import { Div, Span } from '@base-framework/atoms';
import { Jot } from '@base-framework/base';
import { UniversalIcon } from '@base-framework/ui/atoms';

/**
 * @typedef {import('@base-framework/base').Component & {
 *   recoveryTimer?: ReturnType<typeof setInterval>,
 *   setOffline: function(boolean): void,
 *   probe: function(): Promise<boolean>,
 *   evaluate: function(): void,
 *   verifyOffline: function(): void,
 *   startRecoveryPoll: function(): void,
 *   stopRecoveryPoll: function(): void
 * }} ConnectivityBannerInstance
 */

/**
 * ConnectivityBanner
 *
 * A fixed, theme-aware banner that surfaces when the device loses its
 * network connection. It listens to the browser `online` / `offline`
 * events and slides into view while offline so the user knows the app
 * is running from cache. The framework auto-removes the window event
 * listeners when the component is destroyed.
 *
 * @returns {object}
 */
export const ConnectivityBanner = Jot(
{
	/**
	 * Start hidden. iOS Safari / standalone PWAs report
	 * `navigator.onLine === false` unreliably, so we never trust it
	 * directly — connectivity is confirmed with an active probe before
	 * the banner is shown.
	 *
	 * @returns {object}
	 */
	setupStates()
	{
		return {
			offline: false
		};
	},

	/**
	 * Check real connectivity as soon as the banner mounts.
	 *
	 * The browser `online` / `offline` events only fire on a *transition*,
	 * so a device that is already offline at launch (e.g. the PWA opened
	 * in flight mode) would never trigger them and the banner would stay
	 * hidden. An active probe on mount covers that case.
	 *
	 * @this {ConnectivityBannerInstance}
	 * @returns {void}
	 */
	afterSetup()
	{
		this.evaluate();
	},

	/**
	 * @param {boolean} offline
	 * @this {ConnectivityBannerInstance}
	 * @returns {void}
	 */
	setOffline(offline)
	{
		this.state.offline = offline;

		// When we believe we're offline, keep probing so the banner
		// clears itself the moment connectivity returns — iOS does not
		// reliably fire the `online` event.
		if (offline)
		{
			this.startRecoveryPoll();
		}
		else
		{
			this.stopRecoveryPoll();
		}
	},

	/**
	 * Probe the real network. Resolves `true` when reachable.
	 *
	 * `/api/` requests are never served from the service worker cache,
	 * so this always exercises the network. Any HTTP response (even a
	 * 404) means we are online; fetch only rejects on a genuine failure.
	 *
	 * @this {ConnectivityBannerInstance}
	 * @returns {Promise<boolean>}
	 */
	probe()
	{
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		return fetch(`${window.location.origin}/api/?_probe=${Date.now()}`, {
			method: 'HEAD',
			cache: 'no-store',
			signal: controller.signal
		})
		.then(() => true)
		.catch(() => false)
		.finally(() => clearTimeout(timeout));
	},

	/**
	 * Re-check connectivity and reconcile the banner with reality.
	 *
	 * Used on mount and whenever the app returns to the foreground. A
	 * reachable probe hides the banner immediately; an unreachable probe
	 * is double-confirmed (see `verifyOffline`) before showing so a single
	 * transient failure never flashes the banner while genuinely online.
	 *
	 * @this {ConnectivityBannerInstance}
	 * @returns {void}
	 */
	evaluate()
	{
		this.probe().then((online) =>
		{
			if (online)
			{
				this.setOffline(false);
				return;
			}

			this.verifyOffline();
		});
	},

	/**
	 * Confirm we are actually offline before showing the banner.
	 *
	 * iOS Safari fires spurious `offline` events and can momentarily
	 * fail requests even with a working connection, so we require two
	 * consecutive probe failures (spaced apart) before showing.
	 *
	 * @this {ConnectivityBannerInstance}
	 * @returns {void}
	 */
	verifyOffline()
	{
		this.probe().then((online) =>
		{
			if (online)
			{
				this.setOffline(false);
				return;
			}

			setTimeout(() =>
			{
				this.probe().then((onlineRetry) => this.setOffline(!onlineRetry));
			}, 2000);
		});
	},

	/**
	 * Poll for recovery while offline so the banner auto-hides without
	 * relying on the (unreliable on iOS) `online` event.
	 *
	 * @this {ConnectivityBannerInstance}
	 * @returns {void}
	 */
	startRecoveryPoll()
	{
		if (this.recoveryTimer)
		{
			return;
		}

		this.recoveryTimer = setInterval(() =>
		{
			this.probe().then((online) =>
			{
				if (online)
				{
					this.setOffline(false);
				}
			});
		}, 5000);
	},

	/**
	 * @this {ConnectivityBannerInstance}
	 * @returns {void}
	 */
	stopRecoveryPoll()
	{
		if (this.recoveryTimer)
		{
			clearInterval(this.recoveryTimer);
			this.recoveryTimer = null;
		}
	},

	/**
	 * Stop polling when the component is removed.
	 *
	 * @this {ConnectivityBannerInstance}
	 * @returns {void}
	 */
	beforeDestroy()
	{
		this.stopRecoveryPoll();
	},

	/**
	 * Track connectivity changes on the window.
	 *
	 * @this {ConnectivityBannerInstance}
	 * @returns {Array}
	 */
	setupEvents()
	{
		return [
			['online', window, () => this.setOffline(false)],
			['offline', window, () => this.verifyOffline()],

			// iOS PWAs suspend in the background and may miss `online` /
			// `offline` events (and pause the recovery poll) while the
			// connection changes. Re-check whenever the app is brought
			// back to the foreground so the banner reflects reality.
			['visibilitychange', document, () =>
			{
				if (document.visibilityState === 'visible')
				{
					this.evaluate();
				}
			}]
		];
	},

	/**
	 * @returns {object}
	 */
	render()
	{
		return Div({
			class: 'connectivity-banner fixed inset-x-0 top-0 z-[70] flex -translate-y-full items-center justify-center gap-2 px-4 py-2 bg-warning text-warning-foreground text-sm font-medium transition-transform duration-300 ease-out pt-[calc(0.5rem+env(safe-area-inset-top))]',
			role: 'status',
			'aria-live': 'polite',
			onState: ['offline', { 'translate-y-0': true, '-translate-y-full': false }]
		}, [
			UniversalIcon({ size: 'sm' }, 'wifi_off'),
			Span("You're offline: showing the latest saved version")
		]);
	}
});

export default ConnectivityBanner;
