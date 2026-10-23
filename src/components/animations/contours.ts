/**
 * Deterministic topographic contour generator. Produces nested, organically wobbling
 * closed curves around one or more "summits". Pure and seeded, so server and client
 * render identical SVG.
 */
export interface Summit {
  cx: number;
  cy: number;
  radius: number;
  levels: number;
  seed: number;
  /** Horizontal stretch of the hill. */
  stretch?: number;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function closedCurve(points: [number, number][]): string {
  const n = points.length;
  const p = (i: number) => points[((i % n) + n) % n] as [number, number];
  const f = (v: number) => Math.round(v).toString();
  let d = `M${f(p(0)[0])} ${f(p(0)[1])}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(x2)} ${f(y2)}`;
  }
  return `${d}Z`;
}

export interface ContourPath {
  d: string;
  /** 0 for the outermost line, rising towards the summit. */
  level: number;
  /** Every fifth line is an index contour, drawn heavier as on survey plans. */
  index: boolean;
}

export function generateContours(summits: Summit[], samples = 36): ContourPath[] {
  const paths: ContourPath[] = [];
  for (const summit of summits) {
    const rand = rng(summit.seed);
    const harmonics = [2, 3, 4, 5].map((k) => ({
      k,
      amp: (0.05 + rand() * 0.11) / (k * 0.55),
      phase: rand() * Math.PI * 2,
      drift: (rand() - 0.5) * 0.9,
    }));
    const stretch = summit.stretch ?? 1.35;
    for (let level = 0; level < summit.levels; level++) {
      const t = level / summit.levels;
      const r = summit.radius * (1 - t * 0.92);
      const pts: [number, number][] = [];
      for (let i = 0; i < samples; i++) {
        const a = (i / samples) * Math.PI * 2;
        let wobble = 1;
        for (const h of harmonics) wobble += h.amp * (1 - t * 0.5) * Math.sin(h.k * a + h.phase + h.drift * t * 3);
        pts.push([summit.cx + Math.cos(a) * r * wobble * stretch, summit.cy + Math.sin(a) * r * wobble]);
      }
      paths.push({ d: closedCurve(pts), level, index: level % 5 === 0 });
    }
  }
  return paths;
}
