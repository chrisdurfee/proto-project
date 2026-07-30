import { Div } from '@base-framework/atoms';
import { openInstallPrompt } from './installation/install.js';
import { resumeUserSession } from './app-content/resume.js';
import { MainContent } from './main-content.js';

/**
 * This will create the app content.
 *
 * The developer app has no login UI — it relies on a user record
 * restored from local storage (shared with the main app) and
 * resumes that session on boot so CSRF-protected mutations and
 * policy checks see an authenticated admin session.
 *
 * @param {object} props
 * @returns {object}
 */
export const AppContent = (props) => (
	Div({
		class: 'app-content flex flex-auto flex-col',

		onCreated()
		{
			const WAIT_TIME = 1000;
			window.setTimeout(() => openInstallPrompt(), WAIT_TIME);

			if (app.data.user?.id != null)
			{
				resumeUserSession();
			}
		}
	}, MainContent(props))
);
