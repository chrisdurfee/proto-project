import { Div, Span } from "@base-framework/atoms";
import { Button } from "@base-framework/ui/atoms";

/**
 * AttachmentPreviewHeader
 *
 * Header showing file count and clear all button
 *
 * @param {number} fileCount
 * @param {Function} onClearAll
 * @returns {object}
 */
export const AttachmentPreviewHeader = (fileCount, onClearAll) =>
	Div({ class: "flex items-center justify-between mb-2" }, [
		Span({ class: "text-sm font-medium text-muted-foreground" }, `${fileCount} file${fileCount !== 1 ? 's' : ''} selected`),
		Button({
			variant: "ghost",
			class: "text-xs text-muted-foreground hover:text-foreground",
			click: onClearAll
		}, "Clear all")
	]);
