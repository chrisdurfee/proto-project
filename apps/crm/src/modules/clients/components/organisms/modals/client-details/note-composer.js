import { Div } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Button, Textarea } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Form } from "@base-framework/ui/molecules";
import { ClientNoteModel } from "../../../models/client-note-model.js";

/**
 * NoteComposer
 *
 * Handles form submission for adding new client notes.
 *
 * @type {typeof Component} NoteComposer
 */
export const NoteComposer = Jot(
{
	/**
	 * This will set the data.
	 *
	 * @returns {object}
	 */
	setData()
	{
		// @ts-ignore
		const clientId = this.clientId;
		if (!clientId)
		{
			console.error('NoteComposer: clientId is required');
			return;
		}

		// @ts-ignore
		return new ClientNoteModel({
			clientId: clientId,
			userId: app.data?.user?.id || 1,
			title: '',
			content: '',
			noteType: 'general',
			priority: 'normal',
			visibility: 'internal',
			status: 'active'
		});
	},

	/**
	 * This will submit the form.
	 *
	 * @returns {void}
	 */
	submit()
	{
		// @ts-ignore
		const content = this.data.content?.trim() || '';
		if (!content)
		{
			return;
		}

		// Send via API
		// @ts-ignore
		this.data.xhr.add('', (response) =>
		{
			if (!response || !response.success)
			{
				app.notify({
					type: "destructive",
					title: "Error",
					description: response?.message || "Failed to add note.",
					icon: Icons.warning
				});
				return;
			}

			// @ts-ignore
			if (this.submitCallBack)
			{
				// @ts-ignore
				this.submitCallBack(this.parent);
			}

			// Reset form
			// @ts-ignore
			this.reset();
		});
	},

	/**
	 * Reset the form.
	 *
	 * @returns {void}
	 */
	reset()
	{
		// @ts-ignore
		if (this.textareaElement)
		{
			// @ts-ignore
			this.textareaElement.value = '';
		}

		// @ts-ignore
		this.data.title = '';
		// @ts-ignore
		this.data.content = '';
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "p-4 w-full border-t bg-background/80 backdrop-blur-md" }, [
			// @ts-ignore
			Form({ class: "flex flex-col gap-3", submit: () => this.submit() }, [
				Textarea({
					cache: 'textareaElement',
					// @ts-ignore
					placeholder: this.placeholder || "Add a note...",
					bind: "content",
					rows: 3,
					class: "w-full resize-none"
				}),
				Div({ class: "flex justify-end gap-2" }, [
					Button({
						type: "submit",
						variant: "default",
						size: "sm"
					}, "Add Note")
				])
			])
		]);
	}
});
