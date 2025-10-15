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
	url: '/api/client/[[clientId]]/conversation',

	xhr: {
		/**
		 * Add a new conversation message with optional file attachments.
		 *
		 * @param {object} instanceParams - The instance parameters.
		 * @param {function} callBack - The callback function.
		 * @param {FileList|File[]} [files] - Optional files to attach.
		 * @returns {XMLHttpRequest|void} The request promise.
		 */
		add(instanceParams, callBack, files)
		{
			const data = this.model.get();

			// If no files, send as JSON (exclude attachments field)
			if (!files || files.length === 0)
			{
				const cleanData = { ...data };
				delete cleanData.attachments;
				const params = this.setupObjectData(cleanData);
				return this._post('', params, instanceParams, callBack);
			}

			// With files, use FormData
			const formData = new FormData();

			// Add message data (exclude attachments array)
			Object.keys(data).forEach(key =>
			{
				if (key !== 'attachments')
				{
					formData.append(key, data[key]);
				}
			});

			// Add files
			Array.from(files).forEach(file =>
			{
				// Validate file size (10MB as per backend validation)
				const maxSize = 10 * 1024 * 1024; // 10MB
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
