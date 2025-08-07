import path from 'path';
import { defineConfig } from 'vite';
import { generateUrls } from '../../infrastructure/config/domain.config.js';

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
            '@components': path.resolve(__dirname, 'src/components'),
            '@shell': path.resolve(__dirname, 'src/shell'),
        }
    },
    server: {
        host: true,
        port: 3002,
        cors: true,
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true,
                secure: false,
				ws: true,
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
    },
    define: {
        'process.env.VITE_API_URL': JSON.stringify(apiTarget)
    }
});