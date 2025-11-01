import { Div, OnRoute } from "@base-framework/atoms";
import { DockableOverlay, Panel } from "@base-framework/ui/organisms";
import { ThreadDetail } from "./message-thread/details/thread-detail.js";
import { NewConversationForm } from "./message-thread/new-message/new-conversation-form.js";
import { ThreadEmptyState } from "./message-thread/thread-empty-state.js";

/**
 * This will create the dockable thread.
 *
 * @param {object} props
 * @returns {function}
 */
const DockableThread = (props) => (
	() => new DockableOverlay([
		OnRoute('conversationId', (conversationId) =>
		{
			if (!conversationId)
			{
				return ThreadEmptyState();
			}

			if (conversationId === 'new')
			{
				return new NewConversationForm({
					onCancel: () => app.navigate('messages/all'),
					onSuccess: (conversation) =>
					{
						if (props.mingle)
						{
							props.mingle(conversation);
						}
					}
				});
			}

			return new ThreadDetail({
				conversationId,
				delete: props.delete,
				mingle: props.mingle
			});
		})
	])
);

/**
 * This will create the empty thread message.
 *
 * @returns {object}
 */
const EmptyThread = () => (
	new Panel([
		Div({ class: "hidden lg:flex flex-auto flex-col" }, [
			Div({ class: "flex auto flex-col w-full h-full" }, [
				ThreadEmptyState()
			])
		])
	])
);

/**
 * ThreadContentSwitch
 *
 * Switches between a “ThreadEmptyState” and the actual “ThreadDetail.”
 *
 * @param {object} props
 * @returns {object}
 */
export const ThreadContentSwitch = (props) =>
	Div({
		class: "flex-auto flex-col w-full h-full hidden lg:flex",
		switch: [
			{
				uri: 'messages/:conversationId*',
				component: DockableThread(props)
			},
			{
				uri: 'messages*',
				component: EmptyThread
			}
		]
	});