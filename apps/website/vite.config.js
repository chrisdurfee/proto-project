import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { defineConfig } from 'vite';
import { renderLegalPages } from './scripts/render-legal-pages.js';

/**
 * The marketing site is served at the document root in production, but the
 * built files live in public/website (mirroring apps/main -> public/main) so
 * the deploy and the Apache rules stay uniform. That makes the production
 * base "/website/" while dev runs from "/".
 */
const isDev = process.env.NODE_ENV !== 'production';
const BASE_URL = (isDev ? '/' : '/website/');

const OUT_DIR = path.resolve(__dirname, '../../public/website');

/**
 * Pre-compresses emitted text assets with brotli and gzip so the web server
 * can serve the static sibling instead of compressing on every request.
 * Mirrors the plugin used by apps/main.
 *
 * @param {string} outDir
 * @returns {object}
 */
const precompressAssets = (outDir) => ({
	name: 'precompress-assets',
	apply: 'build',
	closeBundle()
	{
		if (!fs.existsSync(outDir))
		{
			return;
		}

		const extensions = ['.js', '.css', '.html', '.svg', '.json', '.webmanifest'];
		const minSize = 1024;
		let count = 0;

		const walk = (dir) =>
		{
			for (const entry of fs.readdirSync(dir, { withFileTypes: true }))
			{
				const full = path.join(dir, entry.name);
				if (entry.isDirectory())
				{
					walk(full);
					continue;
				}

				if (extensions.includes(path.extname(entry.name)) === false)
				{
					continue;
				}

				const source = fs.readFileSync(full);
				if (source.length < minSize)
				{
					continue;
				}

				fs.writeFileSync(`${full}.br`, zlib.brotliCompressSync(source, {
					params: {
						[zlib.constants.BROTLI_PARAM_QUALITY]: 11,
						[zlib.constants.BROTLI_PARAM_SIZE_HINT]: source.length
					}
				}));
				fs.writeFileSync(`${full}.gz`, zlib.gzipSync(source, { level: 9 }));
				count++;
			}
		};

		walk(outDir);
		console.log(`[precompress-assets] ${count} files compressed (.br + .gz)`);
	}
});

/**
 * Serves extensionless clean URLs (for example /legal/terms) from their
 * matching .html entry during dev and preview, mirroring the production
 * rewrite so the two behave the same.
 *
 * @returns {object}
 */
const cleanUrls = () =>
{
	const cleanHtml = (req, _res, next) =>
	{
		const [pathname, query = ''] = req.url.split('?');
		if (pathname !== '/' && path.extname(pathname) === '')
		{
			const rel = pathname.replace(/^\/+/, '').replace(/\/+$/, '');
			if (rel && fs.existsSync(path.resolve(__dirname, `${rel}.html`)))
			{
				req.url = `/${rel}.html${query ? `?${query}` : ''}`;
			}
		}
		next();
	};

	/**
	 * Dev serves public/ at /, but the HTML references /website/site.css
	 * because the production base is /website/. Map that prefix back so the
	 * same markup works in both.
	 */
	const rewriteDevAssets = (req, _res, next) =>
	{
		const [pathname, query = ''] = req.url.split('?');
		if (pathname.startsWith('/website/'))
		{
			req.url = `${pathname.slice('/website'.length)}${query ? `?${query}` : ''}`;
		}
		next();
	};

	return {
		name: 'clean-urls',
		apply: 'serve',
		configureServer(server)
		{
			server.middlewares.use(rewriteDevAssets);
			server.middlewares.use(cleanHtml);
		},
		configurePreviewServer(server)
		{
			server.middlewares.use(cleanHtml);
		}
	};
};

/**
 * Copies the marketing CSS to a stable /website/site.css path so pages
 * rendered outside Vite, including the generated legal HTML, can share the
 * site styling without depending on a hashed asset name.
 *
 * @returns {void}
 */
const emitSiteCss = () =>
{
	const publicDir = path.resolve(__dirname, 'public');
	fs.mkdirSync(publicDir, { recursive: true });

	const css = fs.readFileSync(path.resolve(__dirname, 'src/css/styles.css'), 'utf8');
	fs.writeFileSync(path.resolve(publicDir, 'site.css'), css);
};

/**
 * Generate the legal pages and the shared stylesheet before Vite resolves
 * its inputs, since the rendered files are build entry points.
 */
renderLegalPages();
emitSiteCss();

export default defineConfig({
	plugins: [
		cleanUrls(),
		precompressAssets(OUT_DIR)
	],
	base: BASE_URL,
	server: {
		host: true,
		port: 3003
	},
	build: {
		outDir: OUT_DIR,
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, 'index.html'),
				'legal/terms': path.resolve(__dirname, 'legal/terms.html'),
				'legal/privacy': path.resolve(__dirname, 'legal/privacy.html'),
				'legal/cookies': path.resolve(__dirname, 'legal/cookies.html')
			}
		}
	}
});
