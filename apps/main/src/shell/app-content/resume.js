import { setCsrfToken, whenCsrfReady } from '../../csrf-token.js';
import { AuthModel } from '../models/auth-model.js';

/**
 * Maximum number of resume attempts before giving up on a transient
 * (network / server) failure.
 *
 * @type {number}
 */
const MAX_ATTEMPTS = 3;

/**
 * Base delay (ms) between resume retries. Backs off linearly per
 * attempt so a flaky connection at boot gets a few chances.
 *
 * @type {number}
 */
const RETRY_DELAY = 2000;

/**
 * attemptResume
 *
 * Fire the CSRF-protected `resume` POST and handle the response.
 * Transient failures (no structured response) are retried with
 * backoff; an explicit denial signs the user out; success restores
 * the session.
 *
 * @param {object} model - AuthModel instance.
 * @param {number} attempt - 1-based attempt counter.
 * @returns {void}
 */
const attemptResume = (model, attempt) =>
{
	model.xhr.resume('', (response) =>
	{
		/**
		 * Transient failure (network error / 5xx → no response).
		 * Retry a few times before giving up so a flaky connection
		 * at boot doesn't silently drop the session restore.
		 */
		if (!response)
		{
			if (attempt < MAX_ATTEMPTS)
			{
				window.setTimeout(() => attemptResume(model, attempt + 1), RETRY_DELAY * attempt);
				return;
			}

			/**
			 * Retries exhausted. Leave the optimistic signed-in state
			 * intact — the session cookie may still be valid and the
			 * app already rendered from cached user data. Subsequent
			 * API calls will sign the user out if the session is
			 * genuinely gone, so we avoid kicking a user to login
			 * over a momentary network blip.
			 */
			console.warn('Session resume failed after retries; continuing with cached session.');
			return;
		}

		if (response.allowAccess === true)
		{
			// No-op unless the backend starts rotating the CSRF token
			// on resume — kept so a future rotation on this path
			// stays in sync.
			setCsrfToken(response.csrfToken);
			app.setUserData(response.user);
			app.data.notifications.setup();
			return;
		}

		// Server explicitly denied access — the session is gone.
		app.signOut();
	});
};

/**
 * resumeUserSession
 *
 * Resume the user session.
 *
 * MUST wait for the initial CSRF token to be set before
 * firing the `resume` POST — `resume` is CSRF-protected
 * and racing the `GET /api/auth/csrf-token` fetch with a
 * fixed `setTimeout` causes a 403 on slow networks, which
 * the frontend treats as `allowAccess !== true` and signs
 * the user out. Awaiting the token eliminates the race
 * entirely.
 *
 * @returns {void}
 */
export const resumeUserSession = () =>
{
	whenCsrfReady().then(() =>
	{
		const model = new AuthModel();
		attemptResume(model, 1);
	});
};
