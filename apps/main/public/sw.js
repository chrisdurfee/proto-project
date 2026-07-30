importScripts('./worker/cache-controller.js', './worker/service.js', './worker/push-controller.js');

/**
 * This is the name of the app and the version. This is used to
 * create the cache name.
 *
 * @const
 * @type {string} appName
 */
const APP_NAME = 'main',

/**
 * This is the version of the app. This is used to create the cache
 * name. Production builds stamp this automatically (see
 * stampServiceWorker in vite.config.js) so every deploy installs a
 * fresh worker and purges old caches. The literal value below is only
 * used during local dev — bump it manually when testing worker
 * changes against the dev server.
 *
 * @const
 * @type {string} version
 */
version = '0.0.1';

/**
 * This will add these files to cache. These make up the minimal app
 * shell required to boot offline. Only stable, destination-agnostic
 * documents are precached here.
 *
 * CSS/JS are intentionally NOT precached: the Vite dev server serves
 * the same source URL as either CSS or a JS style-injection module
 * depending on the request destination, and production filenames are
 * content-hashed. Both are cached correctly at runtime from their
 * real (stylesheet/script) requests instead.
 *
 * @const
 * @type {Array<string>} DEFAULT_FILES
 */
const DEFAULT_FILES =
[
	'./',
	'./index.html',
	'./manifest.json'
];

/**
 * This will set up the service worker controller with
 * the app name and the files to cache.
 */
const appNameId = `${APP_NAME}-${version}`;
const service = new Service(appNameId, DEFAULT_FILES, version);

/**
 * Push needs to be added to the service to allow for push
 * notifications to be received.
 */
const push = new PushController(APP_NAME);
