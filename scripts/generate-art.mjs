// Generates the MAES17 illustration series: procedural terrain (fractal noise),
// hillshading, contour lines (marching squares) and survey-plan overlays, rendered in
// the site palette. Output: assets-src/art/<name>.png, then `npm run images` creates the
// responsive WebP files. Deterministic: the same seeds always produce the same images.
//
// Usage: npm run art
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'assets-src/art');
await mkdir(OUT, { recursive: true });

// ---------------------------------------------------------------- palette
const C = {
  paper: [247, 246, 242],
  paperDeep: [236, 233, 224],
  stone: [217, 214, 205],
  graphite: [34, 37, 34],
  olive: [119, 125, 98],
  oliveDeep: [87, 92, 69],
  slate: [100, 121, 133],
  slateDeep: [52, 66, 74],
  signal: [217, 88, 31],
};
const hex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (t) => t * t * (3 - 2 * t);

// ---------------------------------------------------------------- noise
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function perlin(seed) {
  const r = rng(seed);
  const p = new Uint8Array(512);
  const base = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  const grad = (h, x, y) => {
    switch (h & 7) {
      case 0: return x + y;
      case 1: return -x + y;
      case 2: return x - y;
      case 3: return -x - y;
      case 4: return x;
      case 5: return -x;
      case 6: return y;
      default: return -y;
    }
  };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const aa = p[p[xi] + yi];
    const ab = p[p[xi] + yi + 1];
    const ba = p[p[xi + 1] + yi];
    const bb = p[p[xi + 1] + yi + 1];
    const x1 = grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 = grad(ab, xf, yf - 1) + u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return (x1 + v * (x2 - x1)) * 0.7071;
  };
}

/** Height field in 0..1 on a gw × gh grid. */
function terrain(gw, gh, { seed, scale = 2.4, octaves = 6, ridge = 0.45, warp = 0.35, gain = 0.5, bias } = {}) {
  const n = perlin(seed);
  const w = perlin(seed + 101);
  const h = new Float32Array(gw * gh);
  let min = Infinity;
  let max = -Infinity;
  const aspect = gw / gh;
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      let u = (x / gw) * scale * aspect;
      let v = (y / gh) * scale;
      // Domain warping gives the drainage-like, organic look of real relief.
      u += warp * w(u * 0.8, v * 0.8);
      v += warp * w(u * 0.8 + 5.2, v * 0.8 + 1.3);
      let amp = 1;
      let freq = 1;
      let sum = 0;
      let norm = 0;
      for (let o = 0; o < octaves; o++) {
        const nv = n(u * freq, v * freq);
        const rv = 1 - Math.abs(nv) * 1.6;
        sum += amp * ((1 - ridge) * nv + ridge * rv * rv * 0.6);
        norm += amp;
        amp *= gain;
        freq *= 2.03;
      }
      let value = sum / norm;
      if (bias) value += bias(x / gw, y / gh);
      h[y * gw + x] = value;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }
  for (let i = 0; i < h.length; i++) h[i] = (h[i] - min) / (max - min);
  return h;
}

/** Lambertian hillshade, 0..1. */
function hillshade(h, gw, gh, { azimuth = 315, altitude = 40, z = 6 } = {}) {
  const az = (azimuth * Math.PI) / 180;
  const alt = (altitude * Math.PI) / 180;
  const lx = Math.cos(alt) * Math.sin(az);
  const ly = -Math.cos(alt) * Math.cos(az);
  const lz = Math.sin(alt);
  const out = new Float32Array(gw * gh);
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const xl = h[y * gw + Math.max(0, x - 1)];
      const xr = h[y * gw + Math.min(gw - 1, x + 1)];
      const yu = h[Math.max(0, y - 1) * gw + x];
      const yd = h[Math.min(gh - 1, y + 1) * gw + x];
      const dx = (xr - xl) * z * gw * 0.05;
      const dy = (yd - yu) * z * gw * 0.05;
      const len = Math.hypot(dx, dy, 1);
      out[y * gw + x] = clamp((-dx * lx - dy * ly + lz) / len);
    }
  }
  return out;
}

