import { Div, Span, UseParent } from "@base-framework/atoms";
import { Component, DateTime, Jot } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Icons } from "@base-framework/ui/icons";
import { EmptyState } from "@base-framework/ui/molecules";
import { AssistantMessageModel } from "../../models/assistant-message-model.js";
import { AssistantMessageBubble } from "./assistant-message-bubble.js";

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
 * Divider configuration for ScrollableList.
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
 * AssistantMessages
 *
 * Renders AI assistant chat messages with real-time SSE sync.
 *
 * @type {typeof Component}
 */
export const AssistantMessages = Jot(
{
	/**
	 * Set up the data model.
	 *
	 * @returns {object}
	 */
	setData()
	{
		return new AssistantMessageModel({
			userId: app.data.user.id,
            // @ts-ignore
			conversationId: this.conversationId,
			orderBy: {
                id: 'desc',
				createdAt: 'desc'
			}
		});
	},

	/**
	 * Set the conversation ID and initialize data loading.
	 *
	 * @param {number} conversationId
	 * @returns {void}
	 */
	setConversationId(conversationId)
	{
		// @ts-ignore
		this.data.set({ conversationId });

		// Now load the messages
		// @ts-ignore
		if (this.list)
		{
			// @ts-ignore
			this.list.refresh();
		}

		// @ts-ignore
		this.setupSync();
	},

	/**
	 * Set up Server-Sent Events for real-time message sync.
	 *
	 * @returns {void}
	 */
	setupSync()
	{
		// @ts-ignore
		const conversationId = this.data.conversationId ?? null;
		if (!conversationId)
		{
			return;
		}

		// @ts-ignore
		this.eventSource = this.data.xhr.sync({}, (data) =>
		{
			// @ts-ignore
			this.handleSyncUpdate(data);
		});
	},

	/**
	 * Handle sync updates from the server.
	 *
	 * @param {object} data
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

			// If at bottom, scroll to show new messages
			// @ts-ignore
			if (isAtBottom && typeof this.scrollToBottom === 'function')
			{
				setTimeout(() =>
				{
					// @ts-ignore
					this.scrollToBottom();
				}, 100);
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
	 * Clean up SSE connection on destroy.
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
	},

	/**
	 * Render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "flex flex-col grow p-4 z-0" }, [
			Div({ class: "flex flex-auto flex-col w-full max-w-none lg:max-w-5xl mx-auto pt-8 pb-8" }, [
				UseParent((parent) => (
					ScrollableList({
						scrollDirection: 'up',
						// @ts-ignore
						data: parent.data,
						cache: 'list',
						key: 'id',
						role: 'list',
						class: 'flex flex-col gap-4',
						limit: 50,
						divider: Divider,
						rowItem: (message) => AssistantMessageBubble({ message }),
						// @ts-ignore
						scrollContainer: this.parent.panel,
						emptyState: () => EmptyState({
							title: 'Start a conversation',
							description: 'Ask me anything! I\'m here to help.',
							icon: Icons.ai
						})
					})
				))
			])
		]);
	}
});
