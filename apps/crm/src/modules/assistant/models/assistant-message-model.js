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
			const RECONNECT_DELAY = 3000;

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

				};

				source.onerror = (event) =>
				{
					console.error('[SSE] Connection error, will attempt reconnect in', RECONNECT_DELAY / 1000, 'seconds');
					source.close();

					if (!intentionallyClosed)
					{
						reconnectTimer = setTimeout(() =>
						{
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

                    if (event.data === '[DONE]')
                    {
                        intentionallyClosed = true;
                        clearTimeout(reconnectTimer);
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
			};

			connect();

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
		 * Generate AI response using EventSource for streaming.
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

			return this.setupEventSource(url, params, callBack);
		},

		/**
		 * Synchronize messages in real-time using EventSource.
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