import { Div, Span, UseParent } from "@base-framework/atoms";
import { DateTime, Jot } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { EmptyState } from "@base-framework/ui/molecules";
import { MessageModel } from "@modules/messages/models/message-model.js";
import { MessageReadTracker } from "@modules/messages/models/message-read-tracker.js";
import { ThreadSkeleton } from "../skeletons.js";
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
 * Divider configuration for ScrollableList to separate messages by date.
 *
 * @type {object}
 */
const Divider =
{
	skipFirst: true,
	itemProperty: 'createdAt',
	layout: DateDivider,
	customCompare: (lastValue, value) => DateTime.format('standard', lastValue) !== DateTime.format('standard', value)
};

/**
 * ConversationMessages
 *
 * Renders the chat messages using ScrollableList with real-time SSE sync.
 * Uses Server-Sent Events to receive new, updated, and deleted messages.
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
	 * Initialize SSE connection for real-time updates.
	 *
	 * @returns {void}
	 */
	onCreated()
	{
		// @ts-ignore
		this.setupSync();
		// @ts-ignore
		this.setupReadTracking();
	},

	/**
	 * Set up the message read tracker.
	 *
	 * @returns {void}
	 */
	setupReadTracking()
	{
		// @ts-ignore
		this.readTracker = new MessageReadTracker(this.conversationId, {
			threshold: 0.5,
			debounceDelay: 1000
		});
		// @ts-ignore
		this.observer = this.readTracker.observer;
	},

	/**
	 * Set up Server-Sent Events for real-time message sync.
	 *
	 * @returns {void}
	 */
	setupSync()
	{
		// @ts-ignore
		const conversationId = this.conversationId;
		// @ts-ignore
		this.eventSource = new MessageModel({ conversationId })
			.xhr.sync({}, (data) =>
			{
				// @ts-ignore
				this.handleSyncUpdate(data);
			});
	},

	/**
	 * Handle sync updates from the server.
	 *
	 * @param {object} data - The sync data containing new, updated, and deleted messages
	 * @returns {void}
	 */
	handleSyncUpdate(data)
	{
		// @ts-ignore
		if (!this.list)
		{
			return;
		}

		// Handle new and updated messages
		if (data.merge && data.merge.length > 0)
		{
			// @ts-ignore
			const isAtBottom = (typeof this.isAtBottom === 'function' && this.isAtBottom());
			// @ts-ignore
			this.list.mingle(data.merge);

			// If the panel was at the bottom, scroll to bottom after adding new messages
			// @ts-ignore
			if (isAtBottom && typeof this.scrollToBottom === 'function')
			{
				// @ts-ignore
				this.scrollToBottom();
			}
		}

		// Handle deleted messages
		if (data.deleted && data.deleted.length > 0)
		{
			data.deleted.forEach(messageId =>
			{
				// @ts-ignore
				this.list.removeItem(messageId);
			});
		}
	},

	/**
	 * Refresh a specific message after reaction toggle.
	 *
	 * @param {number} messageId
	 * @returns {void}
	 */
	updateMessage(messageId)
	{
		// @ts-ignore
		if (!this.list || !this.data)
		{
			return;
		}

		// Fetch the updated message from the server
		// @ts-ignore
		new MessageModel({ id: messageId, conversationId: this.conversationId })
			.xhr.get({}, (response) =>
			{
				if (!response || response.success === false)
				{
					return;
				}

				// @ts-ignore
				this.list.mingle([
					response.row
				])
			});
	},

	/**
	 * Clean up SSE connection and read tracker on destroy.
	 *
	 * @returns {void}
	 */
	destroy()
	{
		// @ts-ignore
		if (this.eventSource)
		{
			// @ts-ignore
			this.eventSource.close();
			// @ts-ignore
			this.eventSource = null;
		}

		// @ts-ignore
		if (this.readTracker)
		{
			// @ts-ignore
			this.readTracker.destroy();
			// @ts-ignore
			this.readTracker = null;
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
			class: "flex flex-col grow p-4 z-0",
		}, [
			Div({ class: "flex flex-auto flex-col w-full max-w-none lg:max-w-5xl mx-auto pt-24 pb-24" }, [
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
						divider: Divider,
						rowItem: (message) => new MessageBubble({
							message,
							onReactionToggle: (messageId) => parent.updateMessage(messageId),
							observer: parent.observer
						}),
						// @ts-ignore
						scrollContainer: this.scrollContainer,
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