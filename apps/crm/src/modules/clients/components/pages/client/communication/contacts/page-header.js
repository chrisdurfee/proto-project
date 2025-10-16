import { Div, H1, Header } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { SearchInput as BaseSearch } from "@base-framework/ui/organisms";
import { ContactModal } from "./modals/contact-modal.js";

/**
 * This will create a search input for the contacts page.
 *
 * @returns {object}
 */
const SearchInput = () => (
	BaseSearch({
		class: 'min-w-40 lg:min-w-96',
		placeholder: 'Search contacts...',
		bind: 'search',
		keyup: (e, parent) => parent.list.refresh(),
		icon: Icons.magnifyingGlass.default
	})
);

/**
 * This will create a contact modal.
 *
 * @param {object} item
 * @param {object} parent
 * @returns {object}
 */
const Modal = (item, parent) => (
	ContactModal({
		item,
		clientId: parent.route.clientId,
		onClose: (data) =>
		{
			parent.list?.refresh();
		}
	})
);

/**
 * This will create a page header for the contacts page.
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
					Button({ variant: 'withIcon', class: 'text-muted-foreground', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }, 'Add Contact')
				]),
				Div({ class: 'flex lg:hidden mr-0' }, [
					Tooltip({ content: 'Add Contact', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }))
				])
			])
		]),
		Div({ class: 'flex lg:hidden w-full mx-auto my-4' }, [
			SearchInput()
		])
	])
);