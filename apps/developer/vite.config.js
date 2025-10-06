import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
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
		tailwindcss()
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
		https: {
			key: fs.readFileSync('../../infrastructure/docker/ssl/localhost.key'),
			cert: fs.readFileSync('../../infrastructure/docker/ssl/localhost.crt'),
		},
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