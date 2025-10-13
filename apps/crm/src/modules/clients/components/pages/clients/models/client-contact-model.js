import { Model } from "@base-framework/base";

/**
 * ClientContactModel
 *
 * This model is used to handle client contacts.
 *
 * @type {typeof Model}
 */
export const ClientContactModel = Model.extend({
	url: '/api/client/[[clientId]]/contact',

	xhr: {
		/**
		 * Override the base get method to use dynamic URL
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		get(instanceParams, callBack)
		{
			const url = this.model.getUrl();
			const id = this.model.get('id');
			const endpoint = id ? `${url}/${id}` : url;
			return this._get(endpoint, instanceParams, callBack);
		},

		/**
		 * Override the base post method to use dynamic URL
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		post(instanceParams, callBack)
		{
			const url = this.model.getUrl();
			const data = this.model.get();
			return this._post(url, data, instanceParams, callBack);
		},

		/**
		 * Override the base patch method to use dynamic URL
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		patch(instanceParams, callBack)
		{
			const url = this.model.getUrl();
			const data = this.model.get();
			const id = data.id;
			return this._patch(`${url}/${id}`, data, instanceParams, callBack);
		},

		/**
		 * Override the base delete method to use dynamic URL
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest}
		 */
		delete(instanceParams, callBack)
		{
			const url = this.model.getUrl();
			const id = this.model.get('id');
			return this._delete(`${url}/${id}`, instanceParams, callBack);
		}
	}
});
