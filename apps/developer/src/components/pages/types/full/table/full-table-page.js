import { Div } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";

/**
 * TableContainer
 *
 * This component provides a styled container for tables, ensuring consistent padding,
 * scrolling behavior, and responsive design.
 *
 * @returns {object}
 */
export const TableContainer = (children) => (
    Div({ class: 'flex flex-auto flex-col gap-y-2 md:gap-y-4' }, [
        Div({ class: 'flex flex-auto flex-col overflow-x-auto' }, children)
    ])
);

/**
 * FullTablePage
 *
 * This will create a full table page.
 *
 * @param {object} props
 * @returns {BlankPage}
 */
export const FullTablePage = Atom((props, children) => (
	new BlankPage({
        ...props,
        /**
		 * This will remove the padding.
		 */
		class: 'pt-0',
    }, [
        Div({ class: 'grid grid-cols-1 flex-auto' }, [
            Div({ class: 'flex flex-auto flex-col p-6 pt-0 gap-y-6 md:gap-y-12 md:pt-6 lg:p-8 w-full mx-auto' }, children)
        ])
    ])
));

export default FullTablePage;