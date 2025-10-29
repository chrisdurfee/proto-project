import { Button, Div, H2, Header } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Card } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState } from "@base-framework/ui/molecules";
import { UserModel } from "@modules/users/components/pages/users/models/user-model.js";
import { SearchInput as BaseSearch } from './search-input.js';

/**
 * ClientSearchItem
 *
 * Renders a single client search result.
 *
 * @param {object} user
 * @param {function} onClick
 * @returns {object}
 */
const UserSearchItem = (user, onClick) =>
{
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const displayName = user.displayName || 'Unknown';
    const statusColors = {
        active: 'text-emerald-500',
        inactive: 'text-red-500'
    };

    return Card({
        class: 'flex items-center gap-x-3 p-3 cursor-pointer',
        margin: 'my-2',
        hover: true,
        click: (e, { parent }) => onClick?.(user, parent)
    }, [
        Avatar({
            src: `/files/users/profile/${user.image}`,
            alt: fullName,
            fallbackText: fullName,
            status: user.status,
            size: 'sm'
        }),
        Div({ class: 'flex flex-col flex-1 min-w-0' }, [
            Div({ class: 'font-medium truncate capitalize' }, fullName),
            Div({ class: 'flex items-center gap-2 text-sm text-muted-foreground' }, [
                displayName && Div({ class: 'capitalize' }, displayName)
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

/**
 * NewConversationForm
 *
 * A searchable list to select a user and start a new conversation.
 *
 * @type {typeof Component}
 */
export const NewConversationForm = Jot(
{
	/**
	 * Setup the form data and load users.
	 *
	 * @returns {object}
	 */
	setData()
	{
		return new UserModel({
            orderBy: {
                firstName: 'asc'
            }
        });
	},

	/**
	 * Render the form.
	 *
	 * @returns {object}
	 */
	render()
	{
        // @ts-ignore
        const data = this.data;
		return Div({ class: "flex flex-col h-full" }, [
			// Header
			Header({ class: "p-6 border-b" }, [
				Div({ class: "flex items-center justify-between mb-4" }, [
					H2({ class: "text-xl font-semibold" }, "Start New Conversation"),
					Button({
						variant: 'ghost',
						icon: Icons.x,
						click: () => app.navigate('messages/all')
					})
				]),
			]),

			// User List
			Div({ class: "flex flex-1 flex-col p-6 overflow-y-auto" }, [
				SearchInput(data),
                Div({ class: 'flex-1 overflow-hidden mt-8' }, [
                    ScrollableList({
                        data,
                        cache: 'list',
                        key: 'id',
                        role: 'list',
                        skeleton: true,
                        rowItem: (user) => UserSearchItem(user, handleClientClick),
                        emptyState: () =>
                        {
                            const searchValue = data.get?.().search || '';
                            return EmptyState({
                                title: 'No Users Found',
                                description: searchValue ? 'Try adjusting your search terms.' : 'Start typing to search users.',
                                icon: Icons.magnifyingGlass.default
                            });
                        }
                    })
                ])
			]),

			// Footer
			Div({ class: "border-t p-4" }, [
				Button({
					variant: 'outline',
					class: 'w-full',
					click: () => app.navigate('messages/all')
				}, 'Cancel')
			])
		]);
	}
});
