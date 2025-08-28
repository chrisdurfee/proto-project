import { Div, OnState, Span } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Toggle } from "@base-framework/ui";
import { Fieldset, Skeleton } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { FormField } from "@base-framework/ui/molecules";
import { PermissionModel } from "../../permissions/models/permission-model.js";
import { RolePermissionModel } from "../models/role-permission-model.js";

/**
 * This will add or remove the role for the user.
 *
 * @param {boolean} checked
 * @param {number} roleId
 * @param {number} permissionId
 */
const request = (checked, roleId, permissionId) =>
{
	const model = new RolePermissionModel({
		roleId,
		permissionId
	});

	const method = checked ? 'add' : 'delete';
	model.xhr[method]('', (response) =>
	{
		if (!response || response.success === false)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: `An error occurred while ${method === 'add' ? 'adding' : 'removing'} the permission.`,
				icon: Icons.shield
			});
		}
	});
};

/**
 * This will create the permission skeleton.
 *
 * @returns {object}
 */
export const PermissionSkeleton = () => (
	Div({ class: "flex flex-col gap-y-8" }, [
		...[1, 2, 3, 4].map(() =>
			Div({ class: "flex flex-col gap-y-2" }, [
				Div({ class: "flex items-center gap-x-2" }, [
					Skeleton({
						shape: "circle",
						width: "w-5",
						height: "h-5"
					}),
					Skeleton({
						width: "w-32",
						height: "h-4"
					})
				]),
				Skeleton({
					width: "w-40",
					height: "h-3"
				})
			])
		)
	])
);

/**
 * This will create the permission fields.
 *
 * @param {object} props
 * @returns {object}
 */
const PermissionFields = ({ hasPermission, togglePermission }) => (
	Div({
		class: 'flex flex-col gap-y-2',
		for: ['rows', (permission) => new FormField(
			{
				name: permission.name,
				description: permission.description
			},
			[
				Div({ class: 'flex items-center gap-x-2' }, [
					new Toggle({
						active: hasPermission(permission.name),
						change: (active, e) =>
						{
							// @ts-ignore
							togglePermission(permission, active);
						}
					}),
					Span({ class: 'text-base' }, permission.name)
				])
			])
		]
	})
);

/**
 * RolePermissionFieldset
 *
 * Displays the skeleton placeholder while the permissions load.
 *
 * @type {typeof Component}
 */
export const RolePermissionFieldset = Jot(
{
	/**
	 * This will set the default data for the component.
	 *
	 * @returns {object}
	 */
	setData()
	{
		return new PermissionModel({
			rows: []
		});
	},

	/**
	 * This will set up the state.
	 *
	 * @returns {object}
	 */
	state: { loaded: false },

	/**
	 * This will fetch the data from the server.
	 *
	 * @returns {void}
	 */
	fetch()
	{
		// @ts-ignore
		this.data.xhr.all('', (response) =>
		{
			// @ts-ignore
			this.state.loaded = true;

			if (!response || response.success === false)
			{
				return;
			}

			// @ts-ignore
			this.data.rows = response.rows;
		});
	},

	/**
	 * This will check if the role has the permission.
	 *
	 * @param {string} permissionName - The permission name to check.
	 * @returns {boolean}
	 */
	hasPermission(permissionName)
	{
		// @ts-ignore
		const permissions = this?.role?.permissions || [];
		return permissions.find(permission => permission.name === permissionName) !== undefined;
	},

	/**
	 * This will toggle the permission for the role.
	 *
	 * @param {object} permission - The permission to toggle.
	 * @param {boolean} checked - The checked state of the checkbox.
	 * @returns {void}
	 */
	togglePermission(permission, checked)
	{
		const PERMISSION_KEY = 'permissions';
		// @ts-ignore
		const index = this.role.getIndex(PERMISSION_KEY, 'id', permission.id);

		if (checked && index === -1)
		{
			// @ts-ignore
			this.role.push(PERMISSION_KEY, permission);
		}
		else if (!checked && index !== -1)
		{
			// @ts-ignore
			this.role.splice(PERMISSION_KEY, index);
		}

		// @ts-ignore
		request(checked, this.role.id, permission.id);
	},

	/**
	 * This will render the UserRoleFieldset component.
	 *
	 * @returns {object}
	 */
	render()
	{
		// @ts-ignore
		this.fetch();

		return Fieldset({ legend: "Role Permissions" }, [
			OnState('loaded', (loaded) =>
			{
				if (!loaded)
				{
					return PermissionSkeleton();
				}

				return PermissionFields({
					// @ts-ignore
					hasPermission: this.hasPermission.bind(this),
					// @ts-ignore
					togglePermission: this.togglePermission.bind(this)
				});
			})
		]);
	}
});