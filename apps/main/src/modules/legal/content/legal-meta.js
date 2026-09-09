/**
 * Legal document metadata.
 *
 * Version strings are what an acceptance gate compares against, so bump
 * the version of a document whenever its copy changes materially. If you
 * add a backend acceptance check, keep these values in sync with it.
 *
 * @type {object}
 */
export const LEGAL_META = {
	terms: {
		version: '2026-09-08',
		effectiveDate: 'September 8, 2026'
	},
	privacy: {
		version: '2026-09-08',
		effectiveDate: 'September 8, 2026'
	},
	cookies: {
		version: '2026-09-08',
		effectiveDate: 'September 8, 2026'
	}
};

export default LEGAL_META;
