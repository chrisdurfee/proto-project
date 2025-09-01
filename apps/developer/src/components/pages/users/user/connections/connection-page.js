import { UseParent } from "@base-framework/atoms";
import { Panel, UnderlinedTab } from "@base-framework/ui/organisms";
import FullTablePage from "@components/pages/types/full/table/full-table-page.js";
import FollowerPage from "./followers/follower-page.js";
import { PageHeader } from "./page-header.js";

/**
 * This will create the tab content.
 *
 * @returns {object}
 */
const TabContent = () => (
	UseParent(({ route }) => (
		new UnderlinedTab({
			class: '',
			options: [
				{
					label: 'Followers',
					href: `users/${route.userId}/connections`,
					component: () => FollowerPage(),
					uri: `users/:userId/connections`,
					exact: true
				},
				{
					label: 'Following',
					href: `users/${route.userId}/connections/following`,
					component: new Panel({ class: 'p-8' }, 'Stories content'),
					uri: `users/:userId/connections/following`,
				}
			]
		})
	))
);

/**
 * This will create the connection page.
 *
 * @returns {object}
 */
export const ConnectionPage = () => (
	FullTablePage([
		PageHeader(),
		TabContent()
	])
);

export default ConnectionPage;