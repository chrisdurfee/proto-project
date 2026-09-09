import { SupportForm } from "../molecules/support-form.js";

/**
 * ContactPage
 *
 * General contact form. Open to signed-out visitors so the marketing
 * site can link straight here.
 *
 * @returns {object}
 */
export const ContactPage = () => (
	SupportForm({
		title: 'Contact us',
		description: 'Questions about the product, billing, or anything else. We read every message.',
		category: 'contact',
		submitLabel: 'Send message',
		messagePlaceholder: 'What can we help you with?'
	})
);

export default ContactPage;
