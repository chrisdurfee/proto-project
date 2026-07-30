import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { defineConfig } from 'vite';
import { generateUrls } from '../../infrastructure/config/domain.config.js';
import { http2ProxyPlugin } from '../../infrastructure/config/vite-http2-proxy-plugin.js';

// Generate URLs based on environment
const isDev = process.env.NODE_ENV !== 'production';
const urls = generateUrls(isDev);
const apiTarget = urls.api;
const BASE_URL = (isDev ? '/' : '/main/');

// SSL certificate paths
const sslKeyPath = '../../infrastructure/docker/ssl/localhost.key';
const sslCertPath = '../../infrastructure/docker/ssl/localhost.crt';
const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

/**
 * Stamp the service worker version on every production build.
 *
 * The shell and hashed chunks are served cache-first by the worker, so
 * the ONLY thing that invalidates them is a new `version` value in
 * sw.js. Stamping it automatically (package version + build time)
 * guarantees every deploy installs a fresh worker and purges stale
 * shells — a manual bump can no longer be forgotten.
 *
 * @param {string} outDir
 * @returns {object}
 */
const stampServiceWorker = (outDir) => ({
	name: 'stamp-service-worker',
	apply: 'build',
	closeBundle()
	{
		const swPath = path.join(outDir, 'sw.js');
		if (fs.existsSync(swPath) === false)
		{
			return;
		}

		const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));
		const stamp = `${pkg.version}-${Date.now().toString(36)}`;
		const source = fs.readFileSync(swPath, 'utf8');
		const stamped = source.replace(/version = '[^']*'/, `version = '${stamp}'`);
		if (stamped === source)
		{
			throw new Error('stamp-service-worker: version assignment not found in sw.js');
		}

		fs.writeFileSync(swPath, stamped);
		console.log(`[stamp-service-worker] sw.js version → ${stamp}`);
	}
});

/**
 * Pre-compress emitted text assets with max-quality brotli and gzip.
 *
 * Apache's mod_brotli/mod_deflate compress on every request at a low
 * quality level to stay fast. Doing it once at build time (brotli q11,
 * gzip 9) yields ~15-20% smaller transfers and zero runtime CPU — the
 * server just sends the sibling .br/.gz file.
 *
 * @param {string} outDir
 * @returns {object}
 */
const precompressAssets = (outDir) => ({
	name: 'precompress-assets',
	apply: 'build',
	closeBundle()
	{
		const extensions = ['.js', '.css', '.html', '.svg', '.json', '.webmanifest'];
		const minSize = 1024;
		let count = 0;

		const walk = (dir) =>
		{
			for (const entry of fs.readdirSync(dir, { withFileTypes: true }))
			{
				const full = path.join(dir, entry.name);
				if (entry.isDirectory())
				{
					walk(full);
					continue;
				}

				if (extensions.includes(path.extname(entry.name)) === false)
				{
					continue;
				}

				// A file listed by readdirSync can disappear before we read it
				// when a second build / watcher races this one and empties the
				// out dir. Skip it rather than throwing a misleading ENOENT that
				// masks the real (earlier) build error.
				let source;
				try
				{
					source = fs.readFileSync(full);
				}
				catch (error)
				{
					if (error.code === 'ENOENT')
					{
						continue;
					}
					throw error;
				}

				if (source.length < minSize)
				{
					continue;
				}

				fs.writeFileSync(`${full}.br`, zlib.brotliCompressSync(source, {
					params: {
						[zlib.constants.BROTLI_PARAM_QUALITY]: 11,
						[zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length
					}
				}));
				fs.writeFileSync(`${full}.gz`, zlib.gzipSync(source, { level: 9 }));
				count++;
			}
		};

		walk(outDir);
		console.log(`[precompress-assets] ${count} files compressed (.br + .gz)`);
	}
});

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		// HTTP/2 proxy plugin for API requests - removes 6 connection limit
		http2ProxyPlugin({
			apiTarget,
			paths: ['/api', '/files'],
			certPath: hasSSL ? sslCertPath : undefined
		}),
		stampServiceWorker(path.resolve(__dirname, '../../public/main')),
		precompressAssets(path.resolve(__dirname, '../../public/main'))
	],
	base: BASE_URL,
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, 'src/components'),
			'@pages': path.resolve(__dirname, 'src/components/pages'),
			'@modules': path.resolve(__dirname, 'src/modules'),
			'@shell': path.resolve(__dirname, 'src/shell'),
		}
	},
	server: {
		host: true,
		port: 3000,
		cors: true,
		open: true,
		...(hasSSL ? {
			https: {
				key: fs.readFileSync(sslKeyPath),
				cert: fs.readFileSync(sslCertPath),
			}
		} : {})
		// Note: Proxy is handled by http2ProxyPlugin above
	},
	optimizeDeps: {
		include: ['mapbox-gl']
	},
	esbuild: {
		// Strip debugger statements and tree-shake noisy dev logging from
		// production builds. console.error / console.warn are intentionally
		// kept so production diagnostics (bootstrap errors, SW failures) survive.
		drop: ['debugger'],
		pure: ['console.log', 'console.debug', 'console.info']
	},
	build: {
		outDir: path.resolve(__dirname, '../../public/main'),
		emptyOutDir: true,
		rollupOptions: {
			output: {
				/**
				 * Isolate the always-loaded core framework runtime into a
				 * stable, long-cached vendor chunk so app-code deploys do not
				 * bust it (and vice-versa). ui/organisms are intentionally
				 * left out so they keep splitting per-page — that keeps unused
				 * components out of the initial load.
				 */
				manualChunks(id)
				{
					if (id.includes('node_modules/@base-framework/base')
						|| id.includes('node_modules/@base-framework/atoms'))
					{
						return 'base-framework';
					}
				}
			}
		}
	},
	define: {
		'process.env.VITE_API_URL': JSON.stringify(apiTarget)
	}
});
