import { Button as ButtonAtom, Div, Img, OnState, P, Span } from "@base-framework/atoms";
import { Jot } from "@base-framework/base";
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
 * Common emoji reactions for quick access.
 */
const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

/**
 * Emoji picker popup.
 *
 * @param {boolean} isSent
 * @param {number} messageId
 * @param {function} toggleReaction
 * @returns {object}
 */
const EmojiPicker = (isSent, messageId, toggleReaction) =>
{
	// position to left for sent messages to avoid going off-screen
	const positionClass = !isSent ? "left-0" : "right-0";
	return Div({
		class: `absolute top-full ${positionClass} bg-popover bg-surface border rounded-lg shadow-lg p-2 flex gap-1 z-50`,
		click: (e) => e.stopPropagation()
	}, [
		...QUICK_EMOJIS.map(emoji =>
			ButtonAtom({
				class: "text-xl hover:bg-muted rounded p-1 transition-colors",
				click: () => {
					toggleReaction(messageId, emoji);
				}
			}, emoji)
		)
	]);
};

/**
 * FileSize
 *
 * Format bytes to human readable size
 *
 * @param {number} bytes
 * @returns {string}
 */
const formatFileSize = (bytes) =>
{
	if (!bytes) return '';
	if (bytes < 1024) return bytes + ' B';
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
	return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * AttachmentIcon
 *
 * Returns appropriate icon/styling based on file type
 *
 * @param {string} ext
 * @returns {object}
 */
const AttachmentIcon = (ext) =>
{
	const iconClasses = "w-10 h-10 rounded flex items-center justify-center text-white font-semibold text-xs";
	const extUpper = ext?.toUpperCase() || '?';

	// Color coding by file type
	const colorMap = {
		pdf: 'bg-red-500',
		doc: 'bg-blue-500',
		docx: 'bg-blue-500',
		xls: 'bg-green-600',
		xlsx: 'bg-green-600',
		txt: 'bg-gray-500',
		csv: 'bg-green-500',
		zip: 'bg-purple-500',
		default: 'bg-gray-400'
	};

	const bgColor = colorMap[ext?.toLowerCase()] || colorMap.default;
	return Div({ class: `${iconClasses} ${bgColor}` }, extUpper);
};

/**
 * Attachment
 *
 * @param {object} att
 * @returns {object}
 */
const Attachment = (att) =>
{
	const ext = att.fileName ? att.fileName.split('.').pop() : '';
	const isImage = (['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'webp'].includes(ext));
	const filePath = `/files/messages/${att.fileUrl}`;

	return Div({
		class: "group relative flex items-center gap-x-3 p-3 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card",
		click: () => window.open(filePath, '_blank')
	}, [
		// Image preview or file type icon
		isImage
			? Div({ class: "relative" }, [
				Img({
					src: filePath,
					alt: att.fileName,
					class: "w-16 h-16 rounded object-cover border border-border"
				}),
				// Overlay on hover for images
				Div({ class: "absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-all" })
			])
			: AttachmentIcon(ext),

		// File info
		Div({ class: "flex-1 min-w-0" }, [
			P({
				class: "text-sm font-medium truncate group-hover:text-primary transition-colors"
			}, att.displayName || att.fileName),
			Div({ class: "flex items-center gap-x-2 mt-1" }, [
				Span({
					class: "text-xs text-muted-foreground uppercase font-semibold"
				}, ext || 'file'),
				att.fileSize && Span({
					class: "text-xs text-muted-foreground"
				}, formatFileSize(att.fileSize))
			])
		]),

		// Download indicator
		Div({
			class: "opacity-0 group-hover:opacity-100 transition-opacity"
		}, [
			Span({
				class: "text-xs text-muted-foreground"
			}, "↗")
		])
	]);
};

export const Attachments = (attachments) =>
	Div({ class: "flex flex-col gap-y-2 mt-3" },
		attachments.map((att) =>
			Attachment(att)
		)
	);

/**
 * Reaction button that shows existing reactions.
 *
 * @param {object} reaction
 * @param {function} onClick
 * @returns {object}
 */
const ReactionButton = (reaction, onClick) =>
	ButtonAtom({
		class: `text-xs px-2 py-1 rounded-full border transition-colors ${
			reaction.hasCurrentUser
				? 'bg-primary/20 border-primary text-primary'
				: 'bg-muted border-border hover:bg-muted/80'
		}`,
		click: onClick
	}, `${reaction.emoji} ${reaction.count}`);

/**
 * Add reaction button with conditional emoji picker.
 *
 * @param {number} messageId
 * @param {boolean} isSent
 * @param {function} onEmojiSelect
 * @param {boolean} hasReactions
 * @returns {object}
 */
const AddReactionButton = (messageId, isSent, onEmojiSelect, hasReactions) =>
	Div({
		class: `relative ${!hasReactions ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`
	}, [
		OnState('emojiPickerOpen', (open) => open && EmojiPicker(isSent, messageId, (msgId, emoji) => {
			onEmojiSelect(msgId, emoji);
		}))
	]);

/**
 * Display reactions for a message.
 *
 * @param {object} msg
 * @param {function} toggleReaction
 * @param {boolean} isSent
 * @returns {object}
 */
const ReactionDisplay = (msg, toggleReaction, isSent) =>
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
	const hasReactions = reactionButtons.length > 0;

	return Div({
		class: `flex gap-1 mt-1 flex-wrap items-center`
	}, [
		...reactionButtons.map(reaction =>
			ReactionButton(reaction, () => toggleReaction(msg.id, reaction.emoji))
		),
		AddReactionButton(
			msg.id,
			isSent,
			toggleReaction,
			hasReactions
		)
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
export const MessageBubble = Jot(
{
	/**
	 * Set up state for emoji picker.
	 *
	 * @returns {object}
	 */
	state()
	{
		return {
			emojiPickerOpen: false
		};
	},

	/**
	 * Toggle emoji picker visibility.
	 *
	 * @returns {void}
	 */
	toggleEmojiPicker()
	{
		// @ts-ignore
		this.state.emojiPickerOpen = !this.state.emojiPickerOpen;
	},

	/**
	 * Toggle reaction on message.
	 *
	 * @param {number} messageId
	 * @param {string} emoji
	 */
	toggleReaction(messageId, emoji)
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
				// Call the callback to refresh the message in the list
				// @ts-ignore
				if (this.onReactionToggle)
				{
					// @ts-ignore
					this.onReactionToggle(messageId);
				}
			}
		});
	},

	/**
	 * Render the message bubble.
	 *
	 * @returns {object}
	 */
	render()
	{
		// @ts-ignore
		const msg = this.message;
		const isSent = (msg.senderId === userId());
		const bubbleClasses = isSent
			? "bg-primary text-primary-foreground self-end rounded-tr-none"
			: "bg-muted text-foreground self-start rounded-tl-none";

		return Div({
				class: `group flex flex-none flex-col relative ${isSent ? "items-end" : "items-start"}`,
				// @ts-ignore
				pointerenter: () => this.state.emojiPickerOpen = true,
				// @ts-ignore
				pointerleave: () => this.state.emojiPickerOpen = false
			}, [
				// Name + time (with hover effect for time)
				Div({ class: "mb-1 flex items-center" }, [
					isSent
						? Span({ class: "text-xs text-muted-foreground mr-2 opacity-0 group-hover:opacity-100 transition-opacity" }, "You")
						: Span({ class: "text-xs text-muted-foreground mr-2" }, msg.displayName || msg.sender || 'Unknown'),
					Span({
						class: "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out text-xs text-muted-foreground ml-2 capitalize",
					}, TimeFrame({ dateTime: msg.createdAt }))
				]),
				// The bubble
				Div({ class: `rounded-md p-3 max-w-[80%]` }, [
					msg.content && Span({ class: "text-sm" }, msg.content),
					msg.audioUrl && AudioBubble(msg.audioUrl, msg.audioDuration),
				]),
				msg.attachments.length && Attachments(msg.attachments),
				// Reactions - outside the bubble so they don't get cut off
				// @ts-ignore
				ReactionDisplay(
					msg,
					// @ts-ignore
					(msgId, emoji) => this.toggleReaction(msgId, emoji),
					isSent
				),
				// Possibly a "sent for X credits" line
				(msg.credits >= 0) && Div({ class: "text-[11px] text-muted-foreground mt-1" },
					`Sent for ${msg.credits} credits | ${msg.sentTime}`
				)
			]
		);
	}
});

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