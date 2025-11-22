import { Div, UseParent } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DropdownMenu, Modal } from "@base-framework/ui/molecules";
import { IsManager } from "@components/atoms/feature-atoms.js";
import { ClientNoteModel } from "../../../../../models/client-note-model.js";
import { NoteForm } from "./note-form.js";

/**
 * Add a new note.
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
				description: "An error occurred while adding the note.",
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
			title: "Note Added",
			description: "The note has been added.",
			icon: Icons.check
		});
	});
};

/**
 * Update an existing note.
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
				description: "An error occurred while updating the note.",
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
			title: "Note Updated",
			description: "The note has been updated.",
			icon: Icons.check
		});
	});
};

/**
 * HeaderOptions
 *
 * @param {object} data - The note data.
 * @param {function} closeCallback - The callback function to close the modal.
 * @param {function} onSubmit - The callback function to handle form submission.
 * @returns {function}
 */
const HeaderOptions = (data, closeCallback, onSubmit) =>
{
	return () => [
		IsManager(() =>
			UseParent((parent) => (
				new DropdownMenu({
					icon: Icons.ellipsis.vertical,
					groups: [
						[
							{ icon: Icons.trash, label: 'Delete Note', value: 'delete-note' }
						]
					],
					onSelect: (selected) =>
					{
						if (selected.value === 'delete-note')
						{
							// Handle delete
							data.xhr.delete('', (response) =>
							{
								if (!response || response.success === false)
								{
									app.notify({
										type: "destructive",
										title: "Error",
										description: "An error occurred while deleting the note.",
										icon: Icons.shield
									});
									return;
								}

								parent.close();

								app.notify({
									type: "success",
									title: "Note Deleted",
									description: "The note has been deleted.",
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
		)
	];
};

/**
 * NoteModal
 *
 * A modal for creating or editing a Note using ClientNoteModel data.
 *
 * @param {object} props - The properties for the modal.
 * @param {object} [props.item] - The note item to edit (optional)
 * @param {string} [props.clientId] - The client ID this note belongs to
 * @param {function} [props.onClose] - Callback when modal closes
 * @param {function} [props.onSubmit] - Callback when form submits
 * @returns {Modal} - A new instance of the Modal component.
 */
export const NoteModal = (props = { item: {}, clientId: '', onClose: undefined, onSubmit: undefined }) =>
{
	const item = props.item || {};
	const mode = item.id ? 'edit' : 'add';
	const isEditing = mode === 'edit';

	// Ensure clientId is set
	const noteData = {
		...item,
		clientId: props.clientId || item.clientId
	};

	const data = new ClientNoteModel(noteData);
	const closeCallback = (parent) => props.onClose && props.onClose(data, parent);

	return new Modal({
		data,
		title: isEditing ? 'Edit Note' : 'Add Note',
		icon: isEditing ? Icons.pencil.square : Icons.document.add,
		description: isEditing ? 'Update note details.' : 'Create a new note for this client.',
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
			Div({ class: "flex flex-auto flex-col w-full gap-4" }, NoteForm({
				isEditing,
				note: data
			}))
		])
	]).open();
};
