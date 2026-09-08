import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { generateUrls } from '../../infrastructure/config/domain.config.js';
import { http2ProxyPlugin } from '../../infrastructure/config/vite-http2-proxy-plugin.js';
import { preserveHashedAssets } from '../../infrastructure/config/vite-preserve-hashed-assets-plugin.js';

// Generate URLs based on environment
const isDev = process.env.NODE_ENV !== 'production';
const urls = generateUrls(isDev);
const apiTarget = urls.api;
const BASE_URL = (isDev ? '/' : '/crm/');

// SSL certificate paths
const sslKeyPath = '../../infrastructure/docker/ssl/localhost.key';
const sslCertPath = '../../infrastructure/docker/ssl/localhost.crt';
const hasSSL = fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath);

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
		preserveHashedAssets(path.resolve(__dirname, '../../public/crm'))
	],
	base: BASE_URL,
	resolve: {
		/**
		 * The framework packages export module-level singletons — `base`,
		 * `dataBinder`, `router` — and a directive registry populated by
		 * import-time side effects. A second module instance means a second
		 * data binder and directive registry, so elements built through one
		 * instance silently fail to bind or render through the other. There
		 * is no error; it surfaces as unexplained rendering bugs.
		 *
		 * atoms/organisms/ui declare base as a peer, so npm normally hoists
		 * one copy. dedupe is the guarantee: it pins these specifiers to the
		 * root-resolved copy even if a nested one ever appears.
		 */
		dedupe: [
			'@base-framework/base',
			'@base-framework/atoms',
			'@base-framework/organisms',
			'@base-framework/ui'
		],
		alias: {
			'@components': path.resolve(__dirname, 'src/components'),
			'@pages': path.resolve(__dirname, 'src/components/pages'),
			'@modules': path.resolve(__dirname, 'src/modules'),
			'@shell': path.resolve(__dirname, 'src/shell'),
		}
	},
	server: {
		host: true,
		port: 3001,
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
	esbuild: {
		// Strip debugger statements and tree-shake noisy dev logging from
		// production builds. console.error / console.warn are intentionally
		// kept so production diagnostics (bootstrap errors, SW failures) survive.
		drop: ['debugger'],
		pure: ['console.log', 'console.debug', 'console.info']
	},
	build: {
		outDir: path.resolve(__dirname, '../../public/crm'),
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
