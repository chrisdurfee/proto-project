import { Div, P } from "@base-framework/atoms";
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

	conversationModel.xhr.start({}, (response) =>
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
		app.navigate(`messages/all/${response.data.id}`);

		app.notify({
			type: "success",
			title: "Conversation Started",
			description: "The conversation has been started successfully.",
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
			P({ class: "text-sm font-medium" }, "Conversation Type"),
			Input({
				placeholder: "Direct or Group",
				bind: "type",
				value: "direct",
				readonly: true
			})
		]),
		Div({ class: "space-y-2" }, [
			P({ class: "text-sm font-medium" }, "Title (optional)"),
			Input({
				placeholder: "Enter conversation title...",
				bind: "title"
			})
		]),
		Div({ class: "space-y-2" }, [
			P({ class: "text-sm font-medium" }, "Description (optional)"),
			Input({
				placeholder: "Enter conversation description...",
				bind: "description"
			})
		]),
		Div({ class: "space-y-2" }, [
			P({ class: "text-sm font-medium" }, "Participant User ID"),
			Input({
				placeholder: "Enter user ID to start conversation with...",
				bind: "participant_id",
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
		participant_id: null
	});

	const closeCallback = (parent) => props.onClose?.(data, parent);

	const handleSubmit = (parent) =>
	{
		const destroyCallback = () => parent.destroy();
		const modalData = parent.data;

		// Basic validation
		if (!modalData.participant_id)
        {
			app.notify({
				type: "destructive",
				title: "Validation Error",
				description: "Please enter a participant user ID.",
				icon: Icons.warning
			});
			return false;
		}

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
		onClose: closeCallback,
		onSubmit: handleSubmit,
		children: [
			ConversationForm()
		]
	});
};