// Converts the photos listed in image-sources.json into responsive WebP renditions in
// public/images/photos and writes a typed manifest (src/content/images.generated.json)
// that also carries attribution data.
//
// Two kinds of source:
//   - remote (Wikimedia Commons): downloaded once and cached in .cache/images (git-ignored);
//   - local ("local": "assets-src/photos/…"): images supplied by the owner, optionally cropped
//     with "crop": { "left", "top", "width", "height" } in source pixels.
//
// Usage: npm run images
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(await readFile(join(root, 'scripts/image-sources.json'), 'utf8'));
const cacheDir = join(root, '.cache/images');
const outDir = join(root, 'public/images/photos');
const STEPS = [480, 800, 1200, 1600, 2400];

await mkdir(cacheDir, { recursive: true });
await mkdir(outDir, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url, file) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'MAES17WebsiteImageBuilder/1.0' } });
    if (res.ok) {
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
      return;
    }
    await sleep(4000 * (attempt + 1));
  }
  throw new Error(`Failed to download ${url}`);
}

const manifest = {};
for (const src of sources) {
  let input;
  if (src.local) {
    input = join(root, src.local);
  } else {
    input = join(cacheDir, `${src.name}.jpg`);
    if (!(await exists(input))) {
      console.log(`↓ ${src.name}`);
      await download(src.source, input);
      await sleep(1500);
    }
  }
  const load = () => {
    const img = sharp(input).rotate();
    return src.crop ? img.extract(src.crop) : img;
  };
  const meta = src.crop ? { width: src.crop.width, height: src.crop.height } : await load().metadata();
  const widths = STEPS.filter((w) => w <= src.maxWidth && w <= meta.width);
  // Keep the full source resolution as the largest rendition.
  const fullWidth = Math.min(meta.width, src.maxWidth);
  if (fullWidth > (widths[widths.length - 1] ?? 0)) widths.push(fullWidth);
  for (const w of widths) {
    await load()
      .resize({ width: w })
      .webp({ quality: w > 1600 ? 68 : 72, effort: 5 })
      .toFile(join(outDir, `${src.name}-${w}.webp`));
  }
  const largest = widths[widths.length - 1];
  manifest[src.name] = {
    widths,
    width: largest,
    height: Math.round((meta.height / meta.width) * largest),
    // Owner-supplied images carry no third-party attribution and are left off the credits page.
    credit: src.local
      ? null
      : {
          title: src.title,
          author: src.author,
          license: src.license,
          licenseUrl: src.licenseUrl,
          page: src.page,
        },
  };
  console.log(`✓ ${src.name} → ${widths.join(', ')}`);
}

await writeFile(join(root, 'src/content/images.generated.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote manifest for ${Object.keys(manifest).length} images.`);
