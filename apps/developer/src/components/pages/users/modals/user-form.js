import { Div } from "@base-framework/atoms";
import { Fieldset, Input, Select, TelInput, Textarea } from "@base-framework/ui/atoms";
import { DatePicker, FormField } from "@base-framework/ui/molecules";
import { UnderlinedButtonTab } from "@base-framework/ui/organisms";
import { AuthFieldset } from "./auth-fieldset.js";
import { UserRoleFieldset } from "./user-role-fieldset.js";

/**
 * This will create a tab content wrapper.
 *
 * @param {object} props
 * @param {object} children
 * @returns {object}
 */
const TabContent = (props, children) => (
    Div({ class: 'py-4', ...props }, children)
);

/**
 * This will create the user fieldset.
 *
 * @param {boolean} isEditing - Whether the user is being edited or not.
 * @returns {object}
 */
const UserFieldset = (isEditing) => (
    Fieldset({ legend: "User Information" }, [

		new FormField(
			{ name: "firstName", label: "First Name", description: "Enter the user's first name." },
			[
				Input({
					type: "text",
					placeholder: "John",
					required: true,
					bind: "firstName"
				})
			]
		),
		new FormField(
			{ name: "lastName", label: "Last Name", description: "Enter the user's last name." },
			[
				Input({
					type: "text",
					placeholder: "Doe",
					required: true,
					bind: "lastName"
				})
			]
		),
		new FormField(
			{ name: "displayName", label: "Display Name", description: "Enter the user's display name." },
			[
				Input({
					placeholder: "e.g. John Doe",
					required: true,
					bind: "displayName"
				})
			]
		),
		new FormField(
			{ name: "dob", label: "Date of Birth", description: "Enter the user's date of birth." },
			[
				new DatePicker({
					bind: "dob",
					required: true
				})
			]
		),
		new FormField(
			{ name: "gender", label: "Gender", description: "Select the user's gender." },
			[
				Select({
					bind: "gender",
					options: [
						{ value: "female", label: "Female" },
						{ value: "male", label: "Male" },
						{ value: "other", label: "Other" },
						{ value: "prefer_not_to_say", label: "Prefer not to say" }
					]
				})
			]
		),
		new FormField(
			{ name: "bio", label: "Bio", description: "Enter the user's bio." },
			[
				Textarea({
					placeholder: "Tell us about yourself...",
					bind: "bio"
				})
			]
		)
	])
);

/**
 * This will create the contact fieldset.
 *
 * @param {boolean} isEditing - Whether the user is being edited or not.
 * @returns {object}
 */
const ContactFieldset = (isEditing) => (
    Fieldset({ legend: "Contact Information" }, [

		new FormField(
			{ name: "email", label: "Email", description: "Enter the user's email address." },
			[
				Input({
					type: "email",
					placeholder: "e.g. john@example.com",
					required: true,
					bind: "email"
				})
			]
		),
		new FormField(
			{ name: "mobile", label: "Mobile", description: "Enter the user's mobile number." },
			[
				TelInput({
					placeholder: "e.g. +1234567890",
					required: false,
					bind: "mobile"
				})
			]
		)
	])
);

/**
 *  This will create the location fieldset.
 *
 *  @param {boolean} isEditing - Whether the user is being edited or not.
 *  @returns {object}
 */
