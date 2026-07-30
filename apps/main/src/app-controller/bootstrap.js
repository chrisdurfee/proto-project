import { Builder, router } from '@base-framework/base';
import { blockEdgeSwipe } from '@components/utils/block-edge-swipe.js';
import { installScrollRestoration } from '@components/utils/restore-scroll.js';
import { Configs } from '../configs.js';
import { getCsrfToken } from '../csrf-token.js';
import { setupServiceWorker } from '../service.js';
import { AppShell } from '../shell/app-shell.js';
import { NotificationData } from '../shell/data/notification-data.js';
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
 * Build the controller's data layer — local user store, the
 * auth XHR client, and the global notifications data.
 *
 * @returns {{ user: object, auth: object, notifications: NotificationData }}
 */
export const createDataLayer = () => ({
	user: createUserData(),
	auth: new AuthModel(),
	notifications: new NotificationData()
});

/**
 * bootstrap
 *
 * Run the constructor-time side effects in a single call:
 * theme, service worker, router, data layer, CSRF token,
 * font loading, and the edge-swipe/scroll/stale-chunk guards.
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
	blockEdgeSwipe();
	installScrollRestoration();
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

	// Alias to make accessing the app shell root panel
	// easier — used to add popovers, modals, overlays, etc.
	self.root = main.panel;

	hideSplashAndMarkReady(self.swVersion ?? null);
	fixIosStandaloneViewport();
};
