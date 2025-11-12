/**
 * Format bytes to human readable size
 *
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) =>
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
export const getFileExtension = (fileName) =>
{
	return fileName ? fileName.split('.').pop().toLowerCase() : '';
};

/**
 * Check if file is an image based on extension
 *
 * @param {string} ext
 * @returns {boolean}
 */
export const isImageFile = (ext) =>
{
	return ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'webp'].includes(ext);
};
