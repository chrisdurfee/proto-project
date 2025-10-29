import { Button, Div, Form, H2, Header, Input, Label, P, Select } from "@base-framework/atoms";
import { Data } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";

/**
 * AVAILABLE_USERS
 *
 * Mock data for available users to start conversations with.
 * In a real app, this would come from an API.
 */
const AVAILABLE_USERS = [
	{ id: 2, name: "Alice Johnson", email: "alice@example.com" },
	{ id: 3, name: "Bob Smith", email: "bob@example.com" },
	{ id: 4, name: "Carol Williams", email: "carol@example.com" },
	{ id: 5, name: "David Brown", email: "david@example.com" },
];

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

	const data = new Data({
        participantId: null,
        title: '',
        selectedUser: null,
        step: 'select-user', // 'select-user' or 'chat'
        isLoading: false
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
			const user = AVAILABLE_USERS.find(u => u.id === parseInt(selectedId));
			const title = data.get('title') || `Conversation with ${user.name}`;

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
					description: `Started conversation with ${user.name}`,
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
					Select({
						id: "participant-select",
						bind: 'participantId',
						class: "w-full",
						required: true
					}, [
						Div({ tag: 'option', value: '' }, "Choose a user..."),
						...AVAILABLE_USERS.map(user =>
							Div({
								tag: 'option',
								value: user.id.toString()
							}, `${user.name} (${user.email})`)
						)
					])
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
