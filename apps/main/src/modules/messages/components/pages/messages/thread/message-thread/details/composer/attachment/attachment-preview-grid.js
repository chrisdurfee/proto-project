import { Div } from "@base-framework/atoms";
import { AttachmentPreviewItem } from "./attachment-preview-item.js";

/**
 * AttachmentPreviewGrid
 *
 * Grid container for attachment preview items
 *
 * @param {object} parent - Parent component with removeFile method
 * @returns {object}
 */
export const AttachmentPreviewGrid = (parent) =>
	Div({
		class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2",
		// @ts-ignore
		for: ['files', (file, index) => AttachmentPreviewItem(file, index, parent)]
	});
