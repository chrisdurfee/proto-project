import { Div, UseParent } from "@base-framework/atoms";
import { DateTime } from "@base-framework/base";
import { Badge, Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DetailBody, DetailSection, Modal, SplitRow } from "@base-framework/ui/molecules";
import { NoteModal } from "./note-modal.js";

/**
 * HeaderOptions
 *
 * Options for the note details modal header
 *
 * @returns {function}
 */
const HeaderOptions = () => () => [
	UseParent((parent) => ({
		options: [
			{
				label: "Edit",
				click: () =>
				{
					parent.close();
					NoteModal({
						item: parent.data,
						clientId: parent.clientId,
						onClose: parent.onUpdate
					});
				}
			},
			{
				label: "Delete",
				click: () =>
				{
					if (confirm("Are you sure you want to delete this note?"))
					{
						parent.destroy();
					}
				}
			}
		]
	}))
];

/**
 * QuickActionButtons
 *
 * Quick action buttons for the note
 *
 * @param {object} note
 * @returns {object}
 */
const QuickActionButtons = (note) =>
	Div({ class: "flex items-center gap-2 mt-4 pb-4 border-b" }, [
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
	]);

/**
 * Formats note data for display
 *
 * @param {object} note
 * @returns {object}
 */
const formatNoteData = (note) =>
{
	const formatDate = (date) => date ? DateTime.format('standard', date) : 'Not set';
	const formatType = (type) => type ? type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';

	return {
		title: note.title || 'Untitled Note',
		content: note.content || 'No content',
		noteType: formatType(note.noteType),
		priority: note.priority ? note.priority.toUpperCase() : 'NORMAL',
		visibility: note.visibility ? note.visibility.charAt(0).toUpperCase() + note.visibility.slice(1) : 'Team',
		status: note.status ? note.status.charAt(0).toUpperCase() + note.status.slice(1) : 'Active',
		tags: note.tags || 'No tags',
		reminderAt: formatDate(note.reminderAt),
		followUpAt: formatDate(note.followUpAt),
		followUpNotes: note.followUpNotes || 'No follow-up notes',
		createdAt: formatDate(note.createdAt),
		updatedAt: formatDate(note.updatedAt)
	};
};

/**
 * NoteDetailsModal
 *
 * Modal showing full details of a note
 *
 * @param {object} props
 * @param {object} props.note - The note to display
 * @param {string} props.clientId - The client ID
 * @param {function} props.onUpdate - Callback when note is updated/deleted
 * @returns {object}
 */
export const NoteDetailsModal = ({ note, clientId, onUpdate }) =>
{
	const formatted = formatNoteData(note);

	/**
	 * Deletes the note
	 */
	const deleteNote = function()
	{
		const { ClientNoteModel } = require('../../../../../models/client-note-model.js');
		const model = new ClientNoteModel({ clientId });

		model.xhr.delete('', () =>
		{
			this.close();
			onUpdate?.(null);
		});
	};

	return Modal({
		title: formatted.title,
		headerOptions: HeaderOptions(),
		size: "xl",
		data: note,
		clientId,
		onUpdate,
		destroy: deleteNote
	}, [
		QuickActionButtons(note),

		DetailBody([
			// Content Section
			DetailSection({
				title: "Content",
				items: [
					SplitRow({ label: "Note", value: formatted.content, fullWidth: true })
				]
			}),

			// Note Details Section
			DetailSection({
				title: "Note Details",
				items: [
					SplitRow({ label: "Type", value: formatted.noteType }),
					SplitRow({ label: "Priority", value: formatted.priority }),
					SplitRow({ label: "Visibility", value: formatted.visibility }),
					SplitRow({ label: "Status", value: formatted.status }),
					SplitRow({ label: "Tags", value: formatted.tags })
				]
			}),

			// Reminder Section (only show if reminder is set)
			note.hasReminder === 1 && DetailSection({
				title: "Reminder",
				items: [
					SplitRow({ label: "Reminder Date", value: formatted.reminderAt })
				]
			}),

			// Follow-up Section (only show if follow-up is required)
			note.requiresFollowUp === 1 && DetailSection({
				title: "Follow-up",
				items: [
					SplitRow({ label: "Follow-up Date", value: formatted.followUpAt }),
					SplitRow({ label: "Follow-up Notes", value: formatted.followUpNotes, fullWidth: true })
				]
			}),

			// Attachments Section (only show if attachments exist)
			note.hasAttachments === 1 && DetailSection({
				title: "Attachments",
				items: [
					SplitRow({ label: "Attachments", value: note.attachmentUrls || 'No attachments', fullWidth: true })
				]
			}),

			// Audit Section
			DetailSection({
				title: "Audit Information",
				items: [
					SplitRow({ label: "Created", value: formatted.createdAt }),
					SplitRow({ label: "Last Updated", value: formatted.updatedAt })
				]
			})
		])
	]).open();
};
