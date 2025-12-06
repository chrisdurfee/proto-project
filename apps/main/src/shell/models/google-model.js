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
			return this._get('login', {}, instanceParams, callBack);
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
			return this._post('callback', data, instanceParams, callBack);
		}
	}
});