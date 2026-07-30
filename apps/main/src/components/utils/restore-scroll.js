/**
 * restore-scroll.js
 *
 * The Base router restores scroll position synchronously when `popstate`
 * fires. On data-driven detail pages the document at that moment is only
 * a short skeleton, so the browser clamps the target scroll to the
 * current `maxScroll` (often 0) and the saved position is lost forever.
 *
 * This helper re-applies `history.state.scrollPosition` once the real
 * content has grown the document tall enough, retrying via rAF for a
 * bounded window.
 */

/**
 * Monotonic token identifying the active restore session. Incremented
 * whenever a new session starts (or the user takes over) so any stale
 * animation-frame callbacks bail out immediately.
 *
 * @type {number}
 */
let restoreToken = 0;

/**
 * Whether the global restoration listeners have been installed.
 *
 * @type {boolean}
 */
let installed = false;

/**
 * Keyboard keys that represent an intentional scroll/navigation and
 * therefore cancel an in-flight restore so we never fight the user.
 *
 * @type {Set<string>}
 */
const SCROLL_KEYS = new Set([
	'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'
]);

/**
 * Ends the current restore session, bumping the token and detaching
 * the user-interaction guards.
 *
 * @returns {void}
 */
const endSession = () =>
{
	restoreToken++;
	teardownGuards();
};

/**
 * Cancels the active restore session when the user scrolls or presses a
 * navigation key — the user always wins.
 *
 * @param {Event} event
 * @returns {void}
 */
const onUserIntent = (event) =>
{
	if (event.type === 'keydown' && !SCROLL_KEYS.has(/** @type {KeyboardEvent} */ (event).key))
	{
		return;
	}

	endSession();
};

/**
 * Attaches the user-interaction guards for the active session.
 *
 * @returns {void}
 */
const setupGuards = () =>
{
	window.addEventListener('wheel', onUserIntent, { passive: true });
	window.addEventListener('touchstart', onUserIntent, { passive: true });
	window.addEventListener('pointerdown', onUserIntent, { passive: true });
	window.addEventListener('keydown', onUserIntent, { passive: true });
};

/**
 * Detaches the user-interaction guards.
 *
 * @returns {void}
 */
const teardownGuards = () =>
{
	window.removeEventListener('wheel', onUserIntent);
	window.removeEventListener('touchstart', onUserIntent);
	window.removeEventListener('pointerdown', onUserIntent);
	window.removeEventListener('keydown', onUserIntent);
};

/**
 * Begins a robust restore session for the position currently stored in
 * `history.state`. Re-applies the saved Y every animation frame —
 * clamped to the document height as the page's content streams in — so
 * it overrides the router's own scroll-to-top reassertion and keeps
 * climbing as content loads. Ends when the target is reached, the user
 * scrolls, or the bounded window elapses.
 *
 * @param {number} [timeoutMs=3500] - Max time to keep re-applying.
 * @returns {void}
 */
const beginRestoreSession = (timeoutMs = 3500) =>
{
	const state = window.history && window.history.state;
	const target = state && state.scrollPosition;
	if (!target || (!target.x && !target.y) || target.y <= 1)
	{
		return;
	}

	const token = ++restoreToken;
	setupGuards();

	const start = performance.now();
	let reachedFrames = 0;

	const tick = () =>
	{
		// A newer session (or the user) has taken over.
		if (token !== restoreToken)
		{
			return;
		}

		const doc = document.documentElement;
		const maxY = Math.max(0, doc.scrollHeight - window.innerHeight);
		const reachable = Math.min(target.y, maxY);

		window.scrollTo(target.x || 0, reachable);

		const reached = Math.abs(window.scrollY - target.y) < 2;

		// Hold the position stable for a couple of frames once reached so
		// a late layout shift (image load, font swap) cannot bounce it.
		reachedFrames = reached ? reachedFrames + 1 : 0;

		const settled = reached && reachedFrames >= 3;
		const expired = performance.now() - start > timeoutMs;
		if (settled || expired)
		{
			teardownGuards();
			return;
		}

		requestAnimationFrame(tick);
	};

	requestAnimationFrame(tick);
};

/**
 * installScrollRestoration
 *
 * Installs a global window-scroll restorer. On every `popstate` (back /
 * forward through history) it re-applies the saved scroll position held
 * in `history.state` once the page's content is tall enough.
 *
 * This fixes overlay fullscreen detail pages that are destroyed and
 * recreated on navigation: the Base router restores scroll synchronously
 * while only a skeleton is mounted, then forces the page back to the top
 * via its own reassertion, so the saved position is lost. This manager
 * keeps re-applying as the real content streams in, while yielding
 * immediately to any user scroll input.
 *
 * Forward navigations are unaffected: the router stores `{x:0,y:0}` for
 * freshly pushed entries, so there is nothing to restore.
 *
 * Safe to call multiple times — only the first call wires up listeners.
 *
 * @returns {void}
 */
export const installScrollRestoration = () =>
{
	if (installed || typeof window === 'undefined')
	{
		return;
	}
	installed = true;

	// Run after the router's own popstate handler so our session starts
	// from the position it just (clamped) restored and overrides its
	// scroll-to-top reassertion.
	window.addEventListener('popstate', () => beginRestoreSession());
};

/**
 * restoreSavedScroll
 *
 * Re-applies the scroll position stored in `history.state` after content
 * renders. Thin wrapper around {@link beginRestoreSession} so callers
 * that fire on data-load (e.g. entity profile layouts) share the same
 * robust, user-cancellable, content-clamped restore path.
 *
 * @param {object} [options]
 * @param {number} [options.timeoutMs=2000] - Max time to keep retrying.
 * @returns {void}
 */
export const restoreSavedScroll = ({ timeoutMs = 2000 } = {}) =>
{
	beginRestoreSession(timeoutMs);
};

export default restoreSavedScroll;
