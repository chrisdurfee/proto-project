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
				bind: 'companyName',
                required: true
			})
		]),
		new FormField({ name: "clientType", label: "Client Type", description: "Type of client." }, [
			Select({
				bind: 'clientType',
				options: [
					{ label: 'Individual', value: 'individual' },
					{ label: 'Business', value: 'business' },
					{ label: 'Enterprise', value: 'enterprise' }
				],
                required: true
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
			Select({
				bind: 'industry',
				options: [
					{ label: 'Technology', value: 'technology' },
					{ label: 'Healthcare', value: 'healthcare' },
					{ label: 'Finance', value: 'finance' },
					{ label: 'Manufacturing', value: 'manufacturing' },
					{ label: 'Retail', value: 'retail' },
					{ label: 'Real Estate', value: 'real_estate' },
					{ label: 'Education', value: 'education' },
					{ label: 'Construction', value: 'construction' },
					{ label: 'Hospitality', value: 'hospitality' },
					{ label: 'Transportation', value: 'transportation' },
					{ label: 'Professional Services', value: 'professional_services' },
					{ label: 'Media & Entertainment', value: 'media_entertainment' },
					{ label: 'Agriculture', value: 'agriculture' },
					{ label: 'Energy', value: 'energy' },
					{ label: 'Telecommunications', value: 'telecommunications' },
					{ label: 'Insurance', value: 'insurance' },
					{ label: 'Legal', value: 'legal' },
					{ label: 'Non-Profit', value: 'non_profit' },
					{ label: 'Government', value: 'government' },
					{ label: 'Other', value: 'other' }
				]
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
				bind: 'street1',
                required: true
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
				bind: 'city',
                required: true
			})
		]),
		new FormField({ name: "state", label: "State/Province", description: "State or province." }, [
			Select({
				bind: 'state',
				required: true,
				options: [
					{ value: "AL", label: "Alabama" },
					{ value: "AK", label: "Alaska" },
					{ value: "AZ", label: "Arizona" },
					{ value: "AR", label: "Arkansas" },
					{ value: "CA", label: "California" },
					{ value: "CO", label: "Colorado" },
					{ value: "CT", label: "Connecticut" },
					{ value: "DE", label: "Delaware" },
					{ value: "FL", label: "Florida" },
					{ value: "GA", label: "Georgia" },
					{ value: "HI", label: "Hawaii" },
					{ value: "ID", label: "Idaho" },
					{ value: "IL", label: "Illinois" },
					{ value: "IN", label: "Indiana" },
					{ value: "IA", label: "Iowa" },
					{ value: "KS", label: "Kansas" },
					{ value: "KY", label: "Kentucky" },
					{ value: "LA", label: "Louisiana" },
					{ value: "ME", label: "Maine" },
					{ value: "MD", label: "Maryland" },
					{ value: "MA", label: "Massachusetts" },
					{ value: "MI", label: "Michigan" },
					{ value: "MN", label: "Minnesota" },
					{ value: "MS", label: "Mississippi" },
					{ value: "MO", label: "Missouri" },
					{ value: "MT", label: "Montana" },
					{ value: "NE", label: "Nebraska" },
					{ value: "NV", label: "Nevada" },
					{ value: "NH", label: "New Hampshire" },
					{ value: "NJ", label: "New Jersey" },
					{ value: "NM", label: "New Mexico" },
					{ value: "NY", label: "New York" },
					{ value: "NC", label: "North Carolina" },
					{ value: "ND", label: "North Dakota" },
					{ value: "OH", label: "Ohio" },
					{ value: "OK", label: "Oklahoma" },
					{ value: "OR", label: "Oregon" },
					{ value: "PA", label: "Pennsylvania" },
					{ value: "RI", label: "Rhode Island" },
					{ value: "SC", label: "South Carolina" },
					{ value: "SD", label: "South Dakota" },
					{ value: "TN", label: "Tennessee" },
					{ value: "TX", label: "Texas" },
					{ value: "UT", label: "Utah" },
					{ value: "VT", label: "Vermont" },
					{ value: "VA", label: "Virginia" },
					{ value: "WA", label: "Washington" },
					{ value: "WV", label: "West Virginia" },
					{ value: "WI", label: "Wisconsin" },
					{ value: "WY", label: "Wyoming" }
				]
			})
		]),
		new FormField({ name: "postalCode", label: "Postal Code", description: "Zip or postal code." }, [
			Input({
				type: "text",
				placeholder: "10001",
				bind: 'postalCode',
                required: true
			})
		]),
		new FormField({ name: "country", label: "Country", description: "Country name." }, [
			Select({
				bind: 'country',
				options: [
					{ value: "US", label: "United States" },
					{ value: "CA", label: "Canada" },
					{ value: "GB", label: "United Kingdom" },
					{ value: "AU", label: "Australia" },
					{ value: "DE", label: "Germany" },
					{ value: "FR", label: "France" },
					{ value: "IT", label: "Italy" },
					{ value: "ES", label: "Spain" },
					{ value: "NL", label: "Netherlands" },
					{ value: "BE", label: "Belgium" },
					{ value: "CH", label: "Switzerland" },
					{ value: "AT", label: "Austria" },
					{ value: "SE", label: "Sweden" },
					{ value: "NO", label: "Norway" },
					{ value: "DK", label: "Denmark" },
					{ value: "FI", label: "Finland" },
					{ value: "IE", label: "Ireland" },
					{ value: "PT", label: "Portugal" },
					{ value: "PL", label: "Poland" },
					{ value: "CZ", label: "Czech Republic" },
					{ value: "JP", label: "Japan" },
					{ value: "CN", label: "China" },
					{ value: "IN", label: "India" },
					{ value: "BR", label: "Brazil" },
					{ value: "MX", label: "Mexico" },
					{ value: "AR", label: "Argentina" },
					{ value: "ZA", label: "South Africa" },
					{ value: "NZ", label: "New Zealand" },
					{ value: "SG", label: "Singapore" },
					{ value: "KR", label: "South Korea" }
				]
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
			Select({
				bind: 'leadSource',
				options: [
					{ label: 'Website', value: 'website' },
					{ label: 'Referral', value: 'referral' },
					{ label: 'Cold Call', value: 'cold_call' },
					{ label: 'Email Campaign', value: 'email_campaign' },
					{ label: 'Social Media', value: 'social_media' },
					{ label: 'Trade Show', value: 'trade_show' },
					{ label: 'Partner', value: 'partner' },
					{ label: 'Advertisement', value: 'advertisement' },
					{ label: 'Word of Mouth', value: 'word_of_mouth' },
					{ label: 'Direct Mail', value: 'direct_mail' },
					{ label: 'Other', value: 'other' }
				]
			})
		]),
		new FormField({ name: "rating", label: "Rating", description: "Client rating (hot, warm, cold)." }, [
			Select({
				bind: 'rating',
				options: [
					{ label: 'Hot', value: 'hot' },
					{ label: 'Warm', value: 'warm' },
					{ label: 'Cold', value: 'cold' }
				]
			})
		])
	]),

	Fieldset({ legend: "Financial Information" }, [
		new FormField({ name: "currency", label: "Currency", description: "Preferred currency." }, [
			Select({
				bind: 'currency',
				options: [
					{ value: "usd", label: "US Dollar" },
					{ value: "cad", label: "Canadian Dollar" },
					{ value: "chf", label: "Swiss Franc" },
					{ value: "cny", label: "Chinese Yuan" },
					{ value: "rub", label: "Russian Ruble" },
					{ value: "brl", label: "Brazilian Real" },
					{ value: "eur", label: "Euro" },
					{ value: "gbp", label: "British Pound" },
					{ value: "inr", label: "Indian Rupee" },
					{ value: "jpy", label: "Japanese Yen" },
					{ value: "aud", label: "Australian Dollar" }
				]
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
