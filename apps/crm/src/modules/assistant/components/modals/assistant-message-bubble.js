import { Div, Pre, Span } from "@base-framework/atoms";
import { TimeFrame } from "@base-framework/ui";
import { Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar } from "@base-framework/ui/molecules";

/**
 * AssistantMessageBubble
 *
 * Renders a single message bubble for user or AI assistant.
 *
 * @param {object} props
 * @param {object} props.message - The message object
 * @param {object} props.data - Additional data
 * @returns {object}
 */
export const AssistantMessageBubble = ({ message, data }) =>
{
	const isUser = message.role === 'user';

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
				}, data ? [ "[[replyResponse]]", data ] : message.content)
			]),

			// Timestamp
			Span({
                class: "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-xs text-muted-foreground ml-2 capitalize"
            }, TimeFrame({ dateTime: message.createdAt }))
		])
	]);
};
