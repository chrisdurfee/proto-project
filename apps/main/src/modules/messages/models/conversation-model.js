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