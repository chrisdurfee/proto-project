import { Div, P } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Badge, Card, Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState, TimeFrame } from "@base-framework/ui/molecules";
import { NoteDetailsModal } from "./modals/note-details-modal.js";

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
	const preview = note.content ? note.content.substring(0, 120) + (note.content.length > 120 ? '...' : '') : 'No content';
	const userName = note.displayName || `${note.firstName || ''} ${note.lastName || ''}`.trim() || 'Unknown User';

	return Card({
		class: "flex flex-col gap-y-3 px-6 py-4 hover:bg-muted/50 cursor-pointer border-b border-border",
		click: (e, parent) => onClick && onClick(note, parent),
        margin: 'my-2'
	}, [
		// Top row: Avatar + Name on left, TimeFrame + Priority on right
		Div({ class: "flex items-center justify-between" }, [
			Div({ class: "flex items-center gap-2" }, [
				Avatar({
					src: note.image && `/files/users/profile/${note.image}`,
					alt: userName,
					fallbackText: userName,
					size: "sm"
				}),
				P({ class: "text-sm font-medium m-0" }, userName)
			]),
			Div({ class: "flex items-center gap-2" }, [
				P({ class: "text-xs text-muted-foreground m-0" }, [
					TimeFrame({
						dateTime: note.createdAt,
						remoteTimeZone: 'America/Denver'
					})
				]),
				Badge({
					type: note.priority === 'urgent' ? 'destructive' : note.priority === 'high' ? 'warning' : 'outline',
					class: 'text-xs'
				}, note.priority ? note.priority.toUpperCase() : 'NORMAL')
			])
		]),

		// Title row with pin
		Div({ class: "flex items-center gap-2" }, [
			P({ class: "text-sm font-medium m-0 flex-1" }, note.title || 'Untitled Note'),
			note.isPinned === 1 && Icon({ size: 'xs', class: 'text-yellow-500' }, Icons.pin)
		]),

		// Content preview
		P({ class: "text-sm text-muted-foreground m-0 line-clamp-2" }, preview),

		// Badges row (only if any exist)
		note.hasReminder === 1 || note.requiresFollowUp === 1 || note.hasAttachments === 1 ? Div({ class: "flex items-center gap-2 flex-wrap" }, [
			note.hasReminder === 1 && Badge({ type: 'outline', class: 'gap-1 text-xs' }, [
				Icon({ size: 'xs', class: 'text-blue-500' }, Icons.bell),
				'Reminder'
			]),
			note.requiresFollowUp === 1 && Badge({ type: 'outline', class: 'gap-1 text-xs' }, [
				Icon({ size: 'xs', class: 'text-orange-500' }, Icons.arrowPath),
				'Follow-up'
			]),
			note.hasAttachments === 1 && Badge({ type: 'outline', class: 'gap-1 text-xs' }, [
				Icon({ size: 'xs', class: 'text-gray-500' }, Icons.paperClip),
				'Attachments'
			])
		]) : null
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

	return Div({ class: "flex flex-auto flex-col mt-12 rounded-lg overflow-hidden" }, [
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
				icon: Icons.document.add
			})
		})
	]);
});
