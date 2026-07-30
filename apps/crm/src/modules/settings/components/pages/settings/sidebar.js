
import { Confirmation } from "@base-framework/ui/molecules";
import { SidebarMenu } from "./sidebar-menu.js";

/**
 * This will create the Sidebar.
 *
 * @returns {object}
 */
export const Sidebar = () =>(
	SidebarMenu({
		title: 'Settings',
		options: [
			{ label: 'Profile', href: 'settings/profile', icon: 'person', exact: true },
			{ label: 'Appearance', href: 'settings/appearance', icon: 'light_mode' },
			{ label: 'Notifications', href: 'settings/notifications', icon: 'notifications' },
			{ label: 'Sign Out', icon: 'logout', callBack: () => {

				new Confirmation({
					icon: 'logout',
					type: 'destructive',
					title: 'Are you absolutely sure?',
					description: 'This will sign you out of the application.',
					confirmTextLabel: 'Sign Out',
					confirmed: () => app.signOut()
				}).open()
			} }
		]
	})
);