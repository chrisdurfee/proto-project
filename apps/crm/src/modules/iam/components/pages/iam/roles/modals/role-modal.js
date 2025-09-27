import { Div } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Modal } from "@base-framework/ui/molecules";
import { RoleModel } from "../models/role-model.js";
import { RoleForm } from "./role-form.js";

/**
 * Add a new role.
 *
 * @param {object} data
 * @param {function|null} destroyCallback
 * @returns {void}
 */
const add = (data, destroyCallback = null) =>
{
	data.xhr.add('', (response) =>
	{
		if (!response || response.success === false)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: "An error occurred while adding the role.",
				icon: Icons.shield
			});
			return;
		}

		if (destroyCallback)
		{
			destroyCallback();
		}

		app.notify({
			type: "success",
			title: "Role Added",
			description: "The role has been added.",
			icon: Icons.check
		});
	});
};

/**
 * Update an existing role.
 *
 * @param {object} data
 * @param {function|null} destroyCallback
 * @returns {void}
 */
const update = (data, destroyCallback = null) =>
{
	data.xhr.update('', (response) =>
	{
		if (!response || response.success === false)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: "An error occurred while updating the role.",
				icon: Icons.shield
			});
			return;
		}

		if (destroyCallback)
		{
			destroyCallback();
		}

		app.notify({
			type: "success",
			title: "Role Updated",
			description: "The role has been updated.",
			icon: Icons.check
		});
	});
};

/**
 * RoleModal
 *
 * A modal for creating a new Role using RoleModel data.
 *
 * @param {object} props - The properties for the modal.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const RoleModal = (props = {}) =>
{
	const item = props.item || {};
	const mode = item.id ? 'edit' : 'add';
	const data = new RoleModel(item);

	return new Modal({
		data,
		title: mode === 'edit' ? 'Edit Role' : 'Add Role',
		icon: mode === 'edit' ? Icons.pencil.square : Icons.document.add,
		description: mode === 'edit' ? `Editing the '${item.name}' role` : 'Let\'s add a new role.',
		size: 'md',
		type: 'right',
		onClose: () => props.onClose && props.onClose(data),
		onSubmit: (parent) =>
		{
			const destroyCallback = () => parent.destroy();
			const data = parent.data;

			if (mode === 'edit')
			{
				update(data, destroyCallback);
			}
			else
			{
				add(data, destroyCallback);
			}

			/**
			 * If we return false, the modal will not close automatically.
			 */
			return false;
		}
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: "flex flex-auto flex-col w-full gap-4" }, RoleForm({
				isEditing: mode === 'edit',
				role: data
			}))
		])
	]).open();
};