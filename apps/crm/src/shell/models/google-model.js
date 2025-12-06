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
			const data = this.model.get();
			let params = {
				username: encodeURI(data.username),
				password: encodeURIComponent(data.password),
				device: getEnvParams(),
				guid: GUID
			};

			return this._post('login', params, instanceParams, callBack);
		},

		/**
		 * Logout the user.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		logout(instanceParams, callBack)
		{
			let params = "guid=" + GUID;

			return this._post('logout', params, instanceParams, callBack);
		},

		/**
		 * Resume the user's session.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		resume(instanceParams, callBack)
		{
			let params = "guid=" + GUID;

			return this._post('resume', params, instanceParams, callBack);
		},

		/**
		 * Pulse the user's session.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		pulse(instanceParams, callBack)
		{
			let params = "guid=" + GUID;

			return this._post('pulse', params, instanceParams, callBack);
		},

		/**
		 * Get the CSRF token.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		getCsrfToken(instanceParams, callBack)
		{
			let params = "guid=" + GUID;

			return this._get('csrf-token', params, instanceParams, callBack);
		},

		/**
		 * Register a new user.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		register(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				...data,
				guid: GUID
			};

			return this._post('register', params, instanceParams, callBack);
		},

		/**
		 * Get MFA authentication code.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		getAuthCode(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				type: data.type,
				guid: GUID
			};

			return this._post('mfa/code', params, instanceParams, callBack);
		},

		/**
		 * Verify MFA authentication code.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		verifyAuthCode(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				code: data.code,
				guid: GUID
			};

			return this._post('mfa/verify', params, instanceParams, callBack);
		},

		/**
		 * Request a password reset.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		requestPasswordReset(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				email: data.email,
				guid: GUID
			};

			return this._post('password/request', params, instanceParams, callBack);
		},

		/**
		 * Validate a password reset request.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		validatePasswordRequest(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				requestId: data.requestId,
				userId: data.userId,
				guid: GUID
			};

			return this._post('password/verify', params, instanceParams, callBack);
		},

		/**
		 * Reset a user's password.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 */
		resetPassword(instanceParams, callBack)
		{
			const data = this.model.get();
			let params = {
				requestId: data.requestId,
				userId: data.userId,
				password: data.password,
				guid: GUID
			};

			return this._post('password/reset', params, instanceParams, callBack);
		}
	}
});