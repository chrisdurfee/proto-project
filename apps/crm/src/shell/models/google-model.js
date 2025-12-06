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
		}
	}
});