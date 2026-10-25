// Runs after `vite build`. Writes one static HTML file per public route
// (dist/sensory/index.html, ...) with that route's own <title>, description,
// canonical URL, social tags, JSON-LD and a short crawlable summary, plus
// sitemap.xml. The React app still boots and takes over exactly as before;
// this only gives search engines and link previews real per-page content
// without needing JavaScript. Route copy lives in src/seo/routes.json and is
// shared with src/components/RouteMeta.tsx (which keeps the tab title right
// during in-app navigation).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const seo = JSON.parse(readFileSync(join(root, 'src/seo/routes.json'), 'utf8'));
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const canonicalFor = (p) => `${seo.origin}${p === '/' ? '/' : `${p}/`}`;

function render(route) {
  const url = canonicalFor(route.path);
  const jsonLd = route.tool
    ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: route.h1,
        description: route.description,
        url,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
        publisher: { '@type': 'Organization', name: 'SEMH.co.uk', url: 'https://semh.co.uk' },
      }).replace(/</g, '\\u003c')}</script>`
    : '';
  const head = [
    `<title>${esc(route.title)}</title>`,
    `<meta name="description" content="${esc(route.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(route.title)}" />`,
    `<meta property="og:description" content="${esc(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="${esc(seo.siteName)}" />`,
    jsonLd,
  ]
    .filter(Boolean)
    .join('\n    ');

  const body =
    `<main style="font-family:system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem">` +
    `<h1>${esc(route.h1)}</h1><p>${esc(route.summary)}</p>` +
    (route.path === '/' ? '' : `<p><a href="/">All free SEMH tools</a></p>`) +
    `</main>`;

  return template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace(/<meta\s+property="og:title"[^>]*>/i, '')
    .replace(/<meta\s+property="og:description"[^>]*>/i, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const indexed = seo.routes.filter((r) => r.index !== false);
for (const route of indexed) {
  const html = render(route);
  if (route.path === '/') {
    writeFileSync(join(dist, 'index.html'), html);
  } else {
    const dir = join(dist, route.path.replace(/^\//, ''));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
  }
}

const today = new Date().toISOString().slice(0, 10);
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexed.map((r) => `  <url><loc>${canonicalFor(r.path)}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);
console.log(`prerender: wrote ${indexed.length} pages and sitemap.xml`);
