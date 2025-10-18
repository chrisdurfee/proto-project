import { Div } from '@base-framework/atoms';
import { ScrollableList } from '@base-framework/organisms';
import { Card } from '@base-framework/ui/atoms';
import { Icons } from '@base-framework/ui/icons';
import { Avatar, EmptyState, Modal } from '@base-framework/ui/molecules';
import { ClientModel } from '../../models/client-model.js';
import { SearchInput as BaseSearch } from './search-input.js';

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
	const displayName = client.companyName || 'Unknown';
	const statusColors = {
		active: 'text-emerald-500',
		inactive: 'text-red-500'
	};
	const statusColor = statusColors[client.status] || 'text-muted-foreground';

	return Card({
		class: 'flex items-center gap-x-3 p-3 cursor-pointer',
		margin: 'my-2',
		hover: true,
		click: (e, { parent }) => onClick?.(client, parent)
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
				client.industry && Div({ class: 'capitalize' }, client.industry),
				client.city && client.city && Div('•'),
				client.state && Div(`${client.state}`),
				Div({ class: `${statusColor} capitalize` }, client.status || 'Unknown')
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
		keyup: (e, parent) => parent.list?.refresh(),
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
	const handleClientClick = (client, parent) =>
	{
        parent?.close();

        const clientId = client.id ?? '';
		app.navigate(`clients/${clientId}`);
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
			Div({ class: 'flex-1 overflow-hidden mt-8' }, [
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
