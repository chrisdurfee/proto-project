/**
 * PushController
 *
 * This class is responsible for handling push notifications.
 *
 * @class
 */
class PushController
{
	/**
	 * This will create a new instance of PushController.
	 *
	 * @constructor
	 * @param {string} title
	 */
	constructor(title)
	{
		this.title = title;
		this.addEvents();
	}

	/**
	 * This will get the options for the push notification.
	 *
	 * @param {object} event
	 * @returns {object}
	 */
	getOptions(event)
	{
		const icon = './images/icons/icon-512.png',
		badge = '/images/icons/badge.png',
		data = event.data.json();

		return {
			title: data.title || null,
			body: data.message,
			icon,
			badge,
			data
		};
	}

	/**
	 * This will add the events for the push notifications.
	 *
	 * @returns {void}
	 */
	addEvents()
	{
		/**
		 * This will be called when a push notification is received.
		 */
		self.addEventListener('push', (event) =>
		{
			const options = this.getOptions(event),
			title = options.title || this.title;

			event.waitUntil(self.registration.showNotification(title, options));
		});

		/**
		 * This will be called when a notification is clicked.
		 * If the notification has a URL, it will open a new window with that URL.
		 * If the notification does not have a URL, it will open a new window with the root URL.
		 * If the notification is clicked and the window is already open, it will focus the window.
		 */
		self.addEventListener('notificationclick', (event) =>
		{
			event.notification.close();

			const { url } = event.notification.data || {};
			const targetUrl = url || '/';

			event.waitUntil(
				clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) =>
				{
					const normalizedTarget = new URL(targetUrl, self.location.origin);

					for (const client of clientList)
					{
						const clientUrl = new URL(client.url);

						// If the app is already open in *any tab* (same origin)
						if (clientUrl.origin === self.location.origin)
						{
							// Focus it first
							client.focus();

							// If it’s not already at the right route, send a message to navigate
							if (clientUrl.pathname !== normalizedTarget.pathname)
							{
								client.postMessage({
									type: 'NAVIGATE_TO',
									url: normalizedTarget.pathname
								});
							}
							return;
						}
					}

					// If no existing tab found, open a new one
					return clients.openWindow(targetUrl);
				})
			);
		});
	}
}