import { Model } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";

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
		 * @returns {XMLHttpRequest}
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
		 * @returns {XMLHttpRequest}
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
		 * @returns {XMLHttpRequest}
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
		 * @returns {XMLHttpRequest|void} The upload promise.
		 */
		uploadImage(imageFile, instanceParams, callBack)
		{
			const data = this.model.get();
			if (!data.id)
			{
				app.notify({
					type: "destructive",
					title: "Error",
					description: "No user ID found.",
					icon: Icons.shield
				});
				return;
			}

			// Validate file type client-side
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			const fileType = imageFile.type.toLowerCase();
			if (!allowedTypes.includes(fileType))
			{
				app.notify({
					type: "destructive",
					title: "Error",
					description: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
					icon: Icons.shield
				});
				return;
			}

			// Validate file size client-side (30MB)
			const maxSize = 30 * 1024 * 1024; // 30MB
			if (imageFile.size > maxSize)
			{
				app.notify({
					type: "destructive",
					title: "Error",
					description: "File size too large. Maximum size is 30MB.",
					icon: Icons.shield
				});
				return;
			}

			// Create FormData for file upload
			const formData = new FormData();
			formData.append('image', imageFile);

			return this._post(`${data.id}/upload-image`, formData, '', callBack);
		}
    }
});
