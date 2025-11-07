import { Div, Input, UseParent } from "@base-framework/atoms";
import { Veil, VeilJot } from "@base-framework/ui";
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
 * ThreadComposer
 *
 * Container component for chat message composition:
 * - Manages message submission
 * - Handles API calls
 * - Coordinates textarea and buttons
 * - Supports file attachments
 *
 * @type {typeof Veil} ThreadComposer
 */
export const ThreadComposer = VeilJot(
{
	/**
	 * Initialize component state.
	 *
	 * @returns {void}
	 */
	onCreated()
	{
		// @ts-ignore
		this.selectedFiles = [];
	},

	/**
	 * Handle file selection.
	 *
	 * @param {Event} e
	 * @returns {void}
	 */
	handleFileSelect(e)
	{
		// @ts-ignore
		const files = Array.from(e.target.files || []);
		// @ts-ignore
		this.selectedFiles = files;

		if (files.length > 0)
		{
			app.notify({
				title: `${files.length} file(s) selected`,
				description: files.map(f => f.name).join(', '),
				icon: Icons.paperClip
			});
		}
	},

	/**
	 * Open file picker.
	 *
	 * @returns {void}
	 */
	openFilePicker()
	{
		// @ts-ignore
		if (this.fileInput)
		{
			// @ts-ignore
			this.fileInput.click();
		}
	},
	/**
	 * This will submit the form.
	 *
	 * @param {string} content
	 * @returns {void}
	 */
	submit(content)
	{
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

		// @ts-ignore
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
		// @ts-ignore
		}, this.selectedFiles);

		// Reset selected files after sending
		// @ts-ignore
		this.selectedFiles = [];
		// @ts-ignore
		if (this.fileInput)
		{
			// @ts-ignore
			this.fileInput.value = '';
		}
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "fadeIn p-4 w-full lg:max-w-5xl m-auto fadeIn sticky bg-background/80 backdrop-blur-md z-10 bottom-0" }, [
			// Hidden file input
			Input({
				type: "file",
				multiple: true,
				cache: 'fileInput',
				class: "hidden",
				accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip",
				// @ts-ignore
				change: (e) => this.handleFileSelect(e)
			}),
			// @ts-ignore
			Form({ class: "relative flex border rounded-lg p-3 bg-surface max-h-40 overflow-y-auto overflow-x-hidden", submit: () => this.submit(this.textareaComponent.getValue()) }, [
				Div({ class: 'flex flex-col sticky top-0' }, [
					Button({
						variant: "icon",
						icon: Icons.paperclip,
						class: "text-foreground hover:text-accent sticky top-0",
						// @ts-ignore
						click: () => this.openFilePicker()
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
				Div({ class: 'flex flex-col sticky top-0' }, [
					TextCount(),
					SendButton()
				])
			]),
		]);
	}
});