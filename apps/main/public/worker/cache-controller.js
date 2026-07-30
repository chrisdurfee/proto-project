
/**
 * CacheController
 *
 * This will handle the caching of files and data.
 *
 * @class CacheController
 */
class CacheController
{
	/**
	 * This will set up the cache prefix.
	 *
	 * @param {string} prefix
	 */
	constructor(prefix)
	{
		this.cacheName = prefix;
		this.dataCacheName = prefix + '-data';

		/**
		 * The font cache is intentionally version-independent. Web fonts
		 * are large and immutable, so they should survive app updates
		 * instead of being re-downloaded on every version bump.
		 */
		this.fontCacheName = prefix.split('-')[0] + '-fonts';

		/**
		 * The media cache is also version-independent. User media files
		 * are immutable (uploads get unique generated filenames), so they
		 * should survive app updates instead of re-downloading on every
		 * deploy. It is bounded by trimMediaCache to keep storage in check.
		 */
		this.mediaCacheName = prefix.split('-')[0] + '-media';
		this.hasUpdate = false;
	}

	/**
	 * This will open the cache.
	 *
	 * @param {string} cacheName
	 * @param {function} callBack
	 * @returns {Promise}
	 */
	open(cacheName, callBack)
	{
		return caches.open(cacheName).then(callBack);
	}

	/**
	 * Whether a response is safe to store. Redirected, opaque, and
	 * partial (206) responses throw on Cache.put, so they are skipped.
	 *
	 * @param {Response} response
	 * @returns {boolean}
	 */
	isCacheable(response)
	{
		return !!response
			&& response.ok
			&& response.redirected === false
			&& response.type !== 'opaque'
			&& response.type !== 'opaqueredirect';
	}

	/**
	 * This will check if there is an update from
	 * the service worker version.
	 *
	 * @returns {void}
	 */
	checkUpdate()
	{
		if (this.hasUpdate === false)
		{
			this.hasUpdate = true;
			this.alert();
		}
	}

	/**
	 * This will send a message to the client side to notify the app
	 * has an update.
	 *
	 * @returns {void}
	 */
	alert()
	{
		this.notifyClients({ update: true });
	}

	/**
	 * Post a message to all open window clients.
	 *
	 * @param {object} message
	 * @returns {Promise}
	 */
	notifyClients(message)
	{
		return clients.matchAll({
			type: 'window',
			includeUncontrolled: true
		})
		.then((clientList) =>
		{
			clientList.forEach((client) => client.postMessage(message));
		});
	}

	/**
	 * This will add files to the cache.
	 *
	 * @param {array} files
	 * @returns {Promise}
	 */
	addFiles(files)
	{
		return this.open(this.cacheName, (cache) =>
		{
			/**
			 * Add each file individually so a single missing/404 asset
			 * does not abort the entire install (cache.addAll is atomic).
			 */
			return Promise.allSettled(files.map((file) => cache.add(file)));
		});
	}

	/**
	 * Stale-while-revalidate: respond from cache immediately when
	 * available while refreshing the entry from the network in the
	 * background. Falls back to the network on a cold cache. Used for
	 * the Google-hosted webfonts, which are cross-origin and cannot be
	 * precached at install time.
	 *
	 * @param {string} cacheName
	 * @param {Request} request
	 * @returns {Promise<Response>}
	 */
	staleWhileRevalidate(cacheName, request)
	{
		return caches.open(cacheName).then(async (cache) =>
		{
			const cached = await cache.match(request);
			const network = fetch(request).then((response) =>
			{
				if (this.isCacheable(response))
				{
					cache.put(request, response.clone()).catch(() => {});
				}
				return response;
			}).catch(() => null);

			return cached || network;
		});
	}

	/**
	 * This will delete files from the cache.
	 *
	 * @returns {void}
	 */
	deleteFiles()
	{
		caches.delete(this.cacheName).then((success) =>
		{

		});
	}

	/**
	 * This will add data to the cache.
	 *
	 * @param {string} key
	 * @param {*} data
	 * @returns {Promise}
	 */
	addData(key, data)
	{
		return this.open(this.dataCacheName, (cache) =>
		{
			return cache.put(key, data);
		});
	}

	/**
	 * This will remove data from the cache.
	 *
	 * @param {string} key
	 * @returns {Promise}
	 */
	removeData(key)
	{
		return this.open(this.dataCacheName, (cache) =>
		{
			return cache.delete(key);
		});
	}

	/**
	 * This will get data from the cache.
	 *
	 * @param {string} key
	 * @returns {Promise}
	 */
	fetchData(e)
	{
		const request = e.request,
		networkPromise = fetch(request);

		return caches.open(this.dataCacheName).then(async (cache) =>
		{
			const cachedResponse = await cache.match(request);
			const networkResponse = await networkPromise;
			cache.put(request, networkResponse.clone());

			return cachedResponse || networkPromise;
		});
	}

