import path from 'path';
import { defineConfig } from 'vite';
import { Configs } from './src/configs.js';

// Use environment variable for API URL in containers
const apiTarget = process.env.VITE_API_URL || 'http://localhost:8080';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [],
	base: Configs.router.baseUrl,
	resolve: {
		alias: {
			'@common': path.resolve(__dirname, '../common'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@modules': path.resolve(__dirname, 'src/modules'),
			'@shell': path.resolve(__dirname, 'src/shell'),
		}
	},
	server: {
		host: '0.0.0.0',
		port: 3000,
		cors: true,
		watch: {
			usePolling: false,
			ignored: ['**/node_modules/**', '**/dist/**']
		},
		hmr: {
			port: 3000
		},
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
	}
});
