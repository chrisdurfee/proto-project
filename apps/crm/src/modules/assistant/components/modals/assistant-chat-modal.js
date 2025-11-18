import { Div } from '@base-framework/atoms';
import { Component, Jot } from '@base-framework/base';
import { Icons } from '@base-framework/ui/icons';
import { Modal } from '@base-framework/ui/molecules';
import { AssistantConversationModel } from '../../models/assistant-conversation-model.js';
import { AssistantComposer } from './assistant-composer.js';
import { AssistantMessages } from './assistant-messages.js';

/**
 * AssistantChatContent
 *
 * The content component for the AI assistant chat modal.
 *
 * @type {typeof Component}
 */
const AssistantChatContent = Jot(
{
	state: { loaded: false },

	/**
	 * Scroll the message panel to the bottom.
	 *
	 * @returns {void}
	 */
	scrollToBottom()
	{
		// @ts-ignore
		if (this.panel)
		{
			// @ts-ignore
			this.panel.scrollTo({ top: this.panel.scrollHeight, behavior: 'smooth' });
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
		if (!this.panel) return true;
		// @ts-ignore
		return this.panel.scrollHeight - this.panel.scrollTop - this.panel.clientHeight <= BOTTOM_GRACE;
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
				data.set({ conversation: response });
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
			// Messages container with scroll
			Div({
				class: "flex-1 overflow-hidden",
				cache: 'panel'
			}, [
				// @ts-ignore
				new AssistantMessages({
					cache: 'messages',
					// @ts-ignore
					getConversationId: () => this.conversationId,
					// @ts-ignore
					isAtBottom: () => this.isAtBottom(),
					// @ts-ignore
					scrollToBottom: () => this.scrollToBottom(),
					// @ts-ignore
					scrollContainer: this.panel
				})
			]),

			// Composer at bottom
			// @ts-ignore
			new AssistantComposer({
				// @ts-ignore
				getConversationId: () => this.conversationId,
				placeholder: "Ask me anything...",
				submitCallBack: (parent) =>
				{
					// Scroll to bottom after new message
					// @ts-ignore
					this.scrollToBottom();
				}
			})
		]);
	}
});

/**
 * AssistantChatModal
 *
 * A full-screen modal for AI assistant chat.
 *
 * @param {object} props - The properties for the modal.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const AssistantChatModal = (props = {}) =>
{
	const data = new AssistantConversationModel({
		userId: app.data.user.id
	});

	return new Modal({
		data,
		title: 'AI Assistant',
		icon: Icons.ai,
		size: 'full',
		type: 'right',
		hideFooter: true,
		class: 'assistant-chat-modal',
		onClose: () => props.onClose?.()
	}, [
		new AssistantChatContent()
	]).open();
};
