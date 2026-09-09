import { Module } from '../module/module.js';

/**
 * This will set the routes for the module.
 *
 * @type {Array<object>} routes
 */
const routes = Module.convertRoutes(
[
	/**
	 * Terms of Service
	 */
	{ path: '/legal/terms*', import: () => import('./components/pages/terms-page.js'), title: 'Terms of Service' },

	/**
	 * Privacy Policy
	 */
	{ path: '/legal/privacy*', import: () => import('./components/pages/privacy-page.js'), title: 'Privacy Policy' },

	/**
	 * Cookie Policy
	 */
	{ path: '/legal/cookies*', import: () => import('./components/pages/cookie-page.js'), title: 'Cookie Policy' }
]);

/**
 * This will set the links for the module.
 *
 * @type {Array<object>} links
 */
const links = [];

/**
 * This will create our module and add it to the app
 * modules.
 */
Module.create(
{
	/**
	 * @param {Array<object>} routes
	 */
	routes,

	/**
	 * @param {Array<object>} links
	 */
	links
});
