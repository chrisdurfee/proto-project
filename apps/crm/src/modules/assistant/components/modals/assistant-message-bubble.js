import { Div, Pre, Span } from "@base-framework/atoms";
import { TimeFrame } from "@base-framework/ui";
import { Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar } from "@base-framework/ui/molecules";
import { AssistantMessageModel } from "../../models/assistant-message-model.js";

/**
 * Helper function to create streaming data model and initiate streaming.
 *
 * @param {object} dynamic - Dynamic configuration object
 * @returns {object} - Data model for binding
 */
const createStreamingModel = (dynamic) =>
{
	const aiData = new AssistantMessageModel({
		userId: dynamic.userId,
		conversationId: dynamic.conversationId,
		role: 'assistant',
		content: '',
		replyResponse: ''
	});

	// Start streaming (conversationId is already in the URL path via [[conversationId]])
	aiData.xhr.generate({}, (response) =>
	{
		if (response?.content)
		{
			aiData.set({ replyResponse: response.content });
		}
	});

	return aiData;
};

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

	// Check if this message has dynamic streaming configuration
	let streamData = null;
	if (message.dynamic)
	{
		// Create the streaming model
		streamData = createStreamingModel(message.dynamic);
	}

	return Div({
		class: `flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} fadeIn`,
		'data-message-id': message.id
	}, [
		// Avatar
		Div({ class: "shrink-0" }, [
			isUser
				? Avatar({
					src: app.data.user.image,
					alt: app.data.user.displayName,
					fallbackText: app.data.user.displayName || 'U',
					size: 'sm'
				})
				: Div({ class: "flex items-center justify-center w-8 h-8 rounded-full bg-primary/10" }, [
					Icon({ size: 'sm' }, Icons.ai)
				])
		]),

		// Message bubble
		Div({ class: "group flex flex-col gap-1 max-w-[80%]" }, [
			// Message content
			Div({
				class: `rounded-lg px-4 py-3 ${
					isUser
						? 'bg-primary text-primary-foreground'
						: 'bg-surface border'
				}`
			}, [
				Pre({
                    class: "whitespace-pre-wrap wrap-break-words text-sm font-sans"
                }, streamData ? ['[[replyResponse]]', streamData] : message.content)
			]),

			// Timestamp
			Span({
                class: "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-xs text-muted-foreground ml-2 capitalize"
            }, TimeFrame({ dateTime: message.createdAt }))
		])
	]);
};
