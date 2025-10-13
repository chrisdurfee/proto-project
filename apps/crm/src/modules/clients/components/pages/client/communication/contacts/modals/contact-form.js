import { Fieldset, Input, Select, Textarea } from "@base-framework/ui/atoms";
import { FormField } from "@base-framework/ui/molecules";

/**
 * ContactForm
 *
 * Renders a form for creating or editing a client contact.
 *
 * @param {object} props
 * @param {boolean} props.isEditing - Whether the form is in edit mode
 * @param {object} props.contact - The contact data
 * @returns {Array}
 */
export const ContactForm = ({ isEditing = false, contact }) => [
	Fieldset({ legend: "Contact Information" }, [
		new FormField({ name: "firstName", label: "First Name", description: "Contact's first name.", required: true }, [
			Input({
				type: "text",
				placeholder: "John",
				bind: 'firstName',
				required: true
			})
		]),
		new FormField({ name: "lastName", label: "Last Name", description: "Contact's last name.", required: true }, [
			Input({
				type: "text",
				placeholder: "Doe",
				bind: 'lastName',
				required: true
			})
		]),
		new FormField({ name: "email", label: "Email", description: "Contact's email address.", required: true }, [
			Input({
				type: "email",
				placeholder: "john.doe@example.com",
				bind: 'email',
				required: true
			})
		]),
		new FormField({ name: "phone", label: "Phone", description: "Primary phone number." }, [
			Input({
				type: "tel",
				placeholder: "+1 (555) 123-4567",
				bind: 'phone'
			})
		]),
		new FormField({ name: "mobile", label: "Mobile", description: "Mobile phone number." }, [
			Input({
				type: "tel",
				placeholder: "+1 (555) 987-6543",
				bind: 'mobile'
			})
		]),
		new FormField({ name: "fax", label: "Fax", description: "Fax number." }, [
			Input({
				type: "tel",
				placeholder: "+1 (555) 111-2222",
				bind: 'fax'
			})
		])
	]),

	Fieldset({ legend: "Role & Type" }, [
		new FormField({ name: "contactType", label: "Contact Type", description: "Type of contact.", required: true }, [
			Select({
				bind: 'contactType',
				options: [
					{ label: 'Primary', value: 'primary' },
					{ label: 'Billing', value: 'billing' },
					{ label: 'Technical', value: 'technical' },
					{ label: 'Decision Maker', value: 'decision_maker' },
					{ label: 'Influencer', value: 'influencer' },
					{ label: 'Other', value: 'other' }
				]
			})
		]),
		new FormField({ name: "isPrimary", label: "Primary Contact", description: "Is this the primary contact for the client?" }, [
			Select({
				bind: 'isPrimary',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		]),
		new FormField({ name: "jobTitle", label: "Job Title", description: "Contact's job title." }, [
			Input({
				type: "text",
				placeholder: "Sales Manager",
				bind: 'jobTitle'
			})
		]),
		new FormField({ name: "department", label: "Department", description: "Department name." }, [
			Input({
				type: "text",
				placeholder: "Sales",
				bind: 'department'
			})
		])
	]),

	Fieldset({ legend: "Preferences" }, [
		new FormField({ name: "preferredContactMethod", label: "Preferred Contact Method", description: "How to best reach this contact." }, [
			Select({
				bind: 'preferredContactMethod',
				options: [
					{ label: 'Email', value: 'email' },
					{ label: 'Phone', value: 'phone' },
					{ label: 'SMS', value: 'sms' },
					{ label: 'Fax', value: 'fax' },
					{ label: 'Mail', value: 'mail' }
				]
			})
		]),
		new FormField({ name: "language", label: "Language", description: "Preferred language." }, [
			Input({
				type: "text",
				placeholder: "en",
				bind: 'language',
				maxlength: 10
			})
		]),
		new FormField({ name: "timezone", label: "Timezone", description: "Contact's timezone." }, [
			Input({
				type: "text",
				placeholder: "America/New_York",
				bind: 'timezone'
			})
		])
	]),

	Fieldset({ legend: "Social Media" }, [
		new FormField({ name: "linkedinUrl", label: "LinkedIn URL", description: "LinkedIn profile URL." }, [
			Input({
				type: "url",
				placeholder: "https://linkedin.com/in/johndoe",
				bind: 'linkedinUrl'
			})
		]),
		new FormField({ name: "twitterHandle", label: "Twitter Handle", description: "Twitter username." }, [
			Input({
				type: "text",
				placeholder: "@johndoe",
				bind: 'twitterHandle'
			})
		])
	]),

	Fieldset({ legend: "Communication Preferences" }, [
		new FormField({ name: "marketingOptIn", label: "Marketing Opt-In", description: "Consent to receive marketing communications." }, [
			Select({
				bind: 'marketingOptIn',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		]),
		new FormField({ name: "newsletterSubscribed", label: "Newsletter Subscribed", description: "Subscribed to newsletter." }, [
			Select({
				bind: 'newsletterSubscribed',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		]),
		new FormField({ name: "doNotContact", label: "Do Not Contact", description: "Flag to prevent contacting this person." }, [
			Select({
				bind: 'doNotContact',
				options: [
					{ label: 'No', value: 0 },
					{ label: 'Yes', value: 1 }
				]
			})
		])
	]),

	Fieldset({ legend: "Status & Personal Info" }, [
		new FormField({ name: "status", label: "Status", description: "Contact status." }, [
			Select({
				bind: 'status',
				options: [
					{ label: 'Active', value: 'active' },
					{ label: 'Inactive', value: 'inactive' },
					{ label: 'Bounced', value: 'bounced' }
				]
			})
		]),
		new FormField({ name: "birthday", label: "Birthday", description: "Contact's birthday." }, [
			Input({
				type: "date",
				bind: 'birthday'
			})
		]),
		new FormField({ name: "assistantName", label: "Assistant Name", description: "Name of assistant." }, [
			Input({
				type: "text",
				placeholder: "Jane Smith",
				bind: 'assistantName'
			})
		]),
		new FormField({ name: "assistantPhone", label: "Assistant Phone", description: "Assistant's phone number." }, [
			Input({
				type: "tel",
				placeholder: "+1 (555) 222-3333",
				bind: 'assistantPhone'
			})
		])
	]),

	Fieldset({ legend: "Notes" }, [
		new FormField({ name: "notes", label: "Notes", description: "Additional notes about this contact." }, [
			Textarea({
				placeholder: "Add any notes about this contact...",
				bind: 'notes',
				rows: 4
			})
		])
	])
];
