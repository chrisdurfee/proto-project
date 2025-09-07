import { Div } from "@base-framework/atoms";
import { Fieldset, Input, Select, Textarea } from "@base-framework/ui/atoms";
import { FormField } from "@base-framework/ui/molecules";
import { UnderlinedButtonTab } from "@base-framework/ui/organisms";
import { RolePermissionFieldset } from "./role-permission-fieldset.js";

/**
 * This will create a tab content wrapper.
 *
 * @param {object} props
 * @param {object} children
 * @returns {object}
 */
const TabContent = (props, children) => (
    Div({ class: 'py-4', ...props }, children)
);

/**
 * This will create the role settings fieldset.
 *
 * @param {boolean} isEditing - Whether the role is being edited or not.
 * @returns {object}
 */
const RoleSettingsFieldset = (isEditing) => (
	Fieldset({ legend: "Role Settings" }, [
		new FormField(
			{ name: "name", label: "Role Name", description: "Enter the name of the role." },
			[
				Input({ type: "text", placeholder: "e.g. Admin", required: true, bind: "name" })
			]
		),
		new FormField(
			{ name: "slug", label: "Slug", description: "URL-friendly version of the role name." },
			[
				Input({ type: "text", placeholder: "e.g. admin", required: true, bind: "slug" })
			]
		),
		new FormField(
			{ name: "description", label: "Description", description: "A brief description of the role." },
			[
				Textarea({ placeholder: "A short description...", rows: 3, bind: "description" })
			]
		),
		new FormField(
			{ name: "resource", label: "Resource", description: "Defines the scope of the role." },
			[
				Select({
					bind: "resource",
					options: [
						{ value: "global", label: "Global" },
						{ value: "organization", label: "Organization" },
						{ value: "group", label: "Group" },
						{ value: 'team', label: "Team" },
					]
				})
			]
		)
	])
);

/**
 * RoleForm
 *
 * @param {object} props - The properties for the form. *
 * @returns {Array} - Array of form field components.
 */
export const RoleForm = ({ isEditing, role }) => {
	// If not editing, return the original form layout
	if (!isEditing) {
		return [
			RoleSettingsFieldset(isEditing)
		];
	}

	// If editing, use tabs to organize the form
	return [
		new UnderlinedButtonTab({
			class: 'w-full',
			options: [
				{
					label: 'Settings',
					value: 'settings',
					selected: true,
					component: TabContent({}, [
						RoleSettingsFieldset(isEditing)
					])
				},
				{
					label: 'Permissions',
					value: 'permissions',
					component: TabContent({}, [
						new RolePermissionFieldset({ role })
					])
				}
			]
		})
	];
};