import { Div, H1, Header } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Combobox } from "@base-framework/ui/molecules";
import { SearchInput } from "@base-framework/ui/organisms";
import { UserModal } from "./modals/user-modal.js";

/**
 * This will refresh the list.
 *
 * @param {object} e - The event object.
 * @param {object} parent - The parent object.
 * @returns {void}
 */
const refresh = (e, { list }) =>
{
	list.refresh();
};

/**
 * This will create a permission modal.
 *
 * @param {object} item
 * @param {object} parent
 * @returns {object}
 */
const Modal = (item, parent) => (
	UserModal({
		item,
		onClose: (data) =>
		{
			parent.list.refresh();
		}
	})
);

/**
 * This will create a dropdown for the page.
 *
 * @returns {object}
 */
const Dropdown = () => (
	new Combobox({
		width: 'w-full',
		maxWidth: 'max-w-[250px]',
		class: '',
		selectFirst: true,
		onSelect: (item, { data, list }) =>
		{
			const val = item.value;
			if (val === 'all')
			{
				data.filter = {};
				list.refresh();
				return;
			}

			const lowerVal = val.toLowerCase();
			data.filter.status = lowerVal;
			list.refresh();
		},
		items: [
			{ value: 'all', label: 'All' },
			{ value: 'online', label: 'Online'},
			{ value: 'offline', label: 'Offline' },
			{ value: 'busy', label: 'Busy' },
			{ value: 'away', label: 'Away' },
		]
	})
);

/**
 * This will create a page header for the errors page.
 *
 * @returns {object}
 */
export const PageHeader = () => (
	Header({ class: 'flex flex-col' }, [
		Div({ class: 'flex flex-auto items-center justify-between w-full' }, [
			H1({ class: 'text-3xl font-bold' }, 'Users'),
			Div({ class: 'flex items-center gap-2' }, [
				SearchInput({
					class: 'min-w-40 lg:min-w-96',
					placeholder: 'Search users...',
					bind: 'search',
					keyup: (e, parent) => parent.list.refresh(),
					icon: Icons.magnifyingGlass.default
				}),
				Div({ class: 'hidden lg:flex' }, [
					Button({ variant: 'withIcon', class: 'text-muted-foreground outline', icon: Icons.refresh, click: refresh }, 'Refresh')
				]),
				Div({ class: 'flex lg:hidden mr-0' }, [
					Tooltip({ content: 'Refresh', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.refresh, click: refresh }))
				]),
				Dropdown(),
				Div({ class: 'hidden lg:flex' }, [
					Button({ variant: 'withIcon', class: 'text-muted-foreground primary', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }, 'Add User')
				]),
				Div({ class: 'flex lg:hidden mr-0' }, [
					Tooltip({ content: 'Add User', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }))
				])
			])
		])
	])
);