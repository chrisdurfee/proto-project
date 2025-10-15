import { Div, P } from "@base-framework/atoms";
import { Data } from "@base-framework/base";
import { Button, Tooltip } from "@base-framework/ui/atoms";
import { Icons } from "@base-framework/ui/icons";
import { DetailBody, DetailSection, DropdownMenu, Modal, SplitRow } from "@base-framework/ui/molecules";
import { Format } from "@base-framework/ui/utils";
import { ContactModal } from "./contact-modal.js";

/**
 * Quick connect buttons for email, call, message, etc.
 *
 * @returns {object}
 */
const QuickConnectButtons = () =>
	Div({ class: 'flex flex-auto items-center justify-center border-b pb-6' }, [
		Div({ class: 'flex gap-x-4' }, [
			Tooltip({ content: 'Email' }, [
				Button({
					variant: 'icon',
					icon: Icons.envelope.default,
					label: 'Email',
					click: (e, parent) =>
					{
						const email = parent.data.email;
						if (email)
						{
							window.location.href = `mailto:${email}`;
						}
					}
				})
			]),
			Tooltip({ content: 'Call' }, [
				Button({
					variant: 'icon',
					icon: Icons.phone.default,
					label: 'Call',
					click: (e, parent) =>
					{
						const phone = parent.data.phone || parent.data.mobile;
						if (phone)
						{
							window.location.href = `tel:${phone}`;
						}
					}
				})
			]),
			Tooltip({ content: 'Message' }, [
				Button({
					variant: 'icon',
					icon: Icons.chat.text,
					label: 'Message'
				})
			]),
			Tooltip({ content: 'More' }, [
				Button({
					variant: 'icon',
					icon: Icons.ellipsis.vertical,
					label: 'More'
				})
			])
		])
	]);

/**
 * Contact information section
 *
 * @returns {object}
 */
const ContactInformation = () =>
	DetailSection({ title: 'Contact Information' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Name', '[[displayName]]'),
			SplitRow('Email', '[[email]]'),
			SplitRow('Phone', Format.phone('[[phone]]', '-')),
			SplitRow('Mobile', Format.phone('[[mobile]]', '-')),
			SplitRow('Fax', Format.phone('[[fax]]', '-'))
		])
	]);

/**
 * Role and type section
 *
 * @returns {object}
 */
const RoleTypeSection = () =>
	DetailSection({ title: 'Role & Type' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Contact Type', '[[contactTypeLabel]]'),
			SplitRow('Primary Contact', '[[isPrimaryLabel]]'),
			SplitRow('Job Title', '[[jobTitle]]'),
			SplitRow('Department', '[[department]]')
		])
	]);

/**
 * Preferences section
 *
 * @returns {object}
 */
const PreferencesSection = () =>
	DetailSection({ title: 'Preferences' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Preferred Contact Method', '[[preferredContactMethodLabel]]'),
			SplitRow('Language', '[[languageLabel]]'),
			SplitRow('Timezone', '[[timezoneLabel]]')
		])
	]);

/**
 * Social media section
 *
 * @returns {object}
 */
const SocialMediaSection = () =>
	DetailSection({ title: 'Social Media' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('LinkedIn', '[[linkedinUrl]]'),
			SplitRow('Twitter', '[[twitterHandle]]')
		])
	]);

/**
 * Communication preferences section
 *
 * @returns {object}
 */
const CommunicationPreferencesSection = () =>
	DetailSection({ title: 'Communication Preferences' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Marketing Opt-In', '[[marketingOptInLabel]]'),
			SplitRow('Newsletter Subscribed', '[[newsletterSubscribedLabel]]'),
			SplitRow('Do Not Contact', '[[doNotContactLabel]]')
		])
	]);

/**
 * Status and personal info section
 *
 * @returns {object}
 */
const StatusPersonalSection = () =>
	DetailSection({ title: 'Status & Personal Info' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Status', '[[statusLabel]]'),
			SplitRow('Birthday', '[[birthdayFormatted]]'),
			SplitRow('Assistant Name', '[[assistantName]]'),
			SplitRow('Assistant Phone', Format.phone('[[assistantPhone]]', '-'))
		])
	]);

/**
 * Header options for the modal.
 *
 * @param {function} onEdit - Callback when edit is selected
 * @param {function} onDelete - Callback when delete is selected
 * @returns {Array}
 */
const HeaderOptions = (onEdit, onDelete) => [
	new DropdownMenu({
		icon: Icons.ellipsis.vertical,
		groups: [
			[
				{ icon: Icons.pencil.square, label: 'Edit Contact', value: 'edit-contact' },
				{ icon: Icons.trash, label: 'Delete Contact', value: 'delete-contact' }
			]
		],
		onSelect: (item) =>
		{
			if (item.value === 'edit-contact')
			{
				onEdit && onEdit();
			}
			else if (item.value === 'delete-contact')
			{
				onDelete && onDelete();
			}
		},
	})
];

/**
 * Notes section
 *
 * @returns {object}
 */
const NotesSection = () =>
	DetailSection({ title: 'Notes' }, [
		P({ class: 'text-sm text-muted-foreground whitespace-pre-line' }, '[[notes]]')
	]);