/** Contour polylines by marching squares, scaled to output pixels. */
function contours(h, gw, gh, levels, sx, sy) {
  const paths = [];
  for (const level of levels) {
    let d = '';
    for (let y = 0; y < gh - 1; y++) {
      for (let x = 0; x < gw - 1; x++) {
        const a = h[y * gw + x];
        const b = h[y * gw + x + 1];
        const c = h[(y + 1) * gw + x + 1];
        const e = h[(y + 1) * gw + x];
        const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (e > level ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const t = (p, q) => (level - p) / (q - p);
        const top = [x + t(a, b), y];
        const right = [x + 1, y + t(b, c)];
        const bottom = [x + t(e, c), y + 1];
        const left = [x, y + t(a, e)];
        const segs = {
          1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]],
          5: [[left, top], [bottom, right]], 6: [[top, bottom]], 7: [[left, top]], 8: [[left, top]],
          9: [[top, bottom]], 10: [[top, right], [left, bottom]], 11: [[top, right]], 12: [[left, right]],
          13: [[bottom, right]], 14: [[left, bottom]],
        }[idx];
        for (const [p, q] of segs) {
          d += `M${(p[0] * sx).toFixed(1)} ${(p[1] * sy).toFixed(1)}L${(q[0] * sx).toFixed(1)} ${(q[1] * sy).toFixed(1)}`;
        }
      }
    }
    paths.push({ level, d });
  }
  return paths;
}

const levelsEvery = (step, from = step) => {
  const out = [];
  for (let l = from; l < 1; l += step) out.push(Number(l.toFixed(4)));
  return out;
};

/** Renders an RGB raster from a per-pixel colour function, upscaled to the output size. */
async function raster(gw, gh, W, H, colorAt) {
  const buf = Buffer.alloc(gw * gh * 3);
  for (let i = 0; i < gw * gh; i++) {
    const c = colorAt(i);
    buf[i * 3] = clamp(c[0], 0, 255);
    buf[i * 3 + 1] = clamp(c[1], 0, 255);
    buf[i * 3 + 2] = clamp(c[2], 0, 255);
  }
  return sharp(buf, { raw: { width: gw, height: gh, channels: 3 } })
    .resize(W, H, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
}

async function compose(name, base, svg, W, H) {
  await sharp(base)
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`) }])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, `${name}.png`));
  console.log(`✓ ${name}`);
}

/** Finds well-separated high points to use as survey stations. */
function peaks(h, gw, gh, count, minDist, margin = 0.08) {
  const cands = [];
  for (let y = 2; y < gh - 2; y += 2) {
    for (let x = 2; x < gw - 2; x += 2) cands.push([h[y * gw + x], x, y]);
  }
  cands.sort((a, b) => b[0] - a[0]);
  const out = [];
  for (const [, x, y] of cands) {
    if (x < gw * margin || x > gw * (1 - margin) || y < gh * margin || y > gh * (1 - margin)) continue;
    if (out.every(([px, py]) => Math.hypot(px - x, py - y) > minDist)) out.push([x, y]);
    if (out.length >= count) break;
  }
  return out;
}

const mono = 'font-family="Menlo, DejaVu Sans Mono, monospace"';
const trig = (x, y, s, color) =>
  `<path d="M${x} ${y - s}L${x + s * 0.95} ${y + s * 0.62}H${x - s * 0.95}Z" fill="none" stroke="${color}" stroke-width="${s * 0.22}" stroke-linejoin="round"/><circle cx="${x}" cy="${y + s * 0.08}" r="${s * 0.2}" fill="${color}"/>`;
const cross = (x, y, s, color, w = 1.5) =>
  `<path d="M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}" stroke="${color}" stroke-width="${w}"/>`;

function graticule(W, H, step, color, opacity, labels = true) {
  let s = '';
  for (let x = step; x < W; x += step) {
    s += `<path d="M${x} 0V18M${x} ${H - 18}V${H}" stroke="${color}" stroke-opacity="${opacity * 2}" stroke-width="1.5"/>`;
    s += `<path d="M${x} 0V${H}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/>`;
    if (labels) s += `<text x="${x + 6}" y="34" ${mono} font-size="15" fill="${color}" fill-opacity="${opacity * 4}">${(4458000 + x * 2).toLocaleString('en').replace(/,/g, ' ')}</text>`;
  }
  for (let y = step; y < H; y += step) {
    s += `<path d="M0 ${y}H18M${W - 18} ${y}H${W}" stroke="${color}" stroke-opacity="${opacity * 2}" stroke-width="1.5"/>`;
    s += `<path d="M0 ${y}H${W}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/>`;
  }
  return s;
}

