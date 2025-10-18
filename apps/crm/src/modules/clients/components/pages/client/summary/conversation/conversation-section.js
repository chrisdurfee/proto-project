import { Div, H2, Header } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { ConversationModel } from "../../../../models/conversation-model.js";
import { ConversationList } from "./conversation-list.js";
import { ThreadComposer } from "./thread-composer.js";

/**
 * Composer
 *
 * @param {object} param0
 * @returns {object}
 */
const Composer = ({ client }) => (
	new ThreadComposer({
		placeholder: "Add a comment...",
		client,
		submitCallBack: (parent) =>
		{
			const shouldScroll = true;
			parent.list.fetchNew(shouldScroll);
		}
	})
);

/**
 * HeaderContainer
 *
 * @returns {object}
 */
const HeaderContainer = () => (
	Header({ class: "flex flex-col gap-y-2 p-6 bg-background/80 backdrop-blur-md sticky top-0 z-10" }, [
		H2({ class: "text-lg text-muted-foreground" }, "Conversation")
	])
);

/**
 * ConversationSection
 *
 * Displays conversation history and composer.
 *
 * @param {object} props
 * @param {object} props.client
 * @returns {object}
 */
export const ConversationSection = Atom(({ client }) =>
{
	const data = new ConversationModel({
		clientId: client.id,
		filter: {
			clientId: client.id
		},
		orderBy: {
			createdAt: 'desc'
		}
	});

	return Div({ class: "flex flex-auto flex-col max-h-screen gap-y-4 p-0 overflow-y-auto", cache: "listContainer" }, [
		HeaderContainer(),
		Div({ class: "flex-1 gap-y-2" }, [
			ConversationList({ data })
		]),
		Composer({ client })
	]);
});
