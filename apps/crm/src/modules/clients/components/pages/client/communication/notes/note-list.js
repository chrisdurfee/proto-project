import { Div, P } from "@base-framework/atoms";
import { Atom, DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Badge, Card, Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState, TimeFrame } from "@base-framework/ui/molecules";
import { NoteDetailsModal } from "./modals/note-details-modal.js";

/**
 * This will get the icon for the note type.
 *
 * @param {string} type - The note type.
 * @return {object} - The icon for the note type.
 */
const NoteTypeIcon = (type) =>
{
	switch (type)
	{
		case "meeting":
			return Icon({ class: 'text-blue-500' }, Icons.user.group);
		case "call":
			return Icon({ class: 'text-green-500' }, Icons.phone.default);
		case "email":
			return Icon({ class: 'text-purple-500' }, Icons.envelope.default);
		case "task":
			return Icon({ class: 'text-orange-500' }, Icons.circleCheck);
		case "follow_up":
			return Icon({ class: 'text-yellow-500' }, Icons.arrows.uturn.left);
		case "important":
			return Icon({ class: 'text-red-500' }, Icons.information);
		default:
			return Icon({ class: 'text-base' }, Icons.document.text);
	}
};

/**
 * NoteItem
 *
 * Renders a single note row as a card.
 *
 * @param {object} note
 * @param {function} onClick
 * @returns {object}
 */
const NoteItem = (note, onClick) =>
{
	const createdAt = note.createdAt ? DateTime.format('standard', note.createdAt) : 'Just now';
	const preview = note.content ? note.content.substring(0, 150) + (note.content.length > 150 ? '...' : '') : 'No content';
	const userName = note.createdByName || 'Unknown User';

	return Card({
		class: "flex items-start justify-between p-4 cursor-pointer",
		margin: "m-2",
		hover: true,
		click: (e, parent) => onClick && onClick(note, parent)
	}, [
		Div({ class: "flex items-start gap-x-4 flex-1" }, [
			Avatar({
				src: note.createdByImage && `/files/users/profile/${note.createdByImage}`,
				alt: userName,
				fallbackText: userName,
				size: "sm"
			}),
			Div({ class: "flex flex-col flex-1 min-w-0" }, [
				Div({ class: "flex items-center gap-2 mb-1" }, [
					NoteTypeIcon(note.noteType),
					P({ class: "font-medium m-0" }, note.title || 'Untitled Note'),
					note.isPinned === 1 && Icon({ size: 'xs', class: 'text-yellow-500' }, Icons.pin)
				]),
				P({ class: "text-xs text-muted-foreground m-0 mb-1" }, userName),
				P({ class: "text-sm text-muted-foreground m-0 line-clamp-2" }, preview),
				P({ class: "text-xs text-muted-foreground m-0 mt-2" }, TimeFrame(note.createdAt))
			])
		]),
		Div({ class: "flex flex-col items-end gap-2" }, [
			Badge({ type: note.priority === 'urgent' ? 'destructive' : note.priority === 'high' ? 'warning' : 'outline' },
				note.priority ? note.priority.toUpperCase() : 'NORMAL'
			),
			Div({ class: "flex gap-1 mt-1" }, [
				note.hasReminder === 1 && Icon({ size: 'xs', class: 'text-blue-500' }, Icons.bell),
				note.requiresFollowUp === 1 && Icon({ size: 'xs', class: 'text-orange-500' }, Icons.arrowPath),
				note.hasAttachments === 1 && Icon({ size: 'xs', class: 'text-gray-500' }, Icons.paperClip)
			])
		])
	]);
};

/**
 * NoteList
 *
 * Lists all of a client's notes.
 *
 * @param {object} props
 * @param {object} props.data
 * @returns {object}
 */
export const NoteList = Atom(({ data }) =>
{
	/**
	 * Opens the note details modal
	 *
	 * @param {object} note
	 * @param {object} parent
	 */
	const openNoteDetailsModal = (note, parent) =>
	{
		NoteDetailsModal({
			note,
			clientId: data.clientId,
			onUpdate: (updatedData) =>
			{
				if (updatedData === null)
				{
					// Note was deleted, refresh the list
					parent?.refresh();
				}
				else
				{
					// Note was updated, update the list
					parent?.mingle([ updatedData.get() ]);
				}
			}
		});
	};

	return Div({ class: "flex flex-col gap-y-6 mt-12" }, [
		ScrollableList({
			data,
			cache: "list",
			key: "id",
			role: "list",
			skeleton: true,
			rowItem: (note) => NoteItem(note, openNoteDetailsModal),
			emptyState: () => EmptyState({
				title: 'No Notes Found',
				description: 'No notes have been added for this client yet.',
				icon: Icons.documentText
			})
		})
	]);
});