function contourSvg(paths, color, { minor = 0.18, major = 0.42, every = 5, width = 1.1 } = {}) {
  return paths
    .map((p, i) => {
      const isMajor = i % every === every - 1;
      return `<path d="${p.d}" fill="none" stroke="${color}" stroke-opacity="${isMajor ? major : minor}" stroke-width="${isMajor ? width * 1.9 : width}" stroke-linecap="round"/>`;
    })
    .join('');
}

// ---------------------------------------------------------------- shared colour ramps
function darkRelief(h, shade, i, { warm = 0.25, cool = 0, gw = 1, gh = 1, haze = 0 } = {}) {
  const v = h[i];
  const s = shade[i];
  let c = mix([24, 27, 25], [74, 79, 68], smooth(v));
  c = mix(c, [176, 172, 156], smooth(clamp((v - 0.65) / 0.35)) * 0.5);
  const lit = 0.38 + 0.85 * s;
  c = c.map((x) => x * lit);
  // Soft warm rim light on the brightest slopes only.
  c = mix(c, [226, 168, 120], Math.pow(s, 9) * warm);
  if (cool) c = mix(c, C.slate, (1 - v) * cool);
  if (haze) {
    const y = Math.floor(i / gw) / gh;
    c = mix(c, [96, 104, 104], Math.pow(1 - y, 2.2) * haze);
  }
  return c;
}

function paperRelief(h, shade, i, { tint = 0.1 } = {}) {
  const v = h[i];
  let c = mix(C.paper, C.paperDeep, 1 - v);
  c = mix(c, C.olive, (1 - v) * tint);
  return c.map((x) => x * (0.86 + 0.16 * shade[i]));
}

// ---------------------------------------------------------------- the series

async function reliefDusk() {
  const W = 2400, H = 1350, gw = 1200, gh = 675;
  const opts = { seed: 7, scale: 1.5, ridge: 0.5, gain: 0.42, bias: (x, y) => 0.25 * y + 0.1 * Math.sin(x * 3) };
  const h = terrain(gw, gh, opts);
  const sh = hillshade(h, gw, gh, { azimuth: 285, altitude: 22, z: 5 });
  const base = await raster(gw, gh, W, H, (i) => darkRelief(h, sh, i, { warm: 0.35, gw, gh, haze: 0.35 }));
  const iso = contours(terrain(600, 338, opts), 600, 338, levelsEvery(0.04), W / 599, H / 337);
  const svg = contourSvg(iso, hex(C.paper), { minor: 0.07, major: 0.2 }) + graticule(W, H, 400, hex(C.paper), 0.06);
  await compose('art-relief-dusk', base, svg, W, H);
}

async function controlNetwork() {
  const W = 1800, H = 1200, gw = 900, gh = 600;
  const opts = { seed: 21, scale: 1.9, ridge: 0.45, gain: 0.44 };
  const h = terrain(gw, gh, opts);
  const sh = hillshade(h, gw, gh, { azimuth: 315, altitude: 30 });
  const base = await raster(gw, gh, W, H, (i) => darkRelief(h, sh, i, { warm: 0.1, cool: 0.35 }));
  const iso = contours(h, gw, gh, levelsEvery(0.035), W / (gw - 1), H / (gh - 1));
  const pts = peaks(h, gw, gh, 9, 170).map(([x, y]) => [x * (W / gw), y * (H / gh)]);
  let net = '';
  const edges = new Set();
  pts.forEach((p, i) => {
    pts
      .map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j])
      .filter(([, j]) => j !== i)
      .sort((a, b) => a[0] - b[0])
      .slice(0, 3)
      .forEach(([, j]) => edges.add([Math.min(i, j), Math.max(i, j)].join('-')));
  });
  for (const e of edges) {
    const [a, b] = e.split('-').map(Number);
    net += `<path d="M${pts[a][0]} ${pts[a][1]}L${pts[b][0]} ${pts[b][1]}" stroke="${hex(C.paper)}" stroke-opacity="0.55" stroke-width="1.6" stroke-dasharray="10 7"/>`;
  }
  pts.forEach(([x, y], i) => {
    net += trig(x, y, 16, hex(C.signal));
    net += `<text x="${x + 22}" y="${y - 14}" ${mono} font-size="17" fill="${hex(C.paper)}" fill-opacity="0.85">T-${String(i + 1).padStart(2, '0')}</text>`;
  });
  const svg = contourSvg(iso, hex(C.paper), { minor: 0.1, major: 0.28 }) + graticule(W, H, 300, hex(C.paper), 0.05, false) + net;
  await compose('art-control-network', base, svg, W, H);
}

