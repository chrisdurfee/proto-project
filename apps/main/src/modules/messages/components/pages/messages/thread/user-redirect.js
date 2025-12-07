import { Div, OnRoute } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { EmptyState } from "@base-framework/ui/molecules";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";

/**
 * Finds the conversation for a given user ID or creates a new one.
 *
 * @param {number} userId
 */
const findConversation = (userId) =>
{
	const currentUserId = app.data.user.id;

	// Use backend to find existing conversation or create new one
	const conversationModel = new ConversationModel({
		userId: currentUserId
	});

	conversationModel.xhr.findOrCreate(
		{ participantId: userId },
		(result) =>
		{
			if (result?.success && result?.id)
			{
				app.navigate(`messages/${result.id}`, null, true);
				return;
			}

			app.navigate(`messages`, null, true);
			app.notify({
				type: 'warning',
				title: 'Error',
				description: result?.message ?? 'Failed to start conversation. Please try again.',
				icon: Icons.circleX
			});
		}
	);
}

/**
 * Creates a user redirect component.
 *
 * @returns {object}
 */
export const UserRedirect = () =>
{
	return OnRoute('userId', (userId) =>
	{
		if (!userId)
		{
			return Div({ class: 'flex flex-auto flex-col items-center justify-center h-full' }, [
				EmptyState({
					title: 'No User Found',
					description: 'The user does not exist. Please try another.',
					icon: Icons.user.default
				})
			]);
		}

		findConversation(userId);

		return Div({ class: 'flex flex-auto flex-col items-center justify-center h-full' }, [
			// EmptyState({
			//     title: 'Redirecting Conversation',
			//     description: 'We are connecting you to the users conversation.',
			//     icon: Icons.user.default
			// })
		]);
	})
};