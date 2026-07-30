import { Div, H1, P } from '@base-framework/atoms';
import { Button, UniversalIcon } from '@base-framework/ui/atoms';
import { AppPage } from '@components/pages/app-page.js';

/**
 * NotFoundPage
 *
 * Catch-all fallback rendered when a route does not match any module.
 * Keeps the user inside the app shell (nav remains visible) and offers
 * a quick path back home.
 *
 * @returns {object}
 */
export const NotFoundPage = () => (
	AppPage({ class: 'pb-8' }, [
		Div({ class: 'flex-1 flex flex-col items-center justify-center text-center gap-6 py-16 px-6 w-full max-w-screen md:max-w-xl mx-auto' }, [
			Div({ class: 'flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 text-muted-foreground' }, [
				UniversalIcon({ size: 'lg' }, 'explore_off')
			]),
			H1({ class: 'text-2xl font-semibold tracking-[-0.01em] text-foreground' }, 'Page not found'),
			P({ class: 'text-sm leading-relaxed text-muted-foreground max-w-sm' }, 'The page you are looking for may have moved or no longer exists.'),
			Button({ variant: 'primary', click: () => app.navigate('/') }, 'Back to Home')
		])
	])
);

export default NotFoundPage;
