import { A, Div, Footer, Header, Main } from '@base-framework/atoms';
import { SafeZoneTop } from '@base-framework/ui/atoms';
import { modules } from '../modules/modules.js';
import { filterPublicRoutes } from './public-routes.js';

/**
 * The links shown in the public footer.
 *
 * @type {Array<object>}
 */
const FOOTER_LINKS = [
	{ href: '/help', label: 'Help Center' },
	{ href: '/legal/terms', label: 'Terms' },
	{ href: '/legal/privacy', label: 'Privacy' },
	{ href: '/legal/cookies', label: 'Cookies' }
];

/**
 * A minimal header for signed-out visitors, with a way back to sign in.
 *
 * @returns {object}
 */
const PublicHeader = () => (
	Header({ class: 'flex items-center justify-between w-full px-4 py-3 border-b border-border' }, [
		A({ href: '/', class: 'font-semibold text-foreground' }, 'Home'),
		A({ href: '/', class: 'text-sm text-muted-foreground hover:text-foreground transition-colors duration-200' }, 'Sign in')
	])
);

/**
 * @returns {object}
 */
const PublicFooter = () => (
	Footer({ class: 'flex flex-wrap items-center justify-center gap-x-6 gap-y-2 w-full px-4 py-6 border-t border-border' },
		FOOTER_LINKS.map((link) => A({
			href: link.href,
			class: 'text-sm text-muted-foreground hover:text-foreground transition-colors duration-200'
		}, link.label))
	)
);

/**
 * PublicContent
 *
 * The shell used for routes that must work without a session. It
 * deliberately omits the heartbeat and the authenticated navigation,
 * since neither makes sense for a signed-out visitor reading a policy.
 *
 * @returns {Array<object>}
 */
export const PublicContent = () =>
{
	const routes = filterPublicRoutes(modules.routes);

	return [
		SafeZoneTop(),
		PublicHeader(),
		Main({
			class: 'active-panel-container flex flex-auto flex-col relative z-0',
			switch: routes
		}),
		PublicFooter()
	];
};

export default PublicContent;
