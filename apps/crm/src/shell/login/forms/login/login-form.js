import { Div, OnState, Span } from '@base-framework/atoms';
import { Button, Input, LoadingButton } from '@base-framework/ui/atoms';
import { Form } from '@base-framework/ui/molecules';
import { GoogleModel } from '../../../models/google-model.js';
import { STEPS } from '../../steps.js';
import { SignInButton } from './sign-in-button.js';
import { submit } from './submit.js';

/**
 * This will create a sign up link.
 * @returns {object}
 */
const SignUpLink = () => ([
	Div({ class: '' }, [
		Span({ class: 'text-sm text-muted-foreground mt-8 mb-0' }, 'Forgot your password? '),
		Span({ class: 'text-sm font-medium text-primary underline cursor-pointer', click: (e, parent) => parent.showStep(STEPS.FORGOT_PASSWORD) }, 'Reset it'),
	]),
	// Div({ class: '' }, [
	// 	Span({ class: 'text-sm text-muted-foreground mt-8 mb-0' }, 'Don\'t have an account? '),
	// 	Span({ class: 'text-sm font-medium text-primary underline' }, 'Sign up'),
	// ])
]);

/**
 * This will create the credentials container.
 *
 * @returns {object}
 */
const CredentialsContainer = () => (
	Div({ class: 'grid gap-4' }, [
		Div({ class: 'grid gap-4' }, [
			Input({
				type: 'text',
				placeholder: 'Username',
				required: true,
				bind: "username",
				'aria-required': true
			}),
		]),
		Div({ class: 'grid gap-4' }, [
			Input({
				type: 'password',
				placeholder: 'Password',
				required: true,
				bind: 'password',
				pattern: '^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*\\W).{12,}$',
				title: 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.',
				'aria-required': true
			}),
		])
	])
);

/**
 * This will create the sign in with google button.
 *
 * @returns {object}
 */
const SignInWIthGoogleButton = () => (
	Div({ class: 'grid gap-4' }, [
		OnState('googleLoading', (state) => (state)
			? LoadingButton({ disabled: true })
			: Button({
				variant: 'outline',
				'aria-label': 'Sign in with Google',
				click: (e, parent) =>
				{
					parent.state.googleLoading = true;
					const model = new GoogleModel();
					model.xhr.login('', (response) =>
					{
						parent.state.googleLoading = false;
						if (response && response.url)
						{
							window.location.href = response.url;
						}
					});
				}
			}, 'Google')
		)
	])
);

/**
 * This will create the login form.
 *
 * @returns {object}
 */
export const LoginForm = () => (
	Form({ class: 'flex flex-col p-6 pt-0', submit, role: 'form' }, [
		Div({ class: 'grid gap-4' }, [
			CredentialsContainer(),
			SignInButton(),

			// Divider for "OR SIGN IN WITH"
			Div({ class: "relative py-4" }, [
				Div({ class: "absolute inset-0 flex items-center" }, [
					Span({ class: "grow border-t" })
				]),
				Div({ class: 'relative flex justify-center text-xs uppercase' }, [
					Span({ class: 'bg-card px-2 text-muted-foreground' }, "or sign in with")
				]),
			]),
			SignInWIthGoogleButton(),
			SignUpLink(),
		]),
	])
);