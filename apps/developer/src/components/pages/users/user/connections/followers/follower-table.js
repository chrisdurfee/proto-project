import { A, Div, P, Span, Td, Thead, Tr } from "@base-framework/atoms";
import { Checkbox } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState, StaticStatusIndicator } from "@base-framework/ui/molecules";
import { CheckboxCol, HeaderCol, ScrollableDataTable } from "@base-framework/ui/organisms";

/**
 * This will create a follower user avatar.
 *
 * @param {object} row
 * @return {object}
 */
const FollowerUserAvatar = (row) => (
	A({
		href: `users/${row.id}`,
		class: 'flex items-center gap-x-4 no-underline text-inherit hover:text-primary'
	}, [
		Div({ class: 'relative' }, [
			Avatar({
				src: '/files/users/profile/' + row.image,
				alt: row.username,
				fallbackText: `${row.firstName} ${row.lastName}`
			}),
			StaticStatusIndicator(row.status)
		]),
		Div({ class: 'min-w-0 flex-auto' }, [
			Div({ class: 'flex items-center gap-2' }, [
				Span({ class: 'text-base font-semibold leading-6' }, `${row.firstName} ${row.lastName}`),
			]),
			P({ class: 'truncate text-sm leading-5 text-muted-foreground m-0' }, row.username)
		])
	])
);

/**
 * HeaderRow
 *
 * Renders the header row for the follower table.
 *
 * @returns {object}
 */
const HeaderRow = () =>
	Thead([
		Tr({ class: 'text-muted-foreground border-b' }, [
			CheckboxCol({ class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'user', label: 'User' }),
			HeaderCol({ key: 'email', label: 'Email', class: 'hidden md:table-cell' }),
			HeaderCol({ key: 'createdAt', label: 'Followed At', class: 'hidden md:table-cell' })
		])
	]);

/**
 * FollowerRow
 *
 * Renders a single follower entry row.
 *
 * @param {object} row - The follower entry data
 * @param {function} onSelect - Callback when the row is selected
 * @returns {object}
 */
export const FollowerRow = (row, onSelect) =>
	Tr({ class: 'items-center px-4 py-2 hover:bg-muted/50' }, [
		Td({ class: 'p-4 hidden md:table-cell' }, [
			new Checkbox({ checked: row.selected, class: 'mr-2', onChange: () => onSelect(row) })
		]),
		Td({ class: 'p-4' }, [
			FollowerUserAvatar(row)
		]),
		Td({ class: 'p-4 max-w-[200px] truncate hidden md:table-cell' }, [
			A({ href: `mailto:${row.email}`, class: 'text-muted-foreground', 'data-cancel-route': true }, row.email)
		]),
		Td({ class: 'p-4 hidden md:table-cell' }, [
			A({ href: `users/${row.id}`, class: 'text-muted-foreground' }, row.createdAt)
		])
	]);

/**
 * FollowerTable
 *
 * Creates a table displaying follower entries.
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
