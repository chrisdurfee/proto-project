/**
 * Gets the global app data user object.
 *
 * @returns {object|null}
 */
export const getAppUser = () =>
{
	return (typeof app !== 'undefined' && app.data && app.data.user) ? app.data.user : null;
};

/**
 * Checks if the user has a specific role by slug.
 *
 * @param {object[]} roles
 * @param {string} roleSlug
 * @returns {boolean}
 */
export const userHasRole = (roles, roleSlug) =>
{
	if (!roles || !Array.isArray(roles))
	{
		return false;
	}

	// Check for exact role match
	return roles.some(role => role.slug === roleSlug);
};

/**
 * Checks if the user has any of the specified roles.
 *
 * @param {object[]} roles
 * @param {string[]} roleSlugs
 * @returns {boolean}
 */
export const userHasAnyRole = (roles, roleSlugs) =>
{
	if (!roles || !Array.isArray(roles))
	{
		return false;
	}

	// Check for any role match
	return roles.some(role => roleSlugs.includes(role.slug));
};

/**
 * Checks if the user is an administrator.
 *
 * @returns {boolean}
 */
export const userIsAdmin = () =>
{
	const userData = getAppUser();
	if (!userData || !userData.roles)
	{
		return false;
	}

	return userHasRole(userData.roles, 'admin');
};

/**
 * Checks if the user is a manager.
 *
 * @returns {boolean}
 */
export const userIsManager = () =>
{
	if (userIsAdmin())
	{
		return true;
	}

	const userData = getAppUser();
	if (!userData || !userData.roles)
	{
		return false;
	}

	return userHasRole(userData.roles, 'manager');
};

/**
 * Checks if the user is an editor.
 *
 * @returns {boolean}
 */
export const userIsEditor = () =>
{
	if (userIsManager())
	{
		return true;
	}

	const userData = getAppUser();
	if (!userData || !userData.roles)
	{
		return false;
	}

	return userHasRole(userData.roles, 'editor');
};

/**
 * Checks if the user is the owner of a resource.
 *
 * @param {number} userId
 * @param {number|string} resourceId
 * @returns {boolean}
 */
export const userIsOwner = (userId, resourceId) =>
{
	if (userIsManager())
	{
		return true;
	}

	if (!userId)
	{
		return false;
	}

	return userId == resourceId;
};
