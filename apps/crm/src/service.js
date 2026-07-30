import { Store as State } from "@base-framework/base";
import { clearShellReady } from "./app-controller/splash-state.js";
import { Configs } from "./configs.js";
import { Push } from "./shell/push/push.js";
import { isSafeInAppPath } from "./utils/safe-url.js";

/**
 * @type {string} protocol
 */
const protocol = window.location.protocol.replace(':', '');

/**
 * This will check if the service worker is supported.
 *
 * @returns {boolean}
 */
const isSupported = () => ('serviceWorker' in navigator) && protocol !== 'http';

/**
 * This will setup the service worker messages.
 *
 * @param {object} app
 * @param {ServiceWorkerRegistration} registration
 * @returns {void}
 */
const setupServiceMessages = (app, registration) =>
{
	navigator.serviceWorker.addEventListener('message', (e) =>
	{
		const data = e.data;

		if (e.data && e.data.type === 'NAVIGATE_TO')
		{
			if (isSafeInAppPath(e.data.url))
			{
				app.navigate(e.data.url);
			}
			return;
		}

		if (data?.type === 'SW_READY' && data.version)
		{
			app.swVersion = data.version;
			return;
		}

		// this will check to route the push notifiction to the page url
		if (data.url && isSafeInAppPath(data.url))
		{
			// @ts-ignore
			app.navigate(data.url);
		}

		// this will reload the page
		if (data.action === 'reload')
		{
			window.location.reload();
		}

		// this will set the app to notify there is an updated version
		if (data.update)
		{
			clearShellReady();
			State.set('app', 'update', true);
		}
	});

	if (registration.waiting)
	{
		clearShellReady();
	}

	const active = registration.active;
	if (active)
	{
		active.postMessage({ type: 'GET_VERSION' });
	}
};

/**
 * This will setup the push notifications.
 *
 * @param {object} serviceWorker
 * @param {string} pushId
 * @returns {object}
 */
const setupPush = (serviceWorker, pushId) =>
{
	return new Push(pushId, serviceWorker);
};

/**
 * Reloads to apply a new service worker version without the jarring
 * "app loads, then reloads" double boot.
 *
 * @returns {void}
 */
const setupControllerReload = () =>
{
	let refreshing = false;
	let hadController = !!navigator.serviceWorker.controller;

	navigator.serviceWorker.addEventListener('controllerchange', () =>
	{
		if (hadController === false)
		{
			hadController = true;
			return;
		}

		if (refreshing)
		{
			return;
		}

		refreshing = true;
		window.location.reload();
	});
};

/**
 * This will setup the service worker.
 *
 * @param {object} app
 * @returns {Promise<void>}
 */
export const setupServiceWorker = async (app) =>
{
	if (isSupported() === false)
	{
		return;
	}

	setupControllerReload();

	const baseUrl = Configs.router.baseUrl || './';
	const sw = navigator.serviceWorker;

	try
	{
		const registration = await sw.register(`${baseUrl}sw.js`, {
			scope: baseUrl,
			updateViaCache: 'none'
		});

		setupServiceMessages(app, registration);

		if (registration.waiting)
		{
			clearShellReady();
		}

		if (Configs.push && Configs.push.publicId)
		{
			app.push = setupPush(registration, Configs.push.publicId);
		}
	}
	catch (e)
	{
		console.warn('Service worker registration failed:', e);
	}
};
