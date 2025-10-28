import { Div, OnRoute, OnXs, UseParent } from "@base-framework/atoms";
import { Data } from "@base-framework/base";
import { BlankPage } from "@base-framework/ui/pages";
import { ConversationModel } from "../../../models/conversation-model.js";
import { MessagesSidebar } from "./messages-sidebar.js";
import { ThreadList } from "./thread/list/thread-list.js";
import { ThreadContentSwitch } from "./thread/thread-content-switch.js";

/**
 * MessagesPage
 *
 * A chat-like page that shows a thread of messages (like your inbox example).
 * Now uses real API data instead of placeholder data.
 *
 * @returns {object}
 */
export const MessagesPage = () =>
{
	/**
	 * @type {object} Props
	 *
	 * This sets up the page props. Similar structure to the inbox example.
	 */
	const Props =
	{
		/**
		 * Sets up the page data.
		 *
		 * @returns {Data}
		 */
		setData()
		{
			return new Data({
				items: [],
				loaded: false,
				error: null
			});
		},

		/**
		 * Called after setup to load conversations and set default route.
		 *
		 * @returns {void}
		 */
		afterSetup()
		{
			// Load conversations from API
			this.loadConversations();

			if (!this.route.page)
			{
				// @ts-ignore
				app.navigate("messages/all", null, true);
			}
		},

		/**
		 * Load conversations from the API.
		 *
		 * @returns {void}
		 */
		loadConversations()
		{
			const conversationModel = new ConversationModel();

			conversationModel.xhr.getForUser({}, (response) =>
			{
				if (response.success && response.data)
				{
					// Transform API data to match frontend structure
					const conversations = this.transformConversations(response.data);
					this.data.items = conversations;
					this.data.loaded = true;
				}
				else
				{
					this.data.error = response.message || 'Failed to load conversations';
					this.data.loaded = true;
				}
			});
		},

		/**
		 * Transform API conversation data to match frontend structure.
		 *
		 * @param {Array} apiConversations
		 * @returns {Array}
		 */
		transformConversations(apiConversations)
		{
			return apiConversations.map(conv => ({
				id: conv.id,
				sender: conv.title || conv.other_participant?.name || 'Unknown',
				content: conv.last_message?.content || 'No messages yet',
				time: conv.last_message_at || conv.created_at,
				status: conv.other_participant?.status || 'offline',
				avatar: conv.other_participant?.avatar || null,
				unreadCount: conv.unread_count || 0,
				thread: [] // Will be loaded when conversation is selected
			}));
		},

		/**
		 * Setup states for the messages page.
		 *
		 * @returns {object}
		 */
		setupStates()
		{
			return {
				filter: 'all' // e.g. could filter by unread, etc.
			};
		}
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
							: Div({ class: "flex flex-auto w-full lg:max-w-[460px] lg:border-r" }, [
								ThreadList()
							]);
					});
				}

				/**
				 * Large displays always show the thread list.
				 */
				return Div({ class: "flex flex-auto w-full lg:max-w-[460px] lg:border-r" }, [
					ThreadList()
				]);
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