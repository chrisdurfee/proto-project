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
		 * Update a user's credentials.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		getByType(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				type: data.type,
				refId: data.refId
			};

			return this._get(`/type`, params, instanceParams, callBack);
		},

		/**
		 * Unsubscribe a user from email notifications.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		deleteUserByType(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				type: data.type,
				refId: data.refId,
				userId: data.userId
			};

			return this._delete(`/type`, params, instanceParams, callBack);
		}
	}
});