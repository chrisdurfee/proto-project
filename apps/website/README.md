# Website

The public marketing site. Plain HTML and CSS with no framework, so it loads
fast, works without JavaScript, and stays crawlable.

## Why it is separate

The other apps in `apps/` are single-page applications behind a sign-in gate.
This one is the opposite: it is what a visitor and a search engine see first,
so it is rendered to static files at build time.

## Layout

```
apps/website/
├── index.html          Landing page
├── legal/              GENERATED, do not edit by hand
├── public/             Copied verbatim to the build output
├── scripts/
│   └── render-legal-pages.js
└── src/css/styles.css  Site styles, emitted as /website/site.css
```

## Legal pages are generated

`legal/*.html` is produced from the same content the app renders:

```
apps/main/src/modules/legal/content/
├── terms-content.js
├── privacy-content.js
├── cookie-content.js
├── legal-meta.js       Version and effective date
└── legal-config.js     App name, contact addresses, governing law
```

Editing the content module updates both the in-app reader and the public page,
so the two cannot drift apart. Editing `legal/terms.html` directly does not:
the next build overwrites it.

Regenerate without a full build:

```bash
npm run render-legal
```

## Making it yours

1. Edit `legal-config.js`. The copy uses placeholders such as `{{APP_NAME}}`
   and `{{PRIVACY_EMAIL}}` that resolve from there, including the `siteUrl`
   used for canonical and Open Graph URLs.
2. Bump the matching `version` in `legal-meta.js` whenever a document changes
   materially, so any acceptance gate can tell that a user needs to re-accept.
3. Replace the copy in the content modules. It is a neutral template, not legal
   advice. Have counsel review it before you rely on it.

## Commands

```bash
npm run dev       # http://localhost:3003
npm run build     # -> public/website/
npm run preview
```

## How it is served

The build lands in `public/website/`, mirroring `apps/main` to `public/main`.
Apache maps:

| Path | Serves |
|---|---|
| `/` | `public/website/index.html` |
| `/legal/terms`, `/legal/privacy`, `/legal/cookies` | the generated static HTML |
| `/main/`, `/crm/`, `/developer/` | the applications |
| anything else | the main app shell, for client-side routes |

The in-app `/legal/*` routes still exist. A signed-in user navigating from the
footer stays inside the app, while a direct hit or a crawler gets the static
page.

One caveat on canonical tags: Vite treats `<link href>` as an asset reference,
so a root-relative `href="/"` makes the build fail with `EISDIR`. Keep
canonical and `og:url` values absolute, which is correct for SEO anyway.
