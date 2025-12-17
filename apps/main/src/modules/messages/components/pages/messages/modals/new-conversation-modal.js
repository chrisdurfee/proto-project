import { Div, Label } from "@base-framework/atoms";
import { Data } from "@base-framework/base";
import { Input } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Modal } from "@base-framework/ui/molecules";
import { ConversationModel } from "../../../../models/conversation-model.js";

/**
 * Add a new conversation.
 *
 * @param {object} data
 * @param {function|null} destroyCallback
 * @returns {void}
 */
const add = (data, destroyCallback = null) =>
{
	const conversationModel = new ConversationModel();
	conversationModel.set(data);

	conversationModel.xhr.add({}, (response) =>
	{
		if (!response || response.success === false)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: response?.message || "An error occurred while starting the conversation.",
				icon: Icons.shield
			});
			return;
		}

		if (destroyCallback)
		{
			destroyCallback();
		}

		// Navigate to the new conversation
		app.navigate(`messages/${response.data.id}`);

		app.notify({
			title: "Conversation Started",
			description: "The conversation has been started successfully.",
			icon: Icons.check
		});
	});
};

/**
 * This will create the conversation form.
 *
 * @returns {object}
 */
const ConversationForm = () =>
	Div({ class: "space-y-4" }, [
		Div({ class: "space-y-2" }, [
			Label({ for: "title" }, "Title (optional)"),
			Input({
				id: "title",
				placeholder: "Enter conversation title...",
				bind: "title"
			})
		]),
		Div({ class: "space-y-2" }, [
			Label({ for: "description" }, "Description (optional)"),
			Input({
				id: "description",
				placeholder: "Enter conversation description...",
				bind: "description"
			})
		]),
		Div({ class: "space-y-2" }, [
			Label({ for: "participantId" }, "Participant User ID *"),
			Input({
				id: "participantId",
				placeholder: "Enter user ID to start conversation with...",
				bind: "participantId",
				type: "number"
			})
		])
	]);

/**
 * NewConversationModal
 *
 * This modal allows users to start a new conversation.
 *
 * @param {object} props
 * @returns {Modal}
 */
export const NewConversationModal = (props = {}) =>
{
	const data = new Data({
		type: 'direct',
		title: '',
		description: '',
		participantId: props.initialData?.participantId || null
	});

	const handleSubmit = (parent) =>
	{
		const modalData = parent.data.get();

		// Basic validation
		if (!modalData.participantId)
        {
			app.notify({
				type: "destructive",
				title: "Validation Error",
				description: "Please enter a participant user ID.",
				icon: Icons.warning
			});
			return false;
		}

		const destroyCallback = () => parent.destroy();
		add(modalData, destroyCallback);
		props.onSubmit?.(modalData);

		// Return false to prevent automatic modal close
		return false;
	};

	return new Modal({
		data,
		title: 'Start New Conversation',
		icon: Icons.chatBubbleLeft,
		description: 'Create a new conversation with another user.',
		size: 'md',
		type: 'right',
		onClose: () => props.onClose?.(data),
		onSubmit: handleSubmit,
		children: [
			ConversationForm()
		]
	});
};