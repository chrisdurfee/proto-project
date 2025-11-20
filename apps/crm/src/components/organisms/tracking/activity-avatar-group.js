import { Div } from '@base-framework/atoms';
import { Component, Data, Jot } from '@base-framework/base';
import { Avatar } from '@base-framework/ui/molecules';
import { getSavedToken } from '../../../csrf-token';
import { Env } from '../../../shell/env.js';
import { ActivityModel } from './activity-model.js';

/**
 * Activity States
 */
const STATES = {
	ACTIVE: 'active',
	INACTIVE: 'inactive'
};

/**
 * Configuration constants
 */
const API_ENDPOINT = '/api/tracking/activity/type';

/**
 * This will send a request with keep alive.
 *
 * @param {string} url
 * @param {URLSearchParams} params
 * @returns {Promise<Response>}
 */
const sendRequest = (url, params) =>
{
	const token = getSavedToken();

	return fetch(url, {
		method: 'DELETE',
		body: params,
		headers: {
			'Content-type': 'application/x-www-form-urlencoded',
			'CSRF-TOKEN': token
		},
		keepalive: true
	});
};

/**
 * Removes a user from the activity.
 *
 * @param {object} data
 * @returns void
 */
const removeUser = (data) =>
{
	const params = new URLSearchParams({
		op: 'deleteUserByType',
		type: data.type,
		refId: data.refId,
		userId: data.userId
	});

	sendRequest(API_ENDPOINT, params);
};

/**
 * This will create a user container.
 *
 * @param {object} props
 * @returns {object}
 */
const UserContainer = (props) => Div({ class: 'user' }, [
	Avatar({
		src: `/files/users/profile/${props.image}`,
		alt: props.displayName,
		fallbackText: props.displayName,
		size: 'sm'
	})
]);

/**
 * This will create a group.
 *
 * @returns {object}
 */
const Group = () => Div({
	class: 'flex gap-x-2 mx-2 items-center',
	for: ['rows', UserContainer]
});

/**
 * Activity Avatar Group
 *
 * Manages and displays active users viewing a resource using SSE.
 *
 * @property {string} type - Resource type
 * @property {string|number} refId - Resource reference ID
 * @property {string|number} userId - Current user ID
 * @type {typeof Component}
 */
export const ActivityAvatarGroup = Jot(
{
	/**
	 * This will run when the component is created.
	 *
	 * @returns {void}
	 */
	onCreated()
	{
		// @ts-ignore
		this.eventSource = null;
	},

	/**
	 * This will set up the data.
	 *
	 * @returns {Data}
	 */
	setData()
	{
		return new ActivityModel({
			// @ts-ignore
			type: this.type,
			// @ts-ignore
			refId: this.refId,
			// @ts-ignore
			userId: this.userId,
			rows: []
		});
	},

	/**
	 * This will set up the states.
	 *
	 * @returns {object}
	 */
	state()
	{
		return {
			status: {
				value: STATES.INACTIVE,
				callBack: (value) =>
				{
					if (value === STATES.ACTIVE)
					{
						// @ts-ignore
						this.addUser();
						return;
					}

					if (value === STATES.INACTIVE)
					{
						// @ts-ignore
						this.removeUser();
					}
				}
			}
		};
	},

	/**
	 * This will set up the events.
	 *
	 * @returns {Array}
	 */
	events()
	{
		const handleVisibilityChange = () =>
		{
			const isVisible = document.visibilityState === 'visible';
			// @ts-ignore
			isVisible ? this.setActive() : this.setInactive();
		};

		const handleBeforeUnload = () =>
		{
			// @ts-ignore
			this.removeUser();
		};

		const events = [
			['visibilitychange', document, handleVisibilityChange],
			['beforeunload', window, handleBeforeUnload]
		];

		if (Env.isSafari)
		{
			const handlePageShow = (e) =>
			{
				if (!e.persisted)
				{
					// @ts-ignore
					this.setActive();
				}
			};

			const handlePageHide = (e) =>
			{
				if (!e.persisted)
				{
					// @ts-ignore
					this.setInactive();
				}
			};

			events.push(
				// @ts-ignore
				['pageshow', window, handlePageShow],
				['pagehide', window, handlePageHide]
			);
		}

		return events;
	},

	/**
	 * Start listening to real-time activity updates via SSE.
	 *
	 * @param {function} onConnected - Callback when connection is established.
	 * @returns {void}
	 */
	startSync(onConnected)
	{
		// @ts-ignore
		this.eventSource = this.data.xhr.sync('', (response) =>
		{
			if (!response?.rows)
			{
				return;
			}

			// @ts-ignore
			this.data.rows = response.rows;
		}, onConnected);
	},

	/**
	 * Stop listening to activity updates.
	 *
	 * @returns {void}
	 */
	stopSync()
	{
		// @ts-ignore
		if (this.eventSource)
		{
			// @ts-ignore
			this.eventSource.close();
			// @ts-ignore
			this.eventSource = null;
		}
	},

	/**
	 * Updates the activity status.
	 *
	 * @param {string} status
	 * @returns {void}
	 */
	updateStatus(status)
	{
		// @ts-ignore
		this.state.status = status;
	},

	/**
	 * Sets the activity to active and starts syncing.
	 * First starts SSE to subscribe, then adds user so publish will be received.
	 *
	 * @returns {void}
	 */
	setActive()
	{
		// Start SSE sync and wait for connection to open
		// @ts-ignore
		this.startSync(() =>
		{
			// Connection established, now add the user
			// @ts-ignore
			this.updateStatus(STATES.ACTIVE);
		});
	},

	/**
	 * Sets the activity to inactive and stops syncing.
	 *
	 * @returns {void}
	 */
	setInactive()
	{
		// @ts-ignore
		this.updateStatus(STATES.INACTIVE);
		// @ts-ignore
		this.stopSync();
	},

	/**
	 * Adds the current user to the activity list.
	 *
	 * @returns {void}
	 */
	addUser()
	{
		// @ts-ignore
		this.data.xhr.add('', () => {
			// User added, SSE will push the updated list
		});
	},

	/**
	 * Removes the current user from the activity list.
	 *
	 * @returns {void}
	 */
	removeUser()
	{
		// @ts-ignore
		const data = this.data.get();
		removeUser(data);
	},

	/**
	 * This will run after the component is set up.
	 *
	 * @returns {void}
	 */
	after()
	{
		// @ts-ignore
		this.setActive();
	},

	/**
	 * This will render the component.
	 *
	 * @returns {object}
	 */
	render()
	{
		return Group();
	},

	/**
	 * This will run before the component is destroyed.
	 *
	 * @returns {void}
	 */
	destroy()
	{
		// @ts-ignore
		this.setInactive();
	}
});