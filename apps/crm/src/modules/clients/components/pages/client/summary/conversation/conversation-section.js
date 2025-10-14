import { Div, H2, Header, Img, P, Span } from "@base-framework/atoms";
import { Atom, Data } from "@base-framework/base";
import { List } from "@base-framework/organisms";
import { Icons } from "@base-framework/ui/icons";
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
			{ class: "text-xs text-muted-foreground bg-background p-2" },
			date.split("T")[0]
		)
	]);

/**
 * ConversationListItem
 *
 * Renders a single conversation entry with avatar, text, and attachments.
 *
 * @param {object} msg
 * @returns {object}
 */
const ConversationListItem = Atom((msg) =>
	Div({ class: "flex gap-x-3 px-6 py-4 hover:bg-muted/50 rounded" }, [
		Avatar({
			src: msg.userImage || msg.avatar,
			alt: msg.userDisplayName || msg.user,
			fallbackText: msg.userDisplayName || msg.user,
			size: "sm"
		}),
		Div({ class: "flex-1 gap-y-1" }, [
			P({ class: "text-sm font-medium" }, msg.userDisplayName || msg.user),
			P({ class: "text-sm text-muted-foreground" }, msg.message || msg.text),
			msg.attachments && msg.attachments.length > 0 &&
				Div({ class: "flex gap-x-2 mt-2 flex-wrap" },
					msg.attachments.map((att) =>
						Div({ class: "flex items-center gap-x-2 p-2 border rounded hover:bg-muted/50" }, [
							att.fileType?.startsWith('image/')
								? Img({ src: `/files/${att.filePath}`, alt: att.fileName, class: "w-16 h-16 rounded object-cover" })
								: Div({ class: "flex items-center gap-x-2" }, [
									Span({ class: "text-xs text-muted-foreground" }, att.fileExtension?.toUpperCase()),
									Span({ class: "text-xs" }, att.displayName)
								])
						])
					)
				)
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
	// Create conversation data with bindable array
	const conversationData = new Data({
		items: [],
		loading: true
	});

	// Create conversation model
	const conversationModel = new ConversationModel();
	conversationModel.url = `/api/client/${client.id}/conversation`;

	// Load conversations
	conversationModel.xhr.getAll('', (response) =>
	{
		// @ts-ignore
		conversationData.loading = false;

		if (response && response.success && response.rows)
		{
			// @ts-ignore
			conversationData.items = response.rows;
		}
		else
		{
			app.notify({
				type: "destructive",
				title: "Error Loading Conversations",
				description: "Failed to load conversation history.",
				icon: Icons.warning
			});
		}
	});

	return Div({ class: "flex flex-auto flex-col h-full gap-y-4 p-0" }, [
		Header({ class: "flex flex-col gap-y-2 p-6" }, [
			H2({ class: "text-lg text-muted-foreground" }, "Conversation")
		]),
		Div({ class: "flex-1 overflow-y-auto gap-y-2" }, [
			new List({
				cache: "conversationList",
				key: "id",
				// @ts-ignore
				items: conversationData.items,
				role: "list",
				class: "flex flex-col",
				divider: {
					itemProperty: "createdAt",
					layout: DateDivider,
					customCompare: (a, b) => a.split("T")[0] !== b.split("T")[0]
				},
				rowItem: ConversationListItem
			})
		]),
		new ThreadComposer({
			placeholder: "Add a comment...",
			client: client,
			conversationData: conversationData
		})
	]);
});
