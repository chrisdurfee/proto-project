import { Div, Span } from "@base-framework/atoms";
import { TimeFrame } from "@base-framework/ui/molecules";

/**
 * MessageHeader
 *
 * Displays sender name and timestamp with hover effects
 *
 * @param {boolean} isSent
 * @param {string} displayName
 * @param {string} createdAt
 * @returns {object}
 */
export const MessageHeader = (isSent, displayName, createdAt) =>
	Div({ class: "mb-1 flex items-center" }, [
		isSent
			? Span({
				class: "text-xs text-muted-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
			}, "You")
			: Span({
				class: "text-xs text-muted-foreground mr-2 capitalize"
			}, displayName || 'Unknown'),
		Span({
			class: "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-xs text-muted-foreground ml-2 capitalize"
		}, TimeFrame({ dateTime: createdAt }))
	]);

/**
 * MessageContent
 *
 * Displays the message text content
 *
 * @param {string} content
 * @returns {object}
 */
export const MessageContent = (content) =>
	content && Span({ class: "text-sm" }, content);

/**
 * AudioBubble
 *
 * Placeholder for audio messages
 *
 * @param {string} url
 * @param {string} duration
 * @returns {object}
 */
export const AudioBubble = (url, duration) =>
	Div({ class: "flex items-center gap-3 mt-1" }, [
		Div({ class: "bg-background/50 p-2 rounded-md text-sm" }, "Audio wave placeholder"),
		Span({ class: "text-xs" }, duration || "00:00")
	]);

/**
 * MessageBubbleContent
 *
 * The main bubble container with content and audio
 *
 * @param {boolean} isSent
 * @param {string} content
 * @param {string} audioUrl
 * @param {string} audioDuration
 * @returns {object}
 */
export const MessageBubbleContent = (isSent, content, audioUrl, audioDuration) =>
{
	const bubbleClasses = isSent
		? "bg-primary text-primary-foreground self-end rounded-tr-none"
		: "bg-muted text-foreground self-start rounded-tl-none";

	return Div({ class: `rounded-md p-3 max-w-[80%] ${bubbleClasses}` }, [
		MessageContent(content),
		audioUrl && AudioBubble(audioUrl, audioDuration)
	]);
};

/**
 * MessageCredits
 *
 * Displays credit cost if applicable
 *
 * @param {number} credits
 * @param {string} sentTime
 * @returns {object}
 */
export const MessageCredits = (credits, sentTime) =>
	(credits >= 0) && Div({
		class: "text-[11px] text-muted-foreground mt-1"
	}, `Sent for ${credits} credits | ${sentTime}`);
