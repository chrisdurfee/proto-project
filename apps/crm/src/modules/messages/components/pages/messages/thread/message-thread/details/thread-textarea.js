import { Textarea } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
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
 * ThreadTextarea
 *
 * Handles the textarea logic for message composition:
 * - Auto-resizing
 * - Character counting
 * - Submit on Ctrl+Enter
 * - Input validation
 *
 * @type {typeof Component}
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
	 * This will check the submit.
	 *
	 * @param {object} e
	 * @returns {void}
	 */
	checkSubmit(e)
	{
		// @ts-ignore
		this.resizeTextarea();

		const keyCode = e.keyCode;
		if (keyCode === 13)
		{
			if (e.ctrlKey === true)
			{
				// @ts-ignore
				if (this.state.empty === true || this.state.isOverLimit === true)
				{
					e.preventDefault();
					e.stopPropagation();

					app.notify({
						icon: Icons.warning,
						type: 'warning',
						title: 'Missing Message',
						description: 'Please enter a message.',
					});

					return;
				}

				e.preventDefault();
				e.stopPropagation();

				// @ts-ignore
				if (this.onSubmit)
				{
					// @ts-ignore
					this.onSubmit(this.textarea.value);
				}
			}
			else
			{
				// @ts-ignore
				this.resizeTextarea();
			}
		}
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
	 * This will clear the textarea.
	 *
	 * @returns {void}
	 */
	clear()
	{
		// @ts-ignore
		this.textarea.value = '';
		// @ts-ignore
		this.state.charCount = 0;
		// @ts-ignore
		this.state.isOverLimit = false;
		// @ts-ignore
		this.state.empty = true;
		// @ts-ignore
		this.resizeTextarea();
	},

	/**
	 * This will get the current value.
	 *
	 * @returns {string}
	 */
	getValue()
	{
		// @ts-ignore
		return this.textarea.value;
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		// @ts-ignore
		const charLimit = this.state.charLimit;
		const updateCharCount = (e) =>
		{
			const text = e.target.value;
			// @ts-ignore
			const state = this.state;
			state.charCount = text.length;
			state.isOverLimit = (isOverLimit(text.length, charLimit));
			state.empty = text.length === 0;
		};

		return Textarea({
			class: "w-full border-none bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder-muted-foreground",
			cache: 'textarea',
			// @ts-ignore
			placeholder: this.placeholder,
			input: updateCharCount,
			// @ts-ignore
			bind: this.bind,
			required: true,
			// @ts-ignore
			keyup: (e) => this.checkSubmit(e)
		});
	}
});
