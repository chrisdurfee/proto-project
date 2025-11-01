import { Div, Span } from "@base-framework/atoms";
import { TimeFrame } from "@base-framework/ui/molecules";

/**
 * Gets the user ID of the current user.
 *
 * @returns {function}
 */
const getUserId = () =>
{
	const userId = app.data.user.id;
	return () => userId;
};

const userId = getUserId();

/**
 * MessageBubble
 *
 * A single message bubble from thread.thread array.
 *
 * @param {object} msg
 * @returns {object}
 */
export const MessageBubble = (msg) =>
{
	const isSent = (msg.senderId === userId());
	const bubbleClasses = isSent
		? "bg-primary text-primary-foreground self-end rounded-tr-none"
		: "bg-muted text-foreground self-start rounded-tl-none";

	return Div({ class: `group flex flex-col max-w-[80%]` + (isSent ? " ml-auto" : " mr-auto") }, [
		// Name + time (with hover effect for time)
		Div({ class: "mb-1 flex items-center" }, [
			isSent
				? Span({ class: "text-xs text-muted-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity" }, "You")
				: Span({ class: "text-xs text-muted-foreground mr-2" }, msg.sender),
			Span({
				class: "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-xs text-muted-foreground ml-2 capitalize",
			}, TimeFrame({ dateTime: msg.createdAt }))
		]),
		// The bubble
		Div({ class: `rounded-md p-3 ${bubbleClasses}` }, [
			msg.content && Span({ class: "text-sm" }, msg.content),
			msg.audioUrl && AudioBubble(msg.audioUrl, msg.audioDuration)
		]),
		// Possibly a "sent for X credits" line
		(msg.credits >= 0) && Div({ class: "text-[11px] text-muted-foreground mt-1" },
			`Sent for ${msg.credits} credits | ${msg.sentTime}`
		)
	]);
};

/**
 * AudioBubble
 *
 * A placeholder for audio messages.
 *
 * @param {string} url
 * @param {string} duration
 * @returns {object}
 */
const AudioBubble = (url, duration) =>
	Div({ class: "flex items-center gap-3 mt-1" }, [
		Div({ class: "bg-background/50 p-2 rounded-md text-sm" }, "Audio wave placeholder"),
		Span({ class: "text-xs" }, duration || "00:00")
	]);