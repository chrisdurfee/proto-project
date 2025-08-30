import { SidebarMenuPage } from "@base-framework/ui/pages";
import FullSidebarMenuPage from "@pages/types/full/full-sidebar-menu-page.js";
import { IamSwitch } from "./iam-switch.js";
import { Links } from "./links.js";

/**
 * This will create the base path.
 *
 * @constant
 * @type {string}
 */
const BASE_PATH = 'iam';

/**
 * IamPage
 *
 * This will create an an iam page.
 *
 * @returns {SidebarMenuPage}
 */
export const IamPage = () => (
	FullSidebarMenuPage({
		/**
		 * @member {string}	title
		 */
		title: 'IAM',

		/**
		 * @member {string}	basePath
		 */
		basePath: BASE_PATH,

		/**
		 * @member {Array<object>} switch
		 */
		switch: IamSwitch(BASE_PATH),

		/**
		 * @member {Array<object>} links
		 */
		links: Links(BASE_PATH)
	})
);

export default IamPage;