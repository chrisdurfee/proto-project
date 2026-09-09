/**
 * Terms of Service content.
 *
 * Each entry is a document section rendered by the legal document
 * component and by the static renderer in apps/website.
 *
 * This is a neutral starting template, not legal advice. Replace the
 * placeholders, adapt the copy to what your product actually does, and
 * have it reviewed by counsel before you rely on it.
 *
 * @type {{ intro: string, sections: Array<{ heading: string, body: string[] }> }}
 */
export const TERMS_CONTENT = {
	intro: 'These Terms of Service ("Terms") govern your access to and use of {{APP_NAME}}, including our website, web app, and related services (collectively, the "Service"). By creating an account or using the Service, you agree to these Terms and to our Privacy Policy.',
	sections: [
		{
			heading: '1. Acceptance of Terms',
			body: [
				'By accessing or using the Service, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use the Service.',
				'If you use the Service on behalf of an organization, you represent that you have authority to bind that organization, and "you" includes that organization.',
				'We may update these Terms from time to time. When a change is material, we will give notice and may require you to accept the updated Terms before continuing to use the Service.'
			]
		},
		{
			heading: '2. Eligibility',
			body: [
				'You must be old enough to form a binding contract where you live, and in any case at least 13 years old, to create an account.',
				'You are responsible for complying with the laws that apply to you where you use the Service.'
			]
		},
		{
			heading: '3. Your Account',
			body: [
				'You are responsible for safeguarding your credentials and for activity that occurs under your account. Tell us promptly if you believe your account has been used without your permission.',
				'Keep your account information accurate and current. We may suspend an account when information appears false or when required to protect the Service or other users.',
				'Where multi-factor authentication is available, we recommend enabling it.'
			]
		},
		{
			heading: '4. Acceptable Use',
			body: [
				'Do not use the Service to break the law, infringe anyone\'s rights, or harm others.',
				'Do not attempt to gain unauthorized access to any account, system, or data, probe or test the security of the Service without permission, or interfere with its normal operation.',
				'Do not scrape, harvest, or bulk-collect data from the Service except as expressly permitted, and do not use it to send spam or malware.',
				'We may remove content or restrict accounts that violate these rules.'
			]
		},
		{
			heading: '5. Your Content',
			body: [
				'You keep ownership of the content you submit. You grant us a non-exclusive, worldwide, royalty-free licence to host, store, reproduce, and display that content only as needed to operate and improve the Service.',
				'You are responsible for the content you submit and confirm you have the rights necessary to submit it.',
				'We may remove content that violates these Terms or applicable law.'
			]
		},
		{
			heading: '6. Our Intellectual Property',
			body: [
				'The Service, including its software, design, and trademarks, is owned by us or our licensors and is protected by intellectual property laws.',
				'These Terms do not grant you any right to use our names, logos, or trademarks without our prior written permission.'
			]
		},
		{
			heading: '7. Third-Party Services',
			body: [
				'The Service may link to or integrate with services we do not control. We are not responsible for those services, and your use of them is governed by their own terms.'
			]
		},
		{
			heading: '8. Termination',
			body: [
				'You may stop using the Service and close your account at any time.',
				'We may suspend or terminate access if you breach these Terms, if required by law, or if continuing to provide the Service would create risk for us or other users.',
				'Sections that by their nature should survive termination, including ownership, disclaimers, limitation of liability, and dispute resolution, will survive.'
			]
		},
		{
			heading: '9. Disclaimers',
			body: [
				'The Service is provided "as is" and "as available" without warranties of any kind, whether express, implied, or statutory, to the fullest extent permitted by law.',
				'We do not warrant that the Service will be uninterrupted, timely, secure, or error-free, or that any content is accurate or complete.'
			]
		},
		{
			heading: '10. Limitation of Liability',
			body: [
				'To the fullest extent permitted by law, we are not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenue, data, or goodwill.',
				'Our total liability for any claim relating to the Service is limited to the greater of the amount you paid us in the twelve months before the claim or one hundred dollars.',
				'Some jurisdictions do not allow certain limitations, so some of the above may not apply to you.'
			]
		},
		{
			heading: '11. Indemnity',
			body: [
				'You agree to indemnify and hold us harmless from claims, damages, and expenses, including reasonable legal fees, arising out of your use of the Service, your content, or your breach of these Terms.'
			]
		},
		{
			heading: '12. Governing Law and Disputes',
			body: [
				'These Terms are governed by the laws of {{GOVERNING_LAW}}, without regard to conflict-of-law rules.',
				'You and we agree to try to resolve any dispute informally first. Contact us and give us a reasonable opportunity to resolve the issue before starting a formal proceeding.'
			]
		},
		{
			heading: '13. Contact',
			body: [
				'Questions about these Terms can be sent to {{LEGAL_EMAIL}}, or through the contact form in the Help Center.'
			]
		}
	]
};

export default TERMS_CONTENT;
