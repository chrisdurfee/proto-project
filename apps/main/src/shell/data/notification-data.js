import { Data } from "@base-framework/base";
import { NotificationModel } from "../models/notification-model.js";

/**
 * NotificationData
 *
 * Global singleton that owns the notification state for the signed-in user.
 * It holds the reactive unread count, manages a single shared SSE connection,
 * and broadcasts incoming notifications to registered page-level listeners.
 *
 * Lifecycle:
 *   AppController.signIn()  → this.setup()   (guarded: no-op if already connected)
 *   AppContent resume       → this.setup()   (guarded: no-op if already connected)
 *   AppController.signOut() → this.teardown() (closes SSE, resets state)
 *
 * Consumers:
 *   NotificationBadge  — reads data.unreadCount for reactive display
 *   ActivityPage       — registers an onNew listener for live list updates
 *
 * @class
 */
export class NotificationData
{
	/**
	 * Reactive store holding the unread notification count.
	 *
	 * @type {Data}
	 */
	data = null;

	/**
	 * Model instance used for API calls and the SSE connection.
	 *
	 * @type {object|null}
	 */
	model = null;

	/**
	 * Active SSE handle returned by model.xhr.sync().
	 *
	 * @type {object|null}
	 */
	eventSource = null;

	/**
	 * Listeners notified when new notifications arrive via SSE.
	 *
	 * @type {Array<function>}
	 */
	_listeners = [];

	/**
	 * Initialise the reactive data store and model.
	 */
	constructor()
	{
		this.data = new Data({ unreadCount: 0 });
		this.model = new NotificationModel();
	}

	/**
	 * Start the SSE connection and load the initial unread count.
	 * Skips if a connection is already active to prevent duplicate streams.
	 *
	 * @returns {void}
	 */
	setup()
	{
		if (this.eventSource)
		{
			return;
		}

		this.fetchUnreadCount();
		this.startSync();
	}

	/**
	 * Close the SSE connection and reset the unread count to zero.
	 *
	 * @returns {void}
	 */
	teardown()
	{
		if (this.eventSource)
		{
			this.eventSource.close();
			this.eventSource = null;
		}

		this.data.unreadCount = 0;
	}

	/**
	 * Register a listener that receives arrays of new notifications as they arrive via SSE.
	 *
	 * @param {function} fn
	 * @returns {void}
	 */
	onNew(fn)
	{
		this._listeners.push(fn);
	}

	/**
	 * Unregister a previously registered listener.
	 *
	 * @param {function} fn
	 * @returns {void}
	 */
	offNew(fn)
	{
		this._listeners = this._listeners.filter(l => l !== fn);
	}

	/**
	 * Decrement the unread count by the given amount, flooring at zero.
	 *
	 * @param {number} [count=1]
	 * @returns {void}
	 */
	decrementUnread(count = 1)
	{
		this.data.unreadCount = Math.max(0, this.data.unreadCount - count);
	}

	/**
	 * Reset the unread count to zero (e.g. after mark-all-read).
	 *
	 * @returns {void}
	 */
	clearUnread()
	{
		this.data.unreadCount = 0;
	}

	/**
	 * Fetch the current unread notification count from the API.
	 *
	 * @protected
	 * @returns {void}
	 */
	fetchUnreadCount()
	{
		this.model.xhr.unreadCount({}, (response) =>
		{
			if (response && response.success)
			{
				this.data.unreadCount = response.count ?? 0;
			}
		});
	}

	/**
	 * Open the SSE connection and process incoming notification pushes.
	 *
	 * @protected
	 * @returns {void}
	 */
	startSync()
	{
		this.eventSource = this.model.xhr.sync({}, (response) =>
		{
			if (!response || !Array.isArray(response.merge))
			{
				return;
			}

			const items = response.merge;
			this.data.unreadCount = this.data.unreadCount + items.length;
			this._broadcast(items);
		});
	}

	/**
	 * Deliver new notification items to all registered listeners.
	 *
	 * @protected
	 * @param {Array} items
	 * @returns {void}
	 */
	_broadcast(items)
	{
		this._listeners.forEach(fn => fn(items));
	}
}

export default NotificationData;
