import { BlankPage } from "@base-framework/ui/pages";
import { COOKIE_CONTENT } from "../../content/cookie-content.js";
import { LEGAL_META } from "../../content/legal-meta.js";
import { LegalDocument } from "../molecules/legal-document.js";

/**
 * CookiePage
 *
 * Renders the Cookie Policy from the shared content module.
 *
 * @returns {BlankPage}
 */
export const CookiePage = () => (
	new BlankPage([
		LegalDocument({
			title: 'Cookie Policy',
			effectiveDate: LEGAL_META.cookies.effectiveDate,
			version: LEGAL_META.cookies.version,
			content: COOKIE_CONTENT
		})
	])
);

export default CookiePage;
