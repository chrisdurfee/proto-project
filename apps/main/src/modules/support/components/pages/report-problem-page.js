import { SupportForm } from "../molecules/support-form.js";

/**
 * ReportProblemPage
 *
 * Bug reports. Filed under the "bug" category so they can be triaged
 * separately from general questions.
 *
 * @returns {object}
 */
export const ReportProblemPage = () => (
	SupportForm({
		title: 'Report a problem',
		description: 'Something broken or behaving unexpectedly? Tell us what you did and what you saw.',
		category: 'bug',
		submitLabel: 'Send report',
		messagePlaceholder: 'What did you do, what did you expect, and what happened instead?'
	})
);

export default ReportProblemPage;
