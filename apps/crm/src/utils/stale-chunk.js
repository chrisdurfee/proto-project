/**
 * Stale-chunk recovery.
 *
 * After a deploy, the build purges old content-hashed chunks while a
 * running session may still hold the previous shell (the service
 * worker serves navigations cache-first). Any lazy import of a purged
 * chunk then 404s. The new worker has often already installed and
 * claimed the page silently by then, so a plain reload onto the new
 * shell is the cure. When the update has not been picked up yet we
 * trigger it and reload once the new worker activates.
 */

/**
 * @type {string}
 */
const RELOAD_KEY = 'crmStaleChunkReload';

/**
 * @type {number}
 */
const RELOAD_WINDOW = 30000;

/**
 * @type {boolean}
 */
let recovering = false;

/**
 * Check whether a recovery reload already happened recently. Guards
 * against reload loops when a chunk is genuinely missing.
 *
 * @returns {boolean}
 */
const recentlyReloaded = () =>
{
	const ts = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
	return (Date.now() - ts) < RELOAD_WINDOW;
};

/**
 * Reload onto the current shell. The page is already broken (a chunk
 * failed), so the usual deferred reload is skipped.
 *
 * @returns {void}
 */
const reloadOnce = () =>
{
	if (recentlyReloaded())
	{
		return;
	}

	sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
	window.location.reload();
};

/**
 * Recover from a failed chunk load. Checks for a service worker
 * update; if a new worker is pending we reload when it activates,
 * otherwise the active worker is already current (the deploy was
 * picked up before the failure) and we reload immediately.
 *
 * A sessionStorage guard allows only one automatic reload per
 * window so persistent failures fall through to the fallback UI.
 *
 * @returns {void}
 */
export const recoverFromStaleChunk = () =>
{
	if (recovering || !('serviceWorker' in navigator) || recentlyReloaded())
	{
		return;
	}

	recovering = true;

	navigator.serviceWorker.getRegistration()
	.then((registration) =>
	{
		if (!registration)
		{
			recovering = false;
			return;
		}

		return registration.update()
		.catch(() =>
		{
			// Offline or update fetch failed — still try the reload path.
		})
		.then(() =>
		{
			const newWorker = registration.installing || registration.waiting;
			if (newWorker)
			{
				newWorker.addEventListener('statechange', () =>
				{
					if (newWorker.state === 'activated')
					{
						reloadOnce();
					}
				});

				if (newWorker.state === 'activated')
				{
					reloadOnce();
				}
				return;
			}

			/**
			 * No pending worker — the active worker already serves
			 * the latest shell (or this was a network blip). Reload
			 * once to leave the stale shell behind.
			 */
			reloadOnce();
		});
	})
	.catch(() =>
	{
		recovering = false;
	});
};

/**
 * Listen for Vite's preload failures (lazy chunks loaded via inner
 * `Import`/`switch` panels) and trigger the same recovery. The error
 * still propagates so the import fallback UI renders while the
 * worker updates in the background.
 *
 * @returns {void}
 */
export const installStaleChunkRecovery = () =>
{
	window.addEventListener('vite:preloadError', () =>
	{
		recoverFromStaleChunk();
	});
};
