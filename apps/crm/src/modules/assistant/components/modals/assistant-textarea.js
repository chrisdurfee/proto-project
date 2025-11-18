import { Data, Textarea } from '@base-framework/atoms';
import { Jot } from '@base-framework/base';

/**
 * AssistantTextarea
 *
 * Custom textarea for assistant chat with character limit and auto-resize.
 *
 * @type {typeof Textarea}
 */
export const AssistantTextarea = Jot(
{
	/**
	 * Character limit for the textarea.
	 *
	 * @type {number}
	 */
	charLimit: 5000,

	/**
	 * This will setup the state.
	 *
	 * @returns {object}
	 */
	state()
	{
		return new Data({
			empty: true,
			charCount: 0,
			// @ts-ignore
			charLimit: this.charLimit || 5000
		});
	},

	/**
	 * Update character count and empty state.
	 *
	 * @param {string} value
	 * @returns {void}
	 */
	updateState(value)
	{
		const charCount = value.length;
		// @ts-ignore
		this.state.set({
			empty: charCount === 0,
			charCount
		});
	},

	/**
	 * Get the textarea value.
	 *
	 * @returns {string}
	 */
	getValue()
	{
		// @ts-ignore
		return this.textarea?.value || '';
	},

	/**
	 * Clear the textarea.
	 *
	 * @returns {void}
	 */
	clear()
	{
		// @ts-ignore
		if (this.textarea)
		{
			// @ts-ignore
			this.textarea.value = '';
			this.updateState('');
		}
	},

	/**
	 * Validate the textarea.
	 *
	 * @returns {boolean}
	 */
	validate()
	{
		const value = this.getValue();
		// @ts-ignore
		return value.length > 0 && value.length <= this.charLimit;
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Textarea({
			cache: 'textarea',
			// @ts-ignore
			placeholder: this.placeholder || "Type a message...",
			class: "flex-1 bg-transparent resize-none outline-none border-none focus:ring-0 max-h-32 overflow-y-auto",
			rows: 1,
			input: (e) =>
			{
				// @ts-ignore
				this.updateState(e.target.value);

				// Auto-resize
				// @ts-ignore
				e.target.style.height = 'auto';
				// @ts-ignore
				e.target.style.height = e.target.scrollHeight + 'px';
			},
			keydown: (e) =>
			{
				// Submit on Enter (without Shift)
				if (e.key === 'Enter' && !e.shiftKey)
				{
					e.preventDefault();
					// @ts-ignore
					if (this.onSubmit && this.validate())
					{
						// @ts-ignore
						this.onSubmit(this.getValue());
					}
				}
			}
		});
	}
});
