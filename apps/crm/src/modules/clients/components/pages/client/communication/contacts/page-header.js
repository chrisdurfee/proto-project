import { Div, H1, Header } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { SearchInput as BaseSearch } from "@base-framework/ui/organisms";

/**
 * This will convert contacts to options.
 *
 * @param {array} contacts
 * @returns {array}
 */
const convertContactsToOptions = (contacts) => contacts.map((contact) => ({ label: contact.name, value: contact.id }));

/**
 * This will create a search input for the contacts page.
 *
 * @returns {object}
 */
const SearchInput = () => (
	BaseSearch({
		class: 'min-w-40 lg:min-w-96',
		placeholder: 'Search clients...',
		bind: 'search',
		keyup: (e, parent) => parent.list.refresh(),
		icon: Icons.magnifyingGlass.default
	})
);

/**
 * This will create a page header for the clients page.
 *
 * @returns {object}
 */
export const PageHeader = () => (
	Header({ class: 'flex flex-auto flex-col pt-0 sm:pt-2 md:pt-0' }, [
		Div({ class: 'flex flex-auto items-center justify-between w-full' }, [
			H1({ class: 'text-3xl font-bold' }, 'Contacts'),
			Div({ class: 'hidden lg:flex min-w-[440px]' }, [
				SearchInput()
			]),
			Div({ class: 'flex items-center gap-2' }, [
				Div({ class: 'hidden lg:flex' }, [
					Button({ variant: 'withIcon', class: 'text-muted-foreground', icon: Icons.circlePlus, click: () => null }, 'Add Contact')
				]),
				Div({ class: 'flex lg:hidden mr-0' }, [
					Tooltip({ content: 'Add Contact', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.circlePlus, click: () => null }))
				])
			])
		]),
		Div({ class: 'flex lg:hidden w-full mx-auto my-4' }, [
			SearchInput()
		])
	])
);