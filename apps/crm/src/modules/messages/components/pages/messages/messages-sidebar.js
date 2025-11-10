import { Div, H3, Header, Span } from "@base-framework/atoms";
import { Model } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Skeleton } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, StaticStatusIndicator } from "@base-framework/ui/molecules";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";

/**
 * Handle user selection - create or open conversation
 *
 * @param {object} follower
 */
const handleFollowerClick = (follower) =>
{
	const followedUser = follower.followedUser || follower;
	const userName = followedUser.displayName || `${followedUser.firstName || ''} ${followedUser.lastName || ''}`.trim() || followedUser.email;

	const conversationModel = new ConversationModel({
		userId: app.data.user.id,
		participantId: followedUser.id,
		title: `Conversation with ${userName}`,
		type: 'direct'
	});

	conversationModel.xhr.add({}, (result) =>
	{
		if (result && result.id)
		{
			app.navigate(`messages/${result.id}`);
			return;
		}

		app.notify({
			type: 'error',
			title: 'Error',
			description: 'Failed to start conversation. Please try again.',
			icon: Icons.circleX
		});
	});
};

/**
 * Sidebar row item to display the user's name and status,
 * then create/open conversation on click.
 *
 * @returns {object}
 */
const SidebarRowItem = () =>
{
	return (follower) =>
	{
		const followedUser = follower.followedUser || follower;
		const displayName = followedUser.displayName || `${followedUser.firstName || ''} ${followedUser.lastName || ''}`.trim() || followedUser.email;
		const avatarSrc = followedUser.image ? `/files/users/profile/${followedUser.image}` : null;

		return Div({
			class: "flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer",
			click: () => handleFollowerClick(follower)
		},
			[
				Div({ class: "flex items-center gap-2" }, [
					Div({ class: "relative flex-none" }, [
						Avatar({
							src: avatarSrc,
							alt: displayName,
							fallbackText: displayName,
							size: "sm",
						}),
						Div({ class: "absolute bottom-0 right-0" }, [
							StaticStatusIndicator(followedUser.status || 'offline')
						])
					]),
					Span({ class: "text-sm font-medium capitalize" }, displayName)
				])
			]);
	};
};

/**
 * FollowingModel
 *
 * Model for fetching the user's following list
 *
 * @returns {object}
 */
const FollowingModel = Model.extend({
	url: `/api/user/[[userId]]/following`,
});

/**
 * MessagesSidebar
 *
 * A sidebar that lists the user's following connections for starting conversations.
 * Clicking an item creates a new conversation or opens the existing one with that user.
 *
 * @returns {object}
 */
export const MessagesSidebar = () =>
{
	const userId = app.data.user?.id;
	if (!userId)
	{
		return Div({ class: "flex-auto flex-col pb-12 hidden 2xl:flex p-6 border-l bg-sidebar w-full max-w-[320px] h-full" }, 'No user data available.');
	}

	const data = new FollowingModel({
		userId,
		orderBy: {
			createdAt: 'DESC'
		}
	});

	return Div({ class: "flex-auto flex-col pb-12 hidden 2xl:flex p-6 border-l bg-sidebar w-full max-w-[320px] h-full" },
		[
			Header({ class: "pb-4 px-2 flex flex-col" }, [
				H3({ class: "scroll-m-20 text-lg font-bold tracking-tight" }, "Connections")
			]),
			ScrollableList({
				data,
				key: 'id',
				items: [],
				skeleton: {
					number: 3,
					row: () => Div({ class: "flex flex-col gap-y-2 mt-4" }, [
						Skeleton({ width: "w-full", height: "h-10" }),
						Skeleton({ width: "w-full", height: "h-10" }),
						Skeleton({ width: "w-full", height: "h-10" })
					])
				},
				cache: 'connectionList',
				class: "flex flex-col gap-y-1 mt-4",
				rowItem: SidebarRowItem()
			})
		]);
};
