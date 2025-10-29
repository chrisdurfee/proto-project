import { A, Div, H3, Header, Span, UseParent } from "@base-framework/atoms";
import { List } from "@base-framework/organisms";
import { Avatar, StaticStatusIndicator } from "@base-framework/ui/molecules";
import { AVAILABLE_USERS } from "./available-users.js";

/**
 * Sidebar row item to display the user's name and status,
 * then navigate to new conversation on click.
 *
 * @param {object} route
 * @returns {object}
 */
const SidebarRowItem = (route) => {
	return (user) => {
		return A({
			class: "flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer",
			href: "#",
			click: (e) => {
				e.preventDefault();
				// Navigate to new conversation with pre-selected user
				app.navigate('messages/all/new', { participantId: user.id });
			}
		},
			[
				Div({ class: "flex items-center gap-2" }, [
					Div({ class: "relative flex-none" }, [
						Avatar({
							src: user.avatar,
							alt: user.sender,
							fallbackText: user.sender,
							size: "sm",
						}),
						Div({ class: "absolute bottom-0 right-0" }, [
							StaticStatusIndicator(user.status)
						])
					]),
					Span({ class: "text-sm font-medium" }, user.sender)
				])
			]);
	};
};

/**
 * MessagesSidebar
 *
 * A sidebar that lists all available users for starting conversations.
 * Clicking an item opens a modal to start a new conversation with that user.
 *
 * @returns {object}
 */
export const MessagesSidebar = () =>
	Div({ class: "flex-auto flex-col pb-12 hidden 2xl:flex p-6 border-l bg-sidebar w-full max-w-[320px] h-full" },
		[
			Header({ class: "pb-4 px-2 flex flex-col" }, [
				H3({ class: "scroll-m-20 text-lg font-bold tracking-tight" }, "Connections")
			]),
			UseParent(({ route }) => (
				new List({
					key: 'id',
					items: AVAILABLE_USERS,
					class: "flex flex-col gap-y-1 mt-4",
					rowItem: SidebarRowItem(route)
				})
			))
		]);
