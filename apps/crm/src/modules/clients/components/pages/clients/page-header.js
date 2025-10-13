import { Div } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Combobox } from "@base-framework/ui/molecules";
import { SearchInput } from "@base-framework/ui/organisms";
import { PageHeader as TablePageHeader } from "@components/pages/types/page-header.js";
import { ClientModal } from "./client-modal.js";

/**
 * This will refresh the list.
 *
 * @param {object} e - The event object.
 * @param {object} parent - The parent object.
 * @returns {void}
 */
const refresh = (e, { list }) => list.refresh();

/**
 * This will create a client modal.
 *
 * @param {object} item
 * @param {object} parent
 * @returns {object}
 */
const Modal = (item, parent) => (
	ClientModal({
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

			data.filter.status = val;
			list.refresh();
		},
		items: [
			{ value: 'all', label: 'All' },
			{ value: 'active', label: 'Active' },
			{ value: 'inactive', label: 'Inactive' },
			{ value: 'prospect', label: 'Prospect' },
			{ value: 'lead', label: 'Lead' },
			{ value: 'customer', label: 'Customer' },
			{ value: 'former', label: 'Former' }
		]
	})
);

/**
 * This will create a page header for the clients page.
 *
 * @returns {object}
 */
export const PageHeader = () => (
	TablePageHeader({ title: 'Clients' }, [
		SearchInput({
			class: 'min-w-40 lg:min-w-96',
			placeholder: 'Search clients...',
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
			Button({ variant: 'withIcon', class: 'text-muted-foreground primary', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }, 'Add Client')
		]),
		Div({ class: 'flex lg:hidden mr-0' }, [
			Tooltip({ content: 'Add Client', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.circlePlus, click: (e, parent) => Modal(null, parent) }))
		])
	])
);