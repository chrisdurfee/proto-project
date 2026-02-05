/**
 * Vite HTTP/2 Proxy Plugin
 *
 * This plugin provides HTTP/2 proxy support for API requests,
 * which is not natively supported by Vite's http-proxy.
 *
 * HTTP/2 allows for multiplexed streams over a single connection,
 * removing the 6-connection limit per domain that exists with HTTP/1.1.
 * This is especially important for SSE (Server-Sent Events).
 */

import fs from 'node:fs';
import http2 from 'node:http2';
import { URL } from 'node:url';

/**
 * Creates an HTTP/2 proxy plugin for Vite
 *
 * @param {Object} options - Plugin options
 * @param {string} options.apiTarget - The target API URL (e.g., 'https://localhost:8443')
 * @param {string[]} options.paths - Array of paths to proxy (e.g., ['/api', '/files'])
 * @param {string} [options.certPath] - Path to SSL certificate for secure connections
 * @returns {import('vite').Plugin}
 */
export function http2ProxyPlugin(options)
{
	const { apiTarget, paths = ['/api', '/files'], certPath } = options;
	const targetUrl = new URL(apiTarget);

	// HTTP/2 client session (will be created on first request)
	let h2Session = null;
	let sessionPromise = null;
	let pingInterval = null;
	let isConnecting = false;

	/**
	 * Clean up the session and interval (but don't log - it's normal)
	 */
	function cleanupSession()
	{
		if (pingInterval)
		{
			clearInterval(pingInterval);
			pingInterval = null;
		}
		h2Session = null;
		sessionPromise = null;
		isConnecting = false;
	}

	/**
	 * Create a new HTTP/2 session
	 */
	function createSession()
	{
		return new Promise((resolve, reject) =>
		{
			const connectOptions = {
				rejectUnauthorized: false,
				// Request server to keep connection open longer
				settings: {
					enablePush: false,
					// Large initial window for better throughput
					initialWindowSize: 1024 * 1024
				}
			};

			// Add CA certificate if provided
			if (certPath && fs.existsSync(certPath))
			{
				connectOptions.ca = fs.readFileSync(certPath);
			}

			const session = http2.connect(apiTarget, connectOptions);

			// Note: Do NOT manipulate session.socket directly - HTTP/2 doesn't allow it

			session.on('connect', () =>
			{
				console.log(`[vite-http2-proxy] Connected to ${apiTarget}`);
				h2Session = session;
				isConnecting = false;

				// Keep-alive ping every 15 seconds (before typical server timeout)
				if (pingInterval)
				{
					clearInterval(pingInterval);
				}
				pingInterval = setInterval(() =>
				{
					if (session.closed || session.destroyed)
					{
						clearInterval(pingInterval);
						pingInterval = null;
						return;
					}

					session.ping((err) =>
					{
						if (err)
						{
							// Silent reconnect on next request
							cleanupSession();
						}
					});
				}, 15000);

				resolve(session);
			});

			session.on('error', (err) =>
			{
				// Only log actual errors, not normal closes
				if (err.code !== 'ECONNRESET' && err.code !== 'ERR_HTTP2_GOAWAY_SESSION')
				{
					console.error('[vite-http2-proxy] Session error:', err.message);
				}
				cleanupSession();
				reject(err);
			});

			session.on('close', () =>
			{
				// Silent cleanup - reconnect will happen on next request
				cleanupSession();
			});

			session.on('goaway', (errorCode, lastStreamID, opaqueData) =>
			{
				// GOAWAY is normal - server is closing, we'll reconnect on next request
				cleanupSession();
			});

			// Connection timeout
			const timeout = setTimeout(() =>
			{
				if (!session.connected)
				{
					session.destroy();
					cleanupSession();
					reject(new Error('HTTP/2 connection timeout'));
				}
			}, 10000);

			session.once('connect', () => clearTimeout(timeout));
		});
	}

	/**
	 * Get or create HTTP/2 session
	 */
	async function getSession()
	{
		// Return existing healthy session
		if (h2Session && !h2Session.closed && !h2Session.destroyed)
		{
			return h2Session;
		}

		// Wait for in-progress connection
		if (sessionPromise)
		{
			return sessionPromise;
		}

		// Create new session
		isConnecting = true;
		sessionPromise = createSession();

		try
		{
			const session = await sessionPromise;
			sessionPromise = null;
			return session;
		}
		catch (err)
		{
			sessionPromise = null;
			throw err;
		}
	}

	/**
	 * Check if a path should be proxied
	 */
	function shouldProxy(pathname)
	{
		return paths.some(p => pathname.startsWith(p));
	}

	/**
	 * Proxy a request using HTTP/2
	 */
	async function proxyRequest(req, res)
	{
		let stream = null;

		try
		{
			const session = await getSession();

			// Check if request has a body
			const hasBody = !!(req.headers['content-length'] || req.headers['transfer-encoding']);

			// Build headers for upstream request
			const headers = {
				':method': req.method,
				':path': req.url,
				':authority': targetUrl.host,
				':scheme': targetUrl.protocol.replace(':', '')
			};

			// Copy relevant headers from incoming request
			const skipHeaders = ['host', 'connection', 'upgrade', 'http2-settings', 'keep-alive', 'transfer-encoding'];
			for (const [key, value] of Object.entries(req.headers))
			{
				if (!skipHeaders.includes(key.toLowerCase()) && !key.startsWith(':'))
				{
					headers[key] = value;
				}
			}

			// Create HTTP/2 request stream
			// endStream: false means we'll send a body (or call stream.end() later)
			stream = session.request(headers, { endStream: !hasBody });

			// Handle client disconnect - close the upstream stream
			res.on('close', () =>
			{
				if (stream && !stream.closed && !stream.destroyed)
				{
					stream.close();
				}
			});

			// Handle response headers
			stream.on('response', (responseHeaders) =>
			{
				const status = responseHeaders[':status'];

				// Build response headers (exclude HTTP/2 pseudo-headers)
				const outHeaders = {};
				for (const [key, value] of Object.entries(responseHeaders))
				{
					if (!key.startsWith(':'))
					{
						outHeaders[key] = value;
					}
				}

				// Write response head
				res.writeHead(status, outHeaders);
			});

			// Pipe response data
			stream.on('data', (chunk) =>
			{
				// For SSE, ensure immediate flushing
				if (!res.writableEnded)
				{
					res.write(chunk);
					if (typeof res.flush === 'function')
					{
						res.flush();
					}
				}
			});

			stream.on('end', () =>
			{
				if (!res.writableEnded)
				{
					res.end();
				}
			});

			stream.on('error', (err) =>
			{
				// NGHTTP2_CANCEL (0x8) is normal when client disconnects
				// NGHTTP2_PROTOCOL_ERROR can happen on timing issues
				if (err.code === 'ERR_HTTP2_STREAM_CANCEL' ||
					err.message?.includes('NGHTTP2_PROTOCOL_ERROR'))
				{
					return;
				}
				// Ignore write after end errors - timing issue with stream closing
				if (err.message?.includes('write after end'))
				{
					return;
				}
				console.error('[vite-http2-proxy] Stream error:', err.message);
				if (!res.headersSent)
				{
					res.writeHead(502, { 'Content-Type': 'text/plain' });
				}
				if (!res.writableEnded)
				{
					res.end('Bad Gateway');
				}
			});

			// Pipe request body if present (endStream was set to false above)
			if (hasBody)
			{
				req.pipe(stream);
			}
			// If no body, endStream: true was set, so stream is already ended
		}
		catch (err)
		{
			console.error('[vite-http2-proxy] Proxy error:', err.message);
			if (!res.headersSent)
			{
				res.writeHead(502, { 'Content-Type': 'text/plain' });
			}
			if (!res.writableEnded)
			{
				res.end('Bad Gateway: ' + err.message);
			}
		}
	}

	return {
		name: 'vite-http2-proxy',

		configureServer(server)
		{
			// Add middleware before Vite's proxy
			server.middlewares.use((req, res, next) =>
			{
				const pathname = req.url?.split('?')[0] || '';

				if (shouldProxy(pathname))
				{
					// Handle the request with HTTP/2 proxy
					proxyRequest(req, res);
				}
				else
				{
					next();
				}
			});

			// Cleanup on server close
			server.httpServer?.on('close', () =>
			{
				cleanupSession();
				if (h2Session && !h2Session.destroyed)
				{
					h2Session.close();
				}
			});
		}
	};
}

export default http2ProxyPlugin;
