import { Div, Span, UseParent } from "@base-framework/atoms";
import { DateTime, Jot } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
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
		this.setupIntersectionObserver();
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
		new MessageModel({ conversationId })
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
	 * Set up Intersection Observer to mark messages as read when they come into view.
	 *
	 * @returns {void}
	 */
	setupIntersectionObserver()
	{
		const options = {
			root: null, // viewport
			rootMargin: '0px',
			threshold: 0.5 // 50% visible
		};

		// @ts-ignore
		this.observer = new IntersectionObserver((entries) =>
		{
			entries.forEach(entry =>
			{
				if (entry.isIntersecting)
				{
					// Message is in view
					// @ts-ignore
					const messageId = parseInt(entry.target.dataset.messageId);
					if (messageId)
					{
						// @ts-ignore
						this.markMessageAsRead(messageId);
						// Stop observing this message once it's been marked as read
						// @ts-ignore
						this.observer.unobserve(entry.target);
					}
				}
			});
		}, options);
	},

	/**
	 * Mark a message as read (debounced to avoid excessive API calls).
	 *
	 * @param {number} messageId
	 * @returns {void}
	 */
	markMessageAsRead(messageId)
	{
		// Track the highest message ID seen
		// @ts-ignore
		if (!this.lastReadMessageId || messageId > this.lastReadMessageId)
		{
			// @ts-ignore
			this.lastReadMessageId = messageId;

			// Debounce the API call
			// @ts-ignore
			clearTimeout(this.readTimeout);
			// @ts-ignore
			this.readTimeout = setTimeout(() =>
			{
				// @ts-ignore
				const conversationId = this.conversationId;
				new MessageModel({ conversationId })
					// @ts-ignore
					.xhr.markAsRead({ messageId: this.lastReadMessageId }, (response) =>
					{
						if (response && response.success)
						{
							console.log('Messages marked as read up to:', messageId);
						}
					});
			}, 1000); // Wait 1 second after last visible message
		}
	},

	/**
	 * Clean up SSE connection and intersection observer on destroy.
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
		if (this.observer)
		{
			// @ts-ignore
			this.observer.disconnect();
			// @ts-ignore
			this.observer = null;
		}

		// @ts-ignore
		clearTimeout(this.readTimeout);
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