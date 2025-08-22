import { Td, Thead, Tr } from "@base-framework/atoms";
import { Checkbox } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { EmptyState } from "@base-framework/ui/molecules";
import { CheckboxCol, HeaderCol, ScrollableDataTable } from "@base-framework/ui/organisms";
import { MigrationModel } from "./models/migration-model";

/**
 * This will render a header row in the migration table.
 *
 * @returns {object}
 */
const MigrationHeaderRow = () => (
	Thead([
		Tr({ class: 'text-muted-foreground border-b' }, [
			CheckboxCol({ class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'id', label: 'ID', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'migration', label: 'Migration', class: 'max-w-[150px] md:max-w-none' }),
			HeaderCol({ key: 'createdAt', label: 'Created At', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'groupId', label: 'Group ID', align: 'justify-end' })
		])
	])
);

/**
 * This will render a row in the migration table.
 *
 * @param {object} row - Row data
 * @param {function} onSelect - Selection callback
 * @returns {object}
 */
export const MigrationRow = (row, onSelect) => (
	Tr({ class: 'items-center px-4 py-2 hover:bg-muted/50' }, [
		Td({ class: 'p-4 hidden md:table-cell' }, [
			new Checkbox({
				checked: row.selected,
				class: 'mr-2',
				onChange: () => onSelect(row)
			})
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, String(row.id)),
		Td({ class: 'p-4 truncate max-w-[150px] md:max-w-none' }, row.migration),
		Td({ class: 'p-4 hidden md:table-cell' }, row.createdAt),
		Td({ class: 'p-4 text-right justify-end' }, String(row.groupId))
	])
);

/**
 * This will create a migration table.
 *
 * @returns {object}
 */
export const MigrationTable = () => (
	ScrollableDataTable({
		data: new MigrationModel(),
		cache: 'list',
		customHeader: MigrationHeaderRow(),
		skeleton: true,
		rows: [],
		limit: 50,
		rowItem: MigrationRow,
		key: 'id',
		emptyState: () => EmptyState({
			title: 'No Migrations Found',
			description: 'No migrations have been found. Maybe create a new migration.',
			icon: Icons.stack
		})
	})
);