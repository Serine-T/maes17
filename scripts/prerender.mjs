// Static prerendering: renders every public route in every language to HTML using the
// SSR bundle, then writes the sitemap, robots.txt, the 404 page and the root redirect.
import { mkdir, readFile, writeFile, rm, cp } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = join(root, 'dist/client');
const serverEntry = join(root, 'dist/server/entry-server.js');

const server = await import(pathToFileURL(serverEntry).href);
const {
  render,
  indexableRoutes,
  routeToPath,
  locales,
  defaultLocale,
  siteUrl,
  isSiteUrlConfigured,
  localizePath,
  localeMeta,
  canonicalUrl,
} = server;

if (!isSiteUrlConfigured) {
  console.warn(
    `\n⚠  VITE_SITE_URL is not set. Canonical URLs, hreflang, sitemap and JSON-LD use ${siteUrl}.\n` +
      '   Set VITE_SITE_URL (see .env.example) before deploying to production.\n',
  );
}

let template = await readFile(join(clientDir, 'index.html'), 'utf8');

// Inline the (small, ~11 kB compressed) stylesheet so first paint does not wait for a
// separate render-blocking request. React already emits a preload for the hero image.
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
if (cssLink) {
  const css = await readFile(join(clientDir, cssLink[1]), 'utf8');
  template = template.replace(cssLink[0], () => `<style>${css}</style>`);
}

async function renderPage(url) {
  const { html, head, lang } = await render(url);
  return template
    .replace('<html lang="hy">', `<html lang="${lang}">`)
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html);
}

async function write(file, content) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

const pages = [];
for (const locale of locales) {
  for (const route of indexableRoutes) {
    const path = localizePath(locale, routeToPath(route));
    await write(join(clientDir, path, 'index.html'), await renderPage(path));
    pages.push({ route, path });
  }
}

// 404 page (served by static hosts for unknown URLs; marked noindex).
await write(join(clientDir, '404.html'), await renderPage(`/${defaultLocale}/404`));

// Root: send visitors to their stored language or the default one.
const rootHtml = `<!doctype html>
<html lang="${defaultLocale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>MAES17</title>
    <link rel="canonical" href="${canonicalUrl(defaultLocale, '/')}">
${locales.map((l) => `    <link rel="alternate" hreflang="${localeMeta[l].hreflang}" href="${siteUrl}/${l}/">`).join('\n')}
    <link rel="alternate" hreflang="x-default" href="${siteUrl}/${defaultLocale}/">
    <meta http-equiv="refresh" content="0; url=/${defaultLocale}/">
    <script>
      (function () {
        var supported = ${JSON.stringify(locales)};
        var lang = '${defaultLocale}';
        try {
          var stored = localStorage.getItem('maes17.lang');
          if (supported.indexOf(stored) !== -1) lang = stored;
        } catch (e) {}
        location.replace('/' + lang + '/');
      })();
    </script>
  </head>
  <body>
    <p><a href="/${defaultLocale}/">MAES17</a></p>
  </body>
</html>
`;
await write(join(clientDir, 'index.html'), rootHtml);

// Sitemap with hreflang alternates for every page.
const today = new Date().toISOString().slice(0, 10);
const byRoute = new Map();
for (const { route } of pages) byRoute.set(routeToPath(route), route);
const urls = [];
for (const [neutral] of byRoute) {
  const alternates = locales
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${localeMeta[l].hreflang}" href="${canonicalUrl(l, neutral)}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl(defaultLocale, neutral)}"/>`)
    .join('\n');
  for (const l of locales) {
    urls.push(`  <url>\n    <loc>${canonicalUrl(l, neutral)}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`);
  }
}
await write(
  join(clientDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`,
);

await write(
  join(clientDir, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

// llms.txt: plain-text overview for AI crawlers (a discovery aid, not a ranking factor).
const llms = await readFile(join(root, 'scripts/llms.template.txt'), 'utf8');
await write(join(clientDir, 'llms.txt'), llms.replaceAll('{{siteUrl}}', siteUrl));

// The deployable site is dist/client; flatten it to dist/ for simpler hosting.
await rm(join(root, 'dist/server'), { recursive: true, force: true });
await cp(clientDir, join(root, 'dist'), { recursive: true });
await rm(clientDir, { recursive: true, force: true });

console.log(`Prerendered ${pages.length} pages in ${locales.length} languages + 404 → dist/`);
