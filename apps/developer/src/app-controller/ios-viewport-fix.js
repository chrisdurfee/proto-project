/**
 * fixIosStandaloneViewport
 *
 * Workaround for a WKWebView bug in iOS standalone (Add to Home Screen)
 * PWAs: on cold launch the WebView resolves `env(safe-area-inset-top)`
 * to a much larger value than the actual notch inset. Because the body's
 * `.app-container { padding: env(safe-area-inset-top) ... }` rule pushes
 * the entire app shell down by that value, the home page renders with a
 * large empty band above the header. The viewport silently recalculates
 * on the first touch / scroll / orientation change, at which point the
 * layout snaps back to the correct size.
 *
 * This nudges the WebView into recalculating the viewport immediately
 * after the shell mounts. No-op on every other platform.
 *
 * @returns {void}
 */
export const fixIosStandaloneViewport = () =>
{
	/** @type {Navigator & { standalone?: boolean }} */
	const nav = window.navigator;
	const isIos = /iP(ad|hone|od)/.test(nav.platform || '') || (/Mac/.test(nav.platform || '') && nav.maxTouchPoints > 1);
	const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || nav.standalone === true;
	if (!isIos || !isStandalone)
	{
		return;
	}

	const root = document.documentElement;
	const nudge = () =>
	{
		// Toggle a benign style on <html> to force a full layout pass,
		// which re-resolves `env(safe-area-inset-*)` against the correct
		// post-launch viewport.
		const prev = root.style.minHeight;
		root.style.minHeight = '100.01vh';
		// Read a layout property to flush the style change synchronously.
		void root.offsetHeight;
		root.style.minHeight = prev;

		// A no-op scroll is the canonical iOS viewport-recalc trigger and
		// is harmless when the page is already at the top.
		const { scrollX, scrollY } = window;
		window.scrollTo(scrollX, scrollY);
	};

	// Run after the first paint, again after late lazy chunks settle.
	requestAnimationFrame(() => requestAnimationFrame(nudge));
	window.setTimeout(nudge, 300);
};

export default fixIosStandaloneViewport;
