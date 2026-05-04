/**
 * BlockEdgeSwipe
 *
 * Prevents Safari / iOS from triggering swipe-to-navigate (history
 * back / forward) by intercepting touch events that originate near
 * the left or right edge of the viewport.
 *
 * Full-screen overlays are excluded so the default iOS swipe-back
 * still works inside them.
 *
 * Call once at app startup — the listener stays active for the
 * lifetime of the page.
 *
 * @module block-edge-swipe
 */

/**
 * Distance in px from either edge that triggers the block.
 *
 * @type {number}
 */
const EDGE_ZONE = 20;

/**
 * Set up global touch listeners that cancel horizontal edge swipes
 * on primary pages while allowing them inside overlays.
 *
 * @returns {void}
 */
export const blockEdgeSwipe = () =>
{
	let edgeTouch = false;

	/**
	 * Flag touches that start inside the edge zone on primary pages.
	 * Touches inside an overlay are ignored so iOS default swipe works.
	 *
	 * @param {TouchEvent} e
	 * @returns {void}
	 */
	const onTouchStart = (e) =>
	{
		if (e.touches.length !== 1)
		{
			edgeTouch = false;
			return;
		}

		// Allow default iOS swipe inside overlays
		if (e.target instanceof HTMLElement && e.target.closest('.overlay'))
		{
			edgeTouch = false;
			return;
		}

		const x = e.touches[0].clientX;
		const vw = window.innerWidth;
		edgeTouch = (x <= EDGE_ZONE || x >= vw - EDGE_ZONE);
	};

	/**
	 * Cancel the default gesture when an edge touch moves
	 * horizontally, preventing Safari's history navigation.
	 *
	 * @param {TouchEvent} e
	 * @returns {void}
	 */
	const onTouchMove = (e) =>
	{
		if (edgeTouch && e.cancelable)
		{
			e.preventDefault();
		}
	};

	document.addEventListener('touchstart', onTouchStart, { passive: true });
	document.addEventListener('touchmove', onTouchMove, { passive: false });
};
