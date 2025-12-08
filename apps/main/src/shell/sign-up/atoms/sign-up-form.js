import { Div, Form, H2, Header, OnState, P, Span } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { Button, Icon, Input, LoadingButton } from '@base-framework/ui/atoms';
import { Icons } from "@base-framework/ui/icons";
import { GoogleModel } from '@shell/models/google-model';
import { STEPS } from '../steps.js';

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
            Input({
                type: 'email',
                placeholder: 'name@example.com',
                required: true,
                'aria-required': true
            })
        ])
    ])
));

/**
 * @function SignUpButton
 * @description
 *  Primary button to submit the form and sign up.
 *
 * @returns {object} A Div containing the submit button.
 */
const SignUpButton = Atom(() =>
(
	OnState('loading', (state) => (state)
		? LoadingButton({ disabled: true })
		: Div({ class: 'grid gap-4' }, [
			Button({ type: 'submit' }, 'Sign Up')
		])
	)
));

/**
 * @function SignUpWithGoogleButton
 * @description
 *  A secondary button to sign up with Google OAuth.
 *
 * @returns {object} A Div containing the "Sign up with Google" button.
 */
const SignUpWithGoogleButton = Atom(() =>
(
	OnState('googleLoading', (state) => (state)
		? LoadingButton({ disabled: true })
		: Button({
			variant: 'outline',
			class: "gap-2 w-full",
			"aria-label": "Sign in with Google",
			click: (e, parent) =>
			{
				parent.state.googleLoading = true;

				const model = new GoogleModel();
				model.xhr.signup('', (response) =>
				{
					parent.state.googleLoading = false;

					if (!response || response.success !== true)
					{
						app.notify({
							type: "destructive",
							title: "Error",
							description: response?.message || "Failed to sign up with Google.",
							icon: Icons.warning
						});
						return;
					}

					window.location.href = response.url;
				});
			}
		}, [
			Icon(Icons.companies.google || ''),
			Span("Google")
		])
	)
));

/**
 * This will create the card header.
 *
 * @param {object} props
 * @returns {object}
 */
export const CardHeader = ({ title, description }) => (
	Header({ class: 'text-center py-6 flex flex-auto flex-col gap-y-1' }, [
		H2({ class: "font-semibold tracking-tight text-2xl" }, title),
		P({ class: "text-sm text-muted-foreground" }, description)
	])
);

/**
 * This will create a form wrapper.
 *
 * @param {object} props
 * @param {array} children
 * @returns {object}
 */
const FormWrapper = Atom((props, children) => (
	Div({ class: 'w-full mx-auto max-w-sm p-6' }, children)
));

/**
 * @function SignUpForm
 * @description
 *  The main form for collecting user credentials. Mimics the login form structure.
 *
 * @returns {object} A Form containing the fields and buttons.
 */
export const SignUpForm = Atom(() =>
(
	FormWrapper([
		CardHeader({ title: "Create an account", description: "Enter your email below to create your account" }),
		Form({
			class: 'flex flex-col',
			role: 'form',
			submit: (e, parent) =>
			{
				e.preventDefault();

				const model = new GoogleModel();
				model.xhr.signUp('', (response) =>
				{
					if (!response || response.success !== true)
					{
						app.noftify({

						});
						return;
					}

					parent.showStep(STEPS.USER_DETAILS);
				});
			}
		}, [
			Div({ class: 'grid gap-4' }, [
				CredentialsContainer(),
				SignUpButton(),

				// Divider for "OR CONTINUE WITH"
				Div({ class: "relative" }, [
					Div({ class: "absolute inset-0 flex items-center" }, [
						Span({ class: "grow border-t" })
					]),
					Div({ class: 'relative flex justify-center text-xs uppercase py-4' }, [
						Span({ class: 'bg-background px-2 text-muted-foreground' }, "or continue with")
					]),
				]),

				SignUpWithGoogleButton(),
			])
		])
	])
));