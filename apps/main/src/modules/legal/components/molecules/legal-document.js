import { Div, H1, H2, P, Section } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { resolveContent } from "../../content/legal-config.js";

/**
 * Renders one section of a legal document.
 *
 * @param {object} section
 * @returns {object}
 */
const DocumentSection = Atom((section) => (
	Section({ class: 'flex flex-col gap-y-3' }, [
		H2({ class: 'text-lg font-semibold text-foreground' }, section.heading),
		...section.body.map((paragraph) => P({ class: 'text-muted-foreground leading-relaxed' }, paragraph))
	])
));

/**
 * Renders a legal document from a content module.
 *
 * The same content powers the crawlable static pages under
 * apps/website, so the signed-in reader and the public page can never
 * drift apart.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.effectiveDate
 * @param {string} props.version
 * @param {object} props.content
 * @returns {object}
 */
export const LegalDocument = ({ title, effectiveDate, version, content }) =>
{
	const resolved = resolveContent(content);

	return Div({ class: 'flex flex-auto flex-col w-full max-w-3xl mx-auto px-4 py-8 gap-y-8' }, [
		Div({ class: 'flex flex-col gap-y-2' }, [
			H1({ class: 'text-3xl font-bold text-foreground' }, title),
			P({ class: 'text-sm text-muted-foreground' }, `Effective ${effectiveDate} (version ${version})`),
			P({ class: 'text-muted-foreground leading-relaxed' }, resolved.intro)
		]),
		Div({ class: 'flex flex-col gap-y-8' },
			resolved.sections.map((section) => DocumentSection(section))
		)
	]);
};

export default LegalDocument;
