import { Div, H1, Header } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { BackButton } from "@base-framework/ui/organisms";
import { ClientAvatar } from "./client-avatar.js";
import { SidebarMenu } from "./sidebar-menu.js";

/**
 * Toolbar
 *
 * Displays a back button in the toolbar.
 *
 * @returns {object}
 */
const Toolbar = () => (
	Div({ class: "flex w-full flex-col gap-y-8 pb-8 mt-2 md:pl-2" }, [
		Div({ class: "flex items-center justify-between" }, [
			Header({ class: 'flex gap-x-4 items-center' }, [
				BackButton({
					margin: 'm-0 ml-0',
					backUrl: '/clients'
				}),
				H1({ class: 'scroll-m-20 text-2xl lg:text-lg font-bold tracking-tight truncate' }, '[[client.companyName]]'),
			])
		]),
		ClientAvatar()
	])
);

/**
 * This will create the Sidebar.
 *
 * @param {object} props
 * @returns {object}
 */
export const Sidebar = ({ clientId }) => (
	SidebarMenu({
		topNav: Toolbar(),
		options: [
			{ label: 'Summary', href: `clients/${clientId}`, icon: Icons.office.single, exact: true },
			{
				label: 'Communication',
				icon: Icons.chat.group,
				options: [
					{ label: 'Contacts', href: `clients/${clientId}/contacts` },
					//{ label: 'Messages', href: `clients/${clientId}/messages` },
					{ label: 'Calls', href: `clients/${clientId}/calls` },
					{ label: 'Notes', href: `clients/${clientId}/notes` }
				]
			},
			{
				label: 'Billing',
				icon: Icons.currency.dollar,
				options: [
					{ label: 'Invoices', href: `clients/${clientId}/invoices` },
					{ label: 'Payments', href: `clients/${clientId}/payments` },
					{ label: 'Orders', href: `clients/${clientId}/orders` }
				]
			},
			{ label: 'Support', href: `clients/${clientId}/support`, icon: Icons.ticket }
		]
	})
);