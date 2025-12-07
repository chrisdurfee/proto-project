import { Div } from "@base-framework/atoms";

/**
 * AttachmentIcon
 *
 * Returns appropriate icon/styling based on file type
 *
 * @param {string} ext
 * @returns {object}
 */
export const AttachmentIcon = (ext) =>
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
