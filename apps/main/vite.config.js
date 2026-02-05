import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
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

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		// HTTP/2 proxy plugin for API requests - removes 6 connection limit
		http2ProxyPlugin({
			apiTarget,
			paths: ['/api', '/files'],
			certPath: hasSSL ? sslCertPath : undefined
		})
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
	build: {
		outDir: path.resolve(__dirname, '../../public/main'),
		emptyOutDir: true
	},
	define: {
		'process.env.VITE_API_URL': JSON.stringify(apiTarget)
	}
});
