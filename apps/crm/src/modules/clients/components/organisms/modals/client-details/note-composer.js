import { Div, Textarea } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Button } from "@base-framework/ui/atoms";
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
			visibility: 'team',
			status: 'active'
		});
	},

	/**
	 * This will set the state object.
	 *
	 * @returns {object}
	 */
	state()
	{
		return {
			empty: true
		};
	},

	/**
	 * Update the empty state based on textarea value.
	 *
	 * @param {Event} e
	 * @returns {void}
	 */
	updateState(e)
	{
		// @ts-ignore
		const text = e.target.value;
		// @ts-ignore
		this.state.empty = text.trim().length === 0;
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
		// @ts-ignore
		this.state.empty = true;
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: "fadeIn p-4 w-full lg:max-w-5xl m-auto sticky bg-background/80 backdrop-blur-md z-10 bottom-0" }, [
			// @ts-ignore
			Form({ class: "relative flex border rounded-lg p-3 bg-surface", submit: () => this.submit() }, [
				Div({ class: 'flex-1 flex' }, [
					Textarea({
						cache: 'textareaElement',
						// @ts-ignore
						placeholder: this.placeholder || "Add a note...",
						bind: "content",
						// @ts-ignore
						input: (e) => this.updateState(e),
						class: "w-full border-none bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder-muted-foreground"
					}),
					Div({ class: 'flex flex-col justify-end' }, [
						Button({
							type: "submit",
							variant: "icon",
							icon: Icons.airplane,
							class: "text-foreground hover:text-accent",
							onSet: ['empty', (empty, el) => el.disabled = empty]
						})
					])
				])
			])
		]);
	}
});
