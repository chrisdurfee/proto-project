import { Model } from "@base-framework/base";

/**
 * ConversationModel
 *
 * This model handles conversation data and API operations.
 *
 * @type {typeof Model}
 */
export const ConversationModel = Model.extend({
	url: '/api/conversations',

	defaults: {
		id: null,
		type: 'direct',
		title: null,
		description: null,
		participants: [],
		last_message_at: null,
		last_message_id: null,
		created_at: null,
		updated_at: null
	},

	xhr: {
		/**
		 * Get conversations for the current user.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		getForUser(instanceParams, callBack)
		{
			return this._get('', '', instanceParams, callBack);
		},

		/**
		 * Start a new conversation.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		start(instanceParams, callBack)
		{
			const data = this.setupObjectData();
			return this._post('', data, instanceParams, callBack);
		}
	}
});