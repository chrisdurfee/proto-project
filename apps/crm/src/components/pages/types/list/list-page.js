import { Div } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";

/**
 * ListContainer
 *
 * This component provides a styled container for lists, ensuring consistent padding,
 * scrolling behavior, and responsive design.
 *
 * @returns {object}
 */
export const ListContainer = (children) => (
	Div({ class: 'flex flex-auto flex-col gap-y-2 md:gap-y-4' }, [
		Div({ class: 'flex flex-auto flex-col overflow-x-auto' }, children)
	])
);

/**
 * ListPage
 *
 * This will create a list page.
 *
 * @param {object} props
 * @returns {BlankPage}
 */
export const ListPage = Atom((props, children) => (
	new BlankPage(
	{
		beforeDestroy()
		{
			super.beforeDestroy();
			this.list = null;
		},
		...props
	}, [
		Div({ class: 'grid grid-cols-1 flex-auto' }, [
			Div({ class: 'flex flex-auto flex-col p-6 pt-0 gap-y-6 md:gap-y-12 md:pt-6 lg:p-8 w-full mx-auto lg:max-w-7xl' }, children)
		])
	])
));

export default ListPage;