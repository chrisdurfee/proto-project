import { Div, UseParent } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DropdownMenu, Modal } from "@base-framework/ui/molecules";
import { ClientContactModel } from "../../../../../models/client-contact-model.js";
import { ContactForm } from "./contact-form.js";

/**
 * Add a new contact.
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
				description: "An error occurred while adding the contact.",
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
			title: "Contact Added",
			description: "The contact has been added.",
			icon: Icons.check
		});
	});
};

/**
 * Update an existing contact.
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
				description: "An error occurred while updating the contact.",
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
			title: "Contact Updated",
			description: "The contact has been updated.",
			icon: Icons.check
		});
	});
};

/**
 * HeaderOptions
 *
 * @param {object} data - The contact data.
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
						{ icon: Icons.trash, label: 'Delete Contact', value: 'delete-contact' }
					]
				],
				onSelect: (selected) =>
				{
					if (selected.value === 'delete-contact')
					{
						// Handle delete
						data.xhr.delete('', (response) =>
						{
							if (!response || response.success === false)
							{
								app.notify({
									type: "destructive",
									title: "Error",
									description: "An error occurred while deleting the contact.",
									icon: Icons.shield
								});
								return;
							}

							parent.close();

							app.notify({
								type: "success",
								title: "Contact Deleted",
								description: "The contact has been deleted.",
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
 * ContactModal
 *
 * A modal for creating or editing a Contact using ClientContactModel data.
 *
 * @param {object} props - The properties for the modal.
 * @param {object} [props.item] - The contact item to edit (optional)
 * @param {string} [props.clientId] - The client ID this contact belongs to
 * @param {function} [props.onClose] - Callback when modal closes
 * @param {function} [props.onSubmit] - Callback when form submits
 * @returns {Modal} - A new instance of the Modal component.
 */
export const ContactModal = (props = { item: {}, clientId: '', onClose: undefined, onSubmit: undefined }) =>
{
	const item = props.item || {};
	const mode = item.id ? 'edit' : 'add';
	const isEditing = mode === 'edit';

	// Ensure clientId is set
	const contactData = {
		...item,
		clientId: props.clientId || item.clientId
	};

	const data = new ClientContactModel(contactData);
	const closeCallback = (parent) => props.onClose && props.onClose(data, parent);

	return new Modal({
		data,
		title: isEditing ? 'Edit Contact' : 'Add Contact',
		icon: isEditing ? Icons.pencil.square : Icons.user.plus,
		description: isEditing ? 'Update contact details.' : 'Create a new contact for this client.',
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

				if (props.onSubmit)
				{
					props.onSubmit(data);
				}
			}

			/**
			 * If we return false, the modal will not close automatically.
			 */
			return false;
		}
	}, [
		Div({ class: 'flex flex-col lg:p-4 gap-y-8' }, [
			Div({ class: "flex flex-auto flex-col w-full gap-4" }, ContactForm({
				isEditing,
				contact: data
			}))
		])
	]).open();
};