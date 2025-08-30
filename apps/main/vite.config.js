import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import { generateUrls } from '../../infrastructure/config/domain.config.js';

// Generate URLs based on environment
const isDev = process.env.NODE_ENV !== 'production';
const urls = generateUrls(isDev);
const apiTarget = urls.api;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss()
	],
	base: '/', // Changed for subdomain serving
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
		proxy: {
			'/api': {
				target: apiTarget,
				changeOrigin: true,
				secure: false,
				ws: true
			}
		}
	},
	build: {
		outDir: path.resolve(__dirname, '../../public/main'),
		emptyOutDir: true
	},
	define: {
		'process.env.VITE_API_URL': JSON.stringify(apiTarget)
	}
});
