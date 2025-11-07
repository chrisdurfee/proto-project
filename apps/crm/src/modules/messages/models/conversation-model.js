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
		 * Set up an EventSource for real-time conversation updates.
		 *
		 * @param {string} url - The URL path relative to the model's base URL.
		 * @param {string} params - The query parameters.
		 * @param {function} callBack - The callback function for incoming updates.
		 * @returns {EventSource}
		 */
		setupEventSource(url, params, callBack)
		{
			const fullUrl = this.getUrl(url);
			const eventSource = new EventSource(fullUrl);

			eventSource.onmessage = (event) =>
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
					console.error('Error parsing SSE message:', error);
				}
			};

			eventSource.onerror = (error) =>
			{
				console.error('EventSource error:', error);
				eventSource.close();
			};

			return eventSource;
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
		}
	}
});