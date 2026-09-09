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
/**
 * PublicPage
 *
 * Lazy-imported shell for routes that must render without a
 * session, such as the legal documents and the Help Center.
 *
 * @returns {object}
 */
export const PublicPage = () => (
	Import({ src: () => import('../public-content.js') })
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
