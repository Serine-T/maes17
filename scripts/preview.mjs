// Minimal static server for the prerendered build, mirroring typical static hosting:
// directory indexes, trailing-slash redirects and dist/404.html for unknown paths.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';
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
  const headers = {
    'Content-Type': type,
    'Cache-Control': file.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
    Vary: 'Accept-Encoding',
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
