import { Model } from '@base-framework/base';

/**
 * AssistantMessageModel
 *
 * Model for AI assistant messages.
 *
 * @class
 */
export class AssistantMessageModel extends Model
{
	/**
	 * Get the base URL for the API.
	 *
	 * @returns {string}
	 */
	get base()
	{
		const conversationId = this.get('conversationId') || this.conversationId;
		return `/api/assistant/conversation/${conversationId}/message`;
	}

	/**
	 * Setup Server-Sent Events for message sync.
	 *
	 * @param {object} params
	 * @param {function} callBack
	 * @returns {EventSource}
	 */
	setupSync(params, callBack)
	{
		const queryString = new URLSearchParams(params).toString();
		const url = `${this.base}/sync${queryString ? '?' + queryString : ''}`;

		const source = new EventSource(url);

		source.onerror = (event) =>
		{
			callBack({
				success: false
			});
			source.close();
		};

		source.onmessage = (event) =>
		{
			if (event.data === '[DONE]')
			{
				source.close();
				return;
			}

			const data = JSON.parse(event.data);
			callBack(data);
		};

		return source;
	}
}
