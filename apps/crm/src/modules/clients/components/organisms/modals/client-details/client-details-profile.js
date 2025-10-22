import { Div, H3, P } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { DetailSection, SplitRow } from "@base-framework/ui/molecules";
import { Format } from "@base-framework/ui/utils";

/**
 * Section wrapper component
 *
 * @param {string} title
 * @param {Array} children
 * @returns {object}
 */
const Section = (title, children) =>
	Div({ class: "flex flex-col gap-y-4" }, [
		H3({ class: "text-lg font-semibold" }, title),
		...children
	]);

/**
 * Company Information Section
 *
 * @param {object} client
 * @returns {object}
 */
const CompanyInformation = (client) =>
	DetailSection({ title: 'Company Information' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Company Name', Format.default(client.companyName, '-')),
			SplitRow('Client Type', Format.default(client.clientType, '-')),
			SplitRow('Client Number', Format.default(client.clientNumber, '-')),
			SplitRow('Website', Format.default(client.website, '-')),
			SplitRow('Industry', Format.default(client.industry, '-'))
		])
	]);

/**
 * Contact Information Section
 *
 * @param {object} client
 * @returns {object}
 */
const ContactInformation = (client) =>
	DetailSection({ title: 'Contact Information' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Email', Format.default(client.email, '-')),
			SplitRow('Phone', Format.phone(client.phone, '-')),
			SplitRow('Mobile', Format.phone(client.mobile, '-')),
			SplitRow('Fax', Format.phone(client.fax, '-'))
		])
	]);

/**
 * Address Information Section
 *
 * @param {object} client
 * @returns {object}
 */
const AddressInformation = (client) =>
{
	const addressParts = [];
	if (client.street1) addressParts.push(client.street1);
	if (client.street2) addressParts.push(client.street2);

	const cityStateZip = [];
	if (client.city) cityStateZip.push(client.city);
	if (client.state) cityStateZip.push(client.state);
	if (client.postalCode) cityStateZip.push(client.postalCode);

	if (cityStateZip.length > 0) addressParts.push(cityStateZip.join(', '));
	if (client.country) addressParts.push(client.country);

	const fullAddress = addressParts.length > 0 ? addressParts.join('\n') : '-';

	return DetailSection({ title: 'Address' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Address',
				P({ class: 'text-sm text-muted-foreground whitespace-pre-line' }, fullAddress)
			)
		])
	]);
};

/**
 * Business Details Section
 *
 * @param {object} client
 * @returns {object}
 */
const BusinessDetails = (client) =>
	DetailSection({ title: 'Business Details' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Tax ID', Format.default(client.taxId, '-')),
			SplitRow('Employee Count', Format.default(client.employeeCount, '-')),
			SplitRow('Annual Revenue', client.annualRevenue ?
				Format.money(client.annualRevenue, '$', '0.00') : '-'
			)
		])
	]);

/**
 * CRM Details Section
 *
 * @param {object} client
 * @returns {object}
 */
const CrmDetails = (client) =>
{
	const formatLabel = (value) =>
	{
		if (!value) return '-';
		return value.toString().replace('_', ' ')
			.replace(/\b\w/g, l => l.toUpperCase());
	};

	return DetailSection({ title: 'CRM Details' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Status', formatLabel(client.status)),
			SplitRow('Priority', formatLabel(client.priority)),
			SplitRow('Lead Source', Format.default(client.leadSource, '-')),
			SplitRow('Rating', formatLabel(client.rating))
		])
	]);
};

/**
 * Financial Information Section
 *
 * @param {object} client
 * @returns {object}
 */
const FinancialInformation = (client) =>
	DetailSection({ title: 'Financial Information' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			SplitRow('Currency', client.currency ?
				client.currency.toUpperCase() : '-'
			),
			SplitRow('Payment Terms', Format.default(client.paymentTerms, '-')),
			SplitRow('Credit Limit', client.creditLimit ?
				Format.money(client.creditLimit, '$', '0.00') : '-'
			),
			SplitRow('Total Revenue', client.totalRevenue ?
				Format.money(client.totalRevenue, '$', '0.00') : '-'
			)
		])
	]);

/**
 * Notes Section
 *
 * @param {object} client
 * @returns {object}
 */
const NotesSection = (client) =>
{
	const hasNotes = client.notes || client.internalNotes;

	if (!hasNotes)
	{
		return null;
	}

	return DetailSection({ title: 'Notes' }, [
		Div({ class: 'flex flex-col gap-y-4' }, [
			client.notes && Div({ class: 'flex flex-col gap-y-2' }, [
				P({ class: 'text-sm font-medium' }, 'Public Notes'),
				P({ class: 'text-sm text-muted-foreground whitespace-pre-line' },
					client.notes
				)
			]),
			client.internalNotes && Div({ class: 'flex flex-col gap-y-2' }, [
				P({ class: 'text-sm font-medium' }, 'Internal Notes'),
				P({ class: 'text-sm text-muted-foreground whitespace-pre-line' },
					client.internalNotes
				)
			])
		])
	]);
};

/**
 * ClientDetailsProfile
 *
 * Displays the client's profile information in organized sections.
 *
 * @param {object} props
 * @param {object} props.client - The client data
 * @returns {object}
 */
export const ClientDetailsProfile = Atom(({ client }) =>
	Div({ class: "flex flex-col gap-y-6" }, [
		CompanyInformation(client),
		ContactInformation(client),
		AddressInformation(client),
		BusinessDetails(client),
		CrmDetails(client),
		FinancialInformation(client),
		NotesSection(client)
	])
);
