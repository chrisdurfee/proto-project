import { isShellWarm, markShellReady } from './splash-state.js';

/**
 * hideSplash
 *
 * Removes the in-app splash (#app-splash). Uses an instant remove on warm
 * reloads (cached shell, no update pending) and a short fade on cold starts.
 *
 * @param {{ instant?: boolean }} [options]
 * @returns {void}
 */
export const hideSplash = (options = {}) =>
{
	const splash = document.getElementById('app-splash');
	if (!splash)
	{
		return;
	}

	const instant = options.instant === true || (options.instant !== false && isShellWarm());

	if (instant)
	{
		splash.remove();
		document.documentElement.classList.remove('splash-warm');
		return;
	}

	requestAnimationFrame(() =>
	{
		requestAnimationFrame(() =>
		{
			splash.classList.add('fade-out');
			splash.addEventListener('transitionend', () =>
			{
				splash.remove();
				document.documentElement.classList.remove('splash-warm');
			}, { once: true });

			// Fallback if transitionend does not fire (reduced motion, zero duration).
			window.setTimeout(() =>
			{
				if (splash.isConnected)
				{
					splash.remove();
					document.documentElement.classList.remove('splash-warm');
				}
			}, 400);
		});
	});
};

/**
 * hideSplashAndMarkReady
 *
 * Hides the splash and records a warm-start marker for the next visit.
 *
 * @param {string|null} [swVersion]
 * @returns {void}
 */
export const hideSplashAndMarkReady = (swVersion = null) =>
{
	hideSplash({ instant: isShellWarm() });
	markShellReady(swVersion);
};
