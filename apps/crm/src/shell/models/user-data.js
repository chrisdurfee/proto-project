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
		},

		/**
		 * Upload a user's profile image.
		 *
		 * @param {File} imageFile - The image file to upload.
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {Promise} The upload promise.
		 */
		uploadImage(imageFile, instanceParams, callBack)
		{
			const data = this.model.get();

			if (!imageFile || !data.id)
			{
				const error = new Error(!imageFile ? 'No image file provided' : 'User ID not found');
				if (typeof callBack === 'function')
				{
					callBack(error, null);
				}
				return Promise.reject(error);
			}

			// Validate file type client-side
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			const fileType = imageFile.type.toLowerCase();
			if (!allowedTypes.includes(fileType))
			{
				const error = new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
				if (typeof callBack === 'function')
				{
					callBack(error, null);
				}
				return Promise.reject(error);
			}

			// Validate file size client-side (30MB)
			const maxSize = 30 * 1024 * 1024; // 30MB
			if (imageFile.size > maxSize)
			{
				const error = new Error('File size too large. Maximum size is 30MB.');
				if (typeof callBack === 'function')
				{
					callBack(error, null);
				}
				return Promise.reject(error);
			}

			// Create FormData for file upload
			const formData = new FormData();
			formData.append('image', imageFile);

			// Use custom request for file upload
			return this._uploadFile(`${data.id}/upload-image`, formData, instanceParams, callBack);
		},

		/**
		 * Custom file upload method that handles FormData properly.
		 *
		 * @param {string} url - The URL endpoint.
		 * @param {FormData} formData - The form data containing the file.
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {Promise} The upload promise.
		 * @private
		 */
		_uploadFile(url, formData, instanceParams, callBack)
		{
			const fullUrl = `${this.url}/${url}`;

			// Set up request options for file upload
			const requestOptions = {
				method: 'POST',
				body: formData,
				// Don't set Content-Type header - let browser set it with boundary
				headers: {
					'X-Requested-With': 'XMLHttpRequest'
				}
			};

			// Add any additional headers from instanceParams
			if (instanceParams && instanceParams.headers)
			{
				Object.assign(requestOptions.headers, instanceParams.headers);
			}

			return fetch(fullUrl, requestOptions)
				.then(response => {
					if (!response.ok)
					{
						throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then(data => {
					if (typeof callBack === 'function')
					{
						callBack(null, data);
					}
					return data;
				})
				.catch(error => {
					if (typeof callBack === 'function')
					{
						callBack(error, null);
					}
					throw error;
				});
		}
    }
});
