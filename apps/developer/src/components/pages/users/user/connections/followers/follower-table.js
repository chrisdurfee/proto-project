import { Span, Td, Thead, Tr } from "@base-framework/atoms";
import { Checkbox } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { EmptyState } from "@base-framework/ui/molecules";
import { CheckboxCol, HeaderCol, ScrollableDataTable } from "@base-framework/ui/organisms";

/**
 * HeaderRow
 *
 * Renders the header row for the login log table.
 *
 * @returns {object}
 */
const HeaderRow = () =>
	Thead([
		Tr({ class: 'text-muted-foreground border-b' }, [
			CheckboxCol({ class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'userId', label: 'User ID' }),
			HeaderCol({ key: 'createdAt', label: 'Created At', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'direction', label: 'Type' }),
			HeaderCol({ key: 'ip', label: 'IP Address', class: 'hidden md:table-cell' })
		])
	]);

/**
 * LoginRow
 *
 * Renders a single login log entry row.
 *
 * @param {object} row - The login log entry data
 * @param {function} onSelect - Callback when the row is selected
 * @returns {object}
 */
export const FollowerRow = (row, onSelect) =>
	Tr({ class: 'items-center px-4 py-2 hover:bg-muted/50' }, [
		Td({ class: 'p-4 hidden md:table-cell' }, [
			new Checkbox({ checked: row.selected, class: 'mr-2', onChange: () => onSelect(row) })
		]),
		Td({ class: 'p-4' }, String(row.userId)),
		Td({ class: 'p-4 hidden md:table-cell' }, row.createdAt),
		Td({ class: 'p-4' }, Span({ class: 'capitalize' }, row.direction)),
		Td({ class: 'p-4 hidden md:table-cell' }, row.ip)
	]);

/**
 * LoginTable
 *
 * Creates a table displaying login log entries.
 *
 * @param {object} data
 * @returns {object}
 */
export const FollowerTable = (data) =>
	ScrollableDataTable({
		data,
		cache: 'list',
		limit: 50,
		customHeader: HeaderRow(),
		skeleton: true,
		rows: [],
		rowItem: FollowerRow,
		key: 'id',
		emptyState: () => EmptyState({
			title: 'No Followers',
			description: 'No worries. Followers come with time.',
			icon: Icons.user.default
		})
	});
