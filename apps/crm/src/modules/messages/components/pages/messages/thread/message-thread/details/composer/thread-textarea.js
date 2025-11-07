import { Textarea } from "@base-framework/atoms";
import { Veil, VeilJot } from "@base-framework/ui";
import { Icons } from "@base-framework/ui/icons";

/**
 * This will check if the count is over the limit.
 *
 * @param {number} count
 * @param {number} limit
 * @returns {boolean}
 */
const isOverLimit = (count, limit) => count > limit;

/**
 * This will filter newlines from the text.
 *
 * @param {string} text
 * @returns {string}
 */
const filterNewlines = (text) =>
{
	const normalizedText = text.replace(/\n/g, ' ');
    return normalizedText.trim();
};

/**
 * ThreadTextarea
 *
 * Handles the textarea logic for message composition:
 * - Auto-resizing
 * - Character counting
 * - Submit on Ctrl+Enter
 * - Input validation
 *
 * @type {typeof Veil}
 */
export const ThreadTextarea = VeilJot(
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
		if (this.onSubmit)
		{
			// @ts-ignore
			this.onSubmit(this.panel.value);
		}
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

		const text = this.panel.value;
		const normalizedText = filterNewlines(text);
		// @ts-ignore
		if (normalizedText !== '')
		{
			// @ts-ignore
			const targetHeight = this.panel.scrollHeight;
			height = (targetHeight > startHeight) ? targetHeight : startHeight;
		}

		// @ts-ignore
		this.panel.style = 'height:' + height + 'px;';
	},

	/**
	 * This will clear the textarea.
	 *
	 * @returns {void}
	 */
	clear()
	{
		// @ts-ignore
		this.panel.value = '';
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
		return this.panel.value;
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
            // replace newlines with spaces
            const normalizedText = filterNewlines(text);

			// @ts-ignore
			const state = this.state;
			state.charCount = normalizedText.length;
			state.isOverLimit = (isOverLimit(normalizedText.length, charLimit));
			state.empty = normalizedText.length === 0;
		};

		return Textarea({
			class: "w-full border-none bg-transparent overflow-hidden resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder-muted-foreground",
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
