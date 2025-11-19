import { Div, Pre, Span } from "@base-framework/atoms";
import { TimeFrame } from "@base-framework/ui";
import { Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar } from "@base-framework/ui/molecules";
import { AssistantMessageModel } from "../../../models/assistant-message-model.js";

/**
 * Creates streaming data model and initiates streaming.
 *
 * @param {object} dynamic - Dynamic configuration object
 * @returns {object} - Data model for binding
 */
const createStreamingModel = (dynamic) =>
{
	const data = new AssistantMessageModel({
		userId: dynamic.userId,
		conversationId: dynamic.conversationId,
		role: 'assistant',
		content: '',
		replyResponse: ''
	});

	// Pass the AI message ID to the generate endpoint
	const params = dynamic.aiMessageId ? { aiMessageId: dynamic.aiMessageId } : {};

	data.xhr.generate(params, (response) =>
	{
		// Handle different response formats
		if (response?.content)
		{
			// Direct content (test mode or formatted response)
			// @ts-ignore
			data.replyResponse = response.content;
			return;
		}

		const choiceContent = response?.choices?.[0]?.delta?.content;
		if (choiceContent)
		{
			// OpenAI streaming format
			// @ts-ignore
			data.replyResponse += choiceContent;
			return;
		}

		if (response?.error)
		{
			// Error message
			// @ts-ignore
			data.replyResponse = 'Error: ' + response.error;
		}
	});

	return data;
};

/**
 * Renders user avatar.
 *
 * @returns {object}
 */
const UserAvatar = () => Avatar({
	src: app.data.user.image,
	alt: app.data.user.displayName,
	fallbackText: app.data.user.displayName || 'U',
	size: 'sm'
});

/**
 * Renders AI assistant avatar.
 *
 * @returns {object}
 */
const AiAvatar = () => Div({
	class: "flex items-center justify-center w-8 h-8 rounded-full bg-primary/10"
}, [
	Icon({ size: 'sm' }, Icons.ai)
]);

/**
 * Renders message avatar based on role.
 *
 * @param {boolean} isUser
 * @returns {object}
 */
const MessageAvatar = (isUser) => Div({ class: "shrink-0" }, [
	isUser ? UserAvatar() : AiAvatar()
]);

/**
 * Renders message content.
 *
 * @param {boolean} isUser
 * @param {object|null} streamData
 * @param {string} content
 * @returns {object}
 */
const MessageContent = (isUser, streamData, content) => Div({
	class: `rounded-lg px-4 py-3 ${
		isUser
			? 'bg-primary text-primary-foreground'
			: 'bg-surface border'
	}`
}, [
	Pre({
		class: "whitespace-pre-wrap wrap-break-words text-sm font-sans"
	}, streamData ? ['[[replyResponse]]', streamData] : content)
]);

/**
 * Renders message timestamp.
 *
 * @param {string} createdAt
 * @returns {object}
 */
const MessageTimestamp = (createdAt) => Span({
	class: "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-xs text-muted-foreground ml-2 capitalize"
}, TimeFrame({ dateTime: createdAt }));

/**
 * AssistantMessageBubble
 *
 * Renders a single message bubble for user or AI assistant.
 *
 * @param {object} props
 * @param {object} props.message - The message object
 * @returns {object}
 */
export const AssistantMessageBubble = ({ message }) =>
{
	const isUser = message.role === 'user';
	const streamData = message.dynamic ? createStreamingModel(message.dynamic) : null;

	return Div({ class: `flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} fadeIn` }, [
		MessageAvatar(isUser),
		Div({ class: "group flex flex-col gap-1 max-w-[80%]" }, [
			MessageContent(isUser, streamData, message.content),
			MessageTimestamp(message.createdAt)
		])
	]);
};
