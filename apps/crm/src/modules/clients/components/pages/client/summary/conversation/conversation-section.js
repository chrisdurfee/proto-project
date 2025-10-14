import { Div, H2, Header, Img, P, Span } from "@base-framework/atoms";
import { Atom, DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Avatar } from "@base-framework/ui/molecules";
import { ConversationModel } from "../../../../models/conversation-model.js";
import { ThreadComposer } from "./thread-composer.js";

/**
 * DateDivider
 *
 * Renders a date divider between messages.
 *
 * @param {string} date
 * @returns {object}
 */
const DateDivider = (date) =>
	Div({ class: "flex justify-center mt-4" }, [
		Span(
			{ class: "text-xs text-muted-foreground p-2" },
			DateTime.format('standard', date)
		)
	]);

/**
 * Attachment
 *
 * @param {object} att
 * @returns {object}
 */
const Attachment = (att) =>
	Div({ class: "flex items-center gap-x-2 p-2 border rounded hover:bg-muted/50" }, [
		att.fileType?.startsWith('image/')
			? Img({ src: `/files/${att.filePath}`, alt: att.fileName, class: "w-16 h-16 rounded object-cover" })
			: Div({ class: "flex items-center gap-x-2" }, [
				Span({ class: "text-xs text-muted-foreground" }, att.fileExtension?.toUpperCase()),
				Span({ class: "text-xs" }, att.displayName)
			])
	]);

/**
 * Attachments
 *
 * @param {array} attachments
 * @returns {object}
 */
const Attachments = (attachments) =>
	Div({ class: "flex gap-x-2 mt-2 flex-wrap" },
		attachments.map((att) =>
			Attachment(att)
		)
	);

/**
 * ConversationListItem
 *
 * Renders a single conversation entry with avatar, text, and attachments.
 *
 * @param {object} msg
 * @returns {object}
 */
const ConversationListItem = Atom((msg) =>
	Div({ class: "flex gap-x-3 px-6 py-4 hover:bg-muted/50" }, [
		Avatar({
			src: msg.image || msg.avatar,
			alt: msg.firstName + ' ' + msg.lastName,
			fallbackText: msg.firstName + ' ' + msg.lastName,
			size: "sm"
		}),
		Div({ class: "flex-1 gap-y-1" }, [
			P({ class: "text-sm font-medium" }, msg.firstName + ' ' + msg.lastName),
			P({ class: "text-sm text-muted-foreground" }, msg.message || msg.text),
			msg.attachments && msg.attachments.length > 0 &&
				Attachments(msg.attachments)
		])
	])
);

/**
 * ConversationSection
 *
 * Displays conversation history and composer.
 *
 * @param {object} props
 * @param {object} props.client
 * @returns {object}
 */
export const ConversationSection = Atom(({ client }) =>
{
	const data = new ConversationModel({
		clientId: client.id
	});

	return Div({ class: "flex flex-auto flex-col h-full gap-y-4 p-0" }, [
		Header({ class: "flex flex-col gap-y-2 p-6" }, [
			H2({ class: "text-lg text-muted-foreground" }, "Conversation")
		]),
		Div({ class: "flex-1 overflow-y-auto gap-y-2" }, [
			ScrollableList({
				data,
				cache: "list",
				key: "id",
				role: "list",
				class: "flex flex-col",
				divider: {
					itemProperty: "createdAt",
					layout: DateDivider,
					customCompare: (a, b) => DateTime.format('standard', a) !== DateTime.format('standard', b)
				},
				rowItem: ConversationListItem
			})
		]),
		new ThreadComposer({
			placeholder: "Add a comment...",
			client: client,
			conversationData: data
		})
	]);
});
