import { Div, H1, P } from '@base-framework/atoms';
import { Atom } from '@base-framework/base';
import { Icons } from '@base-framework/ui/icons';
import { GoogleModel } from './models/google-model.js';

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
			Div({ class: 'text-destructive' }, Icons.warning),
			H1({ class: 'text-xl font-semibold text-destructive' }, 'Authentication Failed'),
			P({ class: 'text-muted-foreground' }, message),
			Div({
				class: 'mt-4',
				tag: 'a',
				href: '/',
				class: 'text-primary hover:underline'
			}, 'Return to Login')
		])
	])
);

/**
 * GoogleCallback
 *
 * This component handles the Google OAuth callback.
 *
 * @type {typeof Atom}
 */
export const GoogleCallback = Atom({
	/**
	 * This will handle the component creation.
	 *
	 * @returns {void}
	 */
	onCreated()
	{
		const params = new URLSearchParams(window.location.search);
		const code = params.get('code');

		if (!code)
		{
			this.setState({ error: 'No authentication code received.' });
			return;
		}

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
		const model = new GoogleModel();
		// We need to pass the code to the backend
		// The backend expects 'code' in the body
		model.set({ code });

		model.xhr.callback((response) =>
		{
			if (response && response.allowAccess)
			{
				app.signIn(response.user);
				// Redirect to home/dashboard
				app.navigate('/');
				return;
			}

			this.setState({
				error: response.message || 'Failed to authenticate with Google.'
			});
		});
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		if (this.state.error)
		{
			return ErrorScreen(this.state.error);
		}

		return LoadingScreen();
	}
});

export default GoogleCallback;
