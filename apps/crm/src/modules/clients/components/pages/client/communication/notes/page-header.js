import { Div, H1, Header } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { SearchInput as BaseSearch } from "@base-framework/ui/organisms";
import { NoteModal } from "./modals/note-modal.js";

/**
 * This will create a search input for the notes page.
 *
 * @returns {object}
 */
const SearchInput = () => (
	BaseSearch({
		class: 'min-w-40 lg:min-w-96',
		placeholder: 'Search notes...',
		bind: 'search',
		keyup: (e, parent) => parent.list.refresh(),
		icon: Icons.magnifyingGlass.default
	})
);

/**
 * This will create a note modal.
 *
 * @param {object} item
 * @param {object} parent
 * @returns {object}
 */
const Modal = (item, parent) => (
	NoteModal({
		item,
		clientId: parent.route.clientId,
		onClose: (data) =>
		{
			parent.list?.refresh();
		}
	})
);

/**
 * This will create a page header for the notes page.
 *
 * @returns {object}
 */
export const PageHeader = () => (
	Header({ class: 'flex flex-col pt-0 sm:pt-2 md:pt-0' }, [
		Div({ class: 'flex flex-auto items-center justify-between w-full' }, [
			Div({ class: 'flex flex-col gap-1' }, [
				H1({ class: 'text-3xl font-bold' }, 'Notes'),
			]),
			Div({ class: 'hidden lg:flex min-w-[440px]' }, [
				SearchInput()
			]),
			Div({ class: 'flex items-center gap-2' }, [
				Div({ class: 'hidden lg:flex' }, [
					Button({ variant: 'withIcon', class: 'text-muted-foreground', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }, 'Add Note')
				]),
				Div({ class: 'flex lg:hidden mr-0' }, [
					Tooltip({ content: 'Add Note', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }))
				])
			])
		]),
		Div({ class: 'flex lg:hidden w-full mx-auto my-4' }, [
			SearchInput()
		])
	])
);
