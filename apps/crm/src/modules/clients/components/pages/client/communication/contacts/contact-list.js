import { Div, P } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { ScrollableList } from "@base-framework/organisms";
import { Badge, Card } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { Avatar, EmptyState } from "@base-framework/ui/molecules";
import { ContactDetailsModal } from "./modals/contact-details-modal.js";

/**
 * ContactItem
 *
 * Renders a single contact row as a card.
 *
 * @param {object} contact
 * @param {function} onClick
 * @returns {object}
 */
const ContactItem = (contact, onClick) =>
{
	const displayName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unknown';
	const contactType = contact.contactType || 'other';
	const typeLabel = contactType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
	const isPrimary = contact.isPrimary === 1 || contact.isPrimary === true;

	return Card({
		class: "flex items-center justify-between p-4 cursor-pointer",
		margin: "m-2",
		hover: true,
		click: (e, parent) => onClick && onClick(contact, parent)
	}, [
		Div({ class: "flex items-center gap-x-4" }, [
			Avatar({
				src: contact.avatar,
				alt: displayName,
				fallbackText: displayName,
				size: "sm"
			}),
			Div({ class: "flex flex-col" }, [
				Div({ class: "flex items-center gap-2" }, [
					P({ class: "font-medium m-0" }, displayName),
					isPrimary ? Badge({ type: 'green', class: 'text-xs' }, 'Primary') : null
				]),
				P({ class: "text-sm text-muted-foreground m-0" }, contact.email || '-'),
				P({ class: "text-sm text-muted-foreground m-0" }, contact.phone || contact.mobile || '-')
			])
		]),
		Badge({ type: isPrimary ? "primary" : "outline" }, typeLabel)
	]);
};

/**
 * ContactList
 *
 * Lists all of a client's contacts.
 *
 * @param {object} props
 * @param {object} props.data
 * @returns {object}
 */
export const ContactList = Atom(({ data }) =>
{
	/**
	 * Opens the contact details modal
	 *
	 * @param {object} contact
	 * @param {object} parent
	 */
	const openContactDetailsModal = (contact, parent) =>
	{
		ContactDetailsModal({
			contact,
			clientId: data.clientId,
			onUpdate: (updatedData) =>
			{
				if (updatedData === null)
				{
					// Contact was deleted, refresh the list
					parent?.refresh();
				}
				else
				{
					// Contact was updated, update the list
					parent?.mingle([ updatedData.get() ]);
				}
			}
		});
	};

	return Div({ class: "flex flex-col gap-y-6 mt-12" }, [
		ScrollableList({
			data,
			cache: "list",
			key: "id",
			role: "list",
			skeleton: true,
			rowItem: (contact) => ContactItem(contact, openContactDetailsModal),
			emptyState: () => EmptyState({
				title: 'No Contacts Found',
				description: 'No contacts have been added for this client yet.',
				icon: Icons.user.default
			})
		})
	]);
});
