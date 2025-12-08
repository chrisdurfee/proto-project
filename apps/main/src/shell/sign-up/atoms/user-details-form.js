import { Form, OnState } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { Button, Fieldset, Input, LoadingButton } from "@base-framework/ui/atoms";
import { Icons } from '@base-framework/ui/icons';
import { DatePicker, FormField } from '@base-framework/ui/molecules';
import { AuthModel } from '../../models/auth-model.js';
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

	const data = parent.context.data;
	const model = new AuthModel({
		user: { ...data }
	});

	model.xhr.register((response) =>
	{
		parent.state.loading = false;

		if (response && response.allowAccess)
		{
			app.setUserData(response.user);
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
 * @function UserDetailsForm
 * @description
 *  Renders a simple form to collect user details.
 *
 * @returns {object} A Div component containing the user details form.
 */
export const UserDetailsForm = Atom(() =>
(
	Form({
			onCreated(ele, parent)
			{
				const data = parent.context.data;
				data.xhr.getSessionUser('', (response) =>
				{
					if (response && response.user)
					{
						data.set(response.user);
					}
				});
			},
			class: 'flex flex-col gap-4',
			submit
		}, [
		Fieldset({ legend: 'Profile', class: 'flex flex-col gap-4' }, [
			new FormField({
				name: "firstName",
				label: "First Name",
				description: "This is your given name."
			}, [
				Input({ placeholder: "e.g. Jane", required: true, bind: 'firstName' })
			]),

			new FormField({
				name: "lastName",
				label: "Last Name",
				description: "This is your family name."
			}, [
				Input({ placeholder: "e.g. Doe", required: true, bind: 'lastName' })
			]),

			new FormField({
				name: "displayName",
				label: "Display Name",
				description: "This is your public display name."
			}, [
				Input({ placeholder: "e.g. Jane Doe", required: true, bind: 'displayName' })
			]),

			new FormField({
				name: "birthday",
				label: "Birthday",
				description: "Please enter your date of birth."
			}, [
				new DatePicker({ required: true, bind: 'dob' })
			]),

			new FormField({
				name: "password",
				label: "Password",
				description: "Keep it secret, keep it safe."
			}, [
				Input({
					type: "password",
					placeholder: "******************",
					required: true,
					bind: 'password',
					pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{12,}$',
					title: 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.'
				})
			]),

			OnState('loading', (loading) => (loading)
				? LoadingButton({ class: 'w-full', disabled: true }, "Creating Account...")
				: Button({ type: "submit", class: 'w-full' }, "Create Account")
			)
		])
	])
));