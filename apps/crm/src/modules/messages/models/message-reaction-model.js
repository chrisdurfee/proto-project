import { Model } from '@base-framework/base';

/**
 * MessageReactionModel
 *
 * Model for message reactions with XHR integration.
 *
 * @type {typeof Model}
 */
export const MessageReactionModel = Model.extend({
	url: '/api/messaging/messages/[[messageId]]/reactions',

	xhr: {
		/**
		 * Toggle a reaction (add or remove).
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		toggle(instanceParams, callBack)
		{
			const data = this.setupObjectData();
			const messageId = this.model.get('messageId');

			return this._post(`/toggle?messageId=${messageId}`, data, instanceParams, callBack);
		},

		/**
		 * Get all reactions for a message.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {object}
		 */
		getForMessage(instanceParams, callBack)
		{
			const messageId = this.model.get('messageId');
			return this._get(`?messageId=${messageId}`, '', instanceParams, callBack);
		}
	}
});
