import { Div, Img, P, Span } from "@base-framework/atoms";

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
 * Attachment
 *
 * @param {object} att
 * @returns {object}
 */
const Attachment = (att) =>
{
	const isImage = att.fileType?.startsWith('image/');
	const filePath = `/files/client/conversation/${att.filePath}`;

	return Div({
		class: "group relative flex items-center gap-x-3 p-3 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer bg-card",
		click: () => window.open(filePath, '_blank')
	}, [
		// Image preview or file type icon
		isImage
			? Div({ class: "relative" }, [
				Img({
					src: filePath,
					alt: att.fileName,
					class: "w-16 h-16 rounded object-cover border border-border"
				}),
				// Overlay on hover for images
				Div({ class: "absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-all" })
			])
			: AttachmentIcon(att.fileExtension),

		// File info
		Div({ class: "flex-1 min-w-0" }, [
			P({
				class: "text-sm font-medium truncate group-hover:text-primary transition-colors"
			}, att.displayName || att.fileName),
			Div({ class: "flex items-center gap-x-2 mt-1" }, [
				Span({
					class: "text-xs text-muted-foreground uppercase font-semibold"
				}, att.fileExtension || 'file'),
				att.fileSize && Span({
					class: "text-xs text-muted-foreground"
				}, formatFileSize(att.fileSize))
			])
		]),

		// Download indicator
		Div({
			class: "opacity-0 group-hover:opacity-100 transition-opacity"
		}, [
			Span({
				class: "text-xs text-muted-foreground"
			}, "↗")
		])
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
