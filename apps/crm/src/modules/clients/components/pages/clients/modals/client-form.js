import { Fieldset, Input, Select, Textarea } from "@base-framework/ui/atoms";
import { FormField } from "@base-framework/ui/molecules";

/**
 * ClientForm
 *
 * Renders a form for creating or editing a client.
 *
 * @param {object} props
 * @param {boolean} props.isEditing - Whether the form is in edit mode
 * @param {object} props.client - The client data
 * @returns {Array}
 */
export const ClientForm = ({ isEditing = false, client }) => [
	Fieldset({ legend: "Company Information" }, [
		new FormField({ name: "companyName", label: "Company Name", description: "The name of the company." }, [
			Input({
				type: "text",
				placeholder: "Acme Corporation",
				bind: 'companyName'
			})
		]),
		new FormField({ name: "clientType", label: "Client Type", description: "Type of client." }, [
			Select({
				bind: 'clientType',
				options: [
					{ label: 'Individual', value: 'individual' },
					{ label: 'Business', value: 'business' },
					{ label: 'Enterprise', value: 'enterprise' }
				]
			})
		]),
		new FormField({ name: "clientNumber", label: "Client Number", description: "Unique client reference number." }, [
			Input({
				type: "text",
				placeholder: "CLT-001",
				bind: 'clientNumber'
			})
		]),
		new FormField({ name: "website", label: "Website", description: "Company website URL." }, [
			Input({
				type: "url",
				placeholder: "https://example.com",
				bind: 'website'
			})
		])
	]),

	Fieldset({ legend: "Business Details" }, [
		new FormField({ name: "industry", label: "Industry", description: "The industry of the client." }, [
			Input({
				type: "text",
				placeholder: "Technology",
				bind: 'industry'
			})
		]),
		new FormField({ name: "taxId", label: "Tax ID", description: "Tax identification number." }, [
			Input({
				type: "text",
				placeholder: "12-3456789",
				bind: 'taxId'
			})
		]),
		new FormField({ name: "employeeCount", label: "Employee Count", description: "Number of employees." }, [
			Input({
				type: "number",
				placeholder: "100",
				bind: 'employeeCount'
			})
		]),
		new FormField({ name: "annualRevenue", label: "Annual Revenue", description: "Estimated annual revenue." }, [
			Input({
				type: "number",
				step: "0.01",
				placeholder: "1000000.00",
				bind: 'annualRevenue'
			})
		])
	]),

	Fieldset({ legend: "Primary Address" }, [
		new FormField({ name: "street1", label: "Street Address", description: "Primary street address." }, [
			Input({
				type: "text",
				placeholder: "123 Main St",
				bind: 'street1'
			})
		]),
		new FormField({ name: "street2", label: "Street Address 2", description: "Additional address info." }, [
			Input({
				type: "text",
				placeholder: "Suite 100",
				bind: 'street2'
			})
		]),
		new FormField({ name: "city", label: "City", description: "City name." }, [
			Input({
				type: "text",
				placeholder: "New York",
				bind: 'city'
			})
		]),
		new FormField({ name: "state", label: "State/Province", description: "State or province." }, [
			Input({
				type: "text",
				placeholder: "NY",
				bind: 'state'
			})
		]),
		new FormField({ name: "postalCode", label: "Postal Code", description: "Zip or postal code." }, [
			Input({
				type: "text",
				placeholder: "10001",
				bind: 'postalCode'
			})
		]),
		new FormField({ name: "country", label: "Country", description: "Country name." }, [
			Input({
				type: "text",
				placeholder: "United States",
				bind: 'country'
			})
		])
	]),

	Fieldset({ legend: "CRM Details" }, [
		new FormField({ name: "status", label: "Status", description: "Current client status." }, [
			Select({
				bind: 'status',
				options: [
					{ label: 'Active', value: 'active' },
					{ label: 'Inactive', value: 'inactive' },
					{ label: 'Prospect', value: 'prospect' },
					{ label: 'Lead', value: 'lead' },
					{ label: 'Customer', value: 'customer' },
					{ label: 'Former', value: 'former' }
				]
			})
		]),
		new FormField({ name: "priority", label: "Priority", description: "Priority level." }, [
			Select({
				bind: 'priority',
				options: [
					{ label: 'Low', value: 'low' },
					{ label: 'Medium', value: 'medium' },
					{ label: 'High', value: 'high' },
					{ label: 'Critical', value: 'critical' }
				]
			})
		]),
		new FormField({ name: "leadSource", label: "Lead Source", description: "How did you acquire this client?" }, [
			Input({
				type: "text",
				placeholder: "Website, Referral, Cold Call, etc.",
				bind: 'leadSource'
			})
		]),
		new FormField({ name: "rating", label: "Rating", description: "Client rating (hot, warm, cold)." }, [
			Input({
				type: "text",
				placeholder: "hot",
				bind: 'rating'
			})
		])
	]),

	Fieldset({ legend: "Financial Information" }, [
		new FormField({ name: "currency", label: "Currency", description: "Preferred currency." }, [
			Input({
				type: "text",
				placeholder: "USD",
				bind: 'currency',
				maxlength: 3
			})
		]),
		new FormField({ name: "paymentTerms", label: "Payment Terms", description: "Payment terms (e.g., net30)." }, [
			Input({
				type: "text",
				placeholder: "net30",
				bind: 'paymentTerms'
			})
		]),
		new FormField({ name: "creditLimit", label: "Credit Limit", description: "Credit limit amount." }, [
			Input({
				type: "number",
				step: "0.01",
				placeholder: "50000.00",
				bind: 'creditLimit'
			})
		])
	]),

	Fieldset({ legend: "Notes" }, [
		new FormField({ name: "notes", label: "Public Notes", description: "Notes visible to the client." }, [
			Textarea({
				placeholder: "Add any public notes here...",
				bind: 'notes',
				rows: 3
			})
		]),
		new FormField({ name: "internalNotes", label: "Internal Notes", description: "Private notes for internal use only." }, [
			Textarea({
				placeholder: "Add any internal notes here...",
				bind: 'internalNotes',
				rows: 3
			})
		])
	])
];
