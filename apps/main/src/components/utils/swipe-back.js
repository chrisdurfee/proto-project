/**
 * SwipeBack
 *
 * Attaches a left-edge swipe gesture to an element that triggers a
 * "go back" action when the user swipes from the left edge to the right.
 *
 * Provides a polished slide-out animation with an edge indicator and
 * darkening scrim — a smoother alternative to the browser's built-in
 * swipe-to-navigate.
 *
 * Usage:
 *   const cleanup = attachSwipeBack(element, () => history.back());
 *   // later...
 *   cleanup();
 *
 * @module swipe-back
 */

/**
 * Maximum distance in px from the left edge to start the gesture.
 *
 * @type {number}
 */
const EDGE_THRESHOLD = 24;

/**
 * Minimum horizontal distance to consider the swipe intentional.
 *
 * @type {number}
 */
const MIN_SWIPE_DISTANCE = 80;

/**
 * When the page has been dragged past this fraction of the viewport
 * width the dismiss is committed on release.
 *
 * @type {number}
 */
const COMMIT_RATIO = 0.35;

/**
 * Minimum velocity (px/ms) past which a flick dismisses even if the
 * drag distance hasn't reached COMMIT_RATIO.
 *
 * @type {number}
 */
const VELOCITY_THRESHOLD = 0.4;

/**
 * Creates indicator and scrim DOM nodes.
 *
 * @returns {{ indicator: HTMLDivElement, scrim: HTMLDivElement }}
 */
const createVisuals = () =>
{
	const indicator = document.createElement('div');
	indicator.className = 'swipe-back-indicator';

	const scrim = document.createElement('div');
	scrim.className = 'swipe-back-scrim';

	return { indicator, scrim };
};

/**
 * Attach a swipe-back gesture to an element.
 *
 * @param {HTMLElement} el - The container element (usually the overlay root).
 * @param {function} onBack - Callback invoked when the swipe is committed.
 * @returns {function} Cleanup function that removes all listeners and DOM nodes.
 */
export const attachSwipeBack = (el, onBack) =>
{
	let tracking = false;
	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let currentX = 0;
	let directionLocked = false;
	let isHorizontal = false;

	const { indicator, scrim } = createVisuals();
	document.body.appendChild(indicator);
	document.body.appendChild(scrim);

	/**
	 * Update visual feedback based on drag progress.
	 *
	 * @param {number} dx - Horizontal distance dragged.
	 * @returns {void}
	 */
	const updateVisuals = (dx) =>
	{
		const vw = window.innerWidth;
		const progress = Math.min(dx / vw, 1);

		// Indicator: grows wider and more opaque as you pull
		const indicatorWidth = 3 + progress * 12;
		const indicatorOpacity = Math.min(progress * 1.5, 0.35);
		indicator.style.width = `${indicatorWidth}px`;
		indicator.style.opacity = String(indicatorOpacity);

		// Scrim: fades in behind the sliding page
		scrim.style.opacity = String(progress * 0.25);

		// Slide the overlay element to the right
		el.style.transform = `translate3d(${dx}px, 0, 0)`;
		el.style.transition = 'none';
	};

	/**
	 * Reset all visuals back to the default state.
	 *
	 * @param {boolean} animate - Whether to animate the reset.
	 * @returns {void}
	 */
	const resetVisuals = (animate) =>
	{
		if (animate)
		{
			el.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)';
		}

		el.style.transform = '';
		indicator.style.opacity = '0';
		indicator.style.width = '3px';
		scrim.style.opacity = '0';

		if (animate)
		{
			const onEnd = () =>
			{
				el.style.transition = '';
				el.removeEventListener('transitionend', onEnd);
			};
			el.addEventListener('transitionend', onEnd, { once: true });
		}
	};

	/**
	 * Animate the overlay completely off-screen, then fire the callback.
	 *
	 * @returns {void}
	 */
	const commitDismiss = () =>
	{
		const vw = window.innerWidth;
		el.style.transition = 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)';
		el.style.transform = `translate3d(${vw}px, 0, 0)`;
		scrim.style.transition = 'opacity 0.25s ease';
		scrim.style.opacity = '0';
		indicator.style.transition = 'opacity 0.2s ease';
		indicator.style.opacity = '0';

		const onEnd = () =>
		{
			el.removeEventListener('transitionend', onEnd);
			el.style.transition = '';
			el.style.transform = '';
			onBack();
		};
		el.addEventListener('transitionend', onEnd, { once: true });
	};

	/**
	 * @param {TouchEvent} e
	 * @returns {void}
	 */
	const onTouchStart = (e) =>
	{
		if (e.touches.length !== 1)
		{
			return;
		}

		const touch = e.touches[0];
		if (touch.clientX > EDGE_THRESHOLD)
		{
			return;
		}

		tracking = true;
		directionLocked = false;
		isHorizontal = false;
		startX = touch.clientX;
		startY = touch.clientY;
		startTime = Date.now();
		currentX = startX;
	};

	/**
	 * @param {TouchEvent} e
	 * @returns {void}
	 */
	const onTouchMove = (e) =>
	{
		if (!tracking)
		{
			return;
		}

		const touch = e.touches[0];
		const dx = touch.clientX - startX;
		const dy = touch.clientY - startY;

		// Lock direction after a small movement
		if (!directionLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8))
		{
			directionLocked = true;
			isHorizontal = Math.abs(dx) > Math.abs(dy);

			if (!isHorizontal)
			{
				// Vertical scroll — bail out
				tracking = false;
				return;
			}
		}

		if (!isHorizontal)
		{
			return;
		}

		// Only swipe right (positive dx)
		if (dx <= 0)
		{
			return;
		}

		e.preventDefault();
		currentX = touch.clientX;
		updateVisuals(dx);
	};

	/**
	 * @param {TouchEvent} _e
	 * @returns {void}
	 */
	const onTouchEnd = (_e) =>
	{
		if (!tracking || !isHorizontal)
		{
			tracking = false;
			return;
		}

		tracking = false;

		const dx = currentX - startX;
		const dt = Date.now() - startTime;
		const velocity = dx / Math.max(dt, 1);
		const vw = window.innerWidth;

		const pastThreshold = dx > vw * COMMIT_RATIO;
		const fastFlick = dx > MIN_SWIPE_DISTANCE && velocity > VELOCITY_THRESHOLD;

		if (pastThreshold || fastFlick)
		{
			commitDismiss();
		}
		else
		{
			resetVisuals(true);
		}
	};

	/**
	 * @param {TouchEvent} _e
	 * @returns {void}
	 */
	const onTouchCancel = (_e) =>
	{
		if (tracking)
		{
			tracking = false;
			resetVisuals(true);
		}
	};

	el.addEventListener('touchstart', onTouchStart, { passive: true });
	el.addEventListener('touchmove', onTouchMove, { passive: false });
	el.addEventListener('touchend', onTouchEnd, { passive: true });
	el.addEventListener('touchcancel', onTouchCancel, { passive: true });

	/**
	 * Cleanup function.
	 *
	 * @returns {void}
	 */
	return () =>
	{
		el.removeEventListener('touchstart', onTouchStart);
		el.removeEventListener('touchmove', onTouchMove);
		el.removeEventListener('touchend', onTouchEnd);
		el.removeEventListener('touchcancel', onTouchCancel);
		indicator.remove();
		scrim.remove();
	};
};
