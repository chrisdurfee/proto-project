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