import { Button as ButtonAtom, Div, OnState } from "@base-framework/atoms";

/**
 * Common emoji reactions for quick access.
 */
const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

/**
 * EmojiButton
 *
 * Single emoji button in picker
 *
 * @param {string} emoji
 * @param {function} onClick
 * @returns {object}
 */
const EmojiButton = (emoji, onClick) =>
	ButtonAtom({
		class: "text-xl hover:bg-muted rounded p-1 transition-colors",
		click: onClick
	}, emoji);

/**
 * EmojiPicker
 *
 * Displays emoji picker popup with quick reactions
 *
 * @param {boolean} isSent
 * @param {number} messageId
 * @param {function} toggleReaction
 * @returns {object}
 */
export const EmojiPicker = (isSent, messageId, toggleReaction) =>
{
	const positionClass = !isSent ? "left-0" : "right-0";

	return Div({
		class: `absolute top-full ${positionClass} bg-popover bg-surface border rounded-lg shadow-lg p-2 flex gap-1 z-50`,
		click: (e) => e.stopPropagation()
	},
		QUICK_EMOJIS.map(emoji =>
			EmojiButton(emoji, () => toggleReaction(messageId, emoji))
		)
	);
};

/**
 * ReactionButton
 *
 * Displays a single reaction with count and highlight if user reacted
 *
 * @param {object} reaction
 * @param {function} onClick
 * @returns {object}
 */
export const ReactionButton = (reaction, onClick) =>
	ButtonAtom({
		class: `text-xs px-2 py-1 rounded-full transition-colors ${
			reaction.hasCurrentUser
				? 'bg-primary/20 border-primary text-primary'
				: 'bg-muted border-border hover:bg-muted/80'
		}`,
		click: onClick
	}, `${reaction.emoji} ${reaction.count}`);

/**
 * AddReactionButton
 *
 * Button that opens emoji picker
 *
 * @param {number} messageId
 * @param {boolean} isSent
 * @param {function} onEmojiSelect
 * @param {boolean} hasReactions
 * @returns {object}
 */
export const AddReactionButton = (messageId, isSent, onEmojiSelect, hasReactions) =>
	Div({
		class: `relative ${!hasReactions ? 'opacity-0 group-hover:opacity-100 transition-opacity' : ''}`
	}, [
		OnState('emojiPickerOpen', (open) =>
			open && EmojiPicker(isSent, messageId, (msgId, emoji) => {
				onEmojiSelect(msgId, emoji);
			})
		)
	]);

/**
 * GroupReactions
 *
 * Groups reactions by emoji and counts them
 *
 * @param {Array} reactions
 * @param {number} currentUserId
 * @returns {Array}
 */
const groupReactions = (reactions, currentUserId) =>
{
	const grouped = reactions.reduce((acc, reaction) =>
    {
		if (!acc[reaction.emoji])
        {
			acc[reaction.emoji] =
            {
				emoji: reaction.emoji,
				count: 0,
				users: [],
				hasCurrentUser: false
			};
		}

		acc[reaction.emoji].count++;
		acc[reaction.emoji].users.push(reaction.userId);
		if (reaction.userId === currentUserId)
        {
			acc[reaction.emoji].hasCurrentUser = true;
		}
		return acc;
	}, {});

	return Object.values(grouped);
};

/**
 * ReactionDisplay
 *
 * Displays all reactions for a message with add button
 *
 * @param {object} msg
 * @param {function} toggleReaction
 * @param {boolean} isSent
 * @param {number} currentUserId
 * @returns {object}
 */
export const ReactionDisplay = (msg, toggleReaction, isSent, currentUserId) =>
{
	const reactions = msg.reactions || [];
	const reactionButtons = groupReactions(reactions, currentUserId);
	const hasReactions = reactionButtons.length > 0;

	return Div({ class: `flex gap-1 mt-1 flex-wrap items-center` }, [
		...reactionButtons.map(reaction =>
			ReactionButton(reaction, () => toggleReaction(msg.id, reaction.emoji))
		),
		AddReactionButton(msg.id, isSent, toggleReaction, hasReactions)
	]);
};
