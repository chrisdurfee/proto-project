import { Div, On, OnRoute, OnState } from "@base-framework/atoms";
import { List } from "@base-framework/organisms";
import { ListEmptyState } from "./list-empty-state.js";
import { ThreadListHeader } from "./thread-list-header.js";
import { ThreadListItem } from "./thread-list-item.js";

/**
 * filterMessages
 *
 * Filters messages, e.g. unread vs. all.
 *
 * @param {Array<object>} messages
 * @param {string} filter
 * @returns {Array<object>}
 */
const filterMessages = (messages, filter) =>
{
    if (filter === 'unread')
    {
        return messages.filter(msg => msg.unreadCount >= 1);
    }
    return messages;
};

/**
 * ThreadList
 *
 * Similar to InboxList. Renders a list of messages on the left column.
 * Now uses API data from the parent component.
 *
 * @returns {object}
 */
export const ThreadList = () => (
    Div({ class: "w-full pt-0 lg:pt-2 flex flex-col gap-y-2 lg:overflow-y-auto lg:max-h-screen" }, [
        ThreadListHeader(),
        Div([
            OnRoute('page', (page, ele, { data, state }) =>
            {
                if (!page)
                {
                    page = 'all';
                    app.navigate('messages/all', null, true);
                }

                let items = data.items || [];
                if (page !== 'all')
                {
                    // Filter by specific page type if needed
                    items = [];
                }

                items = filterMessages(items, state.filter);
                // Don't overwrite data.items here as it comes from API
            }),
            OnState('filter', (filter, ele, { route, data }) =>
            {
                let items = data.items || [];
                if (route.page !== 'all')
                {
                    items = [];
                }

                items = filterMessages(items, filter);
                // Don't overwrite data.items here as it comes from API
            }),
            On('items', (items, ele, { state }) =>
            {
                items = filterMessages(items, state.filter);
                if (!items.length)
                {
                    return ListEmptyState({ filter: state.filter });
                }

                return new List({
                    cache: 'list',
                    key: 'id',
                    items,
                    role: 'list',
                    class: 'flex flex-col gap-y-2 px-4 pb-4',
                    rowItem: (message) => new ThreadListItem({ message })
                });
            }),
            On('loaded', (loaded, ele, { data, state }) =>
            {
                if (!loaded)
                {
                    // Show loading state
                    return Div({ class: 'flex flex-col gap-y-2 px-4 pb-4' }, [
                        ...Array.from({ length: 5 }, () => ThreadListItem.skeleton())
                    ]);
                }

                // Return null to let the items handler take over
                return null;
            })
        ])
    ])
);