const LocationFieldset = (isEditing) => (
    Fieldset({ legend: "Location Information" }, [

		new FormField(
			{ name: "street_1", label: "Street 1", description: "Enter the user's street address." },
			[
				Input({
					type: "text",
					placeholder: "e.g. 123 Main St",
					bind: "street1"
				})
			]
		),
		new FormField(
			{ name: "street_2", label: "Street 2", description: "Enter the user's street address (optional)." },
			[
				Input({
					type: "text",
					placeholder: "e.g. Apt 4B",
					bind: "street2"
				})
			]
		),
		new FormField(
			{ name: "city", label: "City", description: "Enter the user's city." },
			[
				Input({
					type: "text",
					placeholder: "e.g. New York",
					bind: "city"
				})
			]
		),
		new FormField(
			{ name: "state", label: "State", description: "Enter the user's state." },
			[
				Input({
					type: "text",
					placeholder: "e.g. NY",
					bind: "state"
				})
			]
		),
		new FormField(
			{ name: "postalCode", label: "Postal Code", description: "Enter the user's postal code." },
			[
				Input({
					type: "text",
					placeholder: "e.g. 10001",
					bind: "postalCode"
				})
			]
		),
		new FormField(
			{ name: "timezone", label: "Timezone", description: "Select the user's timezone." },
			[
				Select({
					bind: "timezone",
					options: [
						{ value: "utc", label: "UTC" },
						{ value: "est", label: "Eastern Standard Time" },
						{ value: "pst", label: "Pacific Standard Time" },
						{ value: "cst", label: "Central Standard Time" },
						{ value: "mst", label: "Mountain Standard Time" },
						{ value: "gmt", label: "Greenwich Mean Time" },
						{ value: "cet", label: "Central European Time" },
						{ value: "eet", label: "Eastern European Time" },
						{ value: "ist", label: "Indian Standard Time" },
						{ value: "jst", label: "Japan Standard Time" },
						{ value: "aest", label: "Australian Eastern Standard Time" }
					]
				})
			]
		),
		new FormField(
			{ name: "currency", label: "Currency", description: "Select the user's currency." },
			[
				Select({
					bind: "currency",
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
			]
		),
		new FormField(
			{ name: "country", label: "Country", description: "Select the user's country." },
			[
				Select({
					bind: "country",
					options: [
						{ value: "us", label: "United States" },
						{ value: "ca", label: "Canada" },
						{ value: "mx", label: "Mexico" },
						{ value: "ch", label: "Switzerland" },
						{ value: "cn", label: "China" },
						{ value: "ru", label: "Russia" },
						{ value: "br", label: "Brazil" },
						{ value: "fr", label: "France" },
						{ value: "es", label: "Spain" },
						{ value: "pt", label: "Portugal" },
						{ value: "de", label: "Germany" },
						{ value: "it", label: "Italy" },
						{ value: "nl", label: "Netherlands" },
						{ value: "se", label: "Sweden" },
						{ value: "no", label: "Norway" },
						{ value: "dk", label: "Denmark" },
						{ value: "gb", label: "United Kingdom" },
						{ value: "in", label: "India" },
						{ value: "jp", label: "Japan" },
						{ value: "au", label: "Australia" }
					]
				})
			]
		)
	])
);

/**
 * This will create the access fieldset.
 *
 * @param {boolean} isEditing - Whether the user is being edited or not.
 * @returns {object}
 */
const AccessFieldset = (isEditing) => (
    Fieldset({ legend: "Access Information" }, [

		new FormField(
			{ name: "enable", label: "Enabled", description: "Allow access to the platform." },
			[
				Select({
					bind: "enabled",
					options: [
						{ value: 0, label: "No" },
						{ value: 1, label: "Yes" },
					]
				})
			]
		),
		new FormField(
			{ name: "status", label: "Status", description: "Sets the user's status." },
			[
				Select({
					bind: "status",
					options: [
						{ value: "online", label: "Online" },
						{ value: "offline", label: "Offline" },
						{ value: "busy", label: "Busy" },
						{ value: "away", label: "Away" }
					]
				})
			]
		),
		new FormField(
			{ name: "multiFactorEnabled", label: "Multi-Factor Authentication", description: "Enable multi-factor authentication for this user." },
			[
				Select({
					bind: "multiFactorEnabled",
					options: [
						{ value: "1", label: "Enabled" },
						{ value: "0", label: "Disabled" }
					]
				})
			]
		)
	])
);

/**
 * UserForm
 *
 * Returns an array of form fields for creating or editing a User.
 *
 * @param {object} props - The properties for the form.
 * @returns {Array} - Array of form field components.
 */
export const UserForm = ({ isEditing, user }) =>
{
	// If not editing, return the original form layout
	if (!isEditing)
	{
		return [
			AuthFieldset(),
			UserFieldset(isEditing),
			ContactFieldset(isEditing),
			LocationFieldset(isEditing)
		];
	}

	// If editing, use tabs to organize the form
	return [
		new UnderlinedButtonTab({
			class: 'w-full',
			options: [
				{
					label: 'Profile',
					value: 'profile',
					selected: true,
					component: TabContent([
						UserFieldset(isEditing),
						ContactFieldset(isEditing),
						LocationFieldset(isEditing),
						AccessFieldset(isEditing)
					])
				},
				{
					label: 'Roles',
					value: 'roles',
					component: TabContent([
						new UserRoleFieldset({ user })
					])
				}
			]
		})
	];
};