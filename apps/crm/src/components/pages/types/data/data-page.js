import { Div, UseParent } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";

/**
 * ContentContainer
 *
 * This component provides a styled container for content pages,
 * ensuring consistent spacing and responsive design.
 *
 * @param {Array|object} children - The content components to render
 * @returns {object}
 */
export const ContentContainer = (children) => (
	Div({ class: "p-6 2xl:mx-auto w-full contained" }, children)
);

/**
 * DataPage
 *
 * A standardized page layout for pages that display data with route context.
 * Commonly used for contact lists, payment lists, and similar data-driven pages.
 *
 * @param {object} props - Page props including data model
 * @param {object} props.data - The data model for the page
 * @param {string} [props.class] - Additional CSS classes
 * @param {Function} children - Function that receives route and returns page content
 * @returns {object} A BlankPage component
 */
export const DataPage = Atom((props, children) =>
{
	const { data, class: className = 'pt-0', ...rest } = props;

	return new BlankPage({
		class: className,
		data,
		...rest
	}, [
		UseParent(({ route }) => children({ route, data }))
	]);
});

export default DataPage;
