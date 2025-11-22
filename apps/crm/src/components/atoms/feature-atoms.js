import { On } from "@base-framework/atoms";
import { getAppUser, userHasAnyRole, userHasRole, userIsAdmin, userIsOwner } from "@utils/gates/user-gates.js";

/**
 * Checks if the user has a specific permission by slug.
 *
 * @param {object[]} roles
 * @param {string} permissionSlug
 * @returns {boolean}
 */
const userHasPermission = (roles, permissionSlug) =>
{
	if (userIsAdmin())
    {
        return true;
    }

	if (!roles || !Array.isArray(roles))
	{
		return false;
	}

	return roles.some(role =>
		role.permissions && Array.isArray(role.permissions) &&
		role.permissions.some(permission => permission.slug === permissionSlug)
	);
};

/**
 * Checks if the user has any of the specified permissions.
 *
 * @param {object[]} roles
 * @param {string[]} permissionSlugs
 * @returns {boolean}
 */
const userHasAnyPermission = (roles, permissionSlugs) =>
{
	if (userIsAdmin())
    {
        return true;
    }

	if (!roles || !Array.isArray(roles))
	{
		return false;
	}

	return roles.some(role =>
		role.permissions && Array.isArray(role.permissions) &&
		role.permissions.some(permission => permissionSlugs.includes(permission.slug))
	);
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
 * @param {function} checkFunction - Function that checks if condition is met (receives roles and param)
 * @param {string} watchProp - Property to watch on user object (default: 'roles')
 * @returns {function} The atom factory function
 */
const createParameterizedUserAtom = (checkFunction, watchProp = 'roles') =>
{
	return (param, callback, fallback = null) =>
	{
		const userData = getAppUser();
		if (!userData)
		{
			return fallback;
		}

		return On(userData, watchProp, (value) =>
		{
			const shouldRender = checkFunction(value, param);
			return shouldRender ? callback(value) : fallback;
		});
	};
};

/**
 * Renders content if the user has the Administrator role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsAdmin(() => Div('Admin Panel'))
 */
export const IsAdmin = createUserAtom((roles) => userHasRole(roles, 'admin'));

/**
 * Renders content if the user has the Manager role (or Admin).
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsManager(() => Div('Manager Dashboard'))
 */
export const IsManager = createUserAtom((roles) => userHasRole(roles, 'admin') || userHasRole(roles, 'manager'));

/**
 * Renders content if the user has the Editor role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsEditor(() => Div('Content Editor'))
 */
export const IsEditor = createUserAtom((roles) => userHasRole(roles, 'admin') || userHasRole(roles, 'manager') || userHasRole(roles, 'editor'));

/**
 * Renders content if the user has the User role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsUser(() => Div('User Content'))
 */
export const IsUser = createUserAtom((roles) => userHasRole(roles, 'user'));

/**
 * Renders content if the user has the Contributor role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsContributor(() => Div('Contributor Tools'))
 */
export const IsContributor = createUserAtom((roles) => userHasRole(roles, 'contributor'));

/**
 * Renders content if the user has the Guest role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsGuest(() => Div('Guest Welcome'))
 */
export const IsGuest = createUserAtom((roles) => userHasRole(roles, 'guest'));

/**
 * Renders content if the user has the Partner Admin role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerAdmin(() => Div('Partner Admin Panel'))
 */
export const IsPartnerAdmin = createUserAtom((roles) => userHasRole(roles, 'partner-admin'));

/**
 * Renders content if the user has the Partner Manager role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerManager(() => Div('Partner Manager Dashboard'))
 */
export const IsPartnerManager = createUserAtom((roles) => userHasRole(roles, 'partner-manager'));

/**
 * Renders content if the user has the Partner Editor role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerEditor(() => Div('Partner Editor Tools'))
 */
export const IsPartnerEditor = createUserAtom((roles) => userHasRole(roles, 'partner-editor'));

/**
 * Renders content if the user has the Partner User role.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPartnerUser(() => Div('Partner User Content'))
 */
export const IsPartnerUser = createUserAtom((roles) => userHasRole(roles, 'partner-user'));

/**
 * Renders content if the user has a specific role (by slug).
 *
 * @param {string} roleSlug - The role slug to check
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasRole('admin', () => Div('Admin Panel'))
 * HasRole('manager', () => Div('Manager Tools'), () => Div('Access Denied'))
 */
export const HasRole = createParameterizedUserAtom((roles, roleSlug) => userHasRole(roles, roleSlug));

/**
 * Renders content if the user has any of the specified roles.
 *
 * @param {string[]} roleSlugs - Array of role slugs to check
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasAnyRole(['admin', 'manager'], () => Div('Management Panel'))
 */
export const HasAnyRole = createParameterizedUserAtom((roles, roleSlugs) => userHasAnyRole(roles, roleSlugs));

/**
 * Renders content if the user has a specific permission (by slug).
 *
 * @param {string} permissionSlug - The permission slug to check
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsPermitted('users.edit', () => Button('Edit User'))
 * IsPermitted('content.delete', () => Button('Delete'), () => Span('No Permission'))
 */
export const IsPermitted = createParameterizedUserAtom((roles, permissionSlug) => userHasPermission(roles, permissionSlug));

/**
 * Renders content if the user has any of the specified permissions.
 *
 * @param {string[]} permissionSlugs - Array of permission slugs to check
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasAnyPermission(['users.edit', 'users.delete'], () => Div('User Management'))
 */
export const HasAnyPermission = createParameterizedUserAtom((roles, permissionSlugs) => userHasAnyPermission(roles, permissionSlugs));

/**
 * Renders content if the user is the owner of a resource.
 *
 * @param {number|string} resourceId - The resource owner ID to check against user.id
 * @param {function} callback - Function to render if condition is met (userId) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsOwner(post.userId, () => Button('Edit Post'))
 * IsOwner(comment.userId, () => Button('Delete'), () => Span('Not Owner'))
 */
export const IsOwner = createParameterizedUserAtom((userId, resourceId) => userIsOwner(userId, resourceId), 'id');

/**
 * Renders content if the user is authenticated (has user data).
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsAuthenticated(() => Div('Welcome back!'))
 * IsAuthenticated(() => Div('Dashboard'), () => Div('Please log in'))
 */
export const IsAuthenticated = createUserAtom((roles) => !!roles);

/**
 * Renders content if the user's account is verified.
 *
 * @param {function} callback - Function to render if condition is met (verified) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsVerified(() => Div('Verified Badge'), () => Div('Verify your account'))
 */
export const IsVerified = (() => {
	const createVerifiedAtom = (checkFunction) =>
{
		return (callback, fallback = null) =>
		{
			const userData = getAppUser();
			if (!userData)
			{
				return fallback;
			}

			return On(userData, 'verified', (verified) =>
			{
				const shouldRender = checkFunction(verified);
				return shouldRender ? callback(verified) : fallback;
			});
		};
	};
	return createVerifiedAtom((verified) => verified === 1);
})();

/**
 * Renders content if the user's account is enabled.
 *
 * @param {function} callback - Function to render if condition is met (enabled) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * IsEnabled(() => Div('Active Account'), () => Div('Account Disabled'))
 */
export const IsEnabled = (() =>
{
	const createEnabledAtom = (checkFunction) =>
	{
		return (callback, fallback = null) =>
		{
			const userData = getAppUser();
			if (!userData)
			{
				return fallback;
			}

			return On(userData, 'enabled', (enabled) =>
			{
				const shouldRender = checkFunction(enabled);
				return shouldRender ? callback(enabled) : fallback;
			});
		};
	};
	return createEnabledAtom((enabled) => enabled === 1);
})();

/**
 * Renders content if the user has CRM access permission.
 *
 * @param {function} callback - Function to render if condition is met (roles) => layout
 * @param {function|object|null} [fallback=null] - Fallback content if condition is not met
 * @returns {object} Comment element
 *
 * @example
 * HasCrmAccess(() => Link('/crm', 'CRM Dashboard'))
 */
export const HasCrmAccess = createUserAtom((roles) => userHasPermission(roles, 'crm.access'));
