import { Div, Img, P, Span } from "@base-framework/atoms";
import { Button } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";

/**
 * Format bytes to human readable size
 *
 * @param {number} bytes
 * @returns {string}
 */
const formatFileSize = (bytes) =>
{
	if (!bytes) return '';
	if (bytes < 1024) return bytes + ' B';
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
	return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Get file extension from filename
 *
 * @param {string} fileName
 * @returns {string}
 */
const getFileExtension = (fileName) =>
{
	return fileName ? fileName.split('.').pop().toLowerCase() : '';
};

/**
 * Check if file is an image based on extension
 *
 * @param {string} ext
 * @returns {boolean}
 */
const isImageFile = (ext) =>
{
	return ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'webp'].includes(ext);
};

/**
 * AttachmentIcon
 *
 * Returns appropriate icon/styling based on file type
 *
 * @param {string} ext
 * @returns {object}
 */
const AttachmentIcon = (ext) =>
{
	const iconClasses = "w-12 h-12 rounded flex items-center justify-center text-white font-semibold text-xs";
	const extUpper = ext?.toUpperCase() || '?';

	// Color coding by file type
	const colorMap = {
		pdf: 'bg-red-500',
		doc: 'bg-blue-500',
		docx: 'bg-blue-500',
		xls: 'bg-green-600',
		xlsx: 'bg-green-600',
		txt: 'bg-gray-500',
		csv: 'bg-green-500',
		zip: 'bg-purple-500',
		default: 'bg-gray-400'
	};

	const bgColor = colorMap[ext] || colorMap.default;
	return Div({ class: `${iconClasses} ${bgColor}` }, extUpper);
};

/**
 * ImageThumbnail
 *
 * Renders an image thumbnail preview
 *
 * @param {File} file
 * @returns {object}
 */
const ImageThumbnail = (file) =>
{
	const reader = new FileReader();
	const img = Img({
		alt: file.name,
		class: "w-12 h-12 rounded object-cover border border-border"
	});

	reader.onload = (e) =>
	{
		// @ts-ignore
		img.element.src = e.target.result;
	};
	reader.readAsDataURL(file);

	return img;
};

/**
 * AttachmentPreviewItem
 *
 * Displays a single attachment preview with remove button
 *
 * @param {File} file
 * @param {number} index
 * @param {Function} onRemove
 * @returns {object}
 */
const AttachmentPreviewItem = (file, index, onRemove) =>
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
			P({
				class: "text-sm font-medium truncate"
			}, file.name),
			Span({
				class: "text-xs text-muted-foreground"
			}, formatFileSize(file.size))
		]),

		// Remove button
		Button({
			variant: "icon",
			icon: Icons.xMark,
			class: "text-muted-foreground hover:text-destructive h-6 w-6",
			click: (e) =>
			{
				e.stopPropagation();
				onRemove(index);
			}
		})
	]);
};

/**
 * AttachmentPreview
 *
 * Container for attachment previews above the composer
 * Displays selected files before sending with ability to remove them
 *
 * @param {Array<File>} files
 * @param {Function} onRemove - Callback to remove file by index
 * @returns {object|null}
 */
export const AttachmentPreview = (files, onRemove) =>
{
	if (!files || files.length === 0)
	{
		return null;
	}

	return Div({ class: "px-4 pb-2 w-full bg-background/80 backdrop-blur-md" }, [
		Div({ class: "lg:max-w-5xl m-auto" }, [
			// Header
			Div({ class: "flex items-center justify-between mb-2" }, [
				Span({ class: "text-sm font-medium text-muted-foreground" }, `${files.length} file${files.length !== 1 ? 's' : ''} selected`),
				Button({
					variant: "ghost",
					class: "text-xs text-muted-foreground hover:text-foreground",
					click: () =>
					{
						// Remove all files
						while (files.length > 0)
						{
							onRemove(0);
						}
					}
				}, "Clear all")
			]),

			// Attachment grid
			Div({
				class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
			}, files.map((file, index) => AttachmentPreviewItem(file, index, onRemove)))
		])
	]);
};
