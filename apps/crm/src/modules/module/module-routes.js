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

		return {
			uri,
			import: {
				src: loader.src,
				callBack
			},
			title,
			preventScroll,
			persist: true
		};
	}
}