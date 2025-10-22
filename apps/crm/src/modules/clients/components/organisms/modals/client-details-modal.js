import { Div } from "@base-framework/atoms";
import { Data } from "@base-framework/base";
import { Icons } from "@base-framework/ui/icons";
import { Modal } from "@base-framework/ui/molecules";
import { UnderlinedButtonTab } from "@base-framework/ui/organisms";
import { ClientDetailsAvatar } from "./client-details/client-details-avatar.js";
import { ClientDetailsNotes } from "./client-details/client-details-notes.js";
import { ClientDetailsProfile } from "./client-details/client-details-profile.js";

/**
 * Tab content wrapper.
 *
 * @param {Array} children
 * @returns {object}
 */
const TabContent = (children) => (
	Div({ class: 'py-4' }, children)
);

/**
 * ClientDetailsModal
 *
 * A modal for viewing client details with tabs for profile and notes.
 *
 * @param {object} props
 * @param {object} props.client - The client data
 * @param {function} [props.onUpdate] - Callback when client is updated
 * @param {function} [props.onClose] - Callback when modal closes
 * @returns {object}
 */
export const ClientDetailsModal = (props) =>
{
	const client = props.client || {};
	const clientId = client.id;
	if (!clientId)
	{
		console.error('ClientDetailsModal: client.id is required');
		return;
	}

	const closeCallback = (parent) => props.onClose && props.onClose(parent);

	return new Modal({
		title: 'Client Profile',
		icon: Icons.identification,
		description: `A summary of client details.`,
		size: 'lg',
		type: 'right',
		hidePrimaryButton: true,

		/**
		 * This will setup the data for the modal.
		 *
		 * @returns {Data}
		 */
		setData()
		{
			return new Data({
				client,
				clientId
			});
		},

		/**
		 * This will close the modal.
		 *
		 * @returns {void}
		 */
		onClose: closeCallback
	},
	[
		Div({ class: 'flex flex-col gap-y-4' }, [
			// Client avatar section
			ClientDetailsAvatar({ client }),

			// Tabs for Profile and Notes
			new UnderlinedButtonTab({
				class: 'w-full',
				options: [
					{
						label: 'Profile',
						value: 'profile',
						selected: true,
						component: TabContent([
							ClientDetailsProfile({ client })
						])
					},
					{
						label: 'Notes',
						value: 'notes',
						component: TabContent([
							ClientDetailsNotes({ client, clientId })
						])
					}
				]
			})
		])
	]).open();
};