async function surveyPlan() {
  const W = 1800, H = 1200, gw = 900, gh = 600;
  const h = terrain(gw, gh, { seed: 33, scale: 1.6, ridge: 0.25, octaves: 5 });
  const sh = hillshade(h, gw, gh, { altitude: 50, z: 4 });
  const base = await raster(gw, gh, W, H, (i) => paperRelief(h, sh, i));
  const iso = contours(h, gw, gh, levelsEvery(0.03), W / (gw - 1), H / (gh - 1));
  const plot = [[520, 300], [1290, 250], [1380, 860], [600, 940]];
  const g = hex(C.graphite);
  let s = `<path d="M${plot.map((p) => p.join(' ')).join('L')}Z" fill="${hex(C.olive)}" fill-opacity="0.08" stroke="${g}" stroke-width="3"/>`;
  s += `<rect x="780" y="470" width="300" height="200" transform="rotate(-4 930 570)" fill="${hex(C.stone)}" stroke="${g}" stroke-width="2.4"/>`;
  s += `<path d="M780 470l300 200M1080 470l-300 200" transform="rotate(-4 930 570)" stroke="${g}" stroke-opacity="0.35" stroke-width="1.2"/>`;
  const dims = ['42.18', '33.06', '40.92', '35.71'];
  plot.forEach((p, i) => {
    const q = plot[(i + 1) % plot.length];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    const ang = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
    const a = ang > 90 || ang < -90 ? ang + 180 : ang;
    s += `<text x="${mx}" y="${my - 14}" ${mono} font-size="20" fill="${g}" text-anchor="middle" transform="rotate(${a} ${mx} ${my})">${dims[i]} m</text>`;
    s += cross(p[0], p[1], 16, hex(C.signal), 2.4);
    s += `<text x="${p[0] + 18}" y="${p[1] + 34}" ${mono} font-size="16" fill="${g}" fill-opacity="0.7">${i + 1}</text>`;
  });
  [[300, 200], [1550, 420], [380, 700], [1500, 1050], [980, 1080], [1000, 160]].forEach(([x, y], i) => {
    s += `<circle cx="${x}" cy="${y}" r="4" fill="${g}"/><text x="${x + 10}" y="${y - 8}" ${mono} font-size="15" fill="${g}" fill-opacity="0.65">${(1012.4 + i * 1.37).toFixed(2)}</text>`;
  });
  const svg = contourSvg(iso, hex(C.oliveDeep), { minor: 0.28, major: 0.6 }) + graticule(W, H, 300, g, 0.06, false) + s;
  await compose('art-survey-plan', base, svg, W, H);
}

/** Voronoi parcels on a raster (straight boundaries); returns parcel id per pixel. */
let ANISO = 1;
function parcels(W, H, seeds) {
  const id = new Int32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let best = 0;
      let bd = Infinity;
      for (let k = 0; k < seeds.length; k++) {
        const s = seeds[k];
        // Anisotropic distance gives elongated, field-like parcels.
        const dx = (x - s[0]) * ANISO;
        const dy = y - s[1];
        const d = dx * dx + dy * dy;
        if (d < bd) {
          bd = d;
          best = k;
        }
      }
      id[y * W + x] = best;
    }
  }
  return id;
}

/** Long agricultural strips in blocks separated by field roads, all at one orientation. */
function stripParcels(W, H, r, angle) {
  const id = new Int32Array(W * H);
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const blocks = [];
  for (let v = -W; v < W * 2; v += 260 + r() * 240) blocks.push(v);
  const widths = Array.from({ length: 400 }, () => 26 + r() * 70);
  const edges = [0];
  for (const w of widths) edges.push(edges[edges.length - 1] + w);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x * ca + y * sa + W;
      const v = -x * sa + y * ca;
      let b = 0;
      while (b < blocks.length - 1 && blocks[b + 1] < v) b++;
      // Offset strips per block so boundaries do not line up across roads.
      const uu = u + b * 137;
      let lo = 0;
      let hi = edges.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (edges[mid] <= uu) lo = mid;
        else hi = mid - 1;
      }
      id[y * W + x] = b * 1000 + lo;
    }
  }
  return id;
}

