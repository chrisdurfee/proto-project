import { Div, H1, P } from '@base-framework/atoms';
import { Button, UniversalIcon } from '@base-framework/ui/atoms';
import { AppPage } from '@components/pages/app-page.js';

/**
 * RouteLoadErrorPage
 *
 * Fallback rendered when a dynamic route chunk fails to load
 * (network blip or a stale shell requesting a purged chunk after
 * a deploy). Keeps the user inside the app shell and offers a
 * reload, which also picks up a fresh shell.
 *
 * @returns {object}
 */
export const RouteLoadErrorPage = () => (
	AppPage({ class: 'pb-8' }, [
		Div({ class: 'flex-1 flex flex-col items-center justify-center text-center gap-6 py-16 px-6 w-full max-w-screen md:max-w-xl mx-auto' }, [
			Div({ class: 'flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 text-muted-foreground' }, [
				UniversalIcon({ size: 'lg' }, 'cloud_off')
			]),
			H1({ class: 'text-2xl font-semibold tracking-[-0.01em] text-foreground' }, 'Something went wrong'),
			P({ class: 'text-sm leading-relaxed text-muted-foreground max-w-sm' }, 'This page failed to load. Check your connection and reload to get the latest version of the app.'),
			Button({ variant: 'primary', click: () => window.location.reload() }, 'Reload')
		])
	])
);

export default RouteLoadErrorPage;
