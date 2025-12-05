import { Div } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";

/**
 * SummaryContainer
 *
 * This component provides a styled container for summary cards,
 * ensuring consistent overflow behavior and responsive design.
 *
 * @param {Array|object} children - The summary cards to render
 * @returns {object}
 */
export const SummaryContainer = (children) => (
	Div({ class: 'flex flex-none flex-col gap-y-4 lg:gap-y-4' }, children)
);

/**
 * TableContainer
 *
 * This component provides a styled container for tables within summary pages.
 *
 * @param {Array|object} children - The table to render
 * @returns {object}
 */
export const TableContainer = (children) => (
	Div({ class: 'flex flex-col overflow-x-auto' }, children)
);

/**
 * SummaryTablePage
 *
 * A standardized page layout for pages that include summary cards at the top
 * followed by a data table below. Commonly used for billing pages (invoices, orders).
 *
 * @param {object} props - Additional props to pass to BlankPage
 * @param {Array|object} children - Page header, summary cards, and table components
 * @returns {object} A BlankPage component
 */
export const SummaryTablePage = Atom((props, children) => (
	new BlankPage({
		...props
	}, [
		Div({ class: 'grid grid-cols-1 p-4 md:p-6 h-full' }, [
			Div({ class: 'flex flex-auto flex-col pt-0 lg:gap-y-12 w-full mx-auto 2xl:max-w-[1600px]' }, children)
		])
	])
));

export default SummaryTablePage;
