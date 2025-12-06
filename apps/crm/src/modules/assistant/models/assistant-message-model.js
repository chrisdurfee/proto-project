import { Model } from '@base-framework/base';

/**
 * AssistantMessageModel
 *
 * Model for AI assistant messages.
 *
 * @type {typeof Model}
 */
export const AssistantMessageModel = Model.extend({
	url: '/api/assistant/conversation/[[conversationId]]/message',

	xhr: {
		/**
		 * Set up a simple EventSource without reconnection (for one-time streams like generate).
		 *
		 * @param {string} url - The URL path relative to the model's base URL.
		 * @param {string} params - The query parameters.
		 * @param {function} callBack - The callback function for incoming messages.
		 * @returns {object} Object with source and cleanup function
		 */
		setupChatEventSource(url, params, callBack)
		{
			const fullUrl = this.getUrl(url);
			const source = new EventSource(fullUrl + '?' + params, { withCredentials: true });

			source.onmessage = (event) =>
			{
				if (!event.data)
				{
					return;
				}

				if (event.data === '[DONE]')
				{
					source.close();
					return;
				}

				try
				{
					const data = JSON.parse(event.data);
					callBack(data);
				}
				catch (error)
				{
				}
			};

			source.onerror = (event) =>
			{
				source.close();
			};

			return {
				get source() { return source; },
				close: () =>
				{
					source.close();
				}
			};
		},

		/**
		 * Generate AI response using EventSource for streaming (no reconnect).
		 *
		 * @param {object} instanceParams - Optional query parameters
		 * @param {function} callBack
		 * @returns {object}
		 */
		generate(instanceParams, callBack)
		{
			const params = instanceParams && Object.keys(instanceParams).length > 0
				? new URLSearchParams(instanceParams).toString()
				: '';
			const url = '/generate';

			return this.setupChatEventSource(url, params, callBack);
		},

		/**
		 * Synchronize messages in real-time using EventSource (with auto-reconnect).
		 *
		 * @param {object} instanceParams
		 * @param {function} callBack
		 * @returns {object}
		 */
		sync(instanceParams, callBack)
		{
			const params = '';
			const url = '/sync';

			return this.setupEventSource(url, params, callBack);
		}
	}
});