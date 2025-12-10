import { Div, Form, OnState, Span } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { Button, Icon, Input, LoadingButton } from '@base-framework/ui/atoms';
import { Icons } from "@base-framework/ui/icons";
import { AuthModel } from '@shell/models/auth-model.js';
import { GoogleModel } from '@shell/models/google-model';
import { CardHeader, FormWrapper } from './form-atoms.js';
import { WELCOME_MODES } from './welcome-modes.js';

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
				bind: 'username',
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
 * This will handle the sign-up process.
 *
 * @param {object} parent - The parent component.
 * @returns {void}
 */
const signUp = (parent) =>
{
	parent.state.loading = true;

	const model = new AuthModel({
		username: parent.context.data.username
	});

	model.xhr.register('', (response) =>
	{
		parent.state.loading = false;
		if (!response || response.success !== true)
		{
			app.notify({
				type: "destructive",
				title: "Error",
				description: response?.message || "Failed to sign up.",
				icon: Icons.warning
			});
			return;
		}

		parent.state.mode = WELCOME_MODES.PASSWORD;
	});
};

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
		CardHeader({ title: "Create an account", description: "Enter your email below to create your account." }),
		Form({
			class: 'flex flex-col',
			role: 'form',

			/**
			 * Adds the submit handler to the form.
			 *
			 * @param {Event} e
			 * @param {object} parent
			 */
			submit: (e, parent) =>
			{
				e.preventDefault();
				signUp(parent);
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