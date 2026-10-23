// Generates the MAES17 brand asset set from the shared logo geometry:
// SVG logos (light/dark), standalone symbol, favicons, touch/app icons and the
// Open Graph image. Usage: npm run brand
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { SYMBOL_VIEWBOX, symbolPaths, WORDMARK_WIDTH, wordmarkPaths } from '../src/components/brand/logo-paths.ts';
import { generateContours } from '../src/components/animations/contours.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = join(root, 'public/images/brand');
await mkdir(brandDir, { recursive: true });

const GRAPHITE = '#222522';
const PAPER = '#F7F6F2';
const SIGNAL = '#D9581F';

function symbolGroup(color, accent) {
  const { outer, inner, triangle, dot } = symbolPaths;
  return `<g fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${outer}" stroke-width="2" opacity="0.55"/>
    <path d="${inner}" stroke-width="2"/>
    <path d="${triangle}" stroke-width="2.4" stroke="${accent}"/>
    <circle cx="${dot.cx}" cy="${dot.cy}" r="${dot.r}" fill="${accent}" stroke="none"/>
  </g>`;
}

function wordmarkGroup(color) {
  return `<g fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter">${wordmarkPaths
    .map((d) => `<path d="${d}"/>`)
    .join('')}</g>`;
}

function symbolSvg(color, accent, background) {
  const bg = background ? `<rect width="48" height="48" rx="10" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SYMBOL_VIEWBOX}" width="48" height="48">
  <title>MAES17</title>${bg}
  ${symbolGroup(color, accent)}
</svg>
`;
}

/** Horizontal lockup: 48-unit symbol, 14-unit gap, wordmark scaled to 18 units high. */
function logoSvg(color, accent) {
  const scale = 18 / 20;
  const width = 48 + 14 + WORDMARK_WIDTH * scale + 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(1)} 48" width="${(width * 4).toFixed(0)}" height="192">
  <title>MAES17</title>
  ${symbolGroup(color, accent)}
  <g transform="translate(63 15) scale(${scale})">${wordmarkGroup(color)}</g>
</svg>
`;
}

const files = {
  'maes17-logo.svg': logoSvg(GRAPHITE, SIGNAL),
  'maes17-logo-light.svg': logoSvg(PAPER, SIGNAL),
  'maes17-symbol.svg': symbolSvg(GRAPHITE, SIGNAL),
  'maes17-symbol-light.svg': symbolSvg(PAPER, SIGNAL),
};
for (const [name, svg] of Object.entries(files)) await writeFile(join(brandDir, name), svg);

// Favicon: symbol on a graphite tile reads clearly in both light and dark browser chrome.
const tile = symbolSvg(PAPER, SIGNAL, GRAPHITE);
await writeFile(join(root, 'public/favicon.svg'), tile);

const png = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();
await writeFile(join(root, 'public/apple-touch-icon.png'), await png(tile, 180));
await writeFile(join(brandDir, 'maes17-symbol-512.png'), await png(tile, 512));
await writeFile(join(brandDir, 'maes17-symbol-192.png'), await png(tile, 192));

// favicon.ico containing a single 32×32 PNG image.
const ico32 = await png(tile, 32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(ico32.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(join(root, 'public/favicon.ico'), Buffer.concat([header, ico32]));

await writeFile(
  join(root, 'public/site.webmanifest'),
  JSON.stringify(
    {
      name: 'MAES17',
      short_name: 'MAES17',
      icons: [
        { src: '/images/brand/maes17-symbol-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/images/brand/maes17-symbol-512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: GRAPHITE,
      background_color: PAPER,
      display: 'browser',
    },
    null,
    2,
  ) + '\n',
);

// Open Graph image: hero terrain, graphite wash, contour lines and the light logo.
const contours = generateContours([
  { cx: 980, cy: 170, radius: 360, levels: 14, seed: 11 },
  { cx: 160, cy: 560, radius: 300, levels: 11, seed: 29, stretch: 1.6 },
]);
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${GRAPHITE}" stop-opacity="0.55"/>
    <stop offset="1" stop-color="${GRAPHITE}" stop-opacity="0.9"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g fill="none" stroke="${PAPER}" stroke-opacity="0.18">${contours
    .map((c) => `<path d="${c.d}" stroke-width="${c.index ? 1.6 : 0.8}"/>`)
    .join('')}</g>
  ${[1, 2, 3, 4, 5].map((i) => `<line x1="${i * 200}" y1="0" x2="${i * 200}" y2="630" stroke="${PAPER}" stroke-opacity="0.08"/>`).join('')}
  <g transform="translate(80 470) scale(2.2)">
    ${symbolGroup(PAPER, SIGNAL)}
    <g transform="translate(63 15) scale(0.9)">${wordmarkGroup(PAPER)}</g>
  </g>
</svg>`;
await sharp(join(root, 'public/images/photos/terrain-scan-1420.webp'))
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(join(brandDir, 'og-image.jpg'));

console.log('Brand assets written to public/ and public/images/brand/');
