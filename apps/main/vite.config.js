import path from 'path';
import { defineConfig } from 'vite';
import { Configs } from './src/configs.js';

// Use localhost:8080 to connect to containerized backend
const apiTarget = 'http://localhost:8080';

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
	}
});
