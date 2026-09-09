import { Div } from '@base-framework/atoms';
import { openInstallPrompt } from './installation/install.js';
import { updateBodyClass } from './app-content/body-class.js';
import { LoginPage, MainContent, PublicPage } from './app-content/imports.js';
import { resumeUserSession } from './app-content/resume.js';
import { isOnPublicRoute } from './public-routes.js';

/**
 * Chooses the shell for a signed-out visitor.
 *
 * Legal documents and the Help Center have to be readable without an
 * account, so a signed-out visitor on one of those paths gets the
 * public shell instead of the login gate.
 *
 * @returns {object}
 */
const SignedOutContent = () => (isOnPublicRoute() ? PublicPage() : LoginPage());

/**
 * AppContent
 *
 * Top-level shell — swaps between the lazy LoginPage and
 * MainContent based on `isSignedIn`, mirrors that state
 * onto the `authed` body class, and (when a user was
 * restored from storage) resumes the session over a
 * CSRF-validated `/auth/resume` POST.
 *
 * Implementation split:
 *   - app-content/body-class.js — updateBodyClass
 *                                  (`authed` class toggling)
 *   - app-content/imports.js    — LoginPage / MainContent
 *                                  lazy chunks
 *   - app-content/resume.js     — resumeUserSession
 *                                  (CSRF-aware resume flow)
 *
 * @returns {object}
 */
export const AppContent = () => (
	Div({
		class: 'app-content flex flex-auto flex-col',

		onCreated()
		{
			const WAIT_TIME = 1000;
			window.setTimeout(() => openInstallPrompt(), WAIT_TIME);
		},

		addState()
		{
			const isSignedIn = (app.data.user?.id != null);
			if (isSignedIn) resumeUserSession();
			return { isSignedIn };
		},

		onState: [
			['isSignedIn', (isSignedIn) => (!isSignedIn ? SignedOutContent() : MainContent())],
			['isSignedIn', updateBodyClass]
		]
	})
);

export default AppContent;