async function parcelArt(name, { seed, W = 1800, H = 1200, count = 34, stretch = 1.9, palette, highlight, dark = false, lake, strips = false }) {
  const r = rng(seed);
  ANISO = 1 / stretch;
  const seeds = Array.from({ length: count }, () => [r() * W, r() * H, 0.55 + r() * stretch]);
  const id = strips ? stripParcels(W, H, r, strips) : parcels(W, H, seeds);
  const gw = W / 2, gh = H / 2;
  const h = terrain(gw, gh, { seed: seed + 3, scale: 1.4, ridge: 0.2, octaves: 5 });
  const sh = hillshade(h, gw, gh, { altitude: 45, z: 3 });
  const colors = Array.from({ length: 997 }, () => palette[Math.floor(r() * palette.length)]);
  const buf = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const k = id[i];
      const kk = k % 997;
      const gi = Math.min(gh - 1, y >> 1) * gw + Math.min(gw - 1, x >> 1);
      let c = colors[kk];
      // Fine furrow texture inside each parcel, oriented per parcel.
      const ang = strips ? strips + Math.PI / 2 : (kk % 7) * 0.9;
      const stripe = Math.sin((x * Math.cos(ang) + y * Math.sin(ang)) * 0.9) * 0.018;
      c = c.map((v) => v * (0.88 + 0.14 * sh[gi] + stripe));
      if (lake && h[gi] < lake) c = mix(C.slateDeep, C.slate, h[gi] / lake * 0.6);
      const edge = x > 0 && y > 0 && (id[i - 1] !== k || id[i - W] !== k);
      if (edge) c = dark ? mix(c, C.paper, 0.55) : mix(c, C.graphite, 0.75);
      buf[i * 3] = c[0];
      buf[i * 3 + 1] = c[1];
      buf[i * 3 + 2] = c[2];
    }
  }
  const base = await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
  // Boundary points where parcels meet.
  let s = '';
  const seen = [];
  for (let y = 2; y < H - 2; y += 3) {
    for (let x = 2; x < W - 2; x += 3) {
      const set = new Set([id[y * W + x], id[y * W + x + 3], id[(y + 3) * W + x], id[(y + 3) * W + x + 3]]);
      if (set.size >= 3 && seen.every(([a, b]) => Math.hypot(a - x, b - y) > 26)) seen.push([x, y]);
    }
  }
  const pointColor = dark ? hex(C.paper) : hex(C.graphite);
  seen.forEach(([x, y]) => {
    s += `<circle cx="${x}" cy="${y}" r="5" fill="${dark ? hex(C.graphite) : hex(C.paper)}" stroke="${pointColor}" stroke-width="2"/>`;
  });
  if (highlight) {
    const k = id[Math.floor(H * highlight[1]) * W + Math.floor(W * highlight[0])];
    // Outline the highlighted parcel by tracing its pixels' convex-ish boundary points.
    const pts = seen.filter(([x, y]) => {
      for (const [dx, dy] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) {
        const xx = clamp(x + dx, 0, W - 1);
        const yy = clamp(y + dy, 0, H - 1);
        if (id[yy * W + xx] === k) return true;
      }
      return false;
    });
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    pts.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
    if (pts.length >= 3) {
      s += `<path d="M${pts.map((p) => p.join(' ')).join('L')}Z" fill="${hex(C.signal)}" fill-opacity="0.16" stroke="${hex(C.signal)}" stroke-width="4" stroke-dasharray="14 8"/>`;
      pts.forEach(([x, y]) => (s += `<circle cx="${x}" cy="${y}" r="7" fill="${hex(C.signal)}"/>`));
    }
  }
  s += graticule(W, H, 300, pointColor, 0.05, false);
  await compose(name, base, s, W, H);
}

