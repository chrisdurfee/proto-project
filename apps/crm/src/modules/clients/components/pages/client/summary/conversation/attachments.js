import { Div, Img, Span } from "@base-framework/atoms";

/**
 * Check if file is an image based on extension
 *
 * @param {string} ext
 * @returns {boolean}
 */
const isImageFile = (ext) =>
{
	return ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'webp'].includes(ext?.toLowerCase());
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
	const iconClasses = "w-10 h-10 rounded flex items-center justify-center text-white font-semibold text-xs";
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

	const bgColor = colorMap[ext?.toLowerCase()] || colorMap.default;
	return Div({ class: `${iconClasses} ${bgColor}` }, extUpper);
};

/**
 * FileSize
 *
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
 * ImagePreview
 *
 * Renders an image preview with hover overlay
 *
 * @param {string} filePath
 * @param {string} fileName
 * @returns {object}
 */
const ImagePreview = (filePath, fileName) =>
	Div({ class: "relative" }, [
		Img({
			src: filePath,
			alt: fileName,
			class: "w-16 h-16 rounded object-cover border border-border"
		}),
		Div({ class: "absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-all" })
	]);

/**
 * FileInfo
 *
 * Displays file name, extension, and size
 *
 * @param {object} att
 * @param {string} ext
 * @returns {object}
 */
const FileInfo = (att, ext) =>
	Div({ class: "flex flex-1 min-w-0 flex-col" }, [
		Div({
			class: "text-sm font-medium flex-1 min-w-0 truncate group-hover:text-primary transition-colors"
		}, att.displayName || att.fileName),
		Div({ class: "flex items-center gap-x-2 mt-1" }, [
			Span({
				class: "text-xs text-muted-foreground uppercase font-semibold"
			}, ext || 'file'),
			att.fileSize && Span({
				class: "text-xs text-muted-foreground"
			}, formatFileSize(att.fileSize))
		])
	]);

/**
 * DownloadIndicator
 *
 * Shows download arrow on hover
 *
 * @returns {object}
 */
const DownloadIndicator = () =>
	Div({
		class: "opacity-0 group-hover:opacity-100 transition-opacity"
	}, [
		Span({
			class: "text-xs text-muted-foreground"
		}, "↗")
	]);

/**
 * Attachment
 *
 * @param {object} att
 * @returns {object}
 */
const Attachment = (att) =>
{
	const isImage = isImageFile(att.fileExtension);
	const filePath = `/files/client/conversation/${att.filePath}`;

	return Div({
		class: "group relative flex w-full max-w-xs items-center gap-x-3 p-3 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card min-w-0",
		click: () => window.open(filePath, '_blank')
	}, [
		isImage ? ImagePreview(filePath, att.fileName) : AttachmentIcon(att.fileExtension),
		FileInfo(att, att.fileExtension),
		DownloadIndicator()
	]);
};

/**
 * Attachments
 *
 * @param {array} attachments
 * @returns {object}
 */
export const Attachments = (attachments) =>
	Div({ class: "flex flex-col gap-y-2 mt-3" },
		attachments.map((att) =>
			Attachment(att)
		)
	);
