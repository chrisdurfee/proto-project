import { Model } from "@base-framework/base";

/**
 * NotificationModel
 *
 * Frontend model for user notification operations.
 * Connects to /api/notification endpoints with custom
 * actions for SSE sync, read tracking, and dismissal.
 *
 * @type {typeof Model}
 */
export const NotificationModel = Model.extend({
	url: '/api/notification',

	xhr: {
		/**
		 * Open an SSE connection to receive live notification pushes.
		 * The server broadcasts on channel notification:user:{userId}.
		 *
		 * @param {object} instanceParams
		 * @param {function} callBack
		 * @param {function} [onOpenCallBack]
		 * @returns {EventSource}
		 */
		sync(instanceParams, callBack, onOpenCallBack)
		{
			return this.setupEventSource('/sync', '', callBack, onOpenCallBack);
		},

		/**
		 * Fetch the current unread notification count for the session user.
		 *
		 * @param {object} instanceParams
		 * @param {function} callBack
		 * @returns {XMLHttpRequest}
		 */
		unreadCount(instanceParams, callBack)
		{
			return this._get('/unread-count', {}, instanceParams, callBack);
		},

		/**
		 * Mark all notifications as read for the session user.
		 *
		 * @param {object} instanceParams
		 * @param {function} callBack
		 * @returns {XMLHttpRequest}
		 */
		markAllRead(instanceParams, callBack)
		{
			return this._post('/read-all', {}, instanceParams, callBack);
		},

		/**
		 * Mark a single notification as read.
		 *
		 * @param {object} instanceParams - Must include {id}
		 * @param {function} callBack
		 * @returns {XMLHttpRequest}
		 */
		markRead(instanceParams, callBack)
		{
			const { id } = instanceParams;
			return this._patch(`/${id}/read`, {}, instanceParams, callBack);
		},

		/**
		 * Dismiss (soft-delete) a single notification.
		 *
		 * @param {object} instanceParams - Must include {id}
		 * @param {function} callBack
		 * @returns {XMLHttpRequest}
		 */
		dismiss(instanceParams, callBack)
		{
			const { id } = instanceParams;
			return this._delete(`/${id}/dismiss`, {}, instanceParams, callBack);
		}
	}
});

export default NotificationModel;