async function settingOut() {
  const W = 1800, H = 1200;
  const gw = 900, gh = 600;
  const h = terrain(gw, gh, { seed: 55, scale: 1.3, ridge: 0.15, octaves: 4 });
  const sh = hillshade(h, gw, gh, { altitude: 50, z: 2 });
  const base = await raster(gw, gh, W, H, (i) => mix([38, 50, 57], [58, 74, 83], sh[i] * 0.6 + h[i] * 0.4));
  const iso = contours(h, gw, gh, levelsEvery(0.05), W / (gw - 1), H / (gh - 1));
  const p = hex(C.paper);
  let s = contourSvg(iso, p, { minor: 0.06, major: 0.14 });
  for (let x = 0; x < W; x += 30) s += `<path d="M${x} 0V${H}" stroke="${p}" stroke-opacity="0.035"/>`;
  for (let y = 0; y < H; y += 30) s += `<path d="M0 ${y}H${W}" stroke="${p}" stroke-opacity="0.035"/>`;
  const xs = [420, 660, 900, 1140, 1380];
  const ys = [300, 520, 740, 930];
  const letters = 'ABCDE';
  xs.forEach((x, i) => {
    s += `<path d="M${x} 150V${H - 120}" stroke="${p}" stroke-opacity="0.6" stroke-width="1.5" stroke-dasharray="26 8 4 8"/>`;
    s += `<circle cx="${x}" cy="120" r="26" fill="none" stroke="${p}" stroke-width="2"/><text x="${x}" y="129" ${mono} font-size="24" fill="${p}" text-anchor="middle">${letters[i]}</text>`;
  });
  ys.forEach((y, i) => {
    s += `<path d="M300 ${y}H${W - 300}" stroke="${p}" stroke-opacity="0.6" stroke-width="1.5" stroke-dasharray="26 8 4 8"/>`;
    s += `<circle cx="270" cy="${y}" r="26" fill="none" stroke="${p}" stroke-width="2"/><text x="270" y="${y + 9}" ${mono} font-size="24" fill="${p}" text-anchor="middle">${i + 1}</text>`;
  });
  s += `<path d="M420 300H1380V740H1140V930H420Z" fill="${p}" fill-opacity="0.06" stroke="${p}" stroke-width="5"/>`;
  s += `<path d="M420 1010H1380" stroke="${p}" stroke-width="1.5"/>`;
  xs.forEach((x) => (s += `<path d="M${x} 995V1025" stroke="${p}" stroke-width="2"/>`));
  for (let i = 0; i < xs.length - 1; i++) s += `<text x="${(xs[i] + xs[i + 1]) / 2}" y="1000" ${mono} font-size="18" fill="${p}" text-anchor="middle">6000</text>`;
  [[420, 300], [1380, 300], [1380, 740], [1140, 930], [420, 930], [900, 520], [660, 740]].forEach(([x, y]) => {
    s += `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${hex(C.signal)}" stroke-width="3"/>` + cross(x, y, 24, hex(C.signal), 2.4);
  });
  s += `<text x="1420" y="296" ${mono} font-size="17" fill="${p}" fill-opacity="0.85">X 4 459 612.084</text><text x="1420" y="320" ${mono} font-size="17" fill="${p}" fill-opacity="0.85">Y 8 451 203.517</text>`;
  await compose('art-setting-out', base, s, W, H);
}

async function asBuilt() {
  const W = 1800, H = 1200;
  const base = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 245, g: 243, b: 236 } } }).png().toBuffer();
  const g = hex(C.graphite);
  let s = '';
  for (let x = 0; x < W; x += 24) s += `<path d="M${x} 0V${H}" stroke="${hex(C.slate)}" stroke-opacity="${x % 120 === 0 ? 0.16 : 0.06}"/>`;
  for (let y = 0; y < H; y += 24) s += `<path d="M0 ${y}H${W}" stroke="${hex(C.slate)}" stroke-opacity="${y % 120 === 0 ? 0.16 : 0.06}"/>`;
  const wall = (d) => `<path d="${d}" fill="none" stroke="${g}" stroke-width="14" stroke-linejoin="miter"/>`;
  s += wall('M360 240H1440V960H360Z');
  s += `<path d="M360 240H1440V960H360Z" fill="${hex(C.stone)}" fill-opacity="0.25"/>`;
  s += wall('M840 240V600M840 700V960M360 600H700M780 600H1440M1140 600V960');
  s += `<path d="M700 600A80 80 0 0 1 780 680" fill="none" stroke="${g}" stroke-width="2"/><path d="M840 600A100 100 0 0 0 840 700" fill="none" stroke="${g}" stroke-width="2"/>`;
  for (let x = 380; x < 1430; x += 22) s += `<path d="M${x} 250L${x + 10} 232" stroke="${g}" stroke-width="1.4"/>`;
  const dim = (x1, x2, y, label) =>
    `<path d="M${x1} ${y}H${x2}M${x1} ${y - 12}V${y + 12}M${x2} ${y - 12}V${y + 12}" stroke="${g}" stroke-width="1.6"/><path d="M${x1 - 8} ${y + 8}L${x1 + 8} ${y - 8}M${x2 - 8} ${y + 8}L${x2 + 8} ${y - 8}" stroke="${g}" stroke-width="2.4"/><text x="${(x1 + x2) / 2}" y="${y - 12}" ${mono} font-size="20" fill="${g}" text-anchor="middle">${label}</text>`;
  s += dim(360, 840, 160, '8 012') + dim(840, 1440, 160, '9 988') + dim(360, 1440, 1060, '18 000');
  s += `<g transform="rotate(-90 260 600)">${dim(-120 + 260, 600 + 140, 600, '12 004')}</g>`;
  [[1440, 240, '+12'], [360, 960, '−8'], [1140, 960, '+5'], [840, 240, '+3']].forEach(([x, y, v]) => {
    s += `<circle cx="${x}" cy="${y}" r="22" fill="none" stroke="${hex(C.signal)}" stroke-width="3"/><text x="${x + 30}" y="${y + 42}" ${mono} font-size="19" fill="${hex(C.signal)}">${v} mm</text>`;
  });
  s += `<g transform="translate(1600 1040)"><path d="M0 -60L18 0L0 -12L-18 0Z" fill="${g}"/><text x="0" y="30" ${mono} font-size="20" fill="${g}" text-anchor="middle">N</text></g>`;
  s += `<rect x="1240" y="1100" width="520" height="70" fill="none" stroke="${g}" stroke-width="1.5"/><text x="1260" y="1145" ${mono} font-size="18" fill="${g}">AS-BUILT  1:100  MAES17</text>`;
  await compose('art-as-built', base, s, W, H);
}