/**
 * Formats a label from a value
 *
 * @param {string} value
 * @returns {string}
 */
const formatLabel = (value) =>
{
	if (!value) return '-';
	return value.toString().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formats a boolean to Yes/No
 *
 * @param {any} value
 * @returns {string}
 */
const formatBoolean = (value) =>
{
	const isTrue = value === 1 || value === true || value === '1' || value === 'true';
	return isTrue ? 'Yes' : 'No';
};

/**
 * Formats the contact data for display
 *
 * @param {object} contact
 * @returns {object}
 */
const formatContactData = (contact) =>
{
	const firstName = contact.firstName || '';
	const lastName = contact.lastName || '';
	const displayName = `${firstName} ${lastName}`.trim() || 'Unknown';

	const contactType = contact.contactType || 'other';
	const contactTypeLabel = formatLabel(contactType);

	const isPrimary = contact.isPrimary === 1 || contact.isPrimary === true;
	const isPrimaryLabel = formatBoolean(isPrimary);

	return {
		...contact,
		displayName,
		contactTypeLabel,
		isPrimaryLabel,
		email: contact.email || '-',
		phone: contact.phone || '-',
		mobile: contact.mobile || '-',
		fax: contact.fax || '-',
		jobTitle: contact.jobTitle || '-',
		department: contact.department || '-',
		preferredContactMethodLabel: formatLabel(contact.preferredContactMethod),
		languageLabel: contact.language ? contact.language.toUpperCase() : '-',
		timezoneLabel: formatLabel(contact.timezone),
		linkedinUrl: contact.linkedinUrl || '-',
		twitterHandle: contact.twitterHandle || '-',
		marketingOptInLabel: formatBoolean(contact.marketingOptIn),
		newsletterSubscribedLabel: formatBoolean(contact.newsletterSubscribed),
		doNotContactLabel: formatBoolean(contact.doNotContact),
		statusLabel: formatLabel(contact.status),
		birthdayFormatted: contact.birthday || '-',
		assistantName: contact.assistantName || '-',
		assistantPhone: contact.assistantPhone || '-',
		notes: contact.notes || 'No notes available'
	};
};

/**
 * ContactDetailsModal
 *
 * A read-only modal showing contact details with quick connect buttons.
 *
 * @param {object} props
 * @param {object} props.contact - The contact data
 * @param {string} props.clientId - The client ID
 * @param {function} [props.onUpdate] - Callback when contact is updated
 * @param {function} [props.onClose] - Callback when modal closes
 * @returns {object}
 */
export const ContactDetailsModal = (props = { contact: {}, clientId: '', onUpdate: undefined, onClose: undefined }) =>
{
	const contact = props.contact || {};
	const clientId = props.clientId || contact.clientId;
	let modalInstance = null;

	/**
	 * Handle edit action
	 */
	const handleEdit = () =>
	{
		// Close the details modal
		if (modalInstance)
		{
			modalInstance.destroy();
		}

		// Open the edit modal
		ContactModal({
			item: contact,
			clientId,
			onSubmit: (data) =>
			{
				if (props.onUpdate)
				{
					props.onUpdate(data);
				}
			}
		});
	};

	/**
	 * Handle delete action
	 */
	const handleDelete = () =>
	{
		if (!modalInstance) return;

		// Use fetch to delete the contact
		fetch(`/api/client/${clientId}/contact/${contact.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(res => res.json())
		.then((response) =>
		{
			if (!response || response.success === false)
			{
				app.notify({
					type: "destructive",
					title: "Error",
					description: "An error occurred while deleting the contact.",
					icon: Icons.shield
				});
				return;
			}

			modalInstance.destroy();

			app.notify({
				type: "success",
				title: "Contact Deleted",
				description: "The contact has been deleted.",
				icon: Icons.check
			});

			if (props.onUpdate)
			{
				props.onUpdate(null);
			}
		})
		.catch(() =>
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: "An error occurred while deleting the contact.",
				icon: Icons.shield
			});
		});
	};

	modalInstance = new Modal({
		title: formatContactData(contact).displayName,
		icon: Icons.user.default,
		description: formatContactData(contact).contactTypeLabel,
		size: 'md',
		type: 'right',
		hidePrimaryButton: true,

		/**
		 * This will setup the data for the modal.
		 *
		 * @returns {Data}
		 */
		setData()
		{
			return new Data(formatContactData(contact));
		},

		/**
		 * Header options for the modal.
		 */
		headerOptions: () => HeaderOptions(handleEdit, handleDelete),

		/**
		 * This will close the modal.
		 *
		 * @returns {void}
		 */
		onClose: (parent) =>
		{
			if (props.onClose)
			{
				props.onClose(parent);
			}
		}
	},
	[
		// Quick connect buttons
		QuickConnectButtons(),

		DetailBody([
			// Contact Information Section
			ContactInformation(),

			// Role & Type Section
			RoleTypeSection(),

			// Preferences Section
			PreferencesSection(),

			// Social Media Section
			SocialMediaSection(),

			// Communication Preferences Section
			CommunicationPreferencesSection(),

			// Status & Personal Info Section
			StatusPersonalSection(),

			// Notes Section
			NotesSection()
		])
	]).open();

	return modalInstance;
};
