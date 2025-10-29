import { Button, Div, Form, H2, Header, Input, Label, On, P, Select } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { ConversationModel } from "@modules/messages/models/conversation-model.js";

/**
 * NewConversationForm
 *
 * A form to select a user and start a new conversation.
 *
 * @type {typeof Component}
 */
export const NewConversationForm = Jot(
{
	/**
	 * Setup the form data and load users.
	 *
	 * @returns {object}
	 */
	setData()
	{
		return new ConversationModel({
            loading: false
        });
	},

	/**
	 * Handle user selection and conversation creation
	 */
	handleNext()
	{
        // @ts-ignore
		const selectedId = this.data.participantId;
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

        // @ts-ignore
		this.data.isLoading = true;

        // @ts-ignore
		const users = this.data.users;
		const user = users.find(u => u.id === parseInt(selectedId));
		if (!user)
		{
			app.notify({
				type: 'error',
				title: 'Error',
				description: 'User not found',
				icon: Icons.alertCircle
			});

            // @ts-ignore
			this.data.isLoading = false;
			return;
		}

		const userName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
        // @ts-ignore
		const title = this.data.title || `Conversation with ${userName}`;

        // @ts-ignore
		this.conversationModel.xhr.add({
			participantId: parseInt(selectedId),
			title: title,
			type: 'direct'
		}, (result) => {
            // @ts-ignore
			this.data.isLoading = false;

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

                // @ts-ignore
				if (this.onSuccess)
				{
                    // @ts-ignore
					this.onSuccess(result);
				}
			}
			else
			{
				app.notify({
					type: 'error',
					title: 'Error',
					description: 'Failed to start conversation. Please try again.',
					icon: Icons.alertCircle
				});
			}
		});
	},

	/**
	 * Render the form.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "flex flex-col h-full" }, [
			// Header
			Header({ class: "border-b p-4" }, [
				Div({ class: "flex items-center justify-between" }, [
					H2({ class: "text-xl font-semibold" }, "Start New Conversation"),
					Button({
						variant: 'ghost',
						icon: Icons.x,
                        // @ts-ignore
						click: () => this.onCancel && this.onCancel()
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
                    // @ts-ignore
					click: () => this.onCancel && this.onCancel()
				}, 'Cancel'),
				Button({
					variant: 'default',
                    // @ts-ignore
					click: () => this.handleNext(),
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
	}
});
