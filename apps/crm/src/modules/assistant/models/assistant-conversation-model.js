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
