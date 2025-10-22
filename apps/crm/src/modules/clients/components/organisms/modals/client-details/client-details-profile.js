import { Div, P } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { ColumnRow, DetailBody, DetailSection } from "@base-framework/ui/molecules";
import { Format } from "@base-framework/ui/utils";

/**
 * Company Information Section
 *
 * @param {object} client
 * @returns {object}
 */
const CompanyInformation = (client) =>
	DetailSection({ title: 'Company Information' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			ColumnRow('Name', Format.default('[[client.companyName]]', '-')),
			ColumnRow('Type', Format.default('[[client.clientType]]', '-')),
			ColumnRow('Number', Format.default('[[client.clientNumber]]', '-')),
			ColumnRow('Website', Format.default('[[client.website]]', '-')),
			ColumnRow('Industry', Format.default('[[client.industry]]', '-'))
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
			ColumnRow('Email', Format.default('[[client.email]]', '-')),
			ColumnRow('Phone', Format.phone('[[client.phone]]', '-')),
			ColumnRow('Mobile', Format.phone('[[client.mobile]]', '-')),
			ColumnRow('Fax', Format.phone('[[client.fax]]', '-'))
		])
	]);

/**
 * Address Information Section
 *
 * @param {object} client
 * @returns {object}
 */
const AddressInformation = (client) =>
	DetailSection({ title: 'Address' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			ColumnRow('Street 1', Format.default('[[client.street1]]', '-')),
			ColumnRow('Street 2', Format.default('[[client.street2]]', '-')),
			ColumnRow('City', Format.default('[[client.city]]', '-')),
			ColumnRow('State', Format.default('[[client.state]]', '-')),
			ColumnRow('Postal Code', Format.default('[[client.postalCode]]', '-')),
			ColumnRow('Country', Format.default('[[client.country]]', '-'))
		])
	]);

/**
 * Business Details Section
 *
 * @param {object} client
 * @returns {object}
 */
const BusinessDetails = (client) =>
	DetailSection({ title: 'Business Details' }, [
		Div({ class: 'flex flex-col gap-y-3' }, [
			ColumnRow('Tax ID', Format.default('[[client.taxId]]', '-')),
			ColumnRow('Employee Count', Format.default('[[client.employeeCount]]', '-')),
			ColumnRow('Annual Revenue', Format.money('[[client.annualRevenue]]', '$', '-'))
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
			ColumnRow('Status', { watch: ['[[client.status]]', (value) => formatLabel(value)] }),
			ColumnRow('Priority', { watch: ['[[client.priority]]', (value) => formatLabel(value)] }),
			ColumnRow('Lead Source', Format.default('[[client.leadSource]]', '-')),
			ColumnRow('Rating', { watch: ['[[client.rating]]', (value) => formatLabel(value)] })
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
			ColumnRow('Currency', { watch: ['[[client.currency]]', (value) => value ? value.toUpperCase() : '-'] }),
			ColumnRow('Payment Terms', Format.default('[[client.paymentTerms]]', '-')),
			ColumnRow('Credit Limit', Format.money('[[client.creditLimit]]', '$', '-')),
			ColumnRow('Total Revenue', Format.money('[[client.totalRevenue]]', '$', '-'))
		])
	]);

/**
 * Notes Section
 *
 * @param {object} client
 * @returns {object}
 */
const NotesSection = (client) =>
	DetailSection({ title: 'Notes' }, [
		Div({ class: 'flex flex-col gap-y-4' }, [
			Div({ class: 'flex flex-col gap-y-2' }, [
				P({ class: 'text-sm font-medium' }, 'Public Notes'),
				P({ class: 'text-sm text-muted-foreground whitespace-pre-line' },
					Format.default('[[client.notes]]', 'No public notes')
				)
			]),
			Div({ class: 'flex flex-col gap-y-2' }, [
				P({ class: 'text-sm font-medium' }, 'Internal Notes'),
				P({ class: 'text-sm text-muted-foreground whitespace-pre-line' },
				Format.default('[[client.internalNotes]]', 'No internal notes')
				)
			])
		])
	]);

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
	DetailBody([
		CompanyInformation(client),
		ContactInformation(client),
		AddressInformation(client),
		BusinessDetails(client),
		CrmDetails(client),
		FinancialInformation(client),
		NotesSection(client)
	])
);
