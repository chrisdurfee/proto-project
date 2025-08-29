import { Div } from "@base-framework/atoms";
import { Fieldset, Input, Textarea } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { FormField, Modal } from "@base-framework/ui/molecules";
import { PermissionModel } from "../models/permission-model.js";

/**
 * getPermissionForm
 *
 * Returns an array of form fields for creating a new permission.
 *
 * @returns {Array} - Array of form field components.
 */
const getPermissionForm = () => ([
	Fieldset({ legend: "Permission Settings" }, [
		new FormField(
			{ name: "name", label: "Permission Name", description: "Enter the name of the permission." },
			[
				Input({ type: "text", placeholder: "e.g. View Users", required: true, bind: "name" })
			]
		),
		new FormField(
			{ name: "slug", label: "Slug", description: "URL-friendly version of the permission name." },
			[
				Input({ type: "text", placeholder: "e.g. users.view", required: true, bind: "slug" })
			]
		),
		new FormField(
			{ name: "description", label: "Description", description: "A brief description of the permission." },
			[
				Textarea({ placeholder: "A short description...", rows: 3, bind: "description" })
			]
		),
		new FormField(
			{ name: "module", label: "Module", description: "The module that registered the permission." },
			[
				Input({ type: "text", placeholder: "module", required: true, bind: "module" })
			]
		)
	])
]);

/**
 * Add a new permission.
 *
 * @param {object} data
 * @param {function} onClose
 * @returns {void}
 */
const add = (data, onClose) =>
{
	data.xhr.add('', (response) =>
	{
		if (!response || response.success === false)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: "An error occurred while adding the permission.",
				icon: Icons.shield
			});
			return;
		}

		app.notify({
			type: "success",
			title: "Permission Added",
			description: "The permission has been added.",
			icon: Icons.check
		});

		onClose();
	});
};

/**
 * Update an existing permission.
 *
 * @param {object} data
 * @param {function} onClose
 * @returns {void}
 */
const update = (data, onClose) =>
{
	data.xhr.update('', (response) =>
	{
		if (!response || response.success === false)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: "An error occurred while updating the permission.",
				icon: Icons.shield
			});
			return;
		}

		app.notify({
			type: "success",
			title: "Permission Updated",
			description: "The permission has been updated.",
			icon: Icons.check
		});

		onClose();
	});
};

/**
 * PermissionModal
 *
 * A modal for creating a new Permission using PermissionModel data.
 *
 * @param {object} props - The properties for the modal.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const PermissionModal = (props = {}) =>
{
	const item = props.item || {};
	const mode = item.id ? 'edit' : 'add';

	return new Modal({
		data: new PermissionModel(item),
		title: mode === 'edit' ? 'Edit Permission' : 'Add Permission',
		icon: mode === 'edit' ? Icons.pencil.square : Icons.document.add,
		description: mode === 'edit' ? `Editing the '${item.name}' Permission` : 'Let\'s add a new Permission.',
		size: 'md',
		type: 'right',
		onSubmit: ({ data }) =>
		{
			const onClose = () => props.onClose && props.onClose(data);

			if (mode === 'edit')
			{
				update(data, onClose);
			}
			else
			{
				add(data, onClose);
			}
		}
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: "flex flex-auto flex-col w-full gap-4" }, getPermissionForm())
		])
	]).open();
};