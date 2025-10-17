import { Div } from '@base-framework/atoms';
import { ScrollableList } from '@base-framework/organisms';
import { Card } from '@base-framework/ui/atoms';
import { Icons } from '@base-framework/ui/icons';
import { Avatar, EmptyState, Modal } from '@base-framework/ui/molecules';
import { SearchInput as BaseSearch } from '@base-framework/ui/organisms';
import { ClientModel } from '../../models/client-model.js';

/**
 * ClientSearchItem
 *
 * Renders a single client search result.
 *
 * @param {object} client
 * @param {function} onClick
 * @returns {object}
 */
const ClientSearchItem = (client, onClick) =>
{
	const displayName = client.displayName || client.name || 'Unknown';
	const statusColors = {
		active: 'text-emerald-500',
		inactive: 'text-red-500'
	};
	const statusColor = statusColors[client.status] || 'text-muted-foreground';

	return Card({
		class: 'flex items-center gap-x-3 p-3 cursor-pointer',
		margin: 'm-2',
		hover: true,
		click: () => onClick?.(client)
	}, [
		Avatar({
			src: client.avatar,
			alt: displayName,
			fallbackText: displayName,
			size: 'sm'
		}),
		Div({ class: 'flex flex-col flex-1 min-w-0' }, [
			Div({ class: 'font-medium truncate' }, displayName),
			Div({ class: 'flex items-center gap-2 text-sm text-muted-foreground' }, [
				client.gender && Div({ class: 'capitalize' }, client.gender),
				client.gender && client.age && Div('•'),
				client.age && Div(`${client.age}y`),
				(client.gender || client.age) && Div('•'),
				Div({ class: statusColor }, client.status || 'Unknown')
			])
		])
	]);
};

/**
 * This will create a search input for the calls page.
 *
 * @param {object} data
 * @returns {object}
 */
const SearchInput = (data) => (
	BaseSearch({
		class: 'min-w-40 lg:min-w-96 mt-2',
		placeholder: 'Search clients...',
		bind: 'search',
		autofocus: true,
		keyup: (e, parent) =>
		{
			e.stopPropagation();
			parent.list?.refresh();
		},
		icon: Icons.magnifyingGlass.default
	})
);

/**
 * ClientSearchModal
 *
 * A modal for searching clients.
 *
 * @param {object} props - The properties for the modal.
 * @returns {Modal} - A new instance of the Modal component.
 */
export const ClientSearchModal = (props = {}) =>
{
	const data = new ClientModel({
		search: '',
		filter: {}
	});

	/**
	 * Handle client selection
	 *
	 * @param {object} client
	 */
	const handleClientClick = (client) =>
	{
		if (client.id)
		{
			app.navigate(`clients/${client.id}`);
		}
	};

	return new Modal({
		data,
		title: 'Search Clients',
		icon: Icons.magnifyingGlass.default,
		description: 'Find and view client details.',
		size: 'sm',
		type: 'left',
		showFooter: false,
		onClose: () => props.onClose?.()
	}, [
		Div({ class: 'flex flex-col h-full' }, [
			SearchInput(data),
			Div({ class: 'flex-1 overflow-hidden' }, [
				ScrollableList({
					data,
					cache: 'list',
					key: 'id',
					role: 'list',
					skeleton: true,
					rowItem: (client) => ClientSearchItem(client, handleClientClick),
					emptyState: () =>
					{
						const searchValue = data.get?.().search || '';
						return EmptyState({
							title: 'No Clients Found',
							description: searchValue ? 'Try adjusting your search terms.' : 'Start typing to search clients.',
							icon: Icons.magnifyingGlass.default
						});
					}
				})
			])
		])
	]).open();
};
