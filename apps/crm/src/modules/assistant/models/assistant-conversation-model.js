import { Model } from '@base-framework/base';

/**
 * AssistantConversationModel
 *
 * Model for AI assistant conversations.
 *
 * @type {typeof Model}
 */
export const AssistantConversationModel = Model.extend({
	url: '/api/assistant/conversation',

	xhr: {
		/**
		 * Get the active conversation for the current user.
		 *
		 * @param {object} instanceParams
		 * @param {function} callBack
		 * @returns {void}
		 */
		getActive(instanceParams, callBack)
		{
			return this._get('/active', '', instanceParams, callBack);
		},

		/**
		 * Set up an EventSource for real-time conversation updates with auto-reconnection.
		 *
		 * @param {string} url - The URL path relative to the model's base URL.
		 * @param {string} params - The query parameters.
		 * @param {function} callBack - The callback function for incoming updates.
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
				const queryString = params ? '?' + params : '';
				source = new EventSource(fullUrl + queryString, { withCredentials: true });

				source.onerror = (error) =>
				{
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
					try
					{
						const data = JSON.parse(event.data);
						if (callBack)
						{
							callBack(data);
						}
					}
					catch (error)
					{
						console.error('[SSE] Error parsing message:', error);
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
		 * Synchronize conversations in real-time using EventSource.
		 *
		 * @param {object} instanceParams
		 * @param {function} callBack
		 * @returns {object}
		 */
		sync(instanceParams, callBack)
		{
			const lastId = instanceParams?.lastId || 0;
			const params = `lastId=${lastId}`;
			return this.setupEventSource('/sync', params, callBack);
		}
	}
});
