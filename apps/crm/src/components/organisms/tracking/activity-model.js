import { Model } from "@base-framework/base";

/**
 * ActivityModel
 *
 * This model is used to handle the activity model.
 *
 * @type {typeof Model}
 */
export const ActivityModel = Model.extend({
	url: '/api/tracking/activity',

	xhr: {
		/**
		 * Set up an EventSource for real-time activity updates with auto-reconnection.
		 *
		 * @param {string} url - The URL path relative to the model's base URL.
		 * @param {string} params - The query parameters.
		 * @param {function} callBack - The callback function for incoming updates.
		 * @param {function} onOpenCallBack - Optional callback when connection opens.
		 * @returns {object} Object with source and cleanup function
		 */
		setupEventSource(url, params, callBack, onOpenCallBack)
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
				source = new EventSource(fullUrl + queryString);

				source.onopen = () =>
				{
					//console.log('[SSE] Activity sync established');
					if (onOpenCallBack)
					{
						onOpenCallBack();
					}
				};

				source.onerror = (error) =>
				{
					//console.error('[SSE] Activity sync error, will attempt reconnect in', RECONNECT_DELAY / 1000, 'seconds');
					source.close();

					if (!intentionallyClosed)
					{
						reconnectTimer = setTimeout(() =>
						{
							//console.log('[SSE] Attempting to reconnect activity sync...');
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
						//console.error('[SSE] Error parsing activity message:', error);
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
		 * Get activities by type (legacy method for initial load).
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		getByType(instanceParams, callBack)
		{
			const data = this.model.get();
			const params = {
				type: data.type,
				refId: data.refId
			};

			return this._get(`/type`, params, instanceParams, callBack);
		},

		/**
		 * Synchronize activity in real-time using EventSource.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function for incoming updates.
		 * @param {function} onOpenCallBack - Optional callback when connection opens.
		 * @returns {object} Object with source and cleanup function
		 */
		sync(instanceParams, callBack, onOpenCallBack)
		{
			const data = this.model.get();
			const params = `type=${encodeURIComponent(data.type)}&refId=${data.refId}`;
			return this.setupEventSource('/sync', params, callBack, onOpenCallBack);
		},

		/**
		 * Remove a user from activity tracking.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		deleteUserByType(instanceParams, callBack)
		{
			const data = this.model.get();
			const params = {
				type: data.type,
				refId: data.refId,
				userId: data.userId
			};

			return this._delete(`/type`, params, instanceParams, callBack);
		}
	}
});