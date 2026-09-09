/**
 * Legal document configuration.
 *
 * The legal copy in this folder is written with placeholders so a new
 * project can rename itself in one place. Update these values, and both
 * the in-app reader and the static pages rendered into apps/website
 * pick them up.
 *
 * This file is imported by a plain Node script (the website renderer)
 * as well as by the app, so it must not import anything from the app
 * runtime.
 *
 * @type {object}
 */
export const LEGAL_CONFIG = {
	appName: 'Proto',
	companyName: 'Proto',
	legalEmail: 'legal@example.com',
	privacyEmail: 'privacy@example.com',
	supportEmail: 'support@example.com',
	governingLaw: 'the State of Utah, United States'
};

/**
 * Maps a placeholder token to its configured value.
 *
 * @type {object}
 */
const TOKENS = {
	'{{APP_NAME}}': LEGAL_CONFIG.appName,
	'{{COMPANY_NAME}}': LEGAL_CONFIG.companyName,
	'{{LEGAL_EMAIL}}': LEGAL_CONFIG.legalEmail,
	'{{PRIVACY_EMAIL}}': LEGAL_CONFIG.privacyEmail,
	'{{SUPPORT_EMAIL}}': LEGAL_CONFIG.supportEmail,
	'{{GOVERNING_LAW}}': LEGAL_CONFIG.governingLaw
};

/**
 * Replaces the placeholder tokens in a string with configured values.
 *
 * @param {string} text
 * @returns {string}
 */
export const applyTokens = (text) =>
{
	let result = String(text ?? '');
	for (const [token, value] of Object.entries(TOKENS))
	{
		result = result.split(token).join(value);
	}

	return result;
};

/**
 * Resolves every placeholder in a legal document so callers can render
 * it directly.
 *
 * @param {object} content
 * @returns {object}
 */
export const resolveContent = (content) => ({
	intro: applyTokens(content.intro),
	sections: content.sections.map((section) => ({
		heading: applyTokens(section.heading),
		body: section.body.map(applyTokens)
	}))
});

export default LEGAL_CONFIG;
