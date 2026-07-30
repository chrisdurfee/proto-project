import { Div, H1, Header } from "@base-framework/atoms";
import { BackButton } from "@base-framework/ui/organisms";
import { SidebarMenu } from "./sidebar-menu.js";
import { UserAvatar } from "./user-avatar.js";

/**
 * Toolbar
 *
 * Displays a back button in the toolbar.
 *
 * @returns {object}
 */
const Toolbar = () => (
	Div({ class: "flex w-full flex-col gap-y-8 pb-8 mt-4 md:mt-0 md:pl-2" }, [
		Div({ class: "flex items-center justify-between" }, [
			Header({ class: 'flex gap-x-4 items-center' }, [
				BackButton({
					margin: 'm-0 ml-0',
					backUrl: '/users'
				}),
				H1({ class: 'scroll-m-20 text-lg lg:text-lg font-bold tracking-tight truncate capitalize' }, '[[user.firstName]] [[user.lastName]]'),
			])
		]),
		UserAvatar()
	])
);

/**
 * This will create the Sidebar.
 *
 * @param {object} props
 * @returns {object}
 */
export const Sidebar = ({ userId }) => (
	SidebarMenu({
		topNav: Toolbar(),
		options: [
			{ label: 'Profile', href: `users/${userId}`, icon: 'badge', exact: true },
			{ label: 'Login Times', href: `users/${userId}/login-times`, icon: 'calendar_today' },
			{ label: 'Authorized Devices', href: `users/${userId}/authed-devices`, icon: 'smartphone' },
			{ label: 'Connections', href: `users/${userId}/connections`, icon: 'group' }
		]
	})
);