import { Div, UseParent } from "@base-framework/atoms";
import { Overlay } from "@base-framework/ui/organisms";

/**
 * FullScreenOverlay
 *
 * A full-screen overlay component.
 *
 * @param {object} props - The properties for the overlay.
 * @param {Function} childrenCallBack - A callback function to render child components.
 * @returns {Overlay} The full-screen overlay component.
 */
export const FullScreenOverlay = (props, childrenCallBack) => (
	new Overlay(props, [
		Div({ class: "flex flex-auto flex-col w-full" }, [
			Div({ class: 'flex flex-auto flex-col pt-0 sm:pt-2 lg:pt-0 lg:flex-row h-full' }, [
				UseParent(childrenCallBack)
			])
		])
	])
);

export default FullScreenOverlay;