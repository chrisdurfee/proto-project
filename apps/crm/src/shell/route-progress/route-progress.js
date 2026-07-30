import { Div, On } from '@base-framework/atoms';
import { RouteLoading } from '../data/route-loading.js';

/**
 * The moving segment that shuttles left-to-right while a route chunk loads.
 *
 * @returns {object}
 */
const Shuttle = () => (
	Div({ class: 'absolute inset-y-0 left-0 w-[30%] rounded-full bg-primary routeProgressShuttle' })
);

/**
 * RouteProgress
 *
 * A thin top-of-app loading bar. While a dynamically-imported route chunk
 * is downloading, a short bar shuttles from left to right. It disappears
 * once the chunk has loaded (and never appears for instant, cached loads).
 *
 * @returns {object}
 */
export const RouteProgress = () => (
	Div({
		data: RouteLoading.data,
		class: 'route-progress pointer-events-none fixed inset-x-0 top-safe z-[100] h-[3px] overflow-hidden'
	}, [
		On('active', (active) => (active ? Shuttle() : Div()))
	])
);

export default RouteProgress;
