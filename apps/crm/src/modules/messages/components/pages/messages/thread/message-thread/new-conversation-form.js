import { Button, Div, Form, H2, Header, Input, Label, On, P, Select } from "@base-framework/atoms";
import { Data } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";
import { UserModel } from "@modules/users/components/pages/users/models/user-model.js";

/**
 * NewConversationForm
 *
 * A form to select a user and start a new conversation.
 *
 * @param {object} props
 * @returns {object}
 */
export const NewConversationForm = ({ onCancel, onSuccess }) =>
{
	const conversationModel = new ConversationModel();
	const userModel = new UserModel();

	const data = new Data({
        participantId: null,
        title: '',
        users: [],
        usersLoaded: false,
        isLoading: false
    });

	// Load users from API
	userModel.xhr.all({}, (response) => {
		if (response && response.data) {
			data.set({ users: response.data, usersLoaded: true });
		}
	});

	/**
	 * Handle user selection and conversation creation
	 */
	const handleNext = async () =>
	{
		const selectedId = data.get('participantId');
		if (!selectedId)
		{
			app.notify({
				type: 'error',
				title: 'Selection Required',
				description: 'Please select a user to start a conversation.',
				icon: Icons.alertCircle
			});
			return;
		}

		data.set({ isLoading: true });

		try
		{
			const users = data.get('users');
			const user = users.find(u => u.id === parseInt(selectedId));
			if (!user) {
				throw new Error('User not found');
			}
			const userName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
			const title = data.get('title') || `Conversation with ${userName}`;

			const result = await conversationModel.xhr.add({
				participantId: parseInt(selectedId),
				title: title,
				type: 'direct'
			});

			if (result && result.id)
			{
				app.notify({
					type: 'success',
					title: 'Conversation Started',
					description: `Started conversation with ${userName}`,
					icon: Icons.circleCheck
				});

				// Navigate to the new conversation
				app.navigate(`messages/all/${result.id}`);

				if (onSuccess)
				{
					onSuccess(result);
				}
			}
			else
			{
				throw new Error('Failed to create conversation');
			}
		}
		catch (error)
		{
			console.error('Error creating conversation:', error);
			app.notify({
				type: 'error',
				title: 'Error',
				description: 'Failed to start conversation. Please try again.',
				icon: Icons.alertCircle
			});
		}
		finally
		{
			data.set({ isLoading: false });
		}
	};

	return Div({ class: "flex flex-col h-full" }, [
		// Header
		Header({ class: "border-b p-4" }, [
			Div({ class: "flex items-center justify-between" }, [
				H2({ class: "text-xl font-semibold" }, "Start New Conversation"),
				Button({
					variant: 'ghost',
					icon: Icons.x,
					click: onCancel
				})
			])
		]),

		// Form Content
		Div({ class: "flex-1 p-6 overflow-y-auto" }, [
			Form({ class: "space-y-6 max-w-md" }, [
				// User Selection
				Div({ class: "space-y-2" }, [
					Label({ htmlFor: "participant-select" }, "Select User"),
					On('usersLoaded', (loaded) => {
						if (!loaded) {
							return Select({
								id: "participant-select",
								class: "w-full",
								disabled: true
							}, [
								Div({ tag: 'option' }, "Loading users...")
							]);
						}

						return On('users', (users) =>
							Select({
								id: "participant-select",
								bind: 'participantId',
								class: "w-full",
								required: true
							}, [
								Div({ tag: 'option', value: '' }, "Choose a user..."),
								...users.map(user => {
									const displayName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
									return Div({
										tag: 'option',
										value: user.id.toString()
									}, `${displayName} ${user.email ? `(${user.email})` : ''}`);
								})
							])
						);
					})
				]),

				// Optional Title
				Div({ class: "space-y-2" }, [
					Label({ htmlFor: "title-input" }, "Conversation Title (Optional)"),
					Input({
						id: "title-input",
						type: "text",
						bind: 'title',
						placeholder: "Enter a custom title...",
						class: "w-full"
					})
				]),

				P({ class: "text-sm text-muted-foreground" },
					"Select a user to start a conversation. You'll be taken to the chat interface after clicking Next."
				)
			])
		]),

		// Footer Actions
		Div({ class: "border-t p-4 flex justify-end gap-2" }, [
			Button({
				variant: 'outline',
				click: onCancel
			}, 'Cancel'),
			Button({
				variant: 'default',
				click: handleNext,
				onState: ['isLoading', (loading, ele) => {
					ele.disabled = loading;
				}]
			}, [
				Div({
					onState: ['isLoading', (loading) => loading ? 'Creating...' : 'Next']
				})
			])
		])
	]);
};
