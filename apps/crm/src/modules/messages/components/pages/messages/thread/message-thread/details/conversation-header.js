import { A, Div, Span } from "@base-framework/atoms";
import { Button, Icon } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, StaticStatusIndicator } from "@base-framework/ui/molecules";
import { BackButton } from "@base-framework/ui/organisms";

/**
 * ConversationHeader
 *
 * A top bar: avatar, name, and right-side icons (call, video).
 * Fetches the other user's information from the participants array.
 *
 * @returns {object}
 */
export const ConversationHeader = () =>
	Div({ class: "flex items-center p-4 bg-background/80 backdrop-blur-md sticky top-0 w-full z-10" }, [
		Div({ class: 'flex flex-auto items-center gap-3 lg:max-w-5xl m-auto' }, [
			// Left side back button
			Div({ class: 'flex lg:hidden' }, [
				BackButton({
					margin: 'm-0 ml-0',
					backUrl: '/messages',
					allowHistory: true
				})
			]),

			Div({ class: "flex items-center gap-3 flex-1" }, [
				Div({ class: "relative" }, [
					Avatar({
						src: '/files/users/profile/[[otherUser.image]]',
						alt: '[[otherUser.firstName]] [[otherUser.lastName]]',
						watcherFallback: '[[otherUser.firstName]] [[otherUser.lastName]]',
						size: "md"
					}),
					Div({ class: "absolute bottom-0 right-0" }, [
						StaticStatusIndicator('[[otherUser.status]]')
					])
				]),

				Div({ class: "flex flex-col" }, [
					Span({ class: "font-semibold text-base text-foreground capitalize" }, '[[otherUser.firstName]] [[otherUser.lastName]]'),
				])
			]),

			// Right side icons (video/call)
			Div({ class: "ml-auto flex items-center gap-1" }, [
				A({
					class: "bttn icon",
					href: '/messages/video/[[conversation.id]]',
				}, [
					Icon(Icons.videoCamera.default)
				]),
				Button({
					variant: "icon",
					icon: Icons.phone.default
				})
			])
		])
	]);