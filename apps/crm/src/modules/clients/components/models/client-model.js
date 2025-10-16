import { Model } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";

/**
 * ClientModel
 *
 * This model is used to handle the client model.
 *
 * @type {typeof Model}
 */
export const ClientModel = Model.extend({
	url: '/api/client',

	xhr: {
		/**
		 * Upload a client's logo/image.
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
					description: "No client ID found.",
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
