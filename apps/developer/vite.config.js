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
            '@components': path.resolve(__dirname, 'src/components'),
            '@shell': path.resolve(__dirname, 'src/shell'),
        }
    },
    server: {
        host: '0.0.0.0',
        port: 3002,
        cors: true,
        watch: {
            usePolling: false,
            ignored: ['**/node_modules/**', '**/dist/**']
        },
        hmr: {
            port: 3002
        },
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true,
                secure: false,
                configure: (proxy, options) => {
                    // Log proxy requests for debugging
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        console.log('Proxying request:', req.method, req.url, 'to', apiTarget + req.url);
                    });
                }
            }
        }
    },
    build: {
        outDir: path.resolve(__dirname, '../../public/developer'),
        emptyOutDir: true
    }
});