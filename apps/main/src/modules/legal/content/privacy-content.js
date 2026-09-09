/**
 * Privacy Policy content.
 *
 * This is a neutral starting template, not legal advice. It describes a
 * conventional web application. Delete anything you do not do, add what
 * you do that is not listed, and have it reviewed by counsel.
 *
 * @type {{ intro: string, sections: Array<{ heading: string, body: string[] }> }}
 */
export const PRIVACY_CONTENT = {
	intro: 'This Privacy Policy explains what {{APP_NAME}} collects, why we collect it, and the choices you have. It applies to our website, web app, and related services.',
	sections: [
		{
			heading: '1. Information You Give Us',
			body: [
				'Account information such as your name, username, email address, and password. Passwords are stored only as salted hashes, never in readable form.',
				'Profile information you choose to add, such as an avatar or a short biography.',
				'Content you submit, including messages, posts, uploads, and support requests.',
				'Communications you send us, such as a contact form submission or a bug report.'
			]
		},
		{
			heading: '2. Information We Collect Automatically',
			body: [
				'Device and connection data such as IP address, browser type, operating system, and referring pages.',
				'Usage data such as the pages you view and the actions you take, which we use to understand and improve the Service.',
				'Sign-in activity, including the time, approximate location, and device of recent sign-ins, which we retain to help you spot unauthorized access.',
				'Error and performance diagnostics when something goes wrong, so we can fix it.'
			]
		},
		{
			heading: '3. How We Use Information',
			body: [
				'To provide, maintain, and improve the Service.',
				'To authenticate you, keep your account secure, and detect or prevent abuse and fraud.',
				'To respond to your support requests and communicate about the Service, including security and service notices.',
				'To comply with legal obligations and enforce our Terms.'
			]
		},
		{
			heading: '4. Legal Bases',
			body: [
				'Where the GDPR or a similar law applies, we rely on: performance of a contract, to provide the Service you asked for; legitimate interests, to keep the Service secure and improve it; consent, for optional things such as non-essential cookies or marketing email; and legal obligation, where the law requires it.',
				'Where we rely on consent, you may withdraw it at any time.'
			]
		},
		{
			heading: '5. Sharing',
			body: [
				'We do not sell your personal information.',
				'We share information with service providers who process it on our behalf, such as hosting, email delivery, and error monitoring. They may use it only to provide services to us.',
				'We may disclose information when required by law, to enforce our Terms, or to protect the rights, safety, and property of our users or the public.',
				'If we are involved in a merger, acquisition, or sale of assets, information may transfer as part of that transaction. We will give notice before your information becomes subject to a different policy.'
			]
		},
		{
			heading: '6. Retention',
			body: [
				'We keep personal information only as long as needed for the purposes described here, or as required by law.',
				'When you delete your account we delete or anonymize your personal information, except where we must retain records, for example for tax, accounting, security, or dispute resolution.'
			]
		},
		{
			heading: '7. Security',
			body: [
				'We use technical and organizational measures appropriate to the risk, including encryption in transit, hashed passwords, access controls, and rate limiting on authentication.',
				'No method of transmission or storage is completely secure, so we cannot guarantee absolute security. Tell us promptly if you suspect a problem with your account.'
			]
		},
		{
			heading: '8. Your Rights',
			body: [
				'Depending on where you live, you may have the right to access, correct, delete, export, or restrict the processing of your personal information, and to object to certain processing.',
				'You can update most information directly in your account settings. For anything else, contact us at {{PRIVACY_EMAIL}}.',
				'We will not discriminate against you for exercising these rights. You may also have the right to complain to your local data protection authority.'
			]
		},
		{
			heading: '9. International Transfers',
			body: [
				'We may process information in countries other than your own. When we transfer personal information out of a region that restricts transfers, we use an approved safeguard such as standard contractual clauses.'
			]
		},
		{
			heading: '10. Children',
			body: [
				'The Service is not directed to children under 13, and we do not knowingly collect their personal information. If you believe a child has given us information, contact us and we will delete it.'
			]
		},
		{
			heading: '11. Changes',
			body: [
				'We may update this policy. When a change is material we will give notice, for example in the app or by email, and update the effective date above.'
			]
		},
		{
			heading: '12. Contact',
			body: [
				'Questions about this policy or your information can be sent to {{PRIVACY_EMAIL}}.'
			]
		}
	]
};

export default PRIVACY_CONTENT;
