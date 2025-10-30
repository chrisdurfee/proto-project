import { A, Div, H3, Header, Span } from "@base-framework/atoms";
import { ScrollableList } from "@base-framework/organisms";
import { Skeleton } from "@base-framework/ui/atoms";
import { Avatar, StaticStatusIndicator } from "@base-framework/ui/molecules";
import { UserModel } from "@modules/users/components/pages/users/models/user-model.js";

/**
 * Sidebar row item to display the user's name and status,
 * then navigate to new conversation on click.
 *
 * @returns {object}
 */
const SidebarRowItem = () =>
{
	return (user) =>
	{
		const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
		const avatarSrc = user.image ? `/files/users/profile/${user.image}` : null;

		return A({
			class: "flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer",
			href: `messages/${user.id}`
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
							StaticStatusIndicator(user.status || 'offline')
						])
					]),
					Span({ class: "text-sm font-medium" }, displayName)
				])
			]);
	};
};

/**
 * MessagesSidebar
 *
 * A sidebar that lists all available users for starting conversations.
 * Clicking an item navigates to start a new conversation with that user.
 *
 * @returns {object}
 */
export const MessagesSidebar = () =>
{
	const data = new UserModel();

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
				cache: 'list',
				class: "flex flex-col gap-y-1 mt-4",
				rowItem: SidebarRowItem()
			})
		]);
};
