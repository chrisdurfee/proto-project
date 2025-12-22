import { Events, Store as State } from "@base-framework/base";
import { Timer } from "@base-framework/organisms";
import { APP_STATE, STATES, STATE_ATTR } from "./state.js";

/**
 * Debounce
 *
 * Creates a debounced function that delays the execution of the callback
 * until after a specified wait time has elapsed since the last call.
 *
 * @param {function} callBack - The function to debounce.
 * @param {number} wait - The number of milliseconds to wait.
 * @returns {function} A debounced version of the callback.
 */
const debounce = function(callBack, wait = 200)
{
	let timer = null;

	return function(...args)
	{
		window.clearTimeout(timer);
		timer = window.setTimeout(() =>
		{
			callBack.apply(null, args);
		}, wait);
	};
};

/**
 * ActionTimer
 *
 * Tracks user activity and updates their status based on app usage.
 *
 * @type {object} ActionTimer
 * @constant
 */
export const ActionTimer =
{
	/**
	 * @private
	 * @type {boolean}
	 */
	isInitialized: false,

	/**
	 * @private
	 * @type {object|null}
	 */
	stateWatcher: null,

	/**
	 * @private
	 * @type {function|null}
	 */
	resetHandler: null,

	/**
	 * Sets up the ActionTimer by initializing the state and activity events.
	 *
	 * @param {object} userData - The user data object.
	 * @param {number} [duration=900000] - Inactivity duration in ms (default: 15 minutes).
	 * @returns {void}
	 */
	setup(userData, duration = 900000)
	{
		if (this.isInitialized)
		{
			return;
		}

		this.userData = userData;
		this.timer = new Timer(duration, this.setAsAway.bind(this));

		this.setupEvents();
		this.setupState();

		this.isInitialized = true;
	},

	/**
	 * Initializes the global state for tracking user status and
	 * binds it to app user data.
	 *
	 * @returns {void}
	 */
	setupState()
	{
		const state = (this.state = State.add(APP_STATE, STATE_ATTR));

		// Watch for changes to the user's status in the state
		this.stateWatcher = (value) =>
		{
			this.checkMode(value);
		};
		state.on(STATE_ATTR, this.stateWatcher);

		// Set the default state value from user data
		const user = this.userData;
		const USER_STATUS = user.status || STATES.OFFLINE;
		state.set(STATE_ATTR, USER_STATUS);

		// Link state and user data for two-way binding
		if (user.link)
		{
			user.link(state, STATE_ATTR, 'status');
		}
	},

	/**
	 * Starts or stops tracking based on the user's current state.
	 *
	 * @param {string} state - The current state of the user.
	 * @returns {void}
	 */
	checkMode(state)
	{
		switch (state)
		{
			case STATES.ONLINE:
			case STATES.AWAY:
				this.start();
				break;
			default:
				// If user is offline or busy, we stop the timer by default
				this.stop();
				break;
		}
	},

	/**
	 * Configures activity tracking events (e.g., mouse movements, key presses).
	 *
	 * @returns {void}
	 */
	setupEvents()
	{
		this.resetHandler = debounce(this.reset.bind(this));

		this.events = [
			[['mousemove', 'mousedown', 'keyup', 'touchend'], document, this.resetHandler],
			[['pageshow', 'focus'], window, this.resetHandler],
		];

		this.on = () =>
		{
			if (!this.events) return;

			for (let i = 0; i < this.events.length; i++)
			{
				const [eventNames, target, handler] = this.events[i];
				// @ts-ignore
				Events.on(eventNames, target, handler);
			}
		};

		this.off = () =>
		{
			if (!this.events) return;

			for (let i = 0; i < this.events.length; i++)
			{
				const [eventNames, target, handler] = this.events[i];
				// @ts-ignore
				Events.off(eventNames, target, handler);
			}
		};
	},

	/**
	 * Updates the user's state.
	 *
	 * @param {string} state - The new state to set.
	 * @returns {void}
	 */
	setState(state)
	{
		if (!this.state)
		{
			console.warn('ActionTimer: Cannot set state - not initialized');
			return;
		}
		this.state.set(STATE_ATTR, state);
	},

	/**
	 * Sets the user's status to "away."
	 *
	 * @returns {void}
	 */
	setAsAway()
	{
		this.setState(STATES.AWAY);
	},

	/**
	 * Sets the user's status to "online."
	 *
	 * @returns {void}
	 */
	setAsOnline()
	{
		if (!this.state) return;

		const currentState = this.state.get(STATE_ATTR);
		if (currentState !== STATES.BUSY)
		{
			this.setState(STATES.ONLINE);
		}
	},

	/**
	 * Starts tracking activity by enabling events and starting the timer.
	 *
	 * @returns {void}
	 */
	start()
	{
		if (!this.timer || !this.on) return;

		this.on();
		this.timer.start();
	},

	/**
	 * Resets the activity timer and sets the user's status to "online."
	 *
	 * @returns {void}
	 */
	reset()
	{
		// Don't reset if page is hidden (user switched to another tab)
		if (document.hidden)
		{
			return;
		}

		if (!this.state || !this.timer) return;

		const currentState = this.state.get(STATE_ATTR);
		if (currentState !== STATES.BUSY)
		{
			this.setAsOnline();
		}
		this.timer.start();
	},

	/**
	 * Stops tracking activity by disabling events and stopping the timer.
	 *
	 * @returns {void}
	 */
	stop()
	{
		if (this.off)
		{
			this.off();
		}
		if (this.timer)
		{
			this.timer.stop();
		}
	},

	/**
	 * Cleans up event listeners and timers.
	 *
	 * @returns {void}
	 */
	destroy()
	{
		this.stop();

		// Remove state watcher
		if (this.state && this.stateWatcher)
		{
			this.state.off(STATE_ATTR, this.stateWatcher);
			this.stateWatcher = null;
		}

		// Clean up references
		this.timer = null;
		this.state = null;
		this.userData = null;
		this.events = null;
		this.resetHandler = null;
		this.on = null;
		this.off = null;
		this.isInitialized = false;
	},
};