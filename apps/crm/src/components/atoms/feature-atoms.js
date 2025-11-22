import { On } from "@base-framework/atoms";

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
 * @param {object[]} roles
 * @param {string} roleSlug
 * @returns {boolean}
 */
const userHasRole = (roles, roleSlug) =>
{
	if (!roles || !Array.isArray(roles))
	{
		return false;
	}

	return roles.some(role => role.slug === roleSlug);
};

/**
 * Checks if the user has any of the specified roles.
 *
 * @param {object[]} roles
 * @param {string[]} roleSlugs
 * @returns {boolean}
 */
const userHasAnyRole = (roles, roleSlugs) =>
{
	if (!roles || !Array.isArray(roles))
	{
		return false;
	}

	return roles.some(role => roleSlugs.includes(role.slug));
};

/**
 * Checks if the user has a specific permission by slug.
 *
 * @param {object} user
 * @param {string} permissionSlug
 * @returns {boolean}
 */
const userHasPermission = (user, permissionSlug) =>
{
	if (!user || !user.roles || !Array.isArray(user.roles))
	{
		return false;
	}

	return user.roles.some(role =>
		role.permissions && Array.isArray(role.permissions) &&
		role.permissions.some(permission => permission.slug === permissionSlug)
	);
};

/**
 * Checks if the user has any of the specified permissions.
 *
 * @param {object} user
 * @param {string[]} permissionSlugs
 * @returns {boolean}
 */
const userHasAnyPermission = (user, permissionSlugs) =>
{
	if (!user || !user.roles || !Array.isArray(user.roles))
	{
		return false;
	}

	return user.roles.some(role =>
		role.permissions && Array.isArray(role.permissions) &&
		role.permissions.some(permission => permissionSlugs.includes(permission.slug))
	);
};

/**
 * Checks if the user is the owner of a resource.
 *
 * @param {object} user
 * @param {number|string} resourceId
 * @returns {boolean}
 */
const userIsOwner = (user, resourceId) =>
{
	if (!user || !user.id)
	{
		return false;
	}

	return user.id == resourceId;
};

/**
 * Generic factory for creating user-based conditional rendering atoms.
 * Leverages the base On atom to watch app.data.user changes.
 *
 * @param {function} checkFunction - Function that checks if condition is met
 * @returns {function} The atom factory function
 */
const createUserAtom = (checkFunction) =>
{
	return (callback, fallback = null) =>
	{
		const userData = getAppUser();
		if (!userData)
		{
			return fallback;
		}

		return On(userData, 'roles', (roles) =>
		{
			const shouldRender = checkFunction(roles);
			return shouldRender ? callback(roles) : fallback;
		});
	};
};

/**
 * Generic factory for creating parameterized user-based conditional atoms.
 * Leverages the base On atom to watch app.data.user changes.
 *
 * @param {function} checkFunction - Function that checks if condition is met (receives user and param)
 * @returns {function} The atom factory function
 */
const createParameterizedUserAtom = (checkFunction) =>
{
	return (param, callback, fallback = null) =>
	{
		const userData = getAppUser();
		if (!userData)
		{
			return fallback;
		}

		return On(userData, 'roles', (user) =>
		{
			const shouldRender = checkFunction(user, param);
			return shouldRender ? callback(user) : fallback;
		});
	};
};

/**
 * Renders content if the user has the Administrator role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsAdmin(() => Div('Admin Panel'))
 */
export const IsAdmin = createUserAtom((user) => userHasRole(user, 'admin'));

/**
 * Renders content if the user has the Manager role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsManager(() => Div('Manager Dashboard'))
 */
export const IsManager = createUserAtom((user) => userHasRole(user, 'manager'));

/**
 * Renders content if the user has the Editor role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsEditor(() => Div('Content Editor'))
 */
export const IsEditor = createUserAtom((user) => userHasRole(user, 'editor'));

/**
 * Renders content if the user has the User role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsUser(() => Div('User Content'))
 */
export const IsUser = createUserAtom((user) => userHasRole(user, 'user'));

/**
 * Renders content if the user has the Contributor role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsContributor(() => Div('Contributor Tools'))
 */
