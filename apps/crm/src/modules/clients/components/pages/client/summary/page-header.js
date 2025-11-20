import { Div, H2 } from "@base-framework/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DropdownMenu } from "@base-framework/ui/molecules";
import { ActivityAvatarGroup } from "@components/organisms/tracking/activity-avatar-group.js";
import { ClientModal } from "../../../organisms/modals/client-modal.js";

/**
 * This will create a client modal.
 *
 * @param {object} parent
 * @returns {object}
 */
const openEditModal = (parent) => (
	ClientModal({
		item: parent.context.data.client,
		onSubmit: (data) => parent.context.data.client = data.get()
	})
);

/**
 * PageHeader
 *
 * Creates the header for the client page, including the title and options menu.
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
			new DropdownMenu({
				icon: Icons.ellipsis.vertical,
				variant: 'outline',
				groups: [
					[
						{ icon: Icons.pencil.square, label: 'Edit', value: 'edit' }
					]
				],
				onSelect: (selected, parent) =>
				{
					if (selected.value === 'edit')
					{
						openEditModal(parent);
					}
				}
			})
		])
	])
);