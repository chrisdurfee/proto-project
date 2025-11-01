import { Div, Span, UseParent } from "@base-framework/atoms";
import { DateTime, Jot } from "@base-framework/base";
import { IntervalTimer, ScrollableList } from "@base-framework/organisms";
import { EmptyState } from "@base-framework/ui/molecules";
import { MessageModel } from "@modules/messages/models/message-model.js";
import { MessageBubble } from "./message-bubble.js";
import { ThreadSkeleton } from "./skeletons.js";

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
 * Includes polling for new messages every 10 seconds.
 *
 * @param {object} props - The props object containing conversationId
 * @returns {object}
 */
export const ConversationMessages = Jot(
{
	/**
	 * Set up the data model.
	 *
	 * @returns {object}
	 */
	setData()
	{
		// @ts-ignore
		return new MessageModel({
			userId: app.data.user.id,
			// @ts-ignore
			conversationId: this.conversationId,
			orderBy: {
				createdAt: 'desc'
			}
		});
	},

	/**
	 * Initialize polling timer.
	 *
	 * @returns {void}
	 */
	onCreated()
	{
		// Poll for new messages every 10 seconds
		// @ts-ignore
		this.pollTimer = new IntervalTimer(10000, () => this.pollNewMessages());
	},

	/**
	 * Poll for new messages.
	 *
	 * @returns {void}
	 */
	pollNewMessages()
	{
		// @ts-ignore
		if (!this.list || !this.data)
		{
			return;
		}

		// @ts-ignore
		this.list.fetchNew();
	},

	/**
	 * Refresh a specific message after reaction toggle.
	 *
	 * @param {number} messageId
	 * @returns {void}
	 */
	refreshMessage(messageId)
	{
		// @ts-ignore
		if (!this.list || !this.data)
		{
			return;
		}

		// Fetch the updated message from the server
		// @ts-ignore
		const conversationId = this.conversationId;
		const MessageModel = this.data.constructor;

		// Create a temporary model to fetch just this message
		const tempModel = new MessageModel({
			// @ts-ignore
			conversationId: conversationId
		});

		// Fetch all messages and find the updated one
		// Note: This is a workaround since we don't have a single message endpoint
		// @ts-ignore
		this.list.fetchNew();
	},

	/**
	 * Start polling after component is set up.
	 *
	 * @returns {void}
	 */
	after()
	{
		// @ts-ignore
		this.pollTimer.start();
	},

	/**
	 * Clean up timer on destroy.
	 *
	 * @returns {void}
	 */
	destroy()
	{
		// @ts-ignore
		if (this.pollTimer)
		{
			// @ts-ignore
			this.pollTimer.stop();
		}
	},

	/**
	 * Render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({
			class: "flex flex-col grow overflow-y-auto p-4 z-0",
			cache: 'listContainer'
		}, [
			Div({ class: "flex flex-auto flex-col w-full max-w-none lg:max-w-5xl mx-auto pt-24" }, [
				UseParent((parent) => (
					ScrollableList({
						scrollDirection: 'up',
						// @ts-ignore
						data: parent.data,
						cache: 'list',
						key: 'id',
						role: 'list',
						class: 'flex flex-col gap-4',
						limit: 25,
						skeleton: {
							number: 3,
							row: ThreadSkeleton
						},
						divider: {
							skipFirst: true,
							itemProperty: 'createdAt',
							layout: DateDivider,
							customCompare: (lastValue, value) => DateTime.format('standard', lastValue) !== DateTime.format('standard', value)
						},
						rowItem: (message) => new MessageBubble({
							message,
							onReactionToggle: (messageId) => parent.refreshMessage(messageId)
						}),
						scrollContainer: parent.listContainer,
						emptyState: () => EmptyState({
							title: 'No messages yet',
							description: 'Start the conversation by sending a message!'
						})
					})
				))
			])
		]);
	}
});