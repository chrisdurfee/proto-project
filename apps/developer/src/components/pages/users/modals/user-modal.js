import { Div, UseParent } from '@base-framework/atoms';
import { Icons } from '@base-framework/ui/icons';
import { DropdownMenu, Modal } from '@base-framework/ui/molecules';
import { UserModel } from '../models/user-model.js';
import { ChangePasswordModal } from './change-password-modal.js';
import { UserForm } from './user-form.js';
import { validate } from './validate.js';

/**
 * Notification messages
 */
const NOTIFICATIONS = {
	add: {
		success: {
			type: 'success',
			title: 'User Added',
			description: 'The user has been added.',
			icon: Icons.check
		},
		error: {
			type: 'destructive',
			title: 'Error',
			description: 'An error occurred while adding the user.',
			icon: Icons.shield
		}
	},
	update: {
		success: {
			type: 'success',
			title: 'User Updated',
			description: 'The user has been updated.',
			icon: Icons.check
		},
		error: {
			type: 'destructive',
			title: 'Error',
			description: 'An error occurred while updating the user.',
			icon: Icons.shield
		}
	}
};

/**
 * Handle API response with notifications.
 *
 * @param {object|null} response - The API response.
 * @param {object} notifications - Success and error notification configs.
 * @param {function|null} onSuccess - Callback to execute on success.
 * @returns {void}
 */
const handleResponse = (response, notifications, onSuccess = null) =>
{
	if (!response?.success)
	{
		app.notify(notifications.error);
		return;
	}

	onSuccess?.();
	app.notify(notifications.success);
};

/**
 * Add a new user.
 *
 * @param {object} data - The user data.
 * @param {function|null} destroyCallback - Callback to destroy the modal.
 * @returns {void}
 */
const add = (data, destroyCallback = null) =>
{
	data.xhr.add('', (response) =>
	{
		handleResponse(response, NOTIFICATIONS.add, destroyCallback);
	});
};

/**
 * Update an existing user.
 *
 * @param {object} data - The user data.
 * @param {function|null} destroyCallback - Callback to destroy the modal.
 * @returns {void}
 */
const update = (data, destroyCallback = null) =>
{
	data.xhr.update('', (response) =>
	{
		handleResponse(response, NOTIFICATIONS.update, destroyCallback);
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
	const handleSelect = (selected, parent) =>
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
	};

	return () => [
		UseParent((parent) => (
			new DropdownMenu({
				icon: Icons.ellipsis.vertical,
				groups: [
					[
						{ icon: Icons.locked, label: 'Change Password', value: 'change-password' },
						{ icon: Icons.trash, label: 'Delete User', value: 'delete-user' }
					]
				],
				onSelect: (selected) => handleSelect(selected, parent)
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
 * @param {object} [props.item] - The user item to edit.
 * @param {function} [props.onClose] - Callback when modal closes.
 * @param {function} [props.onSubmit] - Callback when form is submitted.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const UserModal = (props = {}) =>
{
	const item = props.item || {};
	const isEditing = Boolean(item.id);
	const data = new UserModel(item);
	const closeCallback = (parent) => props.onClose?.(data, parent);

	const handleSubmit = (parent) =>
	{
		const destroyCallback = () => parent.destroy();
		const modalData = parent.data;

		if (isEditing)
		{
			update(modalData, destroyCallback);
			props.onSubmit?.(modalData);
		}
		else
		{
			const { password, confirmPassword } = modalData;
			if (!validate(password, confirmPassword))
			{
				return false;
			}

			add(modalData, destroyCallback);
		}

		// Return false to prevent automatic modal close
		return false;
	};

	return new Modal({
		data,
		title: isEditing ? 'Edit User' : 'Add User',
		icon: isEditing ? Icons.pencil.square : Icons.user.plus,
		description: isEditing ? 'Update user details.' : 'Create a new user.',
		size: 'md',
		type: 'right',
		headerOptions: isEditing ? HeaderOptions(data, closeCallback, props.onSubmit) : () => [],
		onClose: closeCallback,
		onSubmit: handleSubmit
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: 'flex flex-auto flex-col w-full gap-4' }, UserForm({
				isEditing,
				user: data
			}))
		])
	]).open();
};