import { Div, OnState } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";
import { ConversationHeader } from "./conversation-header.js";
import { ConversationMessages } from "./conversation-messages.js";
import { HeaderSkeleton, ThreadSkeleton } from "./skeletons.js";
import { ThreadComposer } from "./thread-composer.js";

/**
 * ThreadDetail
 *
 * Displays a conversation with a header and list of messages using ScrollableList
 * to automatically fetch messages from the API.
 *
 * @type {typeof Component}
 */
export const ThreadDetail = Jot(
{
	state: { loaded: false },

	/**
	 * Setup the message data for this conversation.
	 *
	 * @returns {object}
	 */
	setData()
	{
		// Create message model instance with conversationId filter
		return new ConversationModel({
			userId: app.data.user.id,
			// @ts-ignore
			id: this.conversationId,
			filter: {
				// @ts-ignore
				conversationId: this.conversationId
			}
		});
	},

	/**
	 * Scroll the message panel to the bottom.
	 *
	 * @returns {void}
	 */
	scrollToBottom()
	{
		// @ts-ignore
		this.panel.scrollTo({ top: this.panel.scrollHeight, behavior: 'smooth' });
	},

	/**
	 * Check if the message panel is scrolled to the bottom.
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
	 * Fetch messages after component is mounted.
	 *
	 * @return {void}
	 */
	after()
	{
		// @ts-ignore
		this.state.loaded = false;
		// @ts-ignore
		this.data.xhr.get({}, (response) =>
		{
			if (response && response.row)
			{
				const conversation = response.row;
				const currentUserId = app.data.user.id;

				// Find the other participant (not the current user)
				const otherUser = conversation.participants?.find(p => p.userId !== currentUserId);

				// Set the conversation data with computed fields
				// @ts-ignore
				this.data.set({
					conversation,
					otherUser
				});
			}

			// @ts-ignore
			this.state.loaded = true;
		});
	},

	/**
	 * Render the detail view.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "flex flex-auto flex-col w-full bg-background max-h-screen overflow-y-auto" },
		[
			OnState("loaded", (loaded, ele, parent) =>
			{
				if (!loaded)
				{
					return Div([
						HeaderSkeleton(),
						ThreadSkeleton()
					]);
				}

				return Div({ class: "flex flex-col flex-auto relative" }, [
					ConversationHeader(),
					// @ts-ignore
					new ConversationMessages({
						cache: 'conversation',
						// @ts-ignore
						conversationId: this.conversationId,
						// @ts-ignore
						isAtBottom: () => this.isAtBottom(),
						// @ts-ignore
						scrollToBottom: () => this.scrollToBottom(),
						// @ts-ignore
						scrollContainer: this.panel
					}),
					// @ts-ignore
					new ThreadComposer({
						// @ts-ignore
						conversationId: this.conversationId,
						placeholder: "Type something...",
						submitCallBack: (parent) =>
						{
							// scroll this.panel to bottom after new message
							// @ts-ignore
							this.scrollToBottom();
							// const shouldScroll = true;
							// parent.conversation.list.fetchNew(shouldScroll);
						}
					})
				]);
			})
		]);
	}
});