import { Model } from "@base-framework/base";

/**
 * ConversationModel
 *
 * This model handles conversation data and API operations.
 * Uses default CRUD operations (add, update, delete, get, all).
 *
 * @type {typeof Model}
 */
export const ConversationModel = Model.extend({
	url: '/api/messaging/[[userId]]/conversations',

	xhr: {
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
			const RECONNECT_DELAY = 3000; // 3 seconds

			const connect = () =>
			{
				if (intentionallyClosed)
				{
					return;
				}

				const fullUrl = this.getUrl(url);
				const queryString = params ? '?' + params : '';
				source = new EventSource(fullUrl + queryString, { withCredentials: true });

				source.onopen = () =>
				{
				};

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
		 * Synchronize conversations in real-time using EventSource.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function for incoming updates.
		 * @returns {EventSource}
		 */
		sync(instanceParams, callBack)
		{
			const userId = this.model.get('userId');
			const lastId = instanceParams?.lastId || 0;

			const params = `lastId=${lastId}`;
			return this.setupEventSource('/sync', params, callBack);
		},

		/**
		 * Find existing conversation with a user or create a new one.
		 *
		 * @param {object} data - Object with participantId
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		findOrCreate(data, callBack)
		{
			return this._post('/find-or-create', data, {}, callBack);
		}
	}
});