// Static server for the prerendered build (`npm run preview` / `npm start`):
// directory indexes, canonical redirects, dist/404.html for unknown paths, compression,
// and dynamic origin: when the build did not know the public domain, the placeholder
// origin in HTML/XML/TXT responses is replaced with the domain the request was made to.
//
// Env: PORT (default 4173), SITE_URL (fixed origin, skips detection),
//      ALLOWED_HOSTS (comma-separated; recommended in production to block Host-header spoofing),
//      TRUST_PROXY=1 (use X-Forwarded-Proto/Host from a reverse proxy).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
import { ORIGIN_PLACEHOLDER, resolveSiteOrigin } from './site-origin.mjs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const fixedOrigin = resolveSiteOrigin(process.env);
const allowedHosts = (process.env.ALLOWED_HOSTS ?? '')
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);
const trustProxy = process.env.TRUST_PROXY === '1';
const HOST_PATTERN = /^[a-z0-9.-]+(:\d{1,5})?$/;

/** Public origin for this request, validated so a forged Host header cannot inject URLs. */
function requestOrigin(req) {
  if (fixedOrigin) return fixedOrigin;
  const header = (name) => String(req.headers[name] ?? '').split(',')[0].trim().toLowerCase();
  let host = (trustProxy && header('x-forwarded-host')) || header('host');
  if (!HOST_PATTERN.test(host) || (allowedHosts.length && !allowedHosts.includes(host))) {
    host = allowedHosts[0] ?? `localhost:${port}`;
  }
  const forwarded = trustProxy ? header('x-forwarded-proto') : '';
  const proto = forwarded === 'https' || forwarded === 'http' ? forwarded : req.socket.encrypted ? 'https' : 'http';
  return `${proto}://${host}`;
}

async function isFile(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);
  // Canonical address rules, as a production host should apply them (301):
  // lowercase paths, no "/index.html", no duplicate slashes.
  if (!pathname.startsWith('/assets/') && !pathname.startsWith('/images/') && !pathname.startsWith('/videos/')) {
    const canonical = pathname.toLowerCase().replace(/\/{2,}/g, '/').replace(/\/index\.html$/, '/');
    if (canonical !== pathname) {
      res.writeHead(301, { Location: `${canonical}${url.search}` }).end();
      return;
    }
  }
  const target = normalize(join(dist, pathname));
  if (!target.startsWith(dist.slice(0, -1))) {
    res.writeHead(400).end();
    return;
  }
  let file = target;
  if (!(await isFile(file))) {
    if (!pathname.endsWith('/') && (await isFile(join(target, 'index.html')))) {
      res.writeHead(301, { Location: `${pathname}/${url.search}` }).end();
      return;
    }
    file = join(target, 'index.html');
  }
  let status = 200;
  if (!(await isFile(file))) {
    file = join(dist, '404.html');
    status = 404;
  }
  let body = await readFile(file);
  const type = types[extname(file)] ?? 'application/octet-stream';
  if (/html|xml|text\/plain/.test(type) && body.includes(ORIGIN_PLACEHOLDER)) {
    body = Buffer.from(body.toString('utf8').replaceAll(ORIGIN_PLACEHOLDER, requestOrigin(req)));
  }
  const headers = {
    'Content-Type': type,
    'Cache-Control': file.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    Vary: fixedOrigin ? 'Accept-Encoding' : 'Accept-Encoding, Host',
  };
  // Compress text responses like a production host would.
  const accept = String(req.headers['accept-encoding'] ?? '');
  if (/text|javascript|json|xml|svg|manifest/.test(type)) {
    if (accept.includes('br')) {
      body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } });
      headers['Content-Encoding'] = 'br';
    } else if (accept.includes('gzip')) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
  }
  res.writeHead(status, headers);
  res.end(body);
}).listen(port, () => console.log(`Preview: http://localhost:${port}/`));
