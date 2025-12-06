import { Form, OnState } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { DatePicker, FormField } from '@base-framework/ui';
import { Button, Fieldset, Input, LoadingButton } from "@base-framework/ui/atoms";
import { Icons } from '@base-framework/ui/icons';
import { AuthModel } from '../../models/auth-model.js';
import { GoogleModel } from '../../models/google-model.js';
import { STEPS } from '../steps.js';

/**
 * This will create the notification.
 *
 * @param {string} title - The notification title.
 * @param {string} description - The notification description.
 * @param {string} icon - The notification icon.
 * @param {string} type - The notification type.
 * @returns {void}
 */
const notify = (title, description, icon, type) => (
	app.notify({
		title,
		description: description ?? 'Something went wrong. Please try again later.',
		icon,
		type
	})
);

/**
 * This will handle the form submission.
 *
 * @param {object} e - The event object.
 * @param {object} parent - The parent component.
 * @returns {void}
 */
const submit = (e, parent) =>
{
	e.preventDefault();
	parent.state.loading = true;

	const model = new AuthModel({
		user: {
			email: parent.state.email,
			firstName: parent.state.fullname?.split(' ')[0] ?? '',
			lastName: parent.state.fullname?.split(' ').slice(1).join(' ') ?? '',
			username: parent.state.email,
			password: parent.state.password,
			dob: parent.state.birthday
		}
	});

	model.xhr.register((response) =>
	{
		parent.state.loading = false;

		if (response && response.allowAccess)
		{
			app.signIn(response.user);
			parent.showStep(STEPS.CONGRATULATIONS);
			return;
		}

		notify(
			'Error!',
			response.message ?? 'Registration failed.',
			Icons.warning,
			'destructive'
		);
	});
};

/**
 * This will handle the Google signup.
 *
 * @returns {void}
 */
const googleSignup = () =>
{
	const model = new GoogleModel();
	model.xhr.signup((response) =>
	{
		if (response && response.url)
		{
			window.location.href = response.url;
		}
	});
};

/**
 * @function UserDetailsForm
 * @description
 *  Renders a simple form to collect user details.
 *
 * @returns {object} A Div component containing the user details form.
 */
export const UserDetailsForm = Atom(() =>
(
	Form({
			class: 'flex flex-col gap-4',
			submit
		}, [
		Fieldset({ legend: 'Profile', class: 'flex flex-col gap-4' }, [
			new FormField({
				name: "email",
				label: "Email",
				description: "We'll never share your email with anyone else."
			}, [
				Input({ type: "email", placeholder: "name@example.com", required: true, bind: 'email' })
			]),

			new FormField({
				name: "fullname",
				label: "Full Name",
				description: "This is your public display name."
			}, [
				Input({ placeholder: "e.g. Jane Doe", required: true, bind: 'fullname' })
			]),

			new FormField({
				name: "birthday",
				label: "Birthday",
				description: "Please enter your date of birth."
			}, [
				new DatePicker({ required: true, bind: 'birthday' })
			]),

			new FormField({
				name: "password",
				label: "Password",
				description: "Keep it secret, keep it safe."
			}, [
				Input({
					type: "password",
					placeholder: "********",
					required: true,
					bind: 'password',
					pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{12,}$',
					title: 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.'
				})
			]),

			OnState('loading', (loading) => (loading)
				? LoadingButton({ class: 'w-full', disabled: true }, "Creating Account...")
				: Button({ type: "submit", class: 'w-full' }, "Create Account")
			),

			Button({
				type: "button",
				variant: 'outline',
				class: 'w-full',
				click: googleSignup
			}, "Sign up with Google")
		])
	])
));