export const IsContributor = createUserAtom((user) => userHasRole(user, 'contributor'));

/**
 * Renders content if the user has the Guest role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsGuest(() => Div('Guest Welcome'))
 */
export const IsGuest = createUserAtom((user) => userHasRole(user, 'guest'));

/**
 * Renders content if the user has the Partner Admin role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerAdmin(() => Div('Partner Admin Panel'))
 */
export const IsPartnerAdmin = createUserAtom((user) => userHasRole(user, 'partner-admin'));

/**
 * Renders content if the user has the Partner Manager role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerManager(() => Div('Partner Manager Dashboard'))
 */
export const IsPartnerManager = createUserAtom((user) => userHasRole(user, 'partner-manager'));

/**
 * Renders content if the user has the Partner Editor role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerEditor(() => Div('Partner Editor Tools'))
 */
export const IsPartnerEditor = createUserAtom((user) => userHasRole(user, 'partner-editor'));

/**
 * Renders content if the user has the Partner User role.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerUser(() => Div('Partner User Content'))
 */
export const IsPartnerUser = createUserAtom((user) => userHasRole(user, 'partner-user'));

/**
 * Renders content if the user has a specific role (by slug).
 *
 * @param {string} roleSlug - The role slug to check
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasRole('admin', () => Div('Admin Panel'))
 * HasRole('manager', () => Div('Manager Tools'), () => Div('Access Denied'))
 */
export const HasRole = createParameterizedUserAtom((user, roleSlug) => userHasRole(user, roleSlug));

/**
 * Renders content if the user has any of the specified roles.
 *
 * @param {string[]} roleSlugs - Array of role slugs to check
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasAnyRole(['admin', 'manager'], () => Div('Management Panel'))
 */
export const HasAnyRole = createParameterizedUserAtom((user, roleSlugs) => userHasAnyRole(user, roleSlugs));

/**
 * Renders content if the user has a specific permission (by slug).
 *
 * @param {string} permissionSlug - The permission slug to check
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPermitted('users.edit', () => Button('Edit User'))
 * IsPermitted('content.delete', () => Button('Delete'), () => Span('No Permission'))
 */
export const IsPermitted = createParameterizedUserAtom((user, permissionSlug) => userHasPermission(user, permissionSlug));

/**
 * Renders content if the user has any of the specified permissions.
 *
 * @param {string[]} permissionSlugs - Array of permission slugs to check
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasAnyPermission(['users.edit', 'users.delete'], () => Div('User Management'))
 */
export const HasAnyPermission = createParameterizedUserAtom((user, permissionSlugs) => userHasAnyPermission(user, permissionSlugs));

/**
 * Renders content if the user is the owner of a resource.
 *
 * @param {number|string} resourceId - The resource owner ID to check against user.id
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsOwner(post.userId, () => Button('Edit Post'))
 * IsOwner(comment.userId, () => Button('Delete'), () => Span('Not Owner'))
 */
export const IsOwner = createParameterizedUserAtom((user, resourceId) => userIsOwner(user, resourceId));

/**
 * Renders content if the user is authenticated (has user data).
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsAuthenticated(() => Div('Welcome back!'))
 * IsAuthenticated(() => Div('Dashboard'), () => Div('Please log in'))
 */
export const IsAuthenticated = createUserAtom((user) => !!user);

/**
 * Renders content if the user's account is verified.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsVerified(() => Div('Verified Badge'), () => Div('Verify your account'))
 */
export const IsVerified = createUserAtom((user) => user && user.verified === 1);

/**
 * Renders content if the user's account is enabled.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsEnabled(() => Div('Active Account'), () => Div('Account Disabled'))
 */
export const IsEnabled = createUserAtom((user) => user && user.enabled === 1);

/**
 * Renders content if the user has CRM access permission.
 *
 * @param {function} callback - Function to render if condition is met (user, ele, parent) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasCrmAccess(() => Link('/crm', 'CRM Dashboard'))
 */
export const HasCrmAccess = createUserAtom((user) => userHasPermission(user, 'crm.access'));
