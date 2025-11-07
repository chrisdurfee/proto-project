import { Div, H2, P } from "@base-framework/atoms";
import { Button } from "@base-framework/ui/atoms";

/**
 * ListEmptyState
 *
 * Shown when no messages match the filter or route.
 *
 * @returns {object}
 */
export const ListEmptyState = () =>
    Div({ class: "m-4 mt-8 p-4 rounded-md items-center justify-center text-center" }, [
        H2({ class: "text-xl font-semibold text-muted-foreground text-center" }, "No Messages Found"),
        P("We couldn't find any messages. Adjust your filter or start a new conversation."),
        Button({ variant: 'outline', class: 'my-8' }, 'Start a conversation')
    ]);