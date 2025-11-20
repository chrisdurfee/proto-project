import { Fieldset, Input, Select } from "@base-framework/ui/atoms";
import { FormField } from "@base-framework/ui/molecules";

/**
 * UserAccountFieldset
 *
 * Renders a form for creating or linking a user account to a contact.
 *
 * @param {object} props
 * @param {boolean} props.isEditing - Whether the form is in edit mode
 * @param {object} props.contact - The contact data
 * @returns {Array}
 */
export const UserAccountFieldset = ({ isEditing = false, contact }) =>
{
	const hasExistingUser = contact?.userId || contact?.user?.id;

	return [
		Fieldset({ legend: "User Account" }, [
			new FormField({
				name: "createUser",
				label: "User Account",
				description: hasExistingUser
					? "This contact has a linked user account."
					: "Create a user account for this contact to enable messaging and platform access."
			}, [
				Select({
					bind: 'createUser',
					disabled: hasExistingUser,
					options: [
						{ label: 'No User Account', value: 0 },
						{ label: 'Create User Account', value: 1 }
					]
				})
			])
		]),

		// Show user fields when creating/editing user account
		Fieldset({
			legend: "User Credentials",
			bind: ['createUser', (val) => val == 1 || hasExistingUser ? {} : { class: 'hidden' }]
		}, [
			new FormField({
				name: "user.username",
				label: "Username",
				description: "Username for login. Will use email if not provided.",
				required: false
			}, [
				Input({
					type: "text",
					placeholder: "username",
					bind: 'user.username'
				})
			]),

			// Only show password field when creating new user
			...(!hasExistingUser ? [
				new FormField({
					name: "user.password",
					label: "Password",
					description: "User password. A random password will be generated if not provided.",
					required: false
				}, [
					Input({
						type: "password",
						placeholder: "Enter password",
						bind: 'user.password',
						autocomplete: "new-password"
					})
				]),

				new FormField({
					name: "user.confirmPassword",
					label: "Confirm Password",
					description: "Re-enter the password to confirm.",
					required: false
				}, [
					Input({
						type: "password",
						placeholder: "Confirm password",
						bind: 'user.confirmPassword',
						autocomplete: "new-password"
					})
				])
			] : []),

			new FormField({
				name: "user.enabled",
				label: "Account Status",
				description: "Enable or disable the user account."
			}, [
				Select({
					bind: 'user.enabled',
					options: [
						{ label: 'Disabled', value: 0 },
						{ label: 'Enabled', value: 1 }
					]
				})
			]),

			new FormField({
				name: "user.status",
				label: "User Status",
				description: "Set the user's online status."
			}, [
				Select({
					bind: 'user.status',
					options: [
						{ value: "online", label: "Online" },
						{ value: "offline", label: "Offline" },
						{ value: "busy", label: "Busy" },
						{ value: "away", label: "Away" }
					]
				})
			])
		])
	];
};
