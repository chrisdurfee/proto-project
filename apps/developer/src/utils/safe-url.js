/**
 * URL safety guards.
 *
 * Defense-in-depth helpers for the handful of places that navigate or
 * redirect using a URL that originated outside the immediate call
 * (push payloads, service-worker messages, backend auth responses).
 * They prevent open redirects and dangerous schemes (javascript:,
 * data:, etc.) from ever reaching `app.navigate`, `window.open`, or
 * `window.location`.
 */

/**
 * Whether a value is a safe in-app navigation target — a relative
 * path, or a same-origin http(s) absolute URL. Cross-origin URLs,
 * protocol-relative URLs ("//host"), and non-http(s) schemes are
 * rejected so a malformed/hostile message can't redirect off-app.
 *
 * @param {*} url
 * @returns {boolean}
 */
export const isSafeInAppPath = (url) =>
{
	if (typeof url !== 'string' || url.trim() === '')
	{
		return false;
	}

	const trimmed = url.trim();

	/**
	 * A leading scheme ("http:", "javascript:", ...) or a protocol-
	 * relative prefix ("//host") means the target may escape the
	 * origin — only allow it when it resolves back to our own origin
	 * over http(s).
	 */
	if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('//'))
	{
		try
		{
			const resolved = new URL(trimmed, window.location.origin);
			return resolved.origin === window.location.origin
				&& (resolved.protocol === 'http:' || resolved.protocol === 'https:');
		}
		catch
		{
			return false;
		}
	}

	// No scheme → relative in-app path, handled by the router.
	return true;
};

/**
 * Whether a value is an http(s) URL — the only schemes safe to hand
 * to `window.open` or `window.location.href` for an external
 * destination. Rejects javascript:, data:, blob:, etc.
 *
 * @param {*} url
 * @returns {boolean}
 */
export const isHttpUrl = (url) =>
{
	if (typeof url !== 'string' || url.trim() === '')
	{
		return false;
	}

	try
	{
		const { protocol } = new URL(url.trim(), window.location.origin);
		return protocol === 'http:' || protocol === 'https:';
	}
	catch
	{
		return false;
	}
};

/**
 * Open an external (or API-provided) URL in a new tab, refusing any
 * non-http(s) scheme and always severing the opener. Use this for
 * every `window.open` whose target originated from user input or an
 * API response so a stored `javascript:`/`data:` URL can never
 * execute and the new page can never script-reach back.
 *
 * @param {*} url
 * @returns {boolean} whether the URL was opened
 */
export const openExternal = (url) =>
{
	if (isHttpUrl(url) === false)
	{
		console.warn('openExternal blocked a non-http(s) URL:', url);
		return false;
	}

	window.open(url, '_blank', 'noopener,noreferrer');
	return true;
};
