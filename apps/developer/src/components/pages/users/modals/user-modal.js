import { Div, UseParent } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DropdownMenu, Modal } from "@base-framework/ui/molecules";
import { UserModel } from "../models/user-model.js";
import { ChangePasswordModal } from "./change-password-modal.js";
import { UserForm } from "./user-form.js";
import { validate } from "./validate.js";

/**
 * Add a new user.
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
				description: "An error occurred while adding the user.",
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
			title: "User Added",
			description: "The user has been added.",
			icon: Icons.check
		});
	});
};

/**
 * Update an existing user.
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
				description: "An error occurred while updating the user.",
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
			title: "User Updated",
			description: "The user has been updated.",
			icon: Icons.check
		});
	});
};

/**
 * HeaderOptions
 *
 * @param {object} data - The user data.
 * @param {function} closeCallback - The callback function to close the modal.
 * @param {function} onSubmit - The callback function to handle form submission.
 * @returns {function}
 */
const HeaderOptions = (data, closeCallback, onSubmit) =>
{
	return () => [
		UseParent((parent) => (
			new DropdownMenu({
				icon: Icons.ellipsis.vertical,
				groups: [
					[
						{ icon: Icons.locked, label: 'Change Password', value: 'change-password' },
						{ icon: Icons.trash,  label: 'Delete User', value: 'delete-user' }
					]
				],
				onSelect: (selected) =>
				{
					if (selected.value === 'change-password')
					{
						parent.close();

						ChangePasswordModal({
							item: data.get(),
							onClose: closeCallback,
							onSubmit
						});
					}
				}
			})
		))
	];
};

/**
 * UserModal
 *
 * A modal for creating or editing a User using UserModel data.
 *
 * @param {object} props - The properties for the modal.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const UserModal = (props = {}) =>
{
	const item = props.item || {};
	const mode = item.id ? 'edit' : 'add';
	const isEditing = mode === 'edit';
	const data = new UserModel(item);
	const closeCallback = (parent) => props.onClose && props.onClose(data, parent);

	return new Modal({
		data,
		title: isEditing ? 'Edit User' : 'Add User',
		icon: isEditing ? Icons.pencil.square : Icons.user.plus,
		description: isEditing ? 'Update user details.' : 'Create a new user.',
		size: 'md',
		type: 'right',
		headerOptions: isEditing ? HeaderOptions(data, closeCallback, props.onSubmit) : () => [],
		onClose: closeCallback,
		onSubmit: (parent) =>
		{
			const destroyCallback = () => parent.destroy();
			const data = parent.data;

			if (isEditing)
			{
				update(data, destroyCallback);

				if (props.onSubmit)
				{
					props.onSubmit(data);
				}
			}
			else
			{
				const password = data.password;
				const confirmPassword = data.confirmPassword;
				if (!validate(password, confirmPassword))
				{
					return false;
				}

				add(data, destroyCallback);
			}
			return false;
		}
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: "flex flex-auto flex-col w-full gap-4" }, UserForm({
				isEditing,
				user: data
			}))
		])
	]).open();
};