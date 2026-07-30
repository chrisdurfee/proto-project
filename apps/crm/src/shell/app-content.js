import { Div } from '@base-framework/atoms';
import { Import } from '@base-framework/base';
import { whenCsrfReady } from '../csrf-token.js';
import { openInstallPrompt } from './installation/install.js';
import { AuthModel } from './models/auth-model.js';

/**
 * This will update the body class based on the sign in state.
 *
 * @param {boolean} isSignedIn
 * @returns {void}
 */
const updateBodyClass = (isSignedIn) =>
{
	const AUTHED_CLASS_NAME = 'authed';
	const hasClass = document.body.classList.contains(AUTHED_CLASS_NAME);

	// if the body does not have the class and the user is authed, add it.
	if (isSignedIn && !hasClass)
	{
		document.body.classList.add(AUTHED_CLASS_NAME);
		return;
	}

	// if the body has the class and the user is not authed, remove it.
	if (!isSignedIn && hasClass)
	{
		document.body.classList.remove(AUTHED_CLASS_NAME);
	}
};

/**
 * This will create the login page.
 *
 * @returns {object}
 */
const LoginPage = () => (
	Import({
		src: () => import('./login/login-page.js')
	})
);

/**
 * This will create the main content page.
 *
 * @returns {object}
 */
const MainContent = () => (
	Import({
		src: () => import('./main-content.js')
	})
);

/**
 * This will resume the user session.
 *
 * MUST wait for the initial CSRF token to be set before firing the
 * `resume` POST — `resume` is CSRF-protected and racing the
 * `GET /api/auth/csrf-token` fetch with a fixed `setTimeout` causes
 * a 403 on slow networks, which the frontend treats as
 * `allowAccess !== true` and signs the user out. Awaiting the token
 * eliminates the race entirely.
 *
 * @returns {void}
 */
const resumeUserSession = () =>
{
	whenCsrfReady().then(() =>
	{
		const model = new AuthModel();
		model.xhr.resume('', (response) =>
		{
			if (!response)
			{
				return;
			}

			if (response.allowAccess === true)
			{
				app.setUserData(response.user);
			}
			else
			{
				app.signOut();
			}
		});
	});
};

/**
 * This will create the app content.
 *
 * @returns {object}
 */
export const AppContent = () => (
	Div({
		class: 'app-content flex flex-auto flex-col',

		/**
		 * This will open the install prompt when the app is created.
		 *
		 * @returns {void}
		 */
		onCreated()
		{
			const WAIT_TIME = 1000;
			window.setTimeout(() => openInstallPrompt(), WAIT_TIME);
		},

		/**
		 * This will add a state to sign in.
		 *
		 * @returns {object}
		 */
		addState()
		{
			/**
			 * Check if the user is signed in by checking
			 * if a user has been restored from storage.
			 */
			const isSignedIn = (app.data.user?.id != null);
			if (isSignedIn)
			{
				resumeUserSession();
			}

			return {
				isSignedIn: isSignedIn
			};
		},

		/**
		 * This will add the app content or the login page. It will also update the body class
		 * based on the sign in state.
		 */
		onState: [
			/**
			 * This will add the login page if the user is not signed in.
			 */
			['isSignedIn', (isSignedIn) => (!isSignedIn)? LoginPage() : MainContent()],

			/**
			 * This will update the body class based on the sign in state.
			 */
			['isSignedIn', updateBodyClass]
		]
	})
);

export default AppContent;