import { Div } from "@base-framework/atoms";
import { SidebarMenuPage } from "@base-framework/ui/pages";

/**
 * FullSidebarMenuPage
 *
 * This will create a full sidebar menu page.
 *
 * @param {object} props
 * @returns {SidebarMenuPage}
 */
export const FullSidebarMenuPage = (props) => (
	new SidebarMenuPage({
		/**
		 * @member {string}	title
		 */
		title: props.title,

		/**
		 * @member {string}	basePath
		 */
		basePath: props.basePath,

		/**
		 * This will add the body of the page.
		 *
		 * @returns {object}
		 */
		addBody()
		{
			return Div({
				class: 'flex flex-auto flex-col',
				switch: this.addSwitch()
			});
		},

		/**
		 * @member {Array<object>} switch
		 */
		switch: props.switch,

		/**
		 * @member {Array<object>} links
		 */
		links: props.links
	})
);

export default FullSidebarMenuPage;