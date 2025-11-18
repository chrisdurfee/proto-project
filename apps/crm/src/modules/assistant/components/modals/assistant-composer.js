import { Div, UseParent } from "@base-framework/atoms";
import { Veil, VeilJot } from "@base-framework/ui";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Form } from "@base-framework/ui/molecules";
import { AssistantMessageModel } from "../../models/assistant-message-model.js";
import { AssistantTextarea } from "./assistant-textarea.js";

/**
 * This will display the character count.
 *
 * @returns {object}
 */
const TextCount = () => (
	UseParent(({ textareaComponent }) => Div({ class: "text-xs text-muted-foreground" }, [`[[charCount]]/[[charLimit]]`, textareaComponent.state]))
);

/**
 * This will create the send button.
 *
 * @returns {object}
 */
const SendButton = () => (
	Div({ class: "flex justify-between" }, [
		Button({
			type: "submit",
			variant: "icon",
			icon: Icons.airplane,
			class: "text-foreground hover:text-accent",
			onSet: ['empty', (empty, el) => el.disabled = empty]
		})
	])
);

/**
 * AssistantComposer
 *
 * Input component for sending messages to the AI assistant.
 *
 * @type {typeof Veil}
 */
export const AssistantComposer = VeilJot(
{
	/**
	 * This will submit the form.
	 *
	 * @param {string} content
	 * @returns {void}
	 */
	submit(content)
	{
		// @ts-ignore
		if (this.textareaComponent.validate() === false)
		{
			return;
		}

		// @ts-ignore
		this.save(content);
		// @ts-ignore
		this.textareaComponent.clear();
	},

	/**
	 * This will send a new message.
	 *
	 * @param {string} content
	 * @returns {void}
	 */
	save(content)
	{
		// @ts-ignore
		const conversationId = typeof this.getConversationId === 'function' ? this.getConversationId() : null;

		if (!conversationId)
		{
			console.error('No conversation ID available');
			return;
		}

		const data = new AssistantMessageModel({
			userId: app.data.user.id,
			conversationId,
			content
		});

		// @ts-ignore
		data.xhr.add({}, (response) =>
		{
			if (response && response.success !== false)
			{
				// @ts-ignore
				if (this.submitCallBack)
				{
					// @ts-ignore
					this.submitCallBack(this.parent);
				}
			}
		});
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "w-full sticky z-10 bottom-0" }, [
			Div({ class: "fadeIn p-4 w-full fadeIn bg-background/80 backdrop-blur-md border-t" }, [
				// @ts-ignore
				Form({
					class: "relative flex border rounded-lg p-3 bg-surface max-h-40 overflow-y-auto overflow-x-hidden lg:max-w-5xl m-auto",
					// @ts-ignore
					submit: () => this.submit(this.textareaComponent.getValue())
				}, [
					// Textarea for message
					new AssistantTextarea({
						cache: 'textareaComponent',
						// @ts-ignore
						placeholder: this.placeholder || "Ask me anything...",
						// @ts-ignore
						charLimit: this.charLimit ?? 5000,
						// @ts-ignore
						onSubmit: (content) => this.submit(content)
					}),
					Div({ class: 'flex flex-col sticky top-0' }, [
						TextCount(),
						SendButton()
					])
				])
			])
		]);
	}
});
