import { Icons } from "@base-framework/ui/icons";
import { Module } from '../module/module.js';

/**
 * This will set the routes for the module.
 *
 * @type {Array<object>} routes
 */
const routes = Module.convertRoutes(
[
	{ path: '/clients/:clientId/:page?*', import: () => import('./components/pages/client/client-page.js'), title: 'Client :clientId' },
	{ path: '/clients*', import: () => import('./components/pages/clients/client-list-page.js'), title: 'Clients' }
]);

/**
 * This will set the links for the module.
 *
 * @type {Array<object>} links
 */
const links =
[
    { label: 'Clients', href: 'clients', icon: Icons.identification, mobileOrder: 6 }
];

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
     * This will get the options to create the app
     * navigation.
     *
     * @param {Array<object>} links
     */
    links
});