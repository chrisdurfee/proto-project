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
export const UserAccountFieldset = ({ isEditing = false, contact = {} }) =>
{
	const hasExistingUser = !!(contact?.userId || contact?.username);

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
                        { label: 'Already Linked', value: -1 },
						{ label: 'No User Account', value: 0 },
						{ label: 'Create User Account', value: 1 }
					]
				})
			])
		]),

		// Show user fields when creating/editing user account
		Fieldset({
			legend: "User Credentials",
			onSet: ['createUser', { 'flex': 1}]
		}, [
			new FormField({
				name: "username",
				label: "Username",
				description: "Username for login. Will use email if not provided.",
				required: false
			}, [
				Input({
					type: "text",
					placeholder: "username",
					bind: 'username'
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
				name: "enabled",
				label: "Account Status",
				description: "Enable or disable the user account."
			}, [
				Select({
					bind: 'enabled',
					options: [
						{ label: 'Disabled', value: 0 },
						{ label: 'Enabled', value: 1 }
					]
				})
			])
		])
	];
};
