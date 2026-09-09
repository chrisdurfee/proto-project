import { Module } from '../module/module.js';

/**
 * This will set the routes for the module.
 *
 * @type {Array<object>} routes
 */
const routes = Module.convertRoutes(
[
	/**
	 * Help Center landing page.
	 *
	 * Declared without a trailing wildcard, and before the child
	 * routes, because a wildcard '/help*' also matches '/help/contact'
	 * and would swallow every page below it.
	 */
	{ path: '/help', import: () => import('./components/pages/help-center-page.js'), title: 'Help Center' },

	/**
	 * Contact form
	 */
	{ path: '/help/contact*', import: () => import('./components/pages/contact-page.js'), title: 'Contact us' },

	/**
	 * Bug reports
	 */
	{ path: '/help/report*', import: () => import('./components/pages/report-problem-page.js'), title: 'Report a problem' }
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
