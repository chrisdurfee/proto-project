import { A, Div, H1, OnState, P } from '@base-framework/atoms';
import { Component, Jot } from '@base-framework/base';
import { Icon } from '@base-framework/ui/atoms';
import { Icons } from '@base-framework/ui/icons';
import { GoogleModel } from './models/google-model.js';
import { STEPS } from './sign-up/steps.js';

/**
 * This will create the loading screen.
 *
 * @returns {object}
 */
const LoadingScreen = () => (
	Div({ class: 'flex flex-auto flex-col justify-center items-center h-screen' }, [
		Div({ class: 'flex flex-col items-center gap-4' }, [
			Div({ class: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary' }),
			H1({ class: 'text-xl font-semibold' }, 'Authenticating with Google...'),
			P({ class: 'text-muted-foreground' }, 'Please wait while we sign you in.')
		])
	])
);

/**
 * This will create the error screen.
 *
 * @param {string} message
 * @returns {object}
 */
const ErrorScreen = (message) => (
	Div({ class: 'flex flex-auto flex-col justify-center items-center h-screen' }, [
		Div({ class: 'flex flex-col items-center gap-4 text-center max-w-md p-6' }, [
			Icon({ class: 'text-destructive', size: '2xl' }, Icons.warning),
			H1({ class: 'text-xl font-semibold text-destructive' }, 'Authentication Failed'),
			P({ class: 'text-muted-foreground' }, message),
			A({
				href: '/',
				class: 'mt-4 text-primary hover:underline'
			}, 'Return to Login')
		])
	])
);

/**
 * GoogleCallback
 *
 * This component handles the Google OAuth callback.
 *
 * @type {typeof Component}
 */
export const GoogleCallback = Jot(
{
	/**
	 * This will handle the component creation.
	 *
	 * @returns {void}
	 */
	before()
	{
		const params = new URLSearchParams(window.location.search);
		const code = params.get('code');
		if (!code)
		{
			// @ts-ignore
			this.state.error = 'No authorization code provided by Google.';
			return;
		}

		// @ts-ignore
		this.exchangeCode(code);
	},

	/**
	 * This will exchange the code for a session.
	 *
	 * @param {string} code
	 * @returns {void}
	 */
	exchangeCode(code)
	{
		const model = new GoogleModel({
			code
		});

		model.xhr.callback('', (response) =>
		{
			if (response && response.allowAccess)
			{
				if (response.isNew)
				{
					app.navigate('/sign-up?step=user_details', null, true);

					// @ts-ignore
					this.parent.showStep(STEPS.USER_DETAILS);
					return;
				}

				app.signIn(response.user);
				// Redirect to home
				app.navigate('/', null, true);
				return;
			}

			// @ts-ignore
			this.state.error = response.message || 'Failed to authenticate with Google.';
		});
	},

	/**
	 * This will define the component state.
	 *
	 * @returns {object}
	 */
	state()
	{
		return {
			error: null
		};
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return OnState('error', (error) =>
		{
			if (error)
			{
				return ErrorScreen(error);
			}

			return LoadingScreen();
		});
	}
});

export default GoogleCallback;
