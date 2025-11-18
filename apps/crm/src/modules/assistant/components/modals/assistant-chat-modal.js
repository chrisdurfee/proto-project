import { Icons } from '@base-framework/ui/icons';
import { Modal } from '@base-framework/ui/molecules';
import { AssistantConversationModel } from '../../models/assistant-conversation-model.js';
import { AssistantChatContent } from './assistant-chat-content.js';

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
