import { Img } from "@base-framework/atoms";

/**
 * ImageThumbnail
 *
 * Renders an image thumbnail preview
 *
 * @param {File} file
 * @returns {object}
 */
export const ImageThumbnail = (file) =>
{
	return Img({
		alt: file.name,
		class: "w-12 h-12 rounded object-cover border border-border",
		onCreated(img)
		{
			const reader = new FileReader();
			reader.onload = (e) =>
			{
				// @ts-ignore
				img.src = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	});
};
