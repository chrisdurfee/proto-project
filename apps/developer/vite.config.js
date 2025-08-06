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
            '@components': path.resolve(__dirname, 'src/components'),
            '@shell': path.resolve(__dirname, 'src/shell'),
        }
    },
    server: {
        host: 'localhost',
        port: 3002,
        cors: true,
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