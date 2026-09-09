import { A, Div, H1, H2, P, Section } from "@base-framework/atoms";
import { Atom } from "@base-framework/base";
import { UniversalIcon } from "@base-framework/ui/atoms";
import { BlankPage } from "@base-framework/ui/pages";

/**
 * A single navigation card in the Help Center.
 *
 * @param {object} props
 * @param {string} props.href
 * @param {string} props.icon
 * @param {string} props.title
 * @param {string} props.description
 * @returns {object}
 */
const HelpCard = Atom((props) => (
	A({
		href: props.href,
		class: `flex items-start gap-4 p-4 rounded-card border border-border bg-card
				hover:bg-surface-2/50 transition-colors duration-200`
	}, [
		Div({ class: 'text-primary mt-1' }, [
			UniversalIcon({ size: 'sm' }, props.icon)
		]),
		Div({ class: 'flex flex-col gap-y-1' }, [
			H2({ class: 'font-semibold text-foreground' }, props.title),
			P({ class: 'text-sm text-muted-foreground' }, props.description)
		])
	])
));

/**
 * The topics shown on the Help Center landing page.
 *
 * Replace these with the articles your product actually has. The
 * scaffold ships the two destinations that always exist.
 *
 * @type {Array<object>}
 */
const TOPICS = [
	{
		href: '/help/contact',
		icon: 'mail',
		title: 'Contact us',
		description: 'Questions about the product, your account, or billing.'
	},
	{
		href: '/help/report',
		icon: 'bug_report',
		title: 'Report a problem',
		description: 'Something is broken or is not behaving the way you expected.'
	}
];

/**
 * The legal documents linked from the Help Center footer.
 *
 * @type {Array<object>}
 */
const LEGAL_LINKS = [
	{ href: '/legal/terms', label: 'Terms of Service' },
	{ href: '/legal/privacy', label: 'Privacy Policy' },
	{ href: '/legal/cookies', label: 'Cookie Policy' }
];

/**
 * HelpCenterPage
 *
 * The hub that points at the support forms and the legal documents.
 *
 * @returns {BlankPage}
 */
export const HelpCenterPage = () => (
	new BlankPage([
		Div({ class: 'flex flex-auto flex-col w-full max-w-3xl mx-auto px-4 py-8 gap-y-8' }, [
			Div({ class: 'flex flex-col gap-y-2' }, [
				H1({ class: 'scroll-m-20 text-3xl font-bold tracking-tight' }, 'Help Center'),
				P({ class: 'text-base text-muted-foreground max-w-[700px]' },
					'Find an answer or get in touch. We usually reply within one business day.')
			]),

			Section({ class: 'grid gap-4 sm:grid-cols-2' },
				TOPICS.map((topic) => HelpCard(topic))
			),

			Section({ class: 'flex flex-col gap-y-3 pt-4 border-t border-border' }, [
				H2({ class: 'text-sm font-semibold text-foreground' }, 'Legal'),
				Div({ class: 'flex flex-wrap gap-x-6 gap-y-2' },
					LEGAL_LINKS.map((link) => A({
						href: link.href,
						class: 'text-sm text-muted-foreground hover:text-foreground transition-colors duration-200'
					}, link.label))
				)
			])
		])
	])
);

export default HelpCenterPage;
