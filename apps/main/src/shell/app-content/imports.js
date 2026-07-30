import { Import } from '@base-framework/base';

/**
 * LoginPage
 *
 * Lazy-imported sign-in surface used while the user is
 * unauthenticated.
 *
 * @returns {object}
 */
export const LoginPage = () => (
	Import({ src: () => import('../login/login-page.js') })
);

/**
 * MainContent
 *
 * Lazy-imported authenticated shell — the actual app
 * after the login gate is cleared.
 *
 * @returns {object}
 */
export const MainContent = () => (
	Import({ src: () => import('../main-content.js') })
);
