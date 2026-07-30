import { whenCsrfReady } from "../../csrf-token.js";

/**
 * PulseTimer
 *
 * This class is responsible for managing the timer mechanism
 *
 * It periodically checks if the user is still authenticated and
 * logs them out if their session has expired.
 */
export class PulseTimer
{
	/**
	 * Timer constructor
	 *
	 * Initializes the timer mechanism.
	 *
	 * @param {number} delay - The delay between timer ticks in milliseconds.
	 */
	constructor(delay = 0)
	{
		this.timer = null;
		this.delay = delay;
	}

	/**
	 * Starts the timer.
	 *
	 * @returns {void}
	 */
	start()
	{
		this.stop();
		this.verify();

		const DELAY = this.delay;
		this.timer = window.setInterval(() =>
		{
			this.verify();
		}, DELAY);
	}

	/**
	 * Stops the timer.
	 *
	 * @returns {void}
	 */
	stop()
	{
		window.clearInterval(this.timer);
	}

	/**
	 * Used to verify the user has access to the app.
	 *
	 * Pulse is CSRF-protected, so wait for the boot-time CSRF token
	 * fetch before firing. After the first pulse the token is always
	 * set, so `whenCsrfReady()` resolves synchronously.
	 *
	 * @returns {void}
	 */
	verify()
	{
		whenCsrfReady().then(() =>
		{
			app.data.auth.xhr.pulse('', this.afterVerify.bind(this));
		});
	}

	/**
	 * Called after the verification process is complete.
	 *
	 * Pulse is a heartbeat, not an auth state transition, so the CRM
	 * backend never rotates the CSRF token here. The client keeps the
	 * boot-time token for the whole session, which keeps concurrent
	 * tabs working.
	 *
	 * @param {object} response
	 * @returns {void}
	 */
	afterVerify(response)
	{
		if (!response)
		{
			return;
		}

		if (response.allowAccess === true)
		{
			app.setUserData(response.user);
		}
		else
		{
			app.signOut();
		}
	}
}