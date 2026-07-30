import { Builder, router } from '@base-framework/base';
import { Configs } from '../configs.js';
import { getCsrfToken } from '../csrf-token.js';
import { setupServiceWorker } from '../service.js';
import { AppShell } from '../shell/app-shell.js';
import { AuthModel } from '../shell/models/auth-model.js';
import { setHtmlThemeBySettings } from '../theme.js';
import { installStaleChunkRecovery } from '../utils/stale-chunk.js';
import { setupFontLoading } from './font-loading.js';
import { fixIosStandaloneViewport } from './ios-viewport-fix.js';
import { hideSplashAndMarkReady } from './splash.js';
import { createUserData } from './user-data.js';

/**
 * setupRouter
 *
 * Wire the global router to the AppController and apply
 * the configured base URL + title.
 *
 * @param {object} self - The AppController instance.
 * @returns {void}
 */
export const setupRouter = (self) =>
{
	self.router = router;
	const { baseUrl, title } = Configs.router;
	router.setup(baseUrl, title);
};

/**
 * createDataLayer
 *
 * Build the controller's data layer — local user store and the
 * auth XHR client.
 *
 * @returns {{ user: object, auth: object }}
 */
export const createDataLayer = () => ({
	user: createUserData(),
	auth: new AuthModel()
});

/**
 * bootstrap
 *
 * Run the constructor-time side effects in a single call:
 * theme, service worker, router, data layer, CSRF token,
 * font loading, and stale-chunk recovery.
 *
 * @param {object} self - The AppController instance.
 * @returns {Promise<void>}
 */
export const bootstrap = async (self) =>
{
	setHtmlThemeBySettings();
	await setupServiceWorker(self);

	setupRouter(self);
	self.data = createDataLayer();

	getCsrfToken(self.data.auth);
	setupFontLoading();
	installStaleChunkRecovery();
};

/**
 * renderShell
 *
 * Mount the AppShell into `<body>`, expose the panel as
 * `self.root` for popovers / modals / overlays, and hide
 * the splash screen.
 *
 * @param {object} self - The AppController instance.
 * @returns {void}
 */
export const renderShell = (self) =>
{
	const main = self.appShell = new AppShell();
	Builder.render(main, document.body);

	self.root = main.panel;

	hideSplashAndMarkReady(self.swVersion ?? null);
	fixIosStandaloneViewport();
};
