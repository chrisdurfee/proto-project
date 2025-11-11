import { Div, P, Span } from "@base-framework/atoms";
import { Atom, DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState } from "@base-framework/ui/molecules";
import { NoteDetailsModal } from "./modals/note-details-modal.js";

/**
 * DateDivider
 *
 * Renders a date divider between notes.
 *
 * @param {string} date
 * @returns {object}
 */
const DateDivider = (date) =>
	Div({ class: "flex justify-center mt-4" }, [
		Span({ class: "text-xs text-muted-foreground p-2" }, DateTime.format('standard', date))
	]);

/**
 * @typedef {object} Divider
 */
const Divider = {
	skipFirst: true,
	itemProperty: "createdAt",
	layout: DateDivider,
	customCompare: (a, b) => DateTime.format('standard', a) !== DateTime.format('standard', b)
};

/**
 * NoteListItem
 *
 * Renders a single note entry with avatar, text, and metadata.
 *
 * @param {object} note
 * @returns {object}
 */
const NoteListItem = (note, openNoteDetailsModal) =>
{
	const name = note.firstName + ' ' + (note.lastName || '');

	return Div({ class: "flex gap-x-3 px-4 py-4 hover:bg-muted/50", click: () => openNoteDetailsModal(note) }, [
		Avatar({
			src: note.userImage && `/files/users/profile/${note.userImage}`,
			alt: name,
			fallbackText: name,
			size: "sm"
		}),
		Div({ class: "flex flex-1 flex-col gap-y-3" }, [
			Div({ class: "flex items-center gap-x-2" }, [
				P({ class: "text-sm font-medium capitalize" }, name),
				note.noteType && Span({ class: "text-xs text-muted-foreground" },
					`• ${note.noteType.replace('_', ' ')}`
				)
			]),
			note.title && P({ class: "text-sm font-semibold mt-1 capitalize" }, note.title),
			note.content && P({ class: "text-sm text-muted-foreground mt-1 whitespace-pre-line" }, note.content),
			note.tags && Div({ class: "flex gap-2 mt-2 flex-wrap" },
				note.tags.split(',').map(tag =>
					Span({ class: "text-xs bg-muted px-2 py-1 rounded" }, tag.trim())
				)
			)
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

	return Div({ class: "flex flex-auto flex-col mt-12 rounded-lg overflow-hidden" }, [
		ScrollableList({
			data,
			cache: "list",
			key: "id",
			role: "list",
			skeleton: true,
			divider: Divider,
			rowItem: (note) => NoteListItem(note, openNoteDetailsModal),
			emptyState: () => EmptyState({
				title: 'No Notes Found',
				description: 'No notes have been added for this client yet.',
				icon: Icons.document.add
			})
		})
	]);
});
