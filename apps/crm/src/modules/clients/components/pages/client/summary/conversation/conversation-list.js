import { Div, P, Span, UseParent } from "@base-framework/atoms";
import { Atom, DateTime } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Avatar } from "@base-framework/ui/molecules";
import { Attachments } from "./attachments.js";

/**
 * DateDivider
 *
 * Renders a date divider between messages.
 *
 * @param {string} date
 * @returns {object}
 */
const DateDivider = (date) =>
	Div({ class: "flex justify-center mt-4" }, [
		Span({ class: "text-xs text-muted-foreground p-2" }, DateTime.format('standard', date))
	]);

/**
 * @typedef {object} Divider
 */
const Divider = {
    skipFirst: true,
    itemProperty: "createdAt",
    layout: DateDivider,
    customCompare: (a, b) => DateTime.format('standard', a) !== DateTime.format('standard', b)
};

/**
 * ConversationListItem
 *
 * Renders a single conversation entry with avatar, text, and attachments.
 *
 * @param {object} msg
 * @returns {object}
 */
const ConversationListItem = Atom((msg) =>
{
	const name = `${msg.firstName} ${msg.lastName}`;
	return Div({ class: "flex gap-x-3 px-6 py-4 hover:bg-muted/50" }, [
		Avatar({
			src: msg.image && `/files/users/profile/${msg.image}`,
			alt: name,
			fallbackText: name,
			size: "sm"
		}),
		Div({ class: "flex-1 gap-y-1" }, [
			P({ class: "text-sm font-medium" }, name),
			P({ class: "text-sm text-muted-foreground" }, msg.message),
			msg.attachments && msg.attachments.length > 0 &&
				Attachments(msg.attachments)
		])
	]);
});

/**
 * ConversationList
 *
 * @param {object} param0
 * @returns {object}
 */
export const ConversationList = ({ data }) =>
    UseParent((parent)=> (
        ScrollableList({
            scrollDirection: 'up',
            data,
            cache: "list",
            key: "id",
            role: "list",
            class: "flex flex-col",
            limit: 25,
            divider: Divider,
            rowItem: ConversationListItem,
            scrollContainer: parent.listContainer
        })
    ));
