import { Div, Textarea } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";


/**
 * This will check if the count is over the limit.
 *
 * @param {number} count
 * @param {number} limit
 * @returns {boolean}
 */
const isOverLimit = (count, limit) => count > limit ? true : null;

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
	Div({ class: "flex items-center gap-x-2" }, [
		Button({
			type: "button",
			variant: "icon",
			icon: Icons.paperclip,
			class: "text-foreground hover:text-accent",
			click: (e, parent) => parent.parent?.fileInput?.click()
		}),
		Button({
			type: "submit",
			variant: "icon",
			icon: Icons.airplane,
			class: "text-foreground hover:text-accent",
			onState: ['empty', (empty, el) => el.disabled = empty]
		})
	])
);

/**
 * ThreadTextarea
 *
 * Handles textarea-specific logic: character counting, auto-resize, and keyboard shortcuts.
 *
 * @type {typeof Component} ThreadTextarea
 */
export const ThreadTextarea = Jot(
{
	/**
	 * This will set the state object.
	 *
	 * @returns {object}
	 */
	state()
	{
		return {
			empty: true,
			charCount: 0,
			// @ts-ignore
			charLimit: this.charLimit ?? 5000,
			isOverLimit: false
		};
	},

	/**
	 * This will check the submit on key press.
	 *
	 * @param {object} e
	 * @returns {void}
	 */
	checkSubmit(e)
	{
		e.preventDefault();
		e.stopPropagation();

		// @ts-ignore
		this.resizeTextarea();

		const keyCode = e.keyCode;
		if (keyCode !== 13)
		{
			return;
		}

		// Allow Ctrl+Enter to submit
		if (e.ctrlKey === true || e.shiftKey === true)
		{
			// @ts-ignore
			this.resizeTextarea();
			return;
		}

		// @ts-ignore
		if (this.validate() === false)
		{
			return;
		}

		// @ts-ignore
		this.parent?.submit?.();
	},

	/**
	 * This will validate the textarea content.
	 *
	 * @returns {boolean}
	 */
	validate()
	{
		// @ts-ignore
		if (this.state.empty === true)
		{
			app.notify({
				icon: Icons.warning,
				type: 'warning',
				title: 'Missing Message',
				description: 'Please enter a message.',
			});

			return false;
		}

		// @ts-ignore
		if (this.state.isOverLimit === true)
		{
			app.notify({
				icon: Icons.warning,
				type: 'warning',
				title: 'Message Too Long',
				description: 'Your message exceeds the character limit.',
			});

			return false;
		}

		return true;
	},

	/**
	 * This will resize the textarea.
	 *
	 * @returns {void}
	 */
	resizeTextarea()
	{
		const startHeight = 48;
		let height = startHeight;

		// @ts-ignore
		if (this.textarea.value !== '')
		{
			// @ts-ignore
			const targetHeight = this.textarea.scrollHeight;
			height = (targetHeight > startHeight) ? targetHeight : startHeight;
		}

		// @ts-ignore
		this.textarea.style = 'height:' + height + 'px;';
	},

	/**
	 * Update character count and state.
	 *
	 * @param {Event} e
	 * @returns {void}
	 */
	updateCharCount(e)
	{
		// @ts-ignore
		const text = e.target.value;
		// @ts-ignore
		const state = this.state;
		// @ts-ignore
		const charLimit = this.charLimit ?? 5000;

		state.charCount = text.length;
		state.isOverLimit = isOverLimit(text.length, charLimit);
		state.empty = text.length === 0;
	},

	/**
	 * Reset the textarea.
	 *
	 * @returns {void}
	 */
	reset()
	{
		// @ts-ignore
		this.textarea.value = '';
		// @ts-ignore
		this.state.set({
			empty: true,
			charCount: 0,
			isOverLimit: false
		});
	},

	/**
	 * Get the current textarea value.
	 *
	 * @returns {string}
	 */
	getValue()
	{
		// @ts-ignore
		return this.textarea?.value || '';
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Div({ class: 'flex-1 flex' }, [
			// Textarea for message
			Textarea({
				class: "w-full border-none bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder-muted-foreground",
				cache: 'textarea',
				// @ts-ignore
				placeholder: this.placeholder || "Type your message...",
				// @ts-ignore
				input: (e) => this.updateCharCount(e),
				// @ts-ignore
				bind: this.bind,
				required: true,
				// @ts-ignore
				keyup: (e) => this.checkSubmit(e)
			}),
			Div({ class: 'flex flex-col' }, [
				//TextCount(),
				SendButton()
			])
		]);
	}
});