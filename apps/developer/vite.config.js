import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { defineConfig } from 'vite';
import { generateUrls } from '../../infrastructure/config/domain.config.js';

// Generate URLs based on environment
const isDev = process.env.NODE_ENV !== 'production';
const urls = generateUrls(isDev);
const apiTarget = urls.api;
const BASE_URL = (isDev ? '/' : '/developer/');

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		{
			name: 'sse-proxy',
			configureServer(server) {
				server.middlewares.use('/api', (req, res, next) => {
					const accept = req.headers.accept || '';
					if (!accept.includes('text/event-stream')) {
						return next();
					}

					const proxy = createProxyMiddleware({
						target: apiTarget,
						changeOrigin: true,
						secure: false,
						selfHandleResponse: false,
						onProxyRes(proxyRes) {
							proxyRes.pipe(res);
						}
					});

					proxy(req, res, next);
				});
			}
		}
	],
	base: BASE_URL,
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, 'src/components'),
			'@pages': path.resolve(__dirname, 'src/components/pages'),
			'@shell': path.resolve(__dirname, 'src/shell'),
		}
	},
	server: {
		host: true,
		port: 3002,
		cors: true,
		open: true,
		...(fs.existsSync('../../infrastructure/docker/ssl/localhost.key') && fs.existsSync('../../infrastructure/docker/ssl/localhost.crt') ? {
			https: {
				key: fs.readFileSync('../../infrastructure/docker/ssl/localhost.key'),
				cert: fs.readFileSync('../../infrastructure/docker/ssl/localhost.crt'),
			}
		} : {}),
		proxy: {
			'/api': {
				target: apiTarget,
				changeOrigin: true,
				secure: false,
				ws: true
			},
			'/files': {
				target: apiTarget,
				changeOrigin: true,
				secure: false
			}
		}
	},
	build: {
		outDir: path.resolve(__dirname, '../../public/developer'),
		emptyOutDir: true
	},
	define: {
		'process.env.VITE_API_URL': JSON.stringify(apiTarget)
	}
});