import { Div, Form, OnState } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { Button, HiddenInput, Input, LoadingButton } from '@base-framework/ui/atoms';
import { Icons } from "@base-framework/ui/icons";
import { AuthModel } from '@shell/models/auth-model.js';
import { STEPS } from '../steps.js';
import { CardHeader, FormWrapper } from './form-atoms.js';

/**
 * @function CredentialsContainer
 * @description
 *  Input fields for username and password.
 *
 * @returns {object} A Div containing the input fields.
 */
const CredentialsContainer = Atom(() =>
(
    Div({ class: 'grid gap-4' }, [
        Div({ class: 'grid gap-4' }, [
			HiddenInput({ name: 'username', bind: 'username' }),
            Input({
				type: "password",
				placeholder: "******************",
				required: true,
				bind: 'password',
				pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{12,}$',
				title: 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.'
			})
        ])
    ])
));

/**
 * @function ContinueButton
 * @description
 *  Primary button to submit the form and continue.
 *
 * @returns {object} A Div containing the submit button.
 */
const ContinueButton = Atom(() =>
(
	OnState('loading', (state) => (state)
		? LoadingButton({ disabled: true })
		: Div({ class: 'grid gap-4' }, [
			Button({ type: 'submit' }, 'Continue')
		])
	)
));

/**
 * This will handle the sign-up process.
 *
 * @param {object} parent - The parent component.
 * @returns {void}
 */
const setPassword = (parent) =>
{
	parent.state.loading = true;

	const model = new AuthModel({
		username: parent.context.data.password
	});

	model.xhr.setPassword('', (response) =>
	{
		parent.state.loading = false;
		if (!response || response.success !== true)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: response?.message || "Failed to set password.",
				icon: Icons.warning
			});
			return;
		}

		parent.showStep(STEPS.USER_DETAILS);
	});
};

/**
 * @function PasswordForm
 * @description
 *  Form for user to create an account with email and password.
 *
 * @returns {object} A Form containing the fields and buttons.
 */
export const PasswordForm = Atom(() =>
(
	FormWrapper([
		CardHeader({ title: "Set your password", description: "Enter your password below to secure your account." }),
		Form({
			class: 'flex flex-col',
			role: 'form',
			submit: (e, parent) =>
			{
				e.preventDefault();
				setPassword(parent);
			}
		}, [
			Div({ class: 'grid gap-4' }, [
				CredentialsContainer(),
				ContinueButton()
			])
		])
	])
));