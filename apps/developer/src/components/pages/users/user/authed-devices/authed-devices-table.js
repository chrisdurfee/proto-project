import { A, Span, Td, Thead, Tr } from "@base-framework/atoms";
import { Badge, Checkbox } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { EmptyState } from "@base-framework/ui/molecules";
import { CheckboxCol, HeaderCol, ScrollableDataTable } from "@base-framework/ui/organisms";

/**
 * HeaderRow
 *
 * Renders the header row for the authed devices table.
 *
 * @returns {object}
 */
const HeaderRow = () =>
	Thead([
		Tr({ class: 'text-muted-foreground border-b' }, [
			CheckboxCol({ class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'platform', label: 'Platform' }),
			HeaderCol({ key: 'brand', label: 'Brand', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'version', label: 'Version', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'model', label: 'Model', class: 'hidden lg:table-cell' }),
			HeaderCol({ key: 'createdAt', label: 'Authorized At', class: 'hidden md:table-cell' })
		])
	]);

/**
 * AuthedDeviceRow
 *
 * Renders a single authed device entry row.
 *
 * @param {object} row - The authed device entry data
 * @param {function} onSelect - Callback when the row is selected
 * @returns {object}
 */
export const AuthedDeviceRow = (row, onSelect) =>
	Tr({ class: 'items-center px-4 py-2 hover:bg-muted/50' }, [
		Td({ class: 'p-4 hidden md:table-cell' }, [
			new Checkbox({ checked: row.selected, class: 'mr-2', onChange: () => onSelect(row) })
		]),
		Td({ class: 'p-4' }, [
			Span({ class: 'font-medium' }, row.platform || '-')
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			Span({ class: 'text-muted-foreground' }, row.brand || '-')
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			Badge({ variant: 'outline' }, row.version || '-')
		]),
		Td({ class: 'p-4 hidden lg:table-cell' }, [
			Span({ class: 'text-muted-foreground' }, row.model || '-')
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			A({ href: `users/${row.userId || ''}`, class: 'text-muted-foreground' }, row.createdAt || '-')
		])
	]);

/**
 * AuthedDevicesTable
 *
 * Creates a table displaying authorized device entries.
 *
 * @param {object} data
 * @returns {object}
 */
export const AuthedDevicesTable = (data) =>
	ScrollableDataTable({
		data,
		cache: 'list',
		limit: 50,
		customHeader: HeaderRow(),
		skeleton: true,
		rows: [],
		rowItem: AuthedDeviceRow,
		key: 'id',
		emptyState: () => EmptyState({
			title: 'No Authorized Devices',
			description: 'No devices have been authorized for this user.',
			icon: Icons.shield.check
		})
	});