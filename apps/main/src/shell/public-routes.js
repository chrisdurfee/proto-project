/**
 * Routes that must render without a session.
 *
 * Legal documents have to be reachable by a signed-out visitor and by a
 * crawler: app stores and privacy regulations expect a public URL, and
 * the contact form exists precisely for people who cannot sign in.
 *
 * Each entry is matched against the start of a route's uri, so
 * '/legal' covers '/legal/terms*' and everything below it.
 *
 * @type {Array<string>}
 */
export const PUBLIC_ROUTE_PREFIXES = [
	'/legal',
	'/help'
];

/**
 * Checks whether a path is public.
 *
 * The prefix is matched on segment boundaries rather than with a plain
 * startsWith, so this keeps working when the app is mounted under a
 * base path such as /main/ instead of at the domain root.
 *
 * @param {string} uri
 * @returns {boolean}
 */
export const isPublicRouteUri = (uri) =>
{
	const path = String(uri || '');
	return PUBLIC_ROUTE_PREFIXES.some((prefix) =>
	{
		const segment = prefix.replace(/^\//, '');
		return new RegExp(`(^|/)${segment}(/|$)`).test(path);
	});
};

/**
 * Checks whether the browser is currently on a public route.
 *
 * @returns {boolean}
 */
export const isOnPublicRoute = () =>
{
	if (typeof window === 'undefined')
	{
		return false;
	}

	return isPublicRouteUri(window.location.pathname);
};

/**
 * Filters a converted route list down to the public routes.
 *
 * @param {Array<object>} routes
 * @returns {Array<object>}
 */
export const filterPublicRoutes = (routes) => (
	(routes || []).filter((route) => route && isPublicRouteUri(route.uri))
);
