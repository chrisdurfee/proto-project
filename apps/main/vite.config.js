import path from 'path';
import { defineConfig } from 'vite';
import { generateUrls } from '../../domain.config.js';

// Generate URLs based on environment
const isDev = process.env.NODE_ENV !== 'production';
const urls = generateUrls(isDev);
const apiTarget = urls.api;

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [],
	base: '/', // Changed for subdomain serving
	resolve: {
		alias: {
			'@common': path.resolve(__dirname, '../common'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@modules': path.resolve(__dirname, 'src/modules'),
			'@shell': path.resolve(__dirname, 'src/shell'),
		}
	},
	server: {
		host: 'localhost',
		port: 3000,
		cors: true,
		proxy: {
			'/api': {
				target: apiTarget,
				changeOrigin: true,
				secure: false
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
