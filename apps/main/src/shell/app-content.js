import { Div } from '@base-framework/atoms';
import { openInstallPrompt } from './installation/install.js';
import { updateBodyClass } from './app-content/body-class.js';
import { LoginPage, MainContent } from './app-content/imports.js';
import { resumeUserSession } from './app-content/resume.js';

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
			['isSignedIn', (isSignedIn) => (!isSignedIn ? LoginPage() : MainContent())],
			['isSignedIn', updateBodyClass]
		]
	})
);

export default AppContent;
