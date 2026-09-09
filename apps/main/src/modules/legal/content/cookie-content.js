/**
 * Cookie Policy content.
 *
 * This is a neutral starting template, not legal advice. Keep the
 * categories that match the cookies you actually set and remove the
 * rest, then have it reviewed by counsel.
 *
 * @type {{ intro: string, sections: Array<{ heading: string, body: string[] }> }}
 */
export const COOKIE_CONTENT = {
	intro: 'This Cookie Policy explains how {{APP_NAME}} uses cookies and similar technologies such as local storage, what each category is for, and how to control them.',
	sections: [
		{
			heading: '1. What Cookies Are',
			body: [
				'A cookie is a small text file a site stores in your browser. It lets the site remember things between requests, such as the fact that you are signed in.',
				'We also use similar technologies, including local storage and session storage, which behave much the same way. This policy covers those too.'
			]
		},
		{
			heading: '2. Strictly Necessary',
			body: [
				'These are required for the Service to work and cannot be switched off in our systems.',
				'Session cookie: keeps you signed in as you move between pages.',
				'CSRF token: protects forms and state-changing requests from cross-site request forgery.',
				'Load balancing and security cookies: route your request correctly and help block abuse.'
			]
		},
		{
			heading: '3. Functional',
			body: [
				'These remember choices you make so the Service behaves the way you expect.',
				'Examples include your theme preference, language, and whether you have dismissed a particular notice.',
				'If you block these, the Service still works but will forget your preferences.'
			]
		},
		{
			heading: '4. Analytics',
			body: [
				'These help us understand how the Service is used so we can improve it, for example which pages are visited and where errors occur.',
				'We use analytics data in aggregate. Where required, we ask for your consent before setting these.'
			]
		},
		{
			heading: '5. Managing Cookies',
			body: [
				'Most browsers let you view, delete, and block cookies from their settings. Blocking strictly necessary cookies will break sign-in.',
				'Where we ask for consent for non-essential cookies, you can change your choice at any time from the cookie settings link in the footer.',
				'Clearing cookies signs you out and resets your preferences on that device.'
			]
		},
		{
			heading: '6. Third-Party Cookies',
			body: [
				'Some cookies may be set by the providers we use, such as an analytics or error monitoring service. Their use of the data they collect is governed by their own privacy policies.'
			]
		},
		{
			heading: '7. Changes',
			body: [
				'We may update this policy as the cookies we use change. The effective date above shows when it was last revised.'
			]
		},
		{
			heading: '8. Contact',
			body: [
				'Questions about our use of cookies can be sent to {{PRIVACY_EMAIL}}.'
			]
		}
	]
};

export default COOKIE_CONTENT;
