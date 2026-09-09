/**
 * Renders crawlable legal HTML from the in-app content modules, so the
 * public pages and the signed-in reader can never drift apart.
 *
 * The generated files land in apps/website/legal/ and are picked up as
 * Vite entry points by vite.config.js.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COOKIE_CONTENT } from '../../main/src/modules/legal/content/cookie-content.js';
import { LEGAL_CONFIG, resolveContent } from '../../main/src/modules/legal/content/legal-config.js';
import { LEGAL_META } from '../../main/src/modules/legal/content/legal-meta.js';
import { PRIVACY_CONTENT } from '../../main/src/modules/legal/content/privacy-content.js';
import { TERMS_CONTENT } from '../../main/src/modules/legal/content/terms-content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../legal');

/**
 * Escapes text for safe interpolation into HTML.
 *
 * @param {string} value
 * @returns {string}
 */
const escapeHtml = (value) => String(value)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;');

/**
 * Clips text to a length suitable for a meta description.
 *
 * @param {string} value
 * @param {number} max
 * @returns {string}
 */
const clip = (value, max = 158) =>
{
	const text = String(value || '').replace(/\s+/g, ' ').trim();
	if (text.length <= max)
	{
		return text;
	}

	return `${text.slice(0, max - 1).trimEnd()}...`;
};

/**
 * The documents rendered to static HTML.
 *
 * @type {Array<object>}
 */
const PAGES = [
	{ slug: 'terms', title: 'Terms of Service', metaKey: 'terms', content: TERMS_CONTENT },
	{ slug: 'privacy', title: 'Privacy Policy', metaKey: 'privacy', content: PRIVACY_CONTENT },
	{ slug: 'cookies', title: 'Cookie Policy', metaKey: 'cookies', content: COOKIE_CONTENT }
];

/**
 * Builds the cross-links shown at the bottom of each document.
 *
 * @param {string} currentSlug
 * @returns {string}
 */
const relatedLinks = (currentSlug) => PAGES
	.filter((page) => page.slug !== currentSlug)
	.map((page) => `<a href="/legal/${page.slug}">${escapeHtml(page.title)}</a>`)
	.join('\n\t\t\t\t');

/**
 * Renders the document body.
 *
 * @param {object} content
 * @returns {string}
 */
const renderSections = (content) => content.sections.map((section, index) => `
			<section class="legal-section" id="section-${index + 1}">
				<h2>${escapeHtml(section.heading)}</h2>
				${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n\t\t\t\t')}
			</section>`).join('\n');

/**
 * Renders one legal page to HTML.
 *
 * @param {object} page
 * @returns {string}
 */
const renderPage = (page) =>
{
	const meta = LEGAL_META[page.metaKey];
	const content = resolveContent(page.content);
	const description = clip(content.intro);
	const title = `${page.title} | ${LEGAL_CONFIG.appName}`;

	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>${escapeHtml(title)}</title>
		<meta name="description" content="${escapeHtml(description)}">
		<link rel="canonical" href="${LEGAL_CONFIG.siteUrl}/legal/${page.slug}">
		<meta property="og:type" content="article">
		<meta property="og:url" content="${LEGAL_CONFIG.siteUrl}/legal/${page.slug}">
		<meta property="og:title" content="${escapeHtml(title)}">
		<meta property="og:description" content="${escapeHtml(description)}">
		<link rel="stylesheet" href="/website/site.css">
	</head>
	<body>
		<header class="site-header">
			<a class="brand" href="/">${escapeHtml(LEGAL_CONFIG.appName)}</a>
			<nav><a href="/help">Help</a></nav>
		</header>
		<main class="legal-page">
			<p class="eyebrow">Legal</p>
			<h1>${escapeHtml(page.title)}</h1>
			<p class="effective">Effective ${escapeHtml(meta.effectiveDate)} (version ${escapeHtml(meta.version)})</p>
			<p class="intro">${escapeHtml(content.intro)}</p>
${renderSections(content)}
			<nav class="related">
				${relatedLinks(page.slug)}
			</nav>
		</main>
		<footer class="site-footer">
			<a href="/help">Help Center</a>
			<a href="/legal/terms">Terms</a>
			<a href="/legal/privacy">Privacy</a>
			<a href="/legal/cookies">Cookies</a>
		</footer>
	</body>
</html>
`;
};

/**
 * Writes every legal page to disk.
 *
 * @returns {void}
 */
export const renderLegalPages = () =>
{
	fs.mkdirSync(OUT_DIR, { recursive: true });

	for (const page of PAGES)
	{
		fs.writeFileSync(path.join(OUT_DIR, `${page.slug}.html`), renderPage(page));
	}

	console.log(`[render-legal-pages] ${PAGES.length} pages written to apps/website/legal`);
};

/**
 * Allow running this directly with `npm run render-legal`.
 */
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]))
{
	renderLegalPages();
}

export default renderLegalPages;
