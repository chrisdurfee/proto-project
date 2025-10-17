import { Div, Input, Textarea } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Form } from "@base-framework/ui/molecules";
import { ConversationModel } from "../../../../models/conversation-model.js";


/**
 * This will check if the count is over the limit.
 *
 * @param {number} count
 * @param {number} limit
 * @returns {boolean}
 */
const isOverLimit = (count, limit) => count > limit? true : null;

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
			click: (e, parent) => parent.fileInput?.click()
		}),
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
 * Similar to the email composer, but for chat:
 * - text area
 * - mic icon
 * - send button
 *
 * @type {typeof Component} ThreadComposer
 */
export const ThreadComposer = Jot(
{
	/**
	 * This will set the data.
	 *
	 * @returns {void}
	 */
	setData()
	{
		// Create conversation model with data binding
		// @ts-ignore
		const clientId = this.client?.id;
		if (!clientId)
		{
			console.error('ThreadComposer: client.id is required');
			return;
		}

		// Store files separately to preserve File objects
		// @ts-ignore
		this.selectedFiles = [];

		// @ts-ignore
		return new ConversationModel({
			clientId: clientId,
			userId: app.data?.user?.id || 1,
			message: '',
			messageType: 'comment',
			isInternal: 0,
			isPinned: 0
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
			empty: true,
			charCount: 0,
			// @ts-ignore
			charLimit: this.charLimit ?? 5000,
			isOverLimit: false
		};
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
		// Store files as instance property to preserve File objects
		// @ts-ignore
		this.selectedFiles = files;
	},

	/**
	 * This will submit the form.
	 *
	 * @returns {void}
	 */
	submit()
	{
		// @ts-ignore
		const message = this.textarea.value;
		if (!message || message.trim() === '')
		{
			return;
		}

		// Update model with message
		// @ts-ignore
		this.data.message = message;

		// Send via API with files passed separately to preserve File objects
		// @ts-ignore
		this.data.xhr.add('', (response) =>
		{
			if (!response && !response.success)
			{
				app.notify({
					type: "destructive",
					title: "Error",
					description: response?.message || "Failed to send message.",
					icon: Icons.warning
				});
				return;
			}

			// Add optimistic update to conversation list
			// @ts-ignore
			//this.addOptimisticUpdate(message, response.id);

			// @ts-ignore
			if (this.submitCallBack)
			{
				// @ts-ignore
				this.submitCallBack(this.parent);
			}

			// Reset form
			// @ts-ignore
			this.reset();

			// @ts-ignore
		}, this.selectedFiles);
	},

	/**
	 * Reset the form.
	 *
	 * @returns {void}
	 */
	reset()
	{
		// Reset form
		// @ts-ignore
		this.textarea.value = '';
		// @ts-ignore
		(this.fileInput) && (this.fileInput.value = '');

		// @ts-ignore
		this.data.message = '';
		// @ts-ignore
		this.selectedFiles = [];

		// @ts-ignore
		this.state.set({
			empty: true,
			charCount: 0,
			isOverLimit: false
		});
	},

	/**
	 * Add an optimistic update to the conversation.
	 *
	 * @param {string} message
	 * @param {*} conversationId
	 * @retuns void
	 */
	addOptimisticUpdate(message, conversationId)
	{
		// Add optimistic update to conversation list
		// @ts-ignore
		const userData = app.data?.user || {};
		const newMessage = {
			id: conversationId,
			// @ts-ignore
			clientId: this.client.id,
			// @ts-ignore
			userId: userData.id,
			message: message,
			messageType: 'comment',
			isInternal: 0,
			isPinned: 0,
			attachmentCount: 0,
			createdAt: new Date().toISOString(),
			userDisplayName: userData.displayName || 'You',
			userFirstName: userData.firstName || 'You',
			userLastName: userData.lastName || '',
			userImage: userData.image || null,
			attachments: []
		};

		// @ts-ignore
		this.parent.list.append([newMessage]);
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
		if (keyCode !== 13)
		{
			return;
		}

		if (e.ctrlKey !== true)
		{
			// @ts-ignore
			this.resizeTextarea();
			return;
		}

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
		this.submit();
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
			height = (targetHeight > startHeight)? targetHeight : startHeight;
		}

		// @ts-ignore
		this.textarea.style = 'height:' + height + 'px;';
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

		return Div({ class: "fadeIn p-4 w-full lg:max-w-5xl m-auto sticky bg-background/80 backdrop-blur-md z-10 bottom-0" }, [
			// @ts-ignore
			Form({ class: "relative flex border rounded-lg p-3 bg-surface", submit: () => this.submit() }, [
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
				// Textarea for reply
				Textarea({
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
				}),
				Div({ class: 'flex flex-col' }, [
					//TextCount(),
					SendButton()
				])
			]),
		]);
	}
});