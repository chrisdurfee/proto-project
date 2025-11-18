import { Div, Pre } from "@base-framework/atoms";
import { Component, DateTime, Jot } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { Avatar } from "@base-framework/ui/molecules";

/**
 * AssistantMessageBubble
 *
 * Renders a single message bubble for user or AI assistant.
 *
 * @type {typeof Component}
 */
export const AssistantMessageBubble = Jot(
{
	/**
	 * Render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		// @ts-ignore
		const message = this.message;
		const isUser = message.role === 'user';
		const isStreaming = message.isStreaming === 1 || message.isStreaming === true;

		return Div({
			class: `flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} fadeIn`,
			dataSet: [['message-id', message.id]]
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
						Icons.ai({ class: "w-5 h-5 text-primary" })
					])
			]),

			// Message bubble
			Div({ class: "flex flex-col gap-1 max-w-[80%]" }, [
				// Message content
				Div({
					class: `rounded-lg px-4 py-3 ${
						isUser
							? 'bg-primary text-primary-foreground'
							: 'bg-surface border'
					}`
				}, [
					Pre({
						class: "whitespace-pre-wrap wrap-break-words text-sm font-sans",
						bind: isStreaming ? ['content', null, message] : null
					}, isStreaming ? '' : message.content)
				]),

				// Timestamp
				Div({
					class: `text-xs text-muted-foreground ${isUser ? 'text-right' : 'text-left'}`
				}, DateTime.format('time', message.createdAt))
			])
		]);
	}
});
