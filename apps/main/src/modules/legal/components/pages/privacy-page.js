import { BlankPage } from "@base-framework/ui/pages";
import { PRIVACY_CONTENT } from "../../content/privacy-content.js";
import { LEGAL_META } from "../../content/legal-meta.js";
import { LegalDocument } from "../molecules/legal-document.js";

/**
 * PrivacyPage
 *
 * Renders the Privacy Policy from the shared content module.
 *
 * @returns {BlankPage}
 */
export const PrivacyPage = () => (
	new BlankPage([
		LegalDocument({
			title: 'Privacy Policy',
			effectiveDate: LEGAL_META.privacy.effectiveDate,
			version: LEGAL_META.privacy.version,
			content: PRIVACY_CONTENT
		})
	])
);

export default PrivacyPage;
