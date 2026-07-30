/** @type {string} */
export const SHELL_READY_KEY = 'shellReady';

/** @type {string} */
export const SW_VERSION_KEY = 'shellSwVersion';

/**
 * Whether the shell has completed at least one successful boot in this tab session.
 *
 * @returns {boolean}
 */
export const isShellWarm = () =>
{
	try
	{
		return sessionStorage.getItem(SHELL_READY_KEY) === '1';
	}
	catch
	{
		return false;
	}
};

/**
 * Mark the shell as ready so the next navigation can skip the splash animation.
 *
 * @param {string|null} [swVersion]
 * @returns {void}
 */
export const markShellReady = (swVersion = null) =>
{
	try
	{
		sessionStorage.setItem(SHELL_READY_KEY, '1');

		if (swVersion)
		{
			sessionStorage.setItem(SW_VERSION_KEY, swVersion);
		}
	}
	catch
	{
		// Private mode / blocked storage — splash still works, just no warm skip.
	}
};

/**
 * Clear warm-start flags when a new service worker version is waiting or activated.
 *
 * @returns {void}
 */
export const clearShellReady = () =>
{
	try
	{
		sessionStorage.removeItem(SHELL_READY_KEY);
		sessionStorage.removeItem(SW_VERSION_KEY);
	}
	catch
	{
		// ignore
	}
};

/**
 * Apply the document class used by index.html to hide the splash before JS boots.
 *
 * @returns {void}
 */
export const applyWarmSplashClass = () =>
{
	if (isShellWarm())
	{
		document.documentElement.classList.add('splash-warm');
	}
};
