import { Div, UseParent } from '@base-framework/atoms';
import { Icons } from '@base-framework/ui/icons';
import { DropdownMenu, Modal } from '@base-framework/ui/molecules';
import { ClientModel } from '../../models/client-model.js';
import { ClientForm } from './client-form.js';

/**
 * Notification messages
 */
const NOTIFICATIONS = {
	add: {
		success: {
			type: 'success',
			title: 'Client Added',
			description: 'The client has been added.',
			icon: Icons.check
		},
		error: {
			type: 'destructive',
			title: 'Error',
			description: 'An error occurred while adding the client.',
			icon: Icons.shield
		}
	},
	update: {
		success: {
			type: 'success',
			title: 'Client Updated',
			description: 'The client has been updated.',
			icon: Icons.check
		},
		error: {
			type: 'destructive',
			title: 'Error',
			description: 'An error occurred while updating the client.',
			icon: Icons.shield
		}
	},
	delete: {
		success: {
			type: 'success',
			title: 'Client Deleted',
			description: 'The client has been deleted.',
			icon: Icons.check
		},
		error: {
			type: 'destructive',
			title: 'Error',
			description: 'An error occurred while deleting the client.',
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
 * Add a new client.
 *
 * @param {object} data - The client data.
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
 * Update an existing client.
 *
 * @param {object} data - The client data.
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
 * Delete a client.
 *
 * @param {object} data - The client data.
 * @param {function} closeCallback - Callback to execute after successful deletion.
 * @param {object} parent - The parent modal component.
 * @returns {void}
 */
const deleteClient = (data, closeCallback, parent) =>
{
	data.xhr.delete('', (response) =>
	{
		handleResponse(response, NOTIFICATIONS.delete, () =>
		{
			parent.close();
			closeCallback?.(parent);
		});
	});
};

/**
 * HeaderOptions
 *
 * @param {object} data - The client data.
 * @param {function} closeCallback - The callback function to close the modal.
 * @returns {function}
 */
const HeaderOptions = (data, closeCallback) =>
{
	return () => [
		UseParent((parent) => (
			new DropdownMenu({
				icon: Icons.ellipsis.vertical,
				groups: [
					[
						{ icon: Icons.trash, label: 'Delete Client', value: 'delete-client' }
					]
				],
				onSelect: (selected) =>
				{
					if (selected.value === 'delete-client')
					{
						deleteClient(data, closeCallback, parent);
					}
				}
			})
		))
	];
};

/**
 * ClientModal
 *
 * A modal for creating or editing a Client using ClientModel data.
 *
 * @param {object} props - The properties for the modal.
 * @param {object} [props.item] - The client item to edit.
 * @param {function} [props.onClose] - Callback when modal closes.
 * @param {function} [props.onSubmit] - Callback when form is submitted.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const ClientModal = (props = {}) =>
{
	const item = props.item || {};
	const isEditing = Boolean(item.id);
	const data = new ClientModel(item);
	const closeCallback = (parent) => props.onClose?.(data, parent);

	/**
	 * Handles form submission.
	 *
	 * @param {object} parent
	 * @returns {boolean|void}
	 */
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
			add(modalData, destroyCallback);
		}

		// Return false to prevent automatic modal close
		return false;
	};

	return new Modal({
		data,
		title: isEditing ? 'Edit Client' : 'Add Client',
		icon: isEditing ? Icons.pencil.square : Icons.user.plus,
		description: isEditing ? 'Update client details.' : 'Create a new client.',
		size: 'md',
		type: 'right',
		headerOptions: isEditing ? HeaderOptions(data, closeCallback) : () => [],
		onClose: closeCallback,
		onSubmit: handleSubmit
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: 'flex flex-auto flex-col w-full gap-4' }, ClientForm({
				isEditing,
				client: data
			}))
		])
	]).open();
};