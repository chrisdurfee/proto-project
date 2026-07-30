/**
 * Class added to `<body>` whenever the user is signed in
 * so global selectors (and Tailwind layer overrides) can
 * react to auth state.
 *
 * @type {string}
 */
const AUTHED_CLASS_NAME = 'authed';

/**
 * updateBodyClass
 *
 * Mirror the sign-in flag onto the `authed` body class so
 * shell-wide CSS rules can react to auth state. Idempotent
 * — a no-op when the class is already in the requested
 * state.
 *
 * @param {boolean} isSignedIn
 * @returns {void}
 */
export const updateBodyClass = (isSignedIn) =>
{
	const hasClass = document.body.classList.contains(AUTHED_CLASS_NAME);

	if (isSignedIn && !hasClass)
	{
		document.body.classList.add(AUTHED_CLASS_NAME);
		return;
	}

	if (!isSignedIn && hasClass)
	{
		document.body.classList.remove(AUTHED_CLASS_NAME);
	}
};