async function profile() {
  const W = 1800, H = 1200, gw = 900, gh = 420;
  const opts = { seed: 77, scale: 1.8, ridge: 0.4, gain: 0.44 };
  const h = terrain(gw, gh, opts);
  const sh = hillshade(h, gw, gh, { azimuth: 300, altitude: 28 });
  const topH = 840;
  const reliefImg = await raster(gw, gh, W, topH, (i) => darkRelief(h, sh, i, { warm: 0.2, cool: 0.2 }));
  const base = await sharp({ create: { width: W, height: H, channels: 3, background: { r: 30, g: 33, b: 30 } } })
    .composite([{ input: reliefImg, top: 0, left: 0 }])
    .png()
    .toBuffer();
  const iso = contours(h, gw, gh, levelsEvery(0.04), W / (gw - 1), topH / (gh - 1));
  const p = hex(C.paper);
  let s = contourSvg(iso, p, { minor: 0.08, major: 0.22 });
  // Road alignment: a smooth curve sampled for the profile.
  const align = [];
  for (let t = 0; t <= 1.0001; t += 0.01) align.push([120 + t * 1560, topH * (0.55 + 0.25 * Math.sin(t * 5.2) * (1 - t * 0.4))]);
  s += `<path d="M${align.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join('L')}" fill="none" stroke="${hex(C.signal)}" stroke-width="5"/>`;
  align.filter((_, i) => i % 20 === 0).forEach(([x, y], i) => {
    s += `<circle cx="${x}" cy="${y}" r="7" fill="${p}"/><text x="${x + 10}" y="${y - 12}" ${mono} font-size="16" fill="${p}">0+${String(i * 200).padStart(3, '0')}</text>`;
  });
  // Longitudinal profile panel.
  const py0 = topH + 40, py1 = H - 50;
  s += `<rect x="0" y="${topH}" width="${W}" height="${H - topH}" fill="${hex(C.graphite)}"/>`;
  for (let x = 120; x <= 1680; x += 78) s += `<path d="M${x} ${py0}V${py1}" stroke="${p}" stroke-opacity="0.08"/>`;
  for (let y = py0; y <= py1; y += 44) s += `<path d="M120 ${y}H1680" stroke="${p}" stroke-opacity="0.08"/>`;
  const ground = align.map(([x, y]) => {
    const gx = Math.min(gw - 1, Math.round((x / W) * gw));
    const gy = Math.min(gh - 1, Math.round((y / topH) * gh));
    return [x, py1 - h[gy * gw + gx] * (py1 - py0) * 0.9];
  });
  s += `<path d="M${ground.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join('L')}L1680 ${py1}L120 ${py1}Z" fill="${hex(C.olive)}" fill-opacity="0.35" stroke="${p}" stroke-width="2.4"/>`;
  const g0 = ground[0][1], g1 = ground[ground.length - 1][1];
  s += `<path d="M120 ${g0}L1680 ${g1}" stroke="${hex(C.signal)}" stroke-width="3" stroke-dasharray="14 8"/>`;
  s += `<text x="130" y="${py0 + 22}" ${mono} font-size="17" fill="${p}" fill-opacity="0.7">PROFILE  H 1:2000  V 1:200</text>`;
  await compose('art-profile', base, s, W, H);
}

