import { Button } from "@base-framework/ui/atoms";
import { EmptyState } from "@base-framework/ui/molecules";

/**
 * ListEmptyState
 *
 * Shown when no messages match the filter or route.
 *
 * @returns {object}
 */
export const ListEmptyState = () =>
    EmptyState({
        title: 'No Messages Found',
        description: 'We couldn\'t find any messages. Adjust your filter or start a new conversation.'
    }, [
        Button({
            variant: 'outline',
            class: 'my-8',
            click: () =>
            {
                // Navigate to new conversation form
                app.navigate('messages/new');
            }
        }, 'Start a conversation')
    ]);