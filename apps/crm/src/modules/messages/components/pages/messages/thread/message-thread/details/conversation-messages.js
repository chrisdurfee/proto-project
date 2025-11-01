import { Div, Span, UseParent } from "@base-framework/atoms";
import { DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { EmptyState } from "@base-framework/ui/molecules";
import { MessageModel } from "@modules/messages/models/message-model.js";
import { MessageBubble } from "./message-bubble.js";

/**
 * This will create a date divider row.
 *
 * @param {string} date
 * @returns {object}
 */
const DateDivider = (date) => (
	Div({ class: "flex items-center justify-center mt-4" }, [
		Span({ class: "text-xs text-muted-foreground bg-background px-2" }, DateTime.format('standard', date))
	])
);

/**
 * ConversationMessages
 *
 * Renders the chat messages using ScrollableList with automatic data loading.
 *
 * @param {object} props - The props object containing conversationId
 * @returns {object}
 */
export const ConversationMessages = (props) =>
{
	const data = new MessageModel({
		userId: app.data.user.id,
		conversationId: props.conversationId,
		orderBy: {
			createdAt: 'desc'
		}
	});

	return Div({
		class: "flex flex-col grow overflow-y-auto p-4 z-0",
		cache: 'listContainer'
	}, [
		Div({ class: "flex flex-auto flex-col w-full max-w-none lg:max-w-5xl mx-auto pt-24" }, [
			UseParent((parent) => (
				ScrollableList({
					scrollDirection: 'up',
					data,
					cache: 'list',
					key: 'id',
					role: 'list',
					class: 'flex flex-col gap-4',
					limit: 25,
					divider: {
						skipFirst: true,
						itemProperty: 'createdAt',
						layout: DateDivider,
						customCompare: (lastValue, value) => DateTime.format('standard', lastValue) !== DateTime.format('standard', value)
					},
					rowItem: (message) => MessageBubble(message),
					scrollContainer: parent.listContainer,
					emptyState: () => EmptyState({
						title: 'No messages yet',
						description: 'Start the conversation by sending a message!'
					})
				})
			))
		])
	]);
};