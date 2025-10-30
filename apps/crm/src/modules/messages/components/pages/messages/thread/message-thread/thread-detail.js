import { A, Div, OnState, Span, UseParent } from "@base-framework/atoms";
import { Component, DateTime, Jot } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Button, Icon, Skeleton } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState, StaticStatusIndicator, TimeFrame } from "@base-framework/ui/molecules";
import { BackButton } from "@base-framework/ui/organisms";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";
import { MessageModel } from "@modules/messages/models/message-model.js";
import { ThreadComposer } from "./thread-composer.js";

/**
 * HeaderSkeleton
 *
 * Skeleton for the conversation header while loading.
 *
 * @returns {object}
 */
const HeaderSkeleton = () =>
	Div({ class: "flex items-center p-4" }, [
		Div({ class: 'flex flex-auto items-center gap-3 lg:max-w-5xl m-auto' }, [
			Div({ class: "flex lg:hidden" }, [
				Skeleton({ width: "w-10", height: "h-10" })
			]),
			Skeleton({ shape: "circle", width: "w-12", height: "h-12" }),
			Skeleton({ width: "w-32", height: "h-4" }),
			Skeleton({ width: "w-16", height: "h-4", class: "ml-auto" })
		])
	]);

/**
 * ThreadSkeleton
 *
 * Skeleton placeholders for the chat messages.
 *
 * @returns {object}
 */
const ThreadSkeleton = () =>
	Div({ class: "flex flex-col gap-4 w-full h-full max-w-none lg:max-w-5xl m-auto p-4 pt-24" }, [
		Skeleton({ width: "w-1/2", height: "h-8", class: "rounded" }),
		Skeleton({ width: "w-2/3", height: "h-8", class: "rounded self-end" }),
		Skeleton({ width: "w-1/4", height: "h-8", class: "rounded" }),
	]);

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
					ConversationMessages({
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

/**
 * ConversationHeader
 *
 * A top bar: avatar, name, and right-side icons (call, video).
 * Fetches the other user's information from the participants array.
 *
 * @returns {object}
 */
const ConversationHeader = () =>
	Div({ class: "flex items-center p-4 bg-background/80 backdrop-blur-md absolute w-full z-10" }, [
		Div({ class: 'flex flex-auto items-center gap-3 lg:max-w-5xl m-auto' }, [
			// Left side back button
			Div({ class: 'flex lg:hidden' }, [
				BackButton({
					margin: 'm-0 ml-0',
					backUrl: '/messages',
					allowHistory: true
				})
			]),

			Div({ class: "flex items-center gap-3 flex-1" }, [
				Div({ class: "relative" }, [
					Avatar({
						src: '/files/users/profile/[[otherUser.image]]',
						alt: '[[otherUser.firstName]] [[otherUser.lastName]]',
						watcherFallback: '[[otherUser.firstName]] [[otherUser.lastName]]',
						size: "md"
					}),
					Div({ class: "absolute bottom-0 right-0" }, [
						StaticStatusIndicator('[[otherUser.status]]')
					])
				]),

				Div({ class: "flex flex-col" }, [
					Span({ class: "font-semibold text-base text-foreground capitalize" }, '[[otherUser.firstName]] [[otherUser.lastName]]'),
				])
			]),

			// Right side icons (video/call)
			Div({ class: "ml-auto flex items-center gap-1" }, [
				A({
					class: "bttn icon",
					href: '/messages/video/[[conversation.id]]',
				}, [
					Icon(Icons.videoCamera.default)
				]),
				Button({
					variant: "icon",
					icon: Icons.phone.default
				})
			])
		])
	]);

/**
 * This will create a date divider row.
 *
 * @param {string} date
 * @returns {object}
 */
const DateDivider = (date) => (
	Div({ class: "flex items-center justify-center mt-4" }, [
		Span({ class: "text-xs text-muted-foreground bg-background px-2" }, DateTime.format('standard', date))
	])
);

/**
 * ConversationMessages
 *
 * Renders the chat messages using ScrollableList with automatic data loading.
 *
 * @param {object} props - The props object containing conversationId
 * @returns {object}
 */
const ConversationMessages = (props) =>
{
	const data = new MessageModel({
		userId: app.data.user.id,
		conversationId: props.conversationId,
		orderBy: {
			createdAt: 'desc'
		}
	});

	return Div({
		class: "flex flex-col grow overflow-y-auto p-4 z-0",
		cache: 'listContainer'
	}, [
		Div({ class: "flex flex-auto flex-col w-full max-w-none lg:max-w-5xl mx-auto pt-24" }, [
			UseParent((parent) => (
				ScrollableList({
					scrollDirection: 'up',
					data,
					cache: 'list',
					key: 'id',
					role: 'list',
					class: 'flex flex-col gap-4',
					limit: 25,
					divider: {
						skipFirst: true,
						itemProperty: 'createdAt',
						layout: DateDivider,
						customCompare: (lastValue, value) => DateTime.format('standard', lastValue) !== DateTime.format('standard', value)
					},
					rowItem: (message) => MessageBubble(message),
					scrollContainer: parent.listContainer,
					emptyState: () => EmptyState({
						title: 'No messages yet',
						description: 'Start the conversation by sending a message!'
					})
				})
			))
		])
	]);
};

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
const MessageBubble = (msg) =>
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