import { Div, OnLoad } from '@base-framework/atoms';
import { Component, Jot } from '@base-framework/base';
import { AssistantComposer } from './composer/assistant-composer.js';
import { AssistantMessages } from './list/assistant-messages.js';

/**
 * AssistantChatContent
 *
 * The content component for the AI assistant chat modal.
 *
 * @type {typeof Component}
 */
export const AssistantChatContent = Jot(
{
	state: { loaded: false, disabled: false },

	/**
	 * Scroll the message panel to the bottom.
	 *
	 * @returns {void}
	 */
	scrollToBottom()
	{
		// @ts-ignore
		const container = this.parent.panel;
		// @ts-ignore
		if (container)
		{
			// @ts-ignore
			container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
		}
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
		const container = this.parent.panel;
		// @ts-ignore
		if (!container) return true;
		// @ts-ignore
		return container.scrollHeight - container.scrollTop - container.clientHeight <= BOTTOM_GRACE;
	},

	/**
	 * Fetch the active conversation after component is mounted.
	 *
	 * @return {void}
	 */
	after()
	{
		// @ts-ignore
		this.state.loaded = false;
		// @ts-ignore
		const data = this.parent.data;
		data.xhr.getActive({}, (response) =>
		{
			if (response && response.success !== false)
			{
				// @ts-ignore
				this.conversationId = response.id;
				// @ts-ignore
				data.set({
					conversation: response,
					conversationId: response.id
				});

				// Now that we have conversation ID, initialize the messages
				// @ts-ignore
				if (this.messages)
				{
					// @ts-ignore
					this.messages.setConversationId(response.id);
				}
			}

			// @ts-ignore
			this.state.loaded = true;
		});
	},

	/**
	 * Render the modal content.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "flex flex-col h-full" }, [
			OnLoad(() =>
			{
				return Div({ class: 'flex flex-auto flex-col ' }, [
					// Messages container with scroll
					Div({ class: "flex-1" }, [
						// @ts-ignore
						new AssistantMessages({
							cache: 'messages',
							// @ts-ignore
							conversationId: this.conversationId,
							// @ts-ignore
							isAtBottom: () => this.isAtBottom(),
							// @ts-ignore
							scrollToBottom: () => this.scrollToBottom(),
							// @ts-ignore
							scrollContainer: this.parent.panel
						})
					]),

					// Composer at bottom
					// @ts-ignore
					new AssistantComposer({
						// @ts-ignore
						conversationId: this.conversationId,
						placeholder: "Ask me anything...",
						submitCallBack: (parent) =>
						{
							// Scroll to bottom after new message
							// @ts-ignore
							this.scrollToBottom();
						}
					})
				])
			})
		]);
	}
});
