import { Div } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Form } from "@base-framework/ui/molecules";
import { MessageModel } from "@modules/messages/models/message-model.js";
import { ThreadTextarea } from "./thread-textarea.js";

/**
 * This will display the character count.
 *
 * @returns {object}
 */
const TextCount = () => (
	Div({
		class: "text-xs text-muted-foreground",
	}, `[[charCount]]/[[charLimit]]`)
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
 * ThreadComposer
 *
 * Container component for chat message composition:
 * - Manages message submission
 * - Handles API calls
 * - Coordinates textarea and buttons
 *
 * @type {typeof Component} ThreadComposer
 */
export const ThreadComposer = Jot(
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
		this.save(content);
		// @ts-ignore
		this.textareaComponent.clear();
	},

	/**
	 * This will add a new message.
	 *
	 * @param {string} content
	 * @returns {void}
	 */
	save(content)
	{
		const data = new MessageModel({
			userId: app.data.user.id,
			// @ts-ignore
			conversationId: this.conversationId,
			content
		});

		data.xhr.add({}, (response) =>
		{
			if (response && response.success)
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
		return Div({ class: "fadeIn p-4 w-full lg:max-w-5xl m-auto" }, [
			// @ts-ignore
			Form({ class: "relative flex border rounded-lg p-3 bg-surface", submit: () => this.submit(this.textareaComponent.getValue()) }, [
				Div([
					Button({
						variant: "icon",
						icon: Icons.microphone,
						class: "text-foreground hover:text-accent",
						click: () => console.log("Recording audio!")
					})
				]),
				// Textarea for reply
				new ThreadTextarea({
					cache: 'textareaComponent',
					// @ts-ignore
					placeholder: this.placeholder,
					// @ts-ignore
					charLimit: this.charLimit ?? 5000,
					// @ts-ignore
					onSubmit: (content) => this.submit(content)
				}),
				Div({ class: 'flex flex-col' }, [
					//TextCount(),
					SendButton()
				])
			]),
		]);
	}
});