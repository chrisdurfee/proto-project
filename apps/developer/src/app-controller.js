import { signIn, signOut } from './app-controller/auth-actions.js';
import { bootstrap, renderShell } from './app-controller/bootstrap.js';
import { mergeAndStoreUser } from './app-controller/user-data.js';

/**
 * AppController
 *
 * Main app controller. Wires routing, user/auth data, the
 * service worker, CSRF, font loading, and renders the AppShell.
 *
 * Implementation split:
 *   - app-controller/font-loading.js    — webfont preload
 *   - app-controller/splash.js          — hideSplash / splash-state
 *   - app-controller/ios-viewport-fix.js — iOS PWA safe-area nudge
 *   - app-controller/user-data.js       — createUserData / mergeAndStoreUser
 *   - app-controller/auth-actions.js    — signIn / signOut
 *   - app-controller/bootstrap.js       — bootstrap / renderShell /
 *                                          setupRouter / createDataLayer
 *
 * @class
 */
export class AppController
{
	/** @type {object} */
	router = null;

	/** @type {object} */
	appShell = null;

	/** @type {object} */
	data = {};

	/** @type {object|null} */
	root = null;

	/** @type {string|null} */
	swVersion = null;

	/** @type {Promise<void>} */
	#ready;

	constructor()
	{
		this.#ready = bootstrap(this);
	}

	/**
	 * Resolves after bootstrap (service worker registration, router, data layer).
	 *
	 * @returns {Promise<void>}
	 */
	ready()
	{
		return this.#ready;
	}

	/**
	 * @param {string} uri
	 * @param {object} [data]
	 * @param {boolean} [replace=false]
	 * @returns {void}
	 */
	navigate(uri, data, replace = false)
	{
		this.router.navigate(uri, data, replace);
	}

	/** @returns {void} */
	render()
	{
		renderShell(this);
	}

	/**
	 * @param {object} user
	 * @returns {void}
	 */
	signIn(user)
	{
		signIn(this, user);
	}

	/** @returns {void} */
	signOut()
	{
		signOut(this);
	}

	/**
	 * @param {object|null} [data]
	 * @returns {void}
	 */
	setUserData(data = null)
	{
		mergeAndStoreUser(this.data.user, data);
	}

	/**
	 * @param {object} props
	 * @returns {void}
	 */
	notify(props)
	{
		this.appShell.notifications.addNotice(props);
	}
}
