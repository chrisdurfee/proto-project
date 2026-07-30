
/**
 * Service
 *
 * This will create a service for a service worker.
 *
 * @class
 */
class Service
{
	/**
	 * This will create a new service.
	 *
	 * @param {string} prefix
	 * @param {Array<string>} files
	 * @param {string} [version]
	 */
	constructor(prefix, files = [], version = '')
	{
		/**
		 * @member {CacheController} cache
		 */
		this.cache = new CacheController(prefix);

		/**
		 * @member {Array<string>} files
		 */
		this.files = files;

		/**
		 * @member {string} version
		 */
		this.version = version;

		this.addEvents();
	}

	/**
	 * @member {string} dataUri
	 */
	dataUri = '/api/';

	/**
	 * @member {Array<string>} fontHosts
	 */
	fontHosts = ['fonts.googleapis.com', 'fonts.gstatic.com'];

	/**
	 * This will check if the request is a data request.
	 *
	 * @param {string} url
	 * @returns {boolean}
	 */
	isDataRequest(url = '')
	{
		return (url.indexOf(this.dataUri) > -1);
	}

	/**
	 * This will check if the request targets a Google Fonts host.
	 *
	 * @param {URL} url
	 * @returns {boolean}
	 */
	isFontRequest(url)
	{
		return this.fontHosts.indexOf(url.hostname) > -1;
	}

	/**
	 * This will disable navigation preload. The shell is served
	 * cache-first, so an unconsumed preload response only produces
	 * "preload cancelled" warnings. Disabling is idempotent and clears
	 * any preload enabled by a previously activated worker version.
	 *
	 * @returns {Promise}
	 */
	disableNavigationPreload()
	{
		if (self.registration.navigationPreload)
		{
			return self.registration.navigationPreload.disable().catch(() => {});
		}

		return Promise.resolve();
	}

	/**
	 * This will add the events for the service worker.
	 *
	 * @returns {void}
	 */
	addEvents()
	{
		self.addEventListener('install', (e) =>
		{
			self.skipWaiting();

			e.waitUntil(
				this.cache.addFiles(this.files)
			);
		});

		self.addEventListener('activate', (e) =>
		{
			e.waitUntil(
				this.disableNavigationPreload()
					.then(() => this.cache.refresh())
					.then(() =>
				{
					if (this.version)
					{
						return this.cache.notifyClients({
							type: 'SW_READY',
							version: this.version
						});
					}
				}).then(() => self.clients.claim())
			);
		});

		self.addEventListener('message', (e) =>
		{
			if (e.data === 'delete')
			{
				this.cache.deleteFiles();
				return;
			}

			if (e.data?.type === 'GET_VERSION' && this.version)
			{
				const client = e.source;
				if (client)
				{
					client.postMessage({
						type: 'SW_READY',
						version: this.version
					});
				}
			}
		});

		self.addEventListener('fetch', (e) =>
		{
			const request = e.request;

			/**
			 * Only GET requests are cacheable.
			 */
			if (request.method !== 'GET')
			{
				return;
			}

			/**
			 * Never intercept API/data requests — these must always hit
			 * the network so auth and freshness are preserved.
			 */
			if (this.isDataRequest(request.url))
			{
				return;
			}

			const url = new URL(request.url);

			/**
			 * Ignore non-http(s) schemes (chrome-extension, etc.).
			 */
			if (url.protocol !== 'http:' && url.protocol !== 'https:')
			{
				return;
			}

			/**
			 * Google Fonts: stale-while-revalidate into a persistent
			 * font cache so type renders instantly and works offline.
			 */
			if (this.isFontRequest(url))
			{
				e.respondWith(this.cache.staleWhileRevalidate(this.cache.fontCacheName, request));
				return;
			}

			/**
			 * Let the network handle any other cross-origin request.
			 */
			if (url.origin !== self.location.origin)
			{
				return;
			}

			/**
			 * Shell navigations: cached shell immediately, refresh in the
			 * background, fall back to the cached shell when offline.
			 */
			if (request.mode === 'navigate')
			{
				e.respondWith(this.cache.fetchNavigate(e));
				return;
			}

			/**
			 * Same-origin static assets (hashed JS/CSS, images, icons):
			 * cache-first for the fastest repeat loads.
			 */
			e.respondWith(this.cache.fetchFile(e));
		});
	}
}
