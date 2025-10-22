import { Div, P, Span, UseParent } from "@base-framework/atoms";
import { Atom, DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Avatar, EmptyState } from "@base-framework/ui/molecules";
import { ClientNoteModel } from "../../../models/client-note-model.js";
import { NoteComposer } from "./note-composer.js";

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
const NoteListItem = (note) =>
{
	const name = note.firstName + ' ' + (note.lastName || '');

	return Div({ class: "flex gap-x-3 px-4 py-4 hover:bg-muted/50" }, [
		Avatar({
			src: note.userImage && `/files/users/profile/${note.userImage}`,
			alt: name,
			fallbackText: name,
			size: "sm"
		}),
		Div({ class: "flex-1 gap-y-1" }, [
			Div({ class: "flex items-center gap-x-2" }, [
				P({ class: "text-sm font-medium" }, name),
				note.noteType && Span({ class: "text-xs text-muted-foreground" },
					`• ${note.noteType.replace('_', ' ')}`
				)
			]),
			note.title && P({ class: "text-sm font-semibold mt-1" }, note.title),
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
 * NotesList
 *
 * Renders the scrollable list of notes.
 *
 * @param {object} props
 * @param {object} props.data - The notes data model
 * @returns {object}
 */
const NotesList = ({ data }) =>
	UseParent((parent) => (
		ScrollableList({
			scrollDirection: 'up',
			data,
			cache: "list",
			key: "id",
			role: "list",
			class: "flex flex-col",
			limit: 25,
			divider: Divider,
			rowItem: NoteListItem,
			scrollContainer: parent.notesScrollContainer,
			emptyState: () => EmptyState({
				title: 'No notes yet',
				description: 'Start the conversation by adding the first note.'
			})
		})
	));

/**
 * ClientDetailsNotes
 *
 * Displays client notes in a conversation-style layout with a composer.
 *
 * @param {object} props
 * @param {object} props.client - The client data
 * @param {string|number} props.clientId - The client ID
 * @returns {object}
 */
export const ClientDetailsNotes = Atom(({ client, clientId }) =>
{
	const data = new ClientNoteModel({
		clientId,
		orderBy: {
			createdAt: 'desc'
		}
	});

	return Div({
		class: "flex flex-auto flex-col gap-y-4",
		cache: "notesContainer"
	}, [
		Div({
			class: "flex-1 overflow-y-auto",
			cache: "notesScrollContainer"
		}, [
			NotesList({ data })
		]),
		new NoteComposer({
			client,
			clientId,
			submitCallBack: (parent) =>
			{
				if (parent.list)
				{
					const shouldScroll = true;
					parent.list.fetchNew(shouldScroll);
				}
			}
		})
	]);
});
