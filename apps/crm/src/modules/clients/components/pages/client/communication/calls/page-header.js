import { Div, H1, Header } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { SearchInput as BaseSearch } from "@base-framework/ui/organisms";

/**
 * This will create a search input for the calls page.
 *
 * @returns {object}
 */
const SearchInput = () => (
	BaseSearch({
		class: 'min-w-40 lg:min-w-96',
		placeholder: 'Search calls...',
		bind: 'search',
		keyup: (e, parent) => parent.list.refresh(),
		icon: Icons.magnifyingGlass.default
	})
);

/**
 * This will create a page header for the calls page.
 *
 * @returns {object}
 */
export const PageHeader = () => (
	Header({ class: 'flex flex-auto flex-col pt-0 sm:pt-2 md:pt-0' }, [
		Div({ class: 'flex flex-auto items-center justify-between w-full' }, [
			Div({ class: 'flex flex-col gap-1' }, [
				H1({ class: 'text-3xl font-bold' }, 'Call History'),
			]),
			Div({ class: 'hidden lg:flex min-w-[440px]' }, [
				SearchInput()
			])
		]),
		Div({ class: 'flex lg:hidden w-full mx-auto my-4' }, [
			SearchInput()
		])
	])
);
