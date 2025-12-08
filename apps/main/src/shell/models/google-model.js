import { Model } from "@base-framework/base";

/**
 * GoogleModel
 *
 * This model is used to handle the google authentication.
 *
 * @type {typeof Model}
 */
export const GoogleModel = Model.extend({
	url: '/api/auth/google',

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
		 * Signup the user.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		signup(instanceParams, callBack)
		{
			return this._get('signup', {}, instanceParams, callBack);
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
		},

		/**
		 * Handle the signup callback.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		signupCallback(instanceParams, callBack)
		{
			const data = this.model.get();
			return this._post('signup/callback', data, instanceParams, callBack);
		}
	}
});