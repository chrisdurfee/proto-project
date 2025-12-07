import { Div, P, Span } from "@base-framework/atoms";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { AttachmentIcon } from "./attachment-icon.js";
import { ImageThumbnail } from "./image-thumbnail.js";
import { formatFileSize, getFileExtension, isImageFile } from "./utils.js";

/**
 * AttachmentPreviewItem
 *
 * Displays a single attachment preview with remove button
 *
 * @param {File} file
 * @param {number} index
 * @param {object} parent - Parent component with removeFile method
 * @returns {object}
 */
export const AttachmentPreviewItem = (file, index, parent) =>
{
	const ext = getFileExtension(file.name);
	const isImage = isImageFile(ext);

	return Div({
		class: "relative flex items-center gap-x-3 p-2 border border-border rounded-lg bg-card hover:border-primary/50 transition-all"
	}, [
		// Thumbnail or icon
		isImage ? ImageThumbnail(file) : AttachmentIcon(ext),

		// File info
		Div({ class: "flex-1 min-w-0" }, [
			P({ class: "text-sm font-medium truncate" }, file.name),
			Span({ class: "text-xs text-muted-foreground" }, formatFileSize(file.size))
		]),

		// Remove button
		Button({
			variant: "icon",
			icon: Icons.x,
			class: "text-muted-foreground hover:text-destructive h-6 w-6",
			click: (e) =>
			{
				e.stopPropagation();
				parent.removeFile(index);
			}
		})
	]);
};
