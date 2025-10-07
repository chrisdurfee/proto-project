/**
 * This will create a page dynamically.
 *
 * @param {string} url The URL or path this page should match
 * @param {string} title A descriptive title for the page
 * @param {function|Promise} importCallback A function returning the dynamic import
 * @returns {object}
 */
const Page = (url, title, importCallback) => ({
	uri: url,
	title,
	import: importCallback,
});

/**
 * This will create the documentation switch.
 *
 * @param {string} basePath
 * @returns {Array<object>}
 */
export const DocumentationSwitch = (basePath) => ([
	// Getting Started
	Page(`${basePath}`, 'Introduction', () => import('./introduction/intro-page.js')),
	Page(`${basePath}/get-started`, 'Get Started', () => import('./get-started/get-started-page.js')),

	// Core Architecture
	Page(`${basePath}/modules`, 'Modules', () => import('./modules/modules-page.js')),
	Page(`${basePath}/http`, 'Http', () => import('./http/http-page.js')),
	Page(`${basePath}/api`, 'API', () => import('./api/api-page.js')),
	Page(`${basePath}/controllers`, 'Controllers', () => import('./controllers/controllers-page.js')),
	Page(`${basePath}/services`, 'Services', () => import('./services/services-page.js')),

	// Database & Models
	Page(`${basePath}/database`, 'Database & Query Builder', () => import('./database/database-page.js')),
	Page(`${basePath}/models`, 'Models', () => import('./models/models-page.js')),
	Page(`${basePath}/migrations`, 'Migrations', () => import('./migrations/migrations-page.js')),
	Page(`${basePath}/seeders`, 'Seeders', () => import('./seeders/seeders-page.js')),
	Page(`${basePath}/factories`, 'Factories', () => import('./factories/factories-page.js')),

	// Security & Validation
	Page(`${basePath}/security`, 'Security & Authorization', () => import('./security/security-page.js')),
	Page(`${basePath}/auth`, 'Auth', () => import('./auth/auth-page.js')),
	Page(`${basePath}/validation`, 'Input Validation', () => import('./validation/validation-page.js')),

	// Performance & Caching
	Page(`${basePath}/storage`, 'Storage', () => import('./storage/storage-page.js')),
	Page(`${basePath}/file-storage`, 'File Storage', () => import('./file-storage/file-storage-page.js')),

	// Real-time & Background
	Page(`${basePath}/websockets`, 'WebSockets & Real-time', () => import('./websockets/websockets-page.js')),
	Page(`${basePath}/automation`, 'Automation & Jobs', () => import('./automation/automation-page.js')),
	Page(`${basePath}/events`, 'Events', () => import('./events/events-page.js')),
	Page(`${basePath}/dispatch`, 'Dispatch', () => import('./dispatch/dispatch-page.js')),

	// Testing & Development
	Page(`${basePath}/tests`, 'Tests', () => import('./tests/tests-page.js')),
]);

export default DocumentationSwitch;
