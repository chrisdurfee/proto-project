import { Div, Input } from "@base-framework/atoms";
import { Component, Jot } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { Form } from "@base-framework/ui/molecules";
import { ConversationModel } from "../../../../models/conversation-model.js";
import { ThreadTextarea } from "./thread-textarea.js";

/**
 * ThreadComposer
 *
 * Handles form submission, file uploads, and conversation state management.
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
		const message = this.textareaComponent?.getValue?.() || '';
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
			if (!response || !response.success)
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
		// Reset textarea component
		// @ts-ignore
		this.textareaComponent?.reset?.();

		// Reset file input
		// @ts-ignore
		if (this.fileInput)
		{
			// @ts-ignore
			this.fileInput.value = '';
		}

		// @ts-ignore
		this.data.message = '';
		// @ts-ignore
		this.selectedFiles = [];
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
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
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
				// Textarea component
				new ThreadTextarea({
					cache: 'textareaComponent',
					// @ts-ignore
					placeholder: this.placeholder,
					// @ts-ignore
					bind: this.bind,
					// @ts-ignore
					charLimit: this.charLimit
				})
			])
		]);
	}
});