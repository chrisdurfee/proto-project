import { A, Div, P, Span, Td, Thead, Tr } from "@base-framework/atoms";
import { Badge, Button, Checkbox } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState } from "@base-framework/ui/molecules";
import { CheckboxCol, HeaderCol, ScrollableDataTable } from "@base-framework/ui/organisms";
import { ClientModal } from "../../organisms/modals/client-modal.js";
import { ClientDetailsModal } from "../../organisms/modals/client-details-modal.js";

/**
 * This will create a client avatar with company name.
 *
 * @param {object} row
 * @return {object}
 */
const ClientAvatar = (row) => (
	A({
		href: `clients/${row.id}`,
		class: 'flex items-center gap-x-4 no-underline text-inherit hover:text-primary'
	}, [
		Avatar({
			src: row.image,
			alt: row.companyName || `${row.firstName} ${row.lastName}`,
			fallbackText: row.companyName || `${row.firstName} ${row.lastName}`
		}),
		Div({ class: 'min-w-0 flex-auto' }, [
			Div({ class: 'flex items-center gap-2' }, [
				Span({ class: 'text-base font-semibold leading-6' }, row.companyName || `${row.firstName} ${row.lastName}`),
			]),
			P({ class: 'truncate text-sm leading-5 text-muted-foreground m-0' }, row.email || row.clientNumber || '-')
		])
	])
);

/**
 * This will format the status badge.
 *
 * @param {string} status
 * @returns {object}
 */
const StatusBadge = (status) =>
{
	const statusMap = {
		'active': 'green',
		'inactive': 'gray',
		'prospect': 'blue',
		'lead': 'yellow',
		'customer': 'green',
		'former': 'red'
	};

	const type = statusMap[status?.toLowerCase()] || 'gray';
	return Badge({ type }, status || 'Unknown');
};

/**
 * This will format the client type badge.
 *
 * @param {string} clientType
 * @returns {object}
 */
const ClientTypeBadge = (clientType) =>
{
	const typeMap = {
		'individual': 'blue',
		'business': 'purple',
		'enterprise': 'orange'
	};

	const type = typeMap[clientType?.toLowerCase()] || 'gray';
	return Badge({ type }, clientType || 'Individual');
};

/**
 * This will create a client row.
 *
 * @param {object} row
 * @param {function} onSelect
 * @return {object}
 */
export const ClientRow = (row, onSelect) => (
	Tr({ class: 'items-center px-4 py-2 hover:bg-muted/50 cursor-pointer' }, [
		Td({ class: 'p-4 hidden md:table-cell' }, [
			new Checkbox({
				checked: row.selected,
				class: 'mr-2',
				onChange: () => onSelect(row)
			})
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			A({ href: `clients/${row.id}`, class: 'text-muted-foreground' }, String(row.id))
		]),
		Td({ class: 'p-4' }, [
			ClientAvatar(row)
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			StatusBadge(row.status)
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			ClientTypeBadge(row.clientType)
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			A({ href: `clients/${row.id}`, class: 'text-muted-foreground' }, row.industry || '-')
		]),
		Td({ class: 'p-4 text-right hidden md:table-cell' }, [
			A({ href: `clients/${row.id}`, class: 'text-muted-foreground' }, row.totalRevenue ? `$${parseFloat(row.totalRevenue).toFixed(2)}` : '-')
		]),
		Td({ class: 'p-4 text-right' }, [
			Button({
				variant: 'ghost',
				size: 'sm',
				icon: Icons.eye,
				click: (e) => {
					e.preventDefault();
					e.stopPropagation();
					ClientDetailsModal({
						client: row,
						onUpdate: (data) => {
							// Refresh the list if needed
							if (data === null) {
								// Client was deleted
								window.location.reload();
							}
						}
					});
				}
			})
		])
	])
);

/**
 * This will create a header for the client table.
 *
 * @return {object}
 */
const HeaderRow = () => (
	Thead([
		Tr({ class: 'text-muted-foreground border-b' }, [
			CheckboxCol({ class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'id', label: 'ID', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'name', label: 'Name' }),
			HeaderCol({ key: 'status', label: 'Status', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'clientType', label: 'Type', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'industry', label: 'Industry', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'totalRevenue', label: 'Total Revenue', class: 'hidden md:table-cell', align: 'justify-end' }),
			HeaderCol({ key: 'actions', label: '', align: 'justify-end' })
		])
	])
);

/**
 * This will create an empty state for the client list.
 * @returns {object}
 */
const ClientListEmpty = () => EmptyState(
	{
		title: 'No Clients Found!',
		description: 'No clients have been found. Maybe create a new client.',
		icon: Icons.user.minus
	}, [
	Button({
		variant: 'withIcon',
		icon: Icons.circlePlus,
		click: (e, parent) => ClientModal({
			onClose: (data) =>
			{
				// @ts-ignore
				parent.list.refresh();
			}
		})
	}, 'Add Client')
]);

/**
 * This will create a client table.
 *
 * @param {object} data
 * @return {object}
 */
export const ClientTable = (data) => (
	ScrollableDataTable({
		data,
		cache: 'list',
		customHeader: HeaderRow(),
		rows: [],
		limit: 50,
		skeleton: true,
		rowItem: ClientRow,
		key: 'id',
		emptyState: ClientListEmpty
	})
);