import { Div, P, UseParent } from "@base-framework/atoms";
import { Data, DateTime } from "@base-framework/base";
import { Badge, Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DetailBody, DetailSection, DropdownMenu, Modal, SplitRow } from "@base-framework/ui/molecules";
import { ClientNoteModel } from "@modules/clients/components/models/client-note-model.js";
import { NoteModal } from "./note-modal.js";

/**
 * Header options for the modal.
 *
 * @param {object} note - The note data
 * @param {string} clientId - The client ID
 * @param {function} onUpdate - Callback when note is updated
 * @returns {function}
 */
const HeaderOptions = (note, clientId, onUpdate) =>
{
	return () => [
		UseParent((parent) => (
			new DropdownMenu({
				icon: Icons.ellipsis.vertical,
				groups: [
					[
						{ icon: Icons.pencil.square, label: 'Edit Note', value: 'edit-note' },
						{ icon: Icons.trash, label: 'Delete Note', value: 'delete-note' }
					]
				],
				onSelect: (selected) =>
				{
					if (selected.value === 'edit-note')
					{
						parent.close();

						NoteModal({
							item: note,
							clientId,
							onSubmit: (data) =>
							{
								if (onUpdate)
								{
									onUpdate(data);
								}
							}
						});
					}
					else if (selected.value === 'delete-note')
					{
						const model = new ClientNoteModel({ ...note, clientId });
						model.xhr.delete({}, (response) =>
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

							if (onUpdate)
							{
								onUpdate(null);
							}
						});
					}
				}
			})
		))
	];
};

/**
 * Formats a label from a value
 *
 * @param {string} value
 * @returns {string}
 */
const formatLabel = (value) =>
{
	if (!value) return '-';
	return value.toString().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formats the note data for display
 *
 * @param {object} note
 * @returns {object}
 */
const formatNoteData = (note) =>
{
	return {
		...note,
		title: note.title || 'Untitled Note',
		content: note.content || 'No content available',
		noteTypeLabel: formatLabel(note.noteType),
		priorityLabel: formatLabel(note.priority),
		visibilityLabel: formatLabel(note.visibility),
		statusLabel: formatLabel(note.status),
		tagsDisplay: note.tags || '-',
		reminderAtFormatted: note.reminderAt ? DateTime.format('standard', note.reminderAt) : '-',
		followUpAtFormatted: note.followUpAt ? DateTime.format('standard', note.followUpAt) : '-',
		followUpNotesDisplay: note.followUpNotes || 'No follow-up notes',
		attachmentUrlsDisplay: note.attachmentUrls || '-',
		createdAtFormatted: note.createdAt ? DateTime.format('standard', note.createdAt) : '-',
		updatedAtFormatted: note.updatedAt ? DateTime.format('standard', note.updatedAt) : '-'
	};
};

/**
 * Content section
 *
 * @returns {object}
 */
const ContentSection = () =>
	DetailSection({ title: 'Note' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			P({ class: 'text-sm text-muted-foreground whitespace-pre-line' }, '[[content]]')
		])
	]);

/**
 * Note details section
 *
 * @returns {object}
 */
const NoteDetailsSection = () =>
	DetailSection({ title: 'Note Details' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Type', '[[noteTypeLabel]]'),
			SplitRow('Priority', '[[priorityLabel]]'),
			SplitRow('Visibility', '[[visibilityLabel]]'),
			SplitRow('Status', '[[statusLabel]]'),
			SplitRow('Tags', '[[tagsDisplay]]')
		])
	]);

/**
 * Reminder section
 *
 * @returns {object}
 */
const ReminderSection = () =>
	DetailSection({ title: 'Reminder' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Reminder Date', '[[reminderAtFormatted]]')
		])
	]);

/**
 * Follow-up section
 *
 * @returns {object}
 */
const FollowUpSection = () =>
	DetailSection({ title: 'Follow-up' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Follow-up Date', '[[followUpAtFormatted]]'),
			SplitRow('Follow-up Notes', P({ class: 'text-sm text-muted-foreground whitespace-pre-line' }, '[[followUpNotesDisplay]]'))
		])
	]);

/**
 * Attachments section
 *
 * @returns {object}
 */
const AttachmentsSection = () =>
	DetailSection({ title: 'Attachments' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Attachments', '[[attachmentUrlsDisplay]]')
		])
	]);

/**
 * Audit section
 *
 * @returns {object}
 */
const AuditSection = () =>
	DetailSection({ title: 'Audit Information' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Created', '[[createdAtFormatted]]'),
			SplitRow('Last Updated', '[[updatedAtFormatted]]')
		])
	]);

/**
 * NoteDetailsModal
 *
 * A read-only modal showing note details.
 *
 * @param {object} props
 * @param {object} props.note - The note data
 * @param {string} props.clientId - The client ID
 * @param {function} [props.onUpdate] - Callback when note is updated
 * @param {function} [props.onClose] - Callback when modal closes
 * @returns {object}
 */
export const NoteDetailsModal = (props = { note: {}, clientId: '', onUpdate: undefined, onClose: undefined }) =>
{
	const note = props.note || {};
	const clientId = props.clientId || note.clientId;
	const closeCallback = (parent) => props.onClose && props.onClose(parent);

	return new Modal({
		title: formatNoteData(note).title,
		icon: Icons.document.default,
		description: formatNoteData(note).noteTypeLabel,
		size: 'md',
		type: 'right',
		hidePrimaryButton: true,

		/**
		 * This will setup the data for the modal.
		 *
		 * @returns {Data}
		 */
		setData()
		{
			return new ClientNoteModel(formatNoteData(note));
		},

		/**
		 * Header options for the modal.
		 */
		headerOptions: HeaderOptions(note, clientId, props.onUpdate),

		/**
		 * This will close the modal.
		 *
		 * @returns {void}
		 */
		onClose: closeCallback
	},
	[
		// Quick action badges
		Div({ class: "flex items-center gap-2 pb-4 border-b" }, [
			note.hasReminder === 1 && Badge({ type: 'outline', class: 'gap-1' }, [
				Icon({ size: 'xs' }, Icons.bell),
				'Reminder Set'
			]),
			note.requiresFollowUp === 1 && Badge({ type: 'outline', class: 'gap-1' }, [
				Icon({ size: 'xs' }, Icons.arrowPath),
				'Follow-up Required'
			]),
			note.isPinned === 1 && Badge({ type: 'outline', class: 'gap-1' }, [
				Icon({ size: 'xs' }, Icons.pin),
				'Pinned'
			]),
			note.priority === 'urgent' && Badge({ type: 'destructive' }, 'URGENT'),
			note.priority === 'high' && Badge({ type: 'warning' }, 'HIGH')
		]),

		DetailBody([
			// Content Section
			ContentSection(),

			// Note Details Section
			NoteDetailsSection(),

			// Reminder Section (only show if reminder is set)
			note.hasReminder === 1 && ReminderSection(),

			// Follow-up Section (only show if follow-up is required)
			note.requiresFollowUp === 1 && FollowUpSection(),

			// Attachments Section (only show if attachments exist)
			note.hasAttachments === 1 && AttachmentsSection(),

			// Audit Section
			AuditSection()
		])
	]).open();
};
