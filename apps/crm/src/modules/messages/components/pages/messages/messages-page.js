import { Div, OnRoute, OnXs, UseParent } from "@base-framework/atoms";
import { BlankPage } from "@base-framework/ui/pages";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";
import { MessagesSidebar } from "./messages-sidebar.js";
import { ThreadList } from "./thread/list/thread-list.js";
import { ThreadContentSwitch } from "./thread/thread-content-switch.js";

/**
 * Sets up the thread list container.
 *
 * @param {object} data
 * @returns {object}
 */
const createList = (data) =>
	Div({ class: "flex flex-auto w-full lg:max-w-[460px] lg:border-r", cache: "listContainer" }, [
		ThreadList({ data })
	]);

/**
 * MessagesPage
 *
 * A chat-like page that shows a thread of messages.
 * ThreadList handles its own data loading via ScrollableList.
 *
 * @returns {object}
 */
export const MessagesPage = () =>
{
	const userId = app.data.user.id;
	const data = new ConversationModel({
		userId: userId,
		filter: {
			view: 'all',
			userId: userId
		}
	});

	/**
	 * @type {object} Props
	 *
	 * This sets up the page props.
	 */
	const Props =
	{
		title: 'Messages',
		data
	};

	return new BlankPage(Props, [
		Div({ class: "flex w-full flex-col lg:flex-row h-full" }, [

			// Left: Thread List
			OnXs((size) =>
			{
				if (size === "sm" || size === "xs")
				{
					/**
					 * Tracks the route to add or remove the thread list
					 * based on the selected message on small devices.
					 */
					return OnRoute('messageId', (messageId) =>
					{
						/**
						 * If a message is selected, remove the thread list.
						 */
						return (typeof messageId !== "undefined")
							? null
							: createList(data);
					});
				}

				/**
				 * Large displays always show the thread list.
				 */
				return createList(data);
			}),

			// Right: Content Switch for actual chat messages
			UseParent(({ list, route }) => (
				ThreadContentSwitch({
					delete: (id) =>
					{
						list.delete(id);
						app.navigate(`messages/${route.page}`);

						app.notify({
							type: "success",
							title: "Message Deleted",
							description: "The message has been deleted.",
						});
					},
					mingle(row)
					{
						list.mingle(row);
					}
				})
			)),

			MessagesSidebar()
		])
	]);
};

export default MessagesPage;