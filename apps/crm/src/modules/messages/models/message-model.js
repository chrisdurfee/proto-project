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
		 * Set up an EventSource for real-time message updates with auto-reconnection.
		 *
		 * @param {string} url - The URL path relative to the model's base URL.
		 * @param {string} params - The query parameters.
		 * @param {function} callBack - The callback function for incoming messages.
		 * @returns {object} Object with source and cleanup function
		 */
		setupEventSource(url, params, callBack)
		{
			let source = null;
			let reconnectTimer = null;
			let intentionallyClosed = false;
			const RECONNECT_DELAY = 3000; // 3 seconds

			const connect = () =>
			{
				if (intentionallyClosed)
				{
					return;
				}

				const fullUrl = this.getUrl(url);
				source = new EventSource(fullUrl + '?' + params);

				source.onopen = () =>
				{
					console.log('[SSE] Connection established');
				};

				source.onerror = (event) =>
				{
					console.error('[SSE] Connection error, will attempt reconnect in', RECONNECT_DELAY / 1000, 'seconds');
					source.close();

					if (!intentionallyClosed)
					{
						reconnectTimer = setTimeout(() =>
						{
							console.log('[SSE] Attempting to reconnect...');
							connect();
						}, RECONNECT_DELAY);
					}
				};

				source.onmessage = (event) =>
				{
					if (!event.data)
					{
						return;
					}

					try
					{
						const data = JSON.parse(event.data);
						callBack(data);
					}
					catch (error)
					{
						console.error('[SSE] Error parsing message:', error, event.data);
					}
				};
			};

			connect();

			// Return object with source getter and cleanup function
			return {
				get source() { return source; },
				close: () =>
				{
					intentionallyClosed = true;
					if (reconnectTimer)
					{
						clearTimeout(reconnectTimer);
					}
					if (source)
					{
						source.close();
					}
				}
			};
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
		 * Mark messages as read up to a specific message ID.
		 *
		 * @param {object} instanceParams - The instance parameters including optional messageId.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		markAsRead(instanceParams, callBack)
		{
			const data = {};

			// If a specific message ID is provided, include it
			if (instanceParams?.messageId)
			{
				data.messageId = instanceParams.messageId;
			}

			return this._post('/mark-read', data, instanceParams, callBack);
		}
	}
});