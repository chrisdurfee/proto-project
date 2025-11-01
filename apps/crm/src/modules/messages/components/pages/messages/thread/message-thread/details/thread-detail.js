import { Div, OnState } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";
import { ConversationHeader } from "./conversation-header.js";
import { ConversationMessages } from "./conversation-messages.js";
import { HeaderSkeleton, ThreadSkeleton } from "./skeletons.js";
import { ThreadComposer } from "./thread-composer.js";

/**
 * ThreadDetail
 *
 * Displays a conversation with a header and list of messages using ScrollableList
 * to automatically fetch messages from the API.
 *
 * @type {typeof Component}
 */
export const ThreadDetail = Jot(
{
	state: { loaded: false },

	/**
	 * Setup the message data for this conversation.
	 *
	 * @returns {object}
	 */
	setData()
	{
		// Create message model instance with conversationId filter
		return new ConversationModel({
			userId: app.data.user.id,
			// @ts-ignore
			id: this.conversationId,
			filter: {
				// @ts-ignore
				conversationId: this.conversationId
			}
		});
	},

	/**
	 * Fetch messages after component is mounted.
	 *
	 * @return {void}
	 */
	after()
	{
		// @ts-ignore
		this.state.loaded = false;
		// @ts-ignore
		this.data.xhr.get({}, (response) =>
		{
			if (response && response.row)
			{
				const conversation = response.row;
				const currentUserId = app.data.user.id;

				// Find the other participant (not the current user)
				const otherParticipant = conversation.participants?.find(p => p.userId !== currentUserId);

				// Map participant data to expected format
				const otherUser = otherParticipant ? {
					id: otherParticipant.userId,
					firstName: otherParticipant.firstName,
					lastName: otherParticipant.lastName,
					displayName: otherParticipant.displayName,
					email: otherParticipant.email,
					image: otherParticipant.image,
					status: otherParticipant.userStatus
				} : null;

				// Set the conversation data with computed fields
				// @ts-ignore
				this.data.set({
					conversation: {
						...conversation
					},
					otherUser
				});
			}

			// @ts-ignore
			this.state.loaded = true;
		});
	},

	/**
	 * Render the detail view.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "flex flex-auto flex-col w-full bg-background" },
		[
			OnState("loaded", (loaded, ele, parent) =>
			{
				if (!loaded)
				{
					return Div([
						HeaderSkeleton(),
						ThreadSkeleton()
					]);
				}

				return Div({ class: "flex flex-col flex-auto max-h-screen relative" }, [
					ConversationHeader(),
					// @ts-ignore
					new ConversationMessages({
						// @ts-ignore
						conversationId: this.conversationId
					}),
					// @ts-ignore
					new ThreadComposer({
						// @ts-ignore
						conversationId: this.conversationId,
						placeholder: "Type something...",
						submitCallBack: (parent) =>
						{
							const shouldScroll = true;
							parent.list.fetchNew(shouldScroll);
						}
					})
				]);
			})
		]);
	}
});