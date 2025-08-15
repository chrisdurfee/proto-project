/**
 * This will create the aside links.
 *
 * @param {string} path
 * @returns {Array<object>}
 */
export const Links = (path) => ([
	// Getting Started
	{
		href: `${path}`,
		label: 'Introduction',
		exact: true
	},
	{
		href: `${path}/get-started`,
		label: 'Get Started'
	},

	// Core Architecture
	{
		href: `${path}/modules`,
		label: 'Modules'
	},
	{
		label: 'Http',
		href: `${path}/http`
	},
	{
		label: 'API',
		href: `${path}/api`
	},
	{
		label: 'Controllers',
		href: `${path}/controllers`
	},
	{
		label: 'Services',
		href: `${path}/services`
	},

	// Database & Models
	{
		label: 'Database & Query Builder',
		href: `${path}/database`
	},
	{
		label: 'Models',
		href: `${path}/models`
	},
	{
		label: 'Migrations',
		href: `${path}/migrations`
	},

	// Security & Validation
	{
		label: 'Security & Authorization',
		href: `${path}/security`
	},
	{
		label: 'Auth',
		href: `${path}/auth`
	},
	{
		label: 'Input Validation',
		href: `${path}/validation`
	},

	// Performance & Caching
	{
		label: 'Storage',
		href: `${path}/storage`
	},
	{
		label: 'File Storage',
		href: `${path}/file-storage`
	},

	// Real-time & Background
	// {
	// 	label: 'WebSockets & Real-time',
	// 	href: `${path}/websockets`
	// },
	// {
	// 	label: 'Automation & Jobs',
	// 	href: `${path}/automation`
	// },
	{
		label: 'Events',
		href: `${path}/events`
	},
	{
		label: 'Dispatch',
		href: `${path}/dispatch`
	},

	// Testing & Development
	// {
	// 	label: 'Tests',
	// 	href: `${path}/tests`
	// }
]);
