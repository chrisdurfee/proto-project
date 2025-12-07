import { Div, On } from "@base-framework/atoms";
import { Component, Data, Jot } from "@base-framework/base";
import { AttachmentPreviewGrid } from "./attachment-preview-grid.js";
import { AttachmentPreviewHeader } from "./attachment-preview-header.js";

/**
 * AttachmentPreview
 *
 * Container for attachment previews above the composer
 * Displays selected files before sending with ability to remove them
 *
 * @type {typeof Component}
 */
export const AttachmentPreview = Jot(
{
	/**
	 * Initialize component data.
	 *
	 * @returns {void}
	 */
	onCreated()
	{
		// @ts-ignore
		this.data = new Data({ files: [] });
	},

	/**
	 * Add files to the preview.
	 *
	 * @param {Array<File>} files
	 * @returns {void}
	 */
	addFiles(files)
	{
		// @ts-ignore
		this.data.concat('files', files);
	},

	/**
	 * Remove a file by index.
	 *
	 * @param {number} index
	 * @returns {void}
	 */
	removeFile(index)
	{
		// @ts-ignore
		this.data.splice('files', index);
	},

	/**
	 * Clear all files.
	 *
	 * @returns {void}
	 */
	clearAll()
	{
		// @ts-ignore
		this.data.set({ files: [] });
	},

	/**
	 * Get all files.
	 *
	 * @returns {Array<File>}
	 */
	getFiles()
	{
		// @ts-ignore
		return this.data.files;
	},

	/**
	 * Render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return On('files', (files) =>
		{
			if (!files || files.length === 0)
			{
				return null;
			}

			return Div({ class: "px-4 pb-2 w-full bg-background/80 backdrop-blur-md" }, [
				Div({ class: "lg:max-w-5xl m-auto" }, [
					// @ts-ignore
					AttachmentPreviewHeader(files.length, () => this.clearAll()),
					// @ts-ignore
					AttachmentPreviewGrid(this)
				])
			]);
		});
	}
});
