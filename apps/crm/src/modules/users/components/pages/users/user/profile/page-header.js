import { Div, H1 } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { UserModal } from "../../modals/user-modal.js";

/**
 * This will create a permission modal.
 *
 * @param {object} context
 * @returns {object}
 */
const Modal = (context) => (
	UserModal({
		item: context.data.user,
		onSubmit: (data) =>
		{
			context.data.user = data.get();
		}
	})
);

/**
 * Creates the page header for the profile page.
 *
 * @param {object} props
 * @param {object} props.user - The user data.
 * @param {object} props.context - The context object.
 * @returns {object}
 */
export const PageHeader = ({ context }) => (
	Div({ class: 'flex flex-row justify-between gap-4' }, [
		Div({ class: 'flex flex-col' }, [
			H1({ class: 'text-2xl md:text-2xl font-bold tracking-tight' }, 'Profile'),
		]),
		Div({ class: 'flex flex-row space-x-2' }, [
			Div({ class: 'hidden lg:inline-flex' }, [
				Button({
					variant: 'withIcon',
					class: 'text-muted-foreground outline',
					icon: Icons.pencil.square,
					click: () => Modal(context)
				}, 'Edit'),
			]),
			Div({ class: 'flex lg:hidden mr-4' }, [
				Tooltip({ content: 'Edit', position: 'left' }, [
					Button({
						variant: 'icon',
						class: 'outline',
						icon: Icons.pencil.square,
						click: () => Modal(context)
					})
				])
			])
		])
	])
);

export default PageHeader;