	/**
	 * Whether a cached response is a valid match for the request's
	 * destination. The Vite dev server can serve the same URL as CSS
	 * or as a JS style-injection module depending on the destination,
	 * so a cached response with the wrong content-type must be ignored
	 * and refetched with the correct (stylesheet/script) request.
	 *
	 * @param {Request} request
	 * @param {Response} response
	 * @returns {boolean}
	 */
	matchesDestination(request, response)
	{
		const destination = request.destination;
		if (destination !== 'style' && destination !== 'script')
		{
			return true;
		}

		const type = (response.headers.get('content-type') || '').toLowerCase();
		if (destination === 'style')
		{
			return type.indexOf('text/css') > -1;
		}

		return type.indexOf('javascript') > -1 || type.indexOf('ecmascript') > -1;
	}

	/**
	 * This will get files from the cache.
	 *
	 * @param {object} e
	 * @returns {Promise}
	 */
	fetchFile(e)
	{
		const request = e.request;
		return caches.open(this.cacheName).then(async (cache) =>
		{
			const cachedResponse = await cache.match(request);
			if (cachedResponse && this.matchesDestination(request, cachedResponse))
			{
				return cachedResponse;
			}

			/**
			 * Sub-resources (CSS/JS/images) must never fall back to the
			 * HTML shell — returning index.html for a stylesheet/script
			 * request breaks the page. Let the network result (or its
			 * failure) flow through unchanged.
			 */
			return fetch(request).then((response) =>
			{
				if (this.isCacheable(response))
				{
					cache.put(request, response.clone()).catch(() => {});
				}
				return response;
			});
		});
	}

	/**
	 * User media: cache-first into the version-independent media cache.
	 * Media files are immutable, so a cache hit never needs revalidation
	 * — this keeps repeat image loads instant and off the network. The
	 * cache is trimmed occasionally in the background (never blocking
	 * the response) so storage stays bounded.
	 *
	 * @param {object} e
	 * @returns {Promise<Response>}
	 */
	fetchMedia(e)
	{
		const request = e.request;
		return caches.open(this.mediaCacheName).then(async (cache) =>
		{
			const cached = await cache.match(request);
			if (cached)
			{
				return cached;
			}

			const response = await fetch(request);
			if (this.isCacheable(response))
			{
				cache.put(request, response.clone()).catch(() => {});

				/**
				 * Trim on roughly 1-in-20 cache writes, in the background
				 * via waitUntil. Enumerating cache keys is O(n) and was a
				 * measured source of progressive slowdown when done per
				 * request, so it must stay rare and off the response path.
				 */
				if (Math.random() < 0.05)
				{
					e.waitUntil(this.trimMediaCache(cache));
				}
			}
			return response;
		});
	}

	/**
	 * Delete the oldest media entries beyond the cap. Cache keys are
	 * returned in insertion order, so this is FIFO eviction.
	 *
	 * @param {Cache} cache
	 * @returns {Promise<void>}
	 */
	async trimMediaCache(cache)
	{
		const MAX_ENTRIES = 500;
		const keys = await cache.keys();
		const excess = keys.length - MAX_ENTRIES;

		for (let i = 0; i < excess; i++)
		{
			await cache.delete(keys[i]);
		}
	}

	/**
	 * Navigation: serve cached shell immediately when available, refresh in background.
	 *
	 * @param {object} e
	 * @returns {Promise<Response>}
	 */
	fetchNavigate(e)
	{
		const request = e.request;

		return caches.open(this.cacheName).then(async (cache) =>
		{
			const cached = await cache.match(request)
				|| await this.matchShellDocument(cache);

			/**
			 * Refresh the shell in the background. Only cacheable
			 * (basic, non-redirected, 200) responses are stored so a
			 * redirect/opaque response never triggers a Cache.put error.
			 */
			const networkPromise = fetch(request).then((response) =>
			{
				if (this.isCacheable(response))
				{
					cache.put(request, response.clone()).catch(() => {});
				}
				return response;
			});

			if (cached)
			{
				networkPromise.catch(() => {});
				return cached;
			}

			return networkPromise.catch(() => this.matchShellDocument(cache));
		});
	}

	/**
	 * Resolve index.html from precache keys (scope-relative paths vary).
	 *
	 * @param {Cache} cache
	 * @returns {Promise<Response|undefined>}
	 */
	async matchShellDocument(cache)
	{
		const keys = ['./index.html', 'index.html', './'];

		for (let i = 0; i < keys.length; i++)
		{
			const hit = await cache.match(keys[i]);
			if (hit)
			{
				return hit;
			}
		}

		return caches.match('./index.html');
	}

	/**
	 * This will refresh the cache.
	 *
	 * @returns {Promise}
	 */
	refresh()
	{
		const cacheName = this.cacheName,
		dataCacheName = this.dataCacheName,
		fontCacheName = this.fontCacheName,
		mediaCacheName = this.mediaCacheName;

		/**
		 * This will select all caches files.
		 */
		return caches.keys().then((keyList) =>
		{
			/**
			 * This will delete all caches files except the current caches.
			 * The font and media caches are preserved across versions on purpose.
			 */
			return Promise.all(keyList.map((key) =>
			{
				if (key !== cacheName && key !== dataCacheName && key !== fontCacheName && key !== mediaCacheName)
				{
					this.checkUpdate();
					return caches.delete(key);
				}
			}));
		});
	}
}
