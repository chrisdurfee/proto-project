import { base } from "@base-framework/base";

/**
 * Checks if the HTTP method is safe from CSRF protection.
 *
 * @param {string} method - The HTTP method to check.
 * @returns {boolean} - True if the method is safe, false otherwise.
 */
function csrfSafeMethod(method)
{
	return (/^(GET|HEAD|OPTIONS)$/.test(method));
}

let token = null;
let beforeSendRegistered = false;

/**
 * Module-level promise that resolves as soon as a CSRF token has
 * been recorded for this page-load. Consumers that fire CSRF-
 * protected mutations during boot (the session `resume` POST, push
 * `subscribe`, the user status PATCH, etc.) MUST await this before
 * sending their request — otherwise the request races the initial
 * `GET /api/auth/csrf-token` fetch and lands at the server without
 * a header. The middleware then 403s, the frontend treats the 403
 * as "session not allowed", and the user is bounced to login.
 *
 * The promise is created lazily on the first `getCsrfToken()` call
 * so anything that runs before that call (early bootstrap code)
 * does not hang on a promise that will never resolve.
 *
 * @type {Promise<string|null>|null}
 */
let readyPromise = null;
let resolveReady = null;

/**
 * Registers a single base.beforeSend handler that attaches the
 * CSRF-TOKEN header to every non-safe Ajax mutation. The handler
 * closes over the module-level `token`, so token rotations only
 * need to update that variable — not re-register the handler.
 *
 * Re-registering would push duplicate handlers into base's
 * beforeSend list, and `XMLHttpRequest.setRequestHeader()` with
 * the same name concatenates values with ", ", which the backend
 * then rejects as an invalid token.
 *
 * @returns {void}
 */
const ensureBeforeSendHandler = () =>
{
	if (beforeSendRegistered)
	{
		return;
	}

	beforeSendRegistered = true;
	// @ts-ignore
	base.beforeSend((xhr, settings) =>
	{
		if (token && !csrfSafeMethod(settings.method) && !settings.crossDomain)
		{
			xhr.setRequestHeader('CSRF-TOKEN', token);
		}
	});
};

/**
 * Sets the CSRF token for AJAX requests.
 *
 * The backend rotates the CSRF token on auth state transitions
 * (login, resume, MFA confirm, logout). Whenever an auth response
 * includes a fresh `csrfToken`, this MUST be called so subsequent
 * mutations (PATCH/POST/PUT/DELETE) don't fail with
 * "The CSRF token is invalid."
 *
 * @param {string} newToken - The CSRF token to set.
 * @returns {void}
 */
export const setCsrfToken = (newToken) =>
{
	if (!newToken)
	{
		return;
	}

	token = newToken;
	ensureBeforeSendHandler();

	/**
	 * Unblock anything that was awaiting the initial token. Later
	 * rotations (login, MFA, resume, OAuth callback) still flow
	 * through here, but the promise is one-shot — subsequent
	 * `whenCsrfReady()` calls return the already-resolved promise.
	 */
	if (resolveReady)
	{
		const resolve = resolveReady;
		resolveReady = null;
		resolve(token);
	}
};

/**
 * This will get the token that has been saved.
 *
 * @returns {string|null}
 */
export const getSavedToken = () => token;

/**
 * Resolves the ready promise with `null` so awaiting callers can
 * fall through to their error paths instead of deadlocking.
 *
 * @returns {void}
 */
const resolveReadyWithNull = () =>
{
	if (resolveReady)
	{
		const resolve = resolveReady;
		resolveReady = null;
		resolve(null);
	}
};

const MAX_TOKEN_ATTEMPTS = 3;
const TOKEN_ATTEMPT_TIMEOUT = 8000;

/**
 * Fires one token fetch attempt with a timeout guard. A hung
 * request (no callback) or a failed response retries up to
 * MAX_TOKEN_ATTEMPTS times before resolving `null`.
 *
 * @param {object} model - The model to get the CSRF token from.
 * @param {number} [attempt] - The current attempt number.
 * @returns {void}
 */
const requestToken = (model, attempt = 1) =>
{
	let settled = false;

	const fail = () =>
	{
		if (settled || token !== null)
		{
			return;
		}

		settled = true;
		if (attempt < MAX_TOKEN_ATTEMPTS)
		{
			requestToken(model, attempt + 1);
			return;
		}

		console.error('CSRF token fetch failed after ' + MAX_TOKEN_ATTEMPTS + ' attempts.');
		resolveReadyWithNull();
	};

	const timer = setTimeout(fail, TOKEN_ATTEMPT_TIMEOUT);

	model.xhr.getCsrfToken('', (response) =>
	{
		clearTimeout(timer);
		if (!response || response.success === false)
		{
			fail();
			return;
		}

		settled = true;
		setCsrfToken(response.token);
	});
};

/**
 * This will setup the csrf token.
 *
 * Idempotent — safe to call multiple times. Returns a promise that
 * resolves with the token (or `null` if the fetch failed) so callers
 * that need to fire CSRF-protected mutations during boot can await
 * it instead of guessing a setTimeout long enough to win the race
 * against the initial token fetch.
 *
 * Each attempt is guarded by a timeout so a hung request can't
 * deadlock the bootstrap; failures retry before resolving `null`.
 *
 * @param {object} model - The model to get the CSRF token from.
 * @returns {Promise<string|null>}
 */
export const getCsrfToken = (model) =>
{
	if (readyPromise === null)
	{
		readyPromise = new Promise((resolve) =>
		{
			resolveReady = resolve;
		});
	}

	requestToken(model);
	return readyPromise;
};

/**
 * Returns a promise that resolves once the CSRF token has been
 * recorded for this page-load. If the token is already set, resolves
 * immediately. If `getCsrfToken()` hasn't been called yet, resolves
 * once it is.
 *
 * @returns {Promise<string|null>}
 */
export const whenCsrfReady = () =>
{
	if (token !== null)
	{
		return Promise.resolve(token);
	}

	if (readyPromise === null)
	{
		readyPromise = new Promise((resolve) =>
		{
			resolveReady = resolve;
		});
	}

	return readyPromise;
};
