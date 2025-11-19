import { Div, UseParent } from "@base-framework/atoms";
import { Jot } from "@base-framework/base";
import { ConversationModel } from "../../../models/conversation-model.js";
import { ConversationList } from "../../../pages/client/summary/conversation/conversation-list.js";
import { ThreadComposer } from "../../../pages/client/summary/conversation/thread-composer.js";

/**
 * ClientDetailsConversation
 *
 * Displays client conversation history in the client details modal with real-time sync.
 *
 * @param {object} props
 * @param {object} props.client - The client data
 * @param {string} props.clientId - The client ID
 * @returns {object}
 */
export const ClientDetailsConversation = Jot(
{
	/**
	 * Set up the data model.
	 *
	 * @returns {object}
	 */
	setData()
	{
		// @ts-ignore
		if (!this.clientId)
		{
			console.error('ClientDetailsConversation: clientId is required');
			return null;
		}

		return new ConversationModel({
			// @ts-ignore
			clientId: this.clientId,
			orderBy: {
				createdAt: 'desc'
			}
		});
	},

	/**
	 * Set up the SSE connection for conversation updates.
	 *
	 * @returns {void}
	 */
	setupSync()
	{
		// @ts-ignore
		this.eventSource = this.data.xhr.sync({}, (response) =>
		{
			if (!response || !response.merge)
			{
				return;
			}

			// @ts-ignore
			if (this.list && response.merge.length > 0)
			{
				/**
				 * Check if the user is at the bottom before adding new messages.
				 */
				// @ts-ignore
				const isAtBottom = this.isAtBottom();
				// @ts-ignore
				this.list.mingle(response.merge);

				// If at bottom, scroll to show new messages
				// @ts-ignore
				if (isAtBottom)
				{
					// @ts-ignore
					this.scrollToBottom();
				}
			}

			// Handle deletions if needed
			// @ts-ignore
			if (this.list && response.deleted && response.deleted.length > 0)
			{
				response.deleted.forEach(id =>
				{
					// @ts-ignore
					this.list.remove(id);
				});
			}
		});
	},

	/**
	 * Scroll the conversation panel to the bottom.
	 *
	 * @returns {void}
	 */
	scrollToBottom()
	{
		// @ts-ignore
		this.panel.scrollTo({ top: this.panel.scrollHeight, behavior: 'smooth' });
	},

	/**
	 * Check if the conversation panel is scrolled to the bottom.
	 *
	 * @returns {boolean}
	 */
	isAtBottom()
	{
		const BOTTOM_GRACE = 60;
		// @ts-ignore
		return this.panel.scrollHeight - this.panel.scrollTop - this.panel.clientHeight <= BOTTOM_GRACE;
	},

	/**
	 * Start SSE sync after component is set up.
	 *
	 * @returns {void}
	 */
	after()
	{
		// @ts-ignore
		this.setupSync();
	},

	/**
	 * Clean up the SSE connection.
	 *
	 * @returns {void}
	 */
	beforeDestroy()
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
	 * Render the conversation section.
	 *
	 * @returns {object}
	 */
	render()
	{
		// @ts-ignore
		if (!this.data)
		{
			return Div({ class: "p-4 text-center text-muted-foreground" }, "Unable to load conversation");
		}

		return Div({ class: "flex flex-auto flex-col h-96 overflow-hidden" }, [
			// Conversation list with scroll container
			Div({ class: "flex flex-1 flex-col overflow-y-auto", cache: "panel" }, [
				UseParent(({ panel }) => (
					ConversationList({
						// @ts-ignore
						data: this.data,
						scrollContainer: panel
					})
				))
			]),
			// Composer
			Div({ class: "sticky bottom-0" }, [
				new ThreadComposer({
					placeholder: "Add a comment...",
					// @ts-ignore
					client: this.client
				})
			])
		]);
	}
});