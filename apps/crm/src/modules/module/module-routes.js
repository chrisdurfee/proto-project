import { RouteLoadErrorPage } from '@components/pages/route-load-error-page.js';
import { RouteLoading } from '../../shell/data/route-loading.js';
import { recoverFromStaleChunk } from '../../utils/stale-chunk.js';

/**
 * Gets the global app data user object.
 *
 * @returns {object|null}
 */
const getAppUser = () =>
{
	return (typeof app !== 'undefined' && app.data && app.data.user) ? app.data.user : null;
};

/**
 * Checks if the user has a specific role by slug.
 *
 * @param {string} roleSlug
 * @returns {boolean}
 */
const userHasRole = (roleSlug) =>
{
	const userData = getAppUser();
	if (!userData)
	{
		return false;
	}

	const roles = userData.roles;
	if (!roles || !Array.isArray(roles))
	{
		return false;
	}

	// check if admin
	if (roles.some(role => role.slug === 'admin'))
	{
		return true;
	}

	// Check for exact role match
	return roles.some(role => role.slug === roleSlug);
};

/**
 * Wraps a dynamic import loader so a failed chunk load triggers
 * stale-shell recovery and re-throws. Resolving with the error page
 * here would poison the framework's import cache for the whole
 * session — instead the rejection is propagated so the cache entry
 * is dropped and the route's `fallback` layout renders. A later
 * navigation (or the fallback's retry) re-attempts the import.
 *
 * @param {function} src
 * @returns {function}
 */
const guardLoader = (src) =>
{
	return () =>
	{
		RouteLoading.start();
		return src()
			.then((mod) =>
			{
				RouteLoading.done();
				return mod;
			})
			.catch((error) =>
			{
				RouteLoading.done();
				console.error('Route chunk failed to load:', error);
				recoverFromStaleChunk();
				throw error;
			});
	};
};

/**
 * ModuleRoutes
 *
 * This will help create local module routes.
 *
 * @class
 */
export class ModuleRoutes
{
	/**
	 * This will add a route.
	 *
	 * @param {string} uri
	 * @param {object} component
	 * @param {string} [title]
	 * @param {boolean} [preventScroll]
	 * @param {string} [role]
	 * @returns {object}
	 */
	add(
		uri,
		component,
		title,
		preventScroll = false,
		role = null
	)
	{
		if (role && !userHasRole(role))
		{
			return null;
		}

		return {
			uri,
			component,
			title,
			preventScroll: preventScroll || false,
			persist: true
		};
	}

	/**
	 * This will check if the object is a promise.
	 *
	 * @param {*} obj
	 * @returns {boolean}
	 */
	isPromise(obj)
	{
		if (typeof obj === 'function')
		{
			return true;
		}

		return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
	}

	/**
	 * This will add a loaded route.
	 *
	 * @param {string} uri
	 * @param {object|string} loader
	 * @param {string} [title]
	 * @param {boolean} [preventScroll]
	 * @param {string} [role]
	 * @returns {object}
	 */
	load(uri, loader, title, preventScroll = false, role = null)
	{
		if (typeof loader === 'string')
		{
			loader = {
				src: loader
			};
		}
		else if (this.isPromise(loader))
		{
			loader = {
				src: loader
			};
		}

		const callBack = loader.callBack || null;
		if (role && !userHasRole(role))
		{
			return null;
		}

		const src = typeof loader.src === 'function' ? guardLoader(loader.src) : loader.src;
		return {
			uri,
			import: {
				src,
				callBack,
				fallback: () => RouteLoadErrorPage()
			},
			title,
			preventScroll,
			persist: true
		};
	}
}
