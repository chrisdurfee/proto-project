import { EmptyState } from "@base-framework/ui";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";

/**
 * ThreadEmptyState
 *
 * Shown when no specific message is selected.
 *
 * @returns {object}
 */
export const ThreadEmptyState = () =>
	EmptyState({
		title: 'No Thread Selected',
		description: 'Select a message from the list to view the conversation.',
		icon: Icons.airplane,
	}, [
		Button({
			variant: 'outline',
			class: 'my-8',
			click: () =>
			{
				// Navigate to new conversation form
				app.navigate('messages/new');
			}
		}, 'Start New Thread')
	]);