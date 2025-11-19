import { Model } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";

/**
 * ConversationModel
 *
 * This model handles client conversation operations.
 *
 * @type {typeof Model}
 */
export const ConversationModel = Model.extend({
	/**
	 * Base URL for conversation endpoints.
	 * Will be completed with clientId in the component.
	 */
	url: '/api/client/[[clientId]]/conversation',

	xhr: {
		/**
		 * Set up an EventSource for real-time conversation updates with auto-reconnection.
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
					//console.log('[SSE] Client conversation sync established');
					if (onOpenCallBack)
					{
						onOpenCallBack();
					}
				};

				source.onerror = (error) =>
				{
					//console.error('[SSE] Client conversation sync error, will attempt reconnect in', RECONNECT_DELAY / 1000, 'seconds');
					source.close();

					if (!intentionallyClosed)
					{
						reconnectTimer = setTimeout(() =>
						{
							//console.log('[SSE] Attempting to reconnect client conversation sync...');
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
						//console.error('[SSE] Error parsing client conversation message:', error);
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
		 * @param {function} onOpenCallBack - Optional callback when connection opens.
		 * @returns {object} Object with source and cleanup function
		 */
		sync(instanceParams, callBack, onOpenCallBack)
		{
			const lastId = instanceParams?.lastId || 0;
			const params = lastId ? `lastId=${lastId}` : '';
			return this.setupEventSource('/sync', params, callBack, onOpenCallBack);
		},
		/**
		 * Add a new conversation message with optional file attachments.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @param {FileList|File[]} [files] - Optional files to attach.
		 * @returns {XMLHttpRequest|void} The request promise.
		 */
		add(instanceParams, callBack, files)
		{
			const data = this.model.get();

			// If no files, send as JSON (exclude attachments field)
			if (!files || files.length === 0)
			{
				const cleanData = { ...data };
				delete cleanData.attachments;
				const params = this.setupObjectData(cleanData);
				return this._post('', params, instanceParams, callBack);
			}

			// With files, use FormData
			const formData = new FormData();

			// Add message data (exclude attachments array)
			Object.keys(data).forEach(key =>
			{
				if (key !== 'attachments')
				{
					formData.append(key, data[key]);
				}
			});

			// Add files
			Array.from(files).forEach(file =>
			{
				// Validate file size (10MB as per backend validation)
				const maxSize = 10 * 1024 * 1024; // 10MB
				if (file.size > maxSize)
				{
					app.notify({
						type: "destructive",
						title: "File Too Large",
						description: `${file.name} exceeds 10MB limit.`,
						icon: Icons.warning
					});
					return;
				}

				formData.append('attachments[]', file);
			});

			return this._post('', formData, instanceParams, callBack);
		}
	}
});
