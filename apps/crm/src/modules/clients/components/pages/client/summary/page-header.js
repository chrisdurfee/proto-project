import { Div, H2 } from "@base-framework/atoms";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { ActivityAvatarGroup } from "@components/organisms/tracking/activity-avatar-group.js";
import { ClientModal } from "../../../organisms/modals/client-modal.js";

/**
 * This will create a permission modal.
 *
 * @param {object} parent
 * @returns {object}
 */
const Modal = ({ context }) => (
	ClientModal({
		item: context.data.client,
		onSubmit: (data) => context.data.client = data.get()
	})
);

/**
 * PageHeader
 *
 * Creates the header for the client page, including the title and edit button.
 *
 * @param {object} client The client data to display.
 * @returns {object}
 */
export const PageHeader = (client) => (
	Div({ class: 'flex flex-row justify-between gap-4 py-4 lg:py-2' }, [
		H2({ class: 'text-2xl font-medium' }, 'Client Summary'),
		Div({ class: 'flex flex-row gap-x-2' }, [
			new ActivityAvatarGroup({
				type: 'client',
				refId: client.id,
				userId: app.data.user.id
			}),
			Div({ class: 'hidden lg:inline-flex' }, [
				Button({ variant: 'withIcon', class: 'text-muted-foreground outline', icon: Icons.pencil.square, click: (e, parent) => Modal(parent) }, 'Edit'),
			]),
			Div({ class: 'flex lg:hidden mr-4' }, [
				Tooltip({ content: 'Edit', position: 'left' }, Button({ variant: 'icon', class: 'outline', icon: Icons.pencil.square, click: (e, parent) => Modal(parent) }))
			])
		])
	])
);