import { Model } from "@base-framework/base";

/**
 * MessageModel
 *
 * This model handles message data and API operations.
 *
 * @type {typeof Model}
 */
export const MessageModel = Model.extend({
	url: '/api/messages',

	defaults: {
		id: null,
		conversation_id: null,
		sender_id: null,
		content: '',
		message_type: 'text',
		file_url: null,
		file_name: null,
		file_size: null,
		audio_duration: null,
		is_edited: false,
		edited_at: null,
		read_at: null,
		created_at: null,
		updated_at: null,
		// Frontend-specific fields
		sender: null,
		avatar: null,
		status: 'online',
		direction: 'sent'
	},

	xhr: {
		/**
		 * @type {string}
		 */
		objectType: 'resource',

		/**
		 * Get messages for a conversation.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		getForConversation(instanceParams, callBack)
		{
			const conversationId = this.model.get('conversation_id');
			const limit = instanceParams?.limit || 50;
			const offset = instanceParams?.offset || 0;

			const params = `conversation_id=${conversationId}&limit=${limit}&offset=${offset}`;

			return this._get('', params, instanceParams, callBack);
		},

		/**
		 * Send a new message.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		send(instanceParams, callBack)
		{
			const data = this.setupObjectData();
			return this._post('', data, instanceParams, callBack);
		},

		/**
		 * Mark messages as read.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		markAsRead(instanceParams, callBack)
		{
			const conversationId = this.model.get('conversation_id');
			const params = `conversation_id=${conversationId}`;

			return this._post('/mark-read', params, instanceParams, callBack);
		}
	}
});