import { Encode, Model } from "@base-framework/base";

/**
 * MessageModel
 *
 * This model handles message data and API operations.
 *
 * @type {typeof Model}
 */
export const MessageModel = Model.extend({
	url: '/api/messaging/[[conversationId]]/messages',

	xhr: {

		/**
		 * Set up an EventSource for real-time message updates.
		 *
		 * @param {string} params - The query parameters.
		 * @param {function} callBack - The callback function for incoming messages.
		 * @returns {EventSource}
		 */
		setupEventSource(url, params, callBack)
		{
			const fullUrl = this.getUrl(url);
			const source = new EventSource(fullUrl + '?' + params);
			source.onerror = (event) =>
			{
				source.close();
			};

			source.onmessage = (event) =>
			{
				callBack(event.data);
			};
			return source;
		},

		/**
		 * Synchronize messages in real-time using EventSource.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function for incoming messages.
		 * @returns {object}
		 */
		sync(instanceParams, callBack)
		{
			const data = this.model.get();
            const params = '';
			const url = '/sync';

			return this.setupEventSource(url, params, callBack);
		},

		/**
		 * Add a new message with optional file attachments.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @param {Array} files - Optional array of files to attach.
		 * @returns {object}
		 */
		add(instanceParams, callBack, files)
		{
			const data = this.model.get();

			// If files are provided, use FormData
			if (files && files.length > 0)
			{
				const formData = new FormData();
				formData.append(this.objectType, Encode.prepareJsonUrl(data));

				// Add all files with the key 'attachments[]'
				files.forEach(file => {
					formData.append('attachments[]', file);
				});

				return this._post('', formData, instanceParams, callBack);
			}

			// No files, send as regular JSON
			return this._post('', data, instanceParams, callBack);
		},

		/**
		 * Get messages for a conversation.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		getForConversation(instanceParams, callBack)
		{
			const conversationId = this.model.get('conversationId');
			const limit = instanceParams?.limit || 50;
			const offset = instanceParams?.offset || 0;

			const params = `conversationId=${conversationId}&limit=${limit}&offset=${offset}`;

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
			const conversationId = this.model.get('conversationId');
			const params = `conversationId=${conversationId}`;

			return this._post('/mark-read', params, instanceParams, callBack);
		}
	}
});