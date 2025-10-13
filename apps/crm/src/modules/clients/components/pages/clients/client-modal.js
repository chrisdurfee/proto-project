import { Div, UseParent } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DropdownMenu, Modal } from "@base-framework/ui/molecules";
import { ClientForm } from "./modals/client-form.js";
import { ClientModel } from "./models/client-model.js";

/**
 * Add a new client.
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
				description: "An error occurred while adding the client.",
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
			title: "Client Added",
			description: "The client has been added.",
			icon: Icons.check
		});
	});
};

/**
 * Update an existing client.
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
				description: "An error occurred while updating the client.",
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
			title: "Client Updated",
			description: "The client has been updated.",
			icon: Icons.check
		});
	});
};

/**
 * HeaderOptions
 *
 * @param {object} data - The client data.
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
						{ icon: Icons.trash, label: 'Delete Client', value: 'delete-client' }
					]
				],
				onSelect: (selected) =>
				{
					if (selected.value === 'delete-client')
					{
						// Handle delete
						data.xhr.delete('', (response) =>
						{
							if (!response || response.success === false)
							{
								app.notify({
									type: "destructive",
									title: "Error",
									description: "An error occurred while deleting the client.",
									icon: Icons.shield
								});
								return;
							}

							parent.close();

							app.notify({
								type: "success",
								title: "Client Deleted",
								description: "The client has been deleted.",
								icon: Icons.check
							});

							if (closeCallback)
							{
								closeCallback(parent);
							}
						});
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
 * @returns {Modal} - A new instance of the Modal component.
 */
export const ClientModal = (props = {}) =>
{
	const item = props.item || {};
	const mode = item.id ? 'edit' : 'add';
	const isEditing = mode === 'edit';
	const data = new ClientModel(item);
	const closeCallback = (parent) => props.onClose && props.onClose(data, parent);

	return new Modal({
		data,
		title: isEditing ? 'Edit Client' : 'Add Client',
		icon: isEditing ? Icons.pencil.square : Icons.user.plus,
		description: isEditing ? 'Update client details.' : 'Create a new client.',
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
				add(data, destroyCallback);
			}

			/**
			 * If we return false, the modal will not close automatically.
			 */
			return false;
		}
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: "flex flex-auto flex-col w-full gap-4" }, ClientForm({
				isEditing,
				client: data
			}))
		])
	]).open();
};