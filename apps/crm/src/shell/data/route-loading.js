import { Data } from '@base-framework/base';

/**
 * Delay (ms) before the bar is shown. Loads that resolve faster than this
 * (e.g. an already-cached chunk) never flash the bar.
 *
 * @type {number}
 */
const SHOW_DELAY = 120;

/**
 * Reactive state watched by the RouteProgress bar.
 *
 * @type {Data}
 */
const state = new Data({ active: false });

/**
 * In-flight loader count. Supports overlapping loads.
 *
 * @type {number}
 */
let pending = 0;

/**
 * Pending show timer id.
 *
 * @type {number|null}
 */
let timer = null;

/**
 * RouteLoading
 *
 * Tracks in-flight dynamic route-chunk loads and exposes a reactive
 * `active` flag the top progress bar binds to.
 */
export const RouteLoading =
{
	/**
	 * Reactive data the progress bar binds to.
	 *
	 * @type {Data}
	 */
	data: state,

	/**
	 * Marks the start of a route-chunk load.
	 *
	 * @returns {void}
	 */
	start()
	{
		pending++;
		if (pending === 1 && timer === null)
		{
			timer = setTimeout(() =>
			{
				timer = null;
				if (pending > 0)
				{
					state.active = true;
				}
			}, SHOW_DELAY);
		}
	},

	/**
	 * Marks the completion of a route-chunk load.
	 *
	 * @returns {void}
	 */
	done()
	{
		pending = Math.max(0, pending - 1);
		if (pending === 0)
		{
			if (timer !== null)
			{
				clearTimeout(timer);
				timer = null;
			}
			state.active = false;
		}
	}
};

export default RouteLoading;
