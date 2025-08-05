import { Model } from "@base-framework/base";

/**
 * UserData Model
 *
 * This will create a model for user data.
 *
 * @type {typeof Model} UserData
 */
export const UserData = Model.extend({
    url: '/api/user',

    xhr: {
        /**
		 * Update a user's credentials.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		updateCredentials(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				username: data.username,
				password: data.password
			};

			return this._patch(`${data.id}/update-credentials`, params, instanceParams, callBack);
		},

		/**
		 * Unsubscribe a user from email notifications.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		unsubscribe(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				email: data.email,
				requestId: instanceParams.requestId
			};

			return this._patch(`unsubscribe`, params, instanceParams, callBack);
		},

        /**
		 * Verify a user's email.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		verifyEmail(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				token: instanceParams.token
			};

			return this._patch(`${data.id}/verify-email`, params, instanceParams, callBack);
		}
    }
});
