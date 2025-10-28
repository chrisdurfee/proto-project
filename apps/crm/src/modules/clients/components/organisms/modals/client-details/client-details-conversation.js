import { Div } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { ConversationModel } from "../../../models/conversation-model.js";
import { ConversationList } from "../../../pages/client/summary/conversation/conversation-list.js";
import { ThreadComposer } from "../../../pages/client/summary/conversation/thread-composer.js";

/**
 * ClientDetailsConversation
 *
 * Displays client conversation history in the client details modal.
 *
 * @param {object} props
 * @param {object} props.client - The client data
 * @param {string} props.clientId - The client ID
 * @returns {object}
 */
export const ClientDetailsConversation = Atom(({ client, clientId }) =>
{
	if (!clientId)
	{
		console.error('ClientDetailsConversation: clientId is required');
		return Div({ class: "p-4 text-center text-muted-foreground" }, "Unable to load conversation");
	}

	const data = new ConversationModel({
		clientId,
		orderBy: {
			createdAt: 'desc'
		}
	});

	return Div({ class: "flex flex-auto flex-col h-96 overflow-hidden" }, [
		// Conversation list
		Div({ class: "flex flex-1 flex-col overflow-y-auto", cache: "listContainer" }, [
			ConversationList({ data }),
            // Composer
            Div({ class: "sticky bottom-0" }, [
                new ThreadComposer({
                    placeholder: "Add a comment...",
                    client,
                    submitCallBack: (parent) =>
                    {
                        const shouldScroll = true;
                        // Find the conversation list and refresh it
                        const conversationList = parent.parent?.list || parent.parent?.parent?.list;
                        if (conversationList)
                        {
                            conversationList.fetchNew(shouldScroll);
                        }
                    }
                })
            ])
		])
	]);
});