import { Div } from "@base-framework/atoms";
import { ScrollableList } from "@base-framework/organisms";
import { ListEmptyState } from "./list-empty-state.js";
import { ThreadListHeader } from "./thread-list-header.js";
import { ThreadListItem } from "./thread-list-item.js";

/**
 * ThreadList
 *
 * Renders a scrollable list of conversations using ConversationModel.
 *
 * @param {object} props
 * @returns {object}
 */
export const ThreadList = ({ data }) =>
{
	return Div({ class: "w-full pt-0 lg:pt-2 flex flex-col gap-y-2" }, [
		ThreadListHeader(),
		ScrollableList({
			data,
			key: 'id',
			role: 'list',
			class: 'flex flex-col gap-y-2 px-4 pb-4 overflow-y-auto',
			limit: 25,
			rowItem: (conversation) => new ThreadListItem({ message: conversation }),
			emptyState: () => ListEmptyState({ filter: 'all' })
		})
	]);
};