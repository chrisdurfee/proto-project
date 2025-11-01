import { A, Button as ButtonAtom, Div, Img, Span } from "@base-framework/atoms";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { TimeFrame } from "@base-framework/ui/molecules";
import { MessageReactionModel } from "@modules/messages/models/message-reaction-model.js";

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
 * Display file attachment.
 *
 * @param {object} attachment
 * @returns {object}
 */
const AttachmentDisplay = (attachment) =>
{
	const isImage = attachment.fileType?.startsWith('image/');
	const fileIcon = isImage ? Icons.image : Icons.fileText;
	const downloadUrl = `/files/messages/${attachment.fileUrl}`;

	return Div({ class: "mt-2 border rounded-md p-2 bg-background/50" }, [
		isImage
			? A({ href: downloadUrl, target: "_blank", class: "block" }, [
				Img({
					src: downloadUrl,
					alt: attachment.fileName,
					class: "max-w-xs max-h-48 rounded object-cover"
				})
			  ])
			: Div({ class: "flex items-center gap-2" }, [
				Div({ class: "text-muted-foreground" }, fileIcon({ size: 20 })),
				A({
					href: downloadUrl,
					download: attachment.fileName,
					class: "text-sm text-primary hover:underline flex-1"
				}, attachment.fileName || 'Download'),
				Span({ class: "text-xs text-muted-foreground" },
					attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)}KB` : ''
				)
			  ])
	]);
};

/**
 * Display reactions for a message.
 *
 * @param {object} msg
 * @param {function} toggleReaction
 * @returns {object}
 */
const ReactionDisplay = (msg, toggleReaction) =>
{
	const currentUserId = userId();
	const reactions = msg.reactions || [];

	// Group reactions by emoji
	const grouped = reactions.reduce((acc, reaction) => {
		if (!acc[reaction.emoji]) {
			acc[reaction.emoji] = {
				emoji: reaction.emoji,
				count: 0,
				users: [],
				hasCurrentUser: false
			};
		}
		acc[reaction.emoji].count++;
		acc[reaction.emoji].users.push(reaction.userId);
		if (reaction.userId === currentUserId) {
			acc[reaction.emoji].hasCurrentUser = true;
		}
		return acc;
	}, {});

	const reactionButtons = Object.values(grouped);

	return Div({ class: "flex gap-1 mt-1 flex-wrap" }, [
		...reactionButtons.map(reaction =>
			ButtonAtom({
				class: `text-xs px-2 py-1 rounded-full border transition-colors ${
					reaction.hasCurrentUser
						? 'bg-primary/20 border-primary text-primary'
						: 'bg-muted border-border hover:bg-muted/80'
				}`,
				click: () => toggleReaction(msg.id, reaction.emoji)
			}, `${reaction.emoji} ${reaction.count}`)
		),
		// Add reaction button
		Button({
			variant: "ghost",
			size: "sm",
			icon: Icons.plus,
			class: "h-6 w-6 p-0 rounded-full",
			click: () => toggleReaction(msg.id, '👍') // Default to thumbs up for now
		})
	]);
};

/**
 * MessageBubble
 *
 * A single message bubble from thread.thread array.
 * Supports attachments and reactions.
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

	/**
	 * Toggle reaction on message.
	 *
	 * @param {number} messageId
	 * @param {string} emoji
	 */
	const toggleReaction = (messageId, emoji) =>
	{
		const reactionData = new MessageReactionModel({
			messageId: messageId,
			userId: userId(),
			emoji: emoji
		});

		reactionData.xhr.toggle({}, (response) =>
		{
			if (response && response.success)
			{
				// Optimistically update UI - in a real app you'd refresh the message
				app.notify({
					title: response.action === 'added' ? 'Reaction added' : 'Reaction removed',
					icon: Icons.circleCheck
				});
			}
		});
	};

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
			msg.audioUrl && AudioBubble(msg.audioUrl, msg.audioDuration),
			// Display attachments if any
			...(msg.attachments || []).map(attachment => AttachmentDisplay(attachment))
		]),
		// Reactions
		msg.reactions && msg.reactions.length > 0 && ReactionDisplay(msg, toggleReaction),
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