import { BlankPage } from "@base-framework/ui/pages";
import { TERMS_CONTENT } from "../../content/terms-content.js";
import { LEGAL_META } from "../../content/legal-meta.js";
import { LegalDocument } from "../molecules/legal-document.js";

/**
 * TermsPage
 *
 * Renders the Terms of Service from the shared content module.
 *
 * @returns {BlankPage}
 */
export const TermsPage = () => (
	new BlankPage([
		LegalDocument({
			title: 'Terms of Service',
			effectiveDate: LEGAL_META.terms.effectiveDate,
			version: LEGAL_META.terms.version,
			content: TERMS_CONTENT
		})
	])
);

export default TermsPage;
