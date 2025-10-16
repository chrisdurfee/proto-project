import { Div, P } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Badge, Icon } from "@base-framework/ui/atoms";
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
	const preview = note.content ? note.content.substring(0, 120) + (note.content.length > 120 ? '...' : '') : 'No content';
	const userName = note.displayName || `${note.firstName || ''} ${note.lastName || ''}`.trim() || 'Unknown User';

	return Div({
		class: "flex gap-x-3 px-6 py-4 hover:bg-muted/50 cursor-pointer border-b border-border",
		click: (e, parent) => onClick && onClick(note, parent)
	}, [
		Avatar({
			src: note.image && `/files/users/profile/${note.image}`,
			alt: userName,
			fallbackText: userName,
			size: "sm"
		}),
		Div({ class: "flex-1 min-w-0" }, [
			Div({ class: "flex items-center gap-2 mb-1" }, [
				P({ class: "text-sm font-medium m-0" }, userName),
				Div({ class: "flex items-center gap-1 text-xs text-muted-foreground" }, [
					P({ class: "m-0" }, "·"),
					P({ class: "m-0" }, [
                        TimeFrame({
                            dateTime: note.createdAt,
                            remoteTimeZone: 'America/Denver'
                        })
                    ])
				])
			]),
			Div({ class: "flex items-center gap-2 mb-2" }, [
				NoteTypeIcon(note.noteType),
				P({ class: "text-sm font-medium m-0 flex-1" }, note.title || 'Untitled Note'),
				note.isPinned === 1 && Icon({ size: 'xs', class: 'text-yellow-500' }, Icons.pin)
			]),
			P({ class: "text-sm text-muted-foreground m-0 line-clamp-2 mb-2" }, preview),
			Div({ class: "flex items-center gap-2 flex-wrap" }, [
				Badge({
					type: note.priority === 'urgent' ? 'destructive' : note.priority === 'high' ? 'warning' : 'outline',
					class: 'text-xs'
				}, note.priority ? note.priority.toUpperCase() : 'NORMAL'),
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

	return Div({ class: "flex flex-col mt-12 border border-border rounded-lg bg-card overflow-hidden" }, [
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
