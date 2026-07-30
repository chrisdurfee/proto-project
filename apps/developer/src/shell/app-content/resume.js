import { setCsrfToken, whenCsrfReady } from '../../csrf-token.js';
import { AuthModel } from '../models/auth-model.js';

/**
 * Resume the user session when a user record was restored from
 * local storage (typically after signing in via the main app).
 *
 * MUST wait for the boot-time CSRF fetch before firing the
 * CSRF-protected `resume` POST, and MUST call setCsrfToken with
 * the rotated token from the response before any other mutations.
 *
 * @returns {void}
 */
export const resumeUserSession = () =>
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
				setCsrfToken(response.csrfToken);
				app.setUserData(response.user);
				return;
			}

			app.signOut();
		});
	});
};
