import { A, Div, P, UseParent } from "@base-framework/atoms";
import { Skeleton } from "@base-framework/ui/atoms";
import { Avatar, StaticStatusIndicator, TimeFrame } from "@base-framework/ui/molecules";

/**
 * ThreadListItemSkeleton
 *
 * A Tailwind-based skeleton placeholder for loading states:
 * - Round avatar skeleton on the left
 * - Two lines of text and a small time skeleton on the right
 */
export const ThreadListItemSkeleton = () =>
    Div({ class: "flex items-center gap-3 p-4 lg:p-5 hover:bg-muted rounded-md" }, [
        Skeleton({ shape: "circle", width: "w-12", height: "h-12", class: "flex-none" }),
        Div({ class: "flex flex-col flex-1 gap-1" }, [
            Skeleton({ width: "w-1/2", height: "h-4", class: "rounded" }), // Name
            Skeleton({ width: "w-2/3", height: "h-3", class: "rounded mt-1" })  // Message snippet
        ]),
        Skeleton({ width: "w-10", height: "h-3", class: "rounded" })           // Timestamp
    ]);

/**
 * Gets the message preview based on the last message content and type.
 *
 * @param {object} conversation
 * @returns {string}
 */
const getMessagePreview = (conversation) =>
{
    if (!conversation.lastMessageContent)
    {
        return 'No messages yet';
    }

    if (conversation.lastMessageType === 'text')
    {
        return conversation.lastMessageContent;
    }

    return `[${conversation.lastMessageType}]`;
};

/**
 * ThreadListItem
 *
 * A list item showing a single thread's summary:
 * - Avatar (with status)
 * - Other participant's name
 * - Last message snippet (content)
 * - Unread count badge if any
 * - Timestamp
 *
 * Uses a skeleton while loading.
 *
 * @type {object}
 */
export const ThreadListItem = (conversation) =>
{
    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants?.find(p => p.userId !== conversation.userId) || {};

    const fullName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() || conversation.title || 'Unknown';
    const lastMessagePreview = getMessagePreview(conversation);

    return UseParent(({ parent }) =>
    {
        console.log(parent, conversation);
        return A({
            href: `messages/${conversation.conversationId}`,
            class: `
                flex items-center gap-3 p-4 lg:p-5 rounded-md hover:bg-muted/50
            `,

            /**
             * Highlights the current item if selected (based on route messageId).
             */
            onSet: [parent.route, "messageId", {
                'bg-muted/50': conversation.conversationId.toString()
            }],
        }, [
            // Avatar + status
            Div({ class: "relative flex-none" }, [
                Avatar({
                    src: otherParticipant.image ? `/files/users/profile/${otherParticipant.image}` : null,
                    alt: fullName,
                    fallbackText: fullName,
                    size: "md",
                }),
                Div({ class: "absolute bottom-0 right-0" }, [
                    StaticStatusIndicator(otherParticipant.status)
                ])
            ]),

            // Text content
            Div({ class: "flex flex-col flex-1" }, [
                Div({ class: "flex items-center justify-between" }, [
                    P({ class: "font-semibold text-base text-foreground capitalize" }, fullName),
                    Div({ class: "text-xs text-muted-foreground" },
                        TimeFrame({ dateTime: conversation.lastMessageAt || conversation.createdAt })
                    )
                ]),
                Div({ class: "flex items-center justify-between mt-1" }, [
                    P({ class: "text-sm text-muted-foreground line-clamp-1" }, lastMessagePreview),

                    // Unread count badge if any
                    (conversation.unreadCount > 0) && Div({
                        class: "ml-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center"
                    }, conversation.unreadCount.toString())
                ])
            ])
        ]);
    })
};