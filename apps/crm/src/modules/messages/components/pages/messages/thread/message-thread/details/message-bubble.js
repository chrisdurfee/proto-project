import { Div } from "@base-framework/atoms";
import { Jot } from "@base-framework/base";
import { MessageReactionModel } from "@modules/messages/models/message-reaction-model.js";
import { Attachments } from "./attachment.js";
import { MessageBubbleContent, MessageCredits, MessageHeader } from "./message-bubble-layout.js";
import { ReactionDisplay } from "./reaction.js";

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
		const currentUserId = userId();

		return Div({
				class: `group flex flex-none flex-col ${isSent ? "items-end" : "items-start"}`,
				// @ts-ignore
				pointerenter: () => this.state.emojiPickerOpen = true,
				// @ts-ignore
				pointerleave: () => this.state.emojiPickerOpen = false
			}, [
				MessageHeader(isSent, msg.displayName || msg.sender, msg.createdAt),
				MessageBubbleContent(isSent, msg.content, msg.audioUrl, msg.audioDuration),
				msg.attachments.length && Attachments(msg.attachments),
				// @ts-ignore
				ReactionDisplay(
					msg,
					// @ts-ignore
					(msgId, emoji) => this.toggleReaction(msgId, emoji),
					isSent,
					currentUserId
				),
				MessageCredits(msg.credits, msg.sentTime)
			]
		);
	}
});