import { Model } from "@base-framework/base";

/**
 * GoogleModel
 *
 * This model is used to handle the google authentication.
 *
 * @type {typeof Model}
 */
export const GoogleModel = Model.extend({
	url: '/api/auth/crm/google',

	xhr: {
		/**
		 * Login the user.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		login(instanceParams, callBack)
		{
			const redirectUrl = window.location.origin + '/login/google/callback';
			return this._get('login', { redirectUrl }, instanceParams, callBack);
		},

		/**
		 * Handle the callback.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		callback(instanceParams, callBack)
		{
			const data = this.model.get();
			const redirectUrl = window.location.origin + '/login/google/callback';
			return this._post('callback', { ...data, redirectUrl }, instanceParams, callBack);
		}
	}
});