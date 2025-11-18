import { Model } from '@base-framework/base';

/**
 * AssistantConversationModel
 *
 * Model for AI assistant conversations.
 *
 * @class
 */
export class AssistantConversationModel extends Model
{
	/**
	 * Get the base URL for the API.
	 *
	 * @returns {string}
	 */
	get base()
	{
		return '/api/assistant/conversation';
	}

	/**
	 * Get the active conversation for the current user.
	 *
	 * @param {function} callBack
	 * @returns {void}
	 */
	getActive(callBack)
	{
		this.xhr.get({ url: `${this.base}/active` }, callBack);
	}

	/**
	 * Setup Server-Sent Events for conversation sync.
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
