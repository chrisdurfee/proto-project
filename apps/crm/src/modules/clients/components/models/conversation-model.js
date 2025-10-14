import { Model } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";

/**
 * ConversationModel
 *
 * This model handles client conversation operations.
 *
 * @type {typeof Model}
 */
export const ConversationModel = Model.extend({
	/**
	 * Base URL for conversation endpoints.
	 * Will be completed with clientId in the component.
	 */
	url: '/api/client/:clientId/conversation',

	xhr: {
		/**
		 * Add a new conversation message with optional file attachments.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @returns {XMLHttpRequest|void} The request promise.
		 */
		add(instanceParams, callBack)
		{
            const data = this.model.get();
            const files = data.attachments || [];
			// If no files, send as JSON
			if (!files || files.length === 0)
			{
				const params = this.setupObjectData(data);
				return this._post('', params, instanceParams, callBack);
			}

			// With files, use FormData
			const formData = new FormData();

			// Add message data
			Object.keys(data).forEach(key =>
			{
				formData.append(key, data[key]);
			});

			// Add files
			Array.from(files).forEach(file =>
			{
				// Validate file size (50MB as per backend validation)
				const maxSize = 50 * 1024 * 1024; // 50MB
				if (file.size > maxSize)
				{
					app.notify({
						type: "destructive",
						title: "File Too Large",
						description: `${file.name} exceeds 10MB limit.`,
						icon: Icons.warning
					});
					return;
				}

				formData.append('attachments[]', file);
			});

			return this._post('', formData, instanceParams, callBack);
		}
	}
});
