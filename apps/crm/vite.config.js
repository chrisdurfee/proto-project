import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { generateUrls } from '../../infrastructure/config/domain.config.js';

// Generate URLs based on environment
const isDev = process.env.NODE_ENV !== 'production';
const urls = generateUrls(isDev);
const apiTarget = urls.api;
const BASE_URL = (isDev ? '/' : '/crm/');

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss()
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
		port: 3001,
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
				ws: true,
				bypass(req, res) {
					const accept = req.headers.accept || '';
					// Detect EventSource or Fetch('text/event-stream')
					if (accept.includes('text/event-stream')) {
						const target = `${apiTarget}${req.url}`;
						console.log('[vite] redirecting SSE to', target);
						res.writeHead(301, { Location: target });
						res.end();
						return false;
					}
				}
			},
			'/files': {
				target: apiTarget,
				changeOrigin: true,
				secure: false
			}
		}
	},
	build: {
		outDir: path.resolve(__dirname, '../../public/crm'),
		emptyOutDir: true
	},
	define: {
		'process.env.VITE_API_URL': JSON.stringify(apiTarget)
	}
});
