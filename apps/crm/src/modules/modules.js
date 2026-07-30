import "./imported-modules.js";
import { AppModules, Module } from "./module/module.js";

/**
 * Catch-all route appended after every module route. The router matches
 * routes in order, so this only renders when no module route matches,
 * keeping the user inside the app shell instead of a blank content area.
 *
 * @returns {Array<object>}
 */
const getFallbackRoutes = () => Module.convertRoutes([
	{
		path: '*',
		import: () => import('@components/pages/not-found-page.js'),
		title: 'Not Found'
	}
]);

/**
 * This will get the module settings.
 *
 * @param {Array<object>} modules
 * @returns {object}
 */
const getModuleSettings = (modules) =>
{
	let routes = [];
	let links = [];

	modules.forEach((module) =>
	{
		if (!module)
		{
			return;
		}

		const moduleRoutes = module.getRoutes() || [];
		routes.push(...moduleRoutes);

		const moduleLinks = module.getLinks() || [];
		links.push(...moduleLinks);
	});

	routes.push(...getFallbackRoutes());

	return {
		routes,
		links
	};
};

/**
 * This will add the modules to the app.
 *
 * @param {Array<object>} modules
 * @returns {object}
 */
export const AddModules = (modules) =>
{
	if (!modules || modules.length < 1)
	{
		return {};
	}

	return getModuleSettings(modules);
};

export const modules = AddModules(AppModules);