async function hillsideProject() {
  const W = 1800, H = 1200, gw = 900, gh = 600;
  const h = terrain(gw, gh, { seed: 91, scale: 1.7, ridge: 0.3, bias: (x) => 0.4 * x });
  const sh = hillshade(h, gw, gh, { altitude: 40, z: 5 });
  const base = await raster(gw, gh, W, H, (i) => paperRelief(h, sh, i, { tint: 0.18 }));
  const iso = contours(h, gw, gh, levelsEvery(0.025), W / (gw - 1), H / (gh - 1));
  const g = hex(C.graphite);
  let s = contourSvg(iso, hex(C.oliveDeep), { minor: 0.3, major: 0.65, width: 1.3 });
  s += `<rect x="760" y="440" width="320" height="220" transform="rotate(12 920 550)" fill="${hex(C.graphite)}" fill-opacity="0.9"/>`;
  s += `<rect x="700" y="380" width="440" height="340" transform="rotate(12 920 550)" fill="none" stroke="${hex(C.signal)}" stroke-width="3" stroke-dasharray="12 8"/>`;
  [[620, 300], [1250, 360], [1180, 820], [560, 760], [920, 960], [1460, 600]].forEach(([x, y], i) => {
    s += cross(x, y, 12, g, 2) + `<text x="${x + 14}" y="${y - 10}" ${mono} font-size="16" fill="${g}">${(1286.2 + i * 2.41).toFixed(2)}</text>`;
  });
  await compose('art-project-hillside', base, s, W, H);
}

async function slopeProject() {
  const W = 1800, H = 1200, gw = 900, gh = 600;
  const h = terrain(gw, gh, { seed: 64, scale: 1.5, ridge: 0.5, gain: 0.42, bias: (x, y) => 0.5 * (1 - y) });
  const sh = hillshade(h, gw, gh, { azimuth: 250, altitude: 26, z: 5 });
  const base = await raster(gw, gh, W, H, (i) => darkRelief(h, sh, i, { warm: 0.3, cool: 0.15 }));
  const iso = contours(h, gw, gh, levelsEvery(0.03), W / (gw - 1), H / (gh - 1));
  let s = contourSvg(iso, hex(C.paper), { minor: 0.09, major: 0.25 });
  const r = rng(5);
  for (let i = 0; i < 14; i++) {
    const x = 300 + r() * 1200;
    const y = 300 + r() * 650;
    const len = 30 + r() * 50;
    const a = Math.PI * (0.35 + r() * 0.3);
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    s += `<circle cx="${x}" cy="${y}" r="6" fill="${hex(C.paper)}"/><path d="M${x} ${y}L${x2} ${y2}" stroke="${hex(C.signal)}" stroke-width="3.5"/><path d="M${x2} ${y2}l${-Math.cos(a - 0.5) * 12} ${-Math.sin(a - 0.5) * 12}M${x2} ${y2}l${-Math.cos(a + 0.5) * 12} ${-Math.sin(a + 0.5) * 12}" stroke="${hex(C.signal)}" stroke-width="3.5"/>`;
  }
  await compose('art-project-slope', base, s, W, H);
}

// Muted field palettes.
const fields = [[214, 210, 196], [196, 194, 176], [176, 178, 156], [154, 160, 134], [226, 222, 210], [186, 180, 160], [140, 148, 124]];
const darkFields = [[52, 58, 50], [66, 72, 60], [44, 50, 46], [78, 82, 68], [58, 66, 62]];

await reliefDusk();
await controlNetwork();
await surveyPlan();
await parcelArt('art-cadastre', { seed: 12, count: 30, stretch: 1.4, palette: fields, highlight: [0.52, 0.48] });
await parcelArt('art-land-division', { seed: 44, palette: fields, strips: 0.32 });
await parcelArt('art-project-lakeside', { seed: 18, count: 26, stretch: 1.6, palette: darkFields, dark: true, lake: 0.3, highlight: [0.62, 0.4] });
await parcelArt('art-project-plots', { seed: 73, palette: fields, strips: -0.5, highlight: [0.45, 0.5] });
await settingOut();
await asBuilt();
await profile();
await hillsideProject();
await slopeProject();
