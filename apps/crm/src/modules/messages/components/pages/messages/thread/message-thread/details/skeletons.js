import { Div } from "@base-framework/atoms";
import { Skeleton } from "@base-framework/ui/atoms";

/**
 * HeaderSkeleton
 *
 * Skeleton for the conversation header while loading.
 *
 * @returns {object}
 */
export const HeaderSkeleton = () =>
	Div({ class: "flex items-center p-4 px-2" }, [
		Div({ class: 'flex flex-auto items-center gap-3 lg:max-w-5xl m-auto' }, [
			Div({ class: "flex lg:hidden" }, [
				Skeleton({ width: "w-10", height: "h-10" })
			]),
			Skeleton({ shape: "circle", width: "w-12", height: "h-12" }),
			Skeleton({ width: "w-32", height: "h-4" }),
			Skeleton({ width: "w-16", height: "h-4", class: "ml-auto" })
		])
	]);

/**
 * ThreadSkeleton
 *
 * Skeleton placeholders for the chat messages.
 *
 * @returns {object}
 */
export const ThreadSkeleton = () =>
	Div({ class: "flex flex-none flex-col gap-4 w-full max-w-none lg:max-w-5xl m-auto p-4 pt-24" }, [
		Skeleton({ width: "w-1/2", height: "h-8", class: "rounded" + (Math.random() > 0.5 ? " self-end" : "") })
	]);