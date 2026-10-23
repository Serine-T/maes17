/**
 * MAES17 brand geometry, shared by the React logo and the static SVG/PNG assets.
 *
 * Symbol: a triangulation (trig) point — the cartographic sign for a geodetic control
 * point — sitting inside two terrain contour lines. Wordmark: monoline capitals drawn
 * on the same stroke weight so the mark stays crisp at small sizes.
 */
export const SYMBOL_VIEWBOX = '0 0 48 48';
export const symbolPaths = {
  outer: 'M26 4C37 5 45 13 44 24C43 34 36 43 24 44C13 45 4 37 4 26C4 18 8 13 13 9C17 6 21 3.6 26 4Z',
  inner: 'M25 11C32 11.5 37.5 17 37 24.5C36.5 31.5 31 37 24 37C17 37 11.5 32 11.5 25C11.5 20 13.5 17 16.5 14.5C19 12.3 21.7 10.8 25 11Z',
  triangle: 'M24 16.5L31 29H17Z',
  dot: { cx: 24, cy: 24.8, r: 1.7 },
};

const S_POINTS: [number, number][][] = [
  [[10, 1.2], [8, 0], [5.6, 0]],
  [[2.6, 0], [0.6, 1.9], [0.6, 4.8]],
  [[0.6, 7.6], [2.6, 8.9], [5.6, 9.7]],
  [[8.8, 10.6], [11, 12], [11, 15.1]],
  [[11, 18.2], [8.6, 20], [5.5, 20]],
  [[2.8, 20], [0.8, 18.7], [0, 16.6]],
];

/** The letter S as a cubic path, shifted horizontally by `ox`. */
function sPath(ox: number): string {
  const f = (n: number) => Number((n + ox).toFixed(2));
  return `M${f(11)} 3.2` + S_POINTS.map((seg) => `C${seg.map(([x, y]) => `${f(x)} ${y}`).join(' ')}`).join('');
}

/** Wordmark "MAES17" on a 92 × 20 grid, monoline strokes. */
export const WORDMARK_WIDTH = 92;
export const wordmarkPaths = [
  'M1 20V1L7.5 12L14 1V20',
  'M21 20L27 0L33 20',
  'M23.1 13H30.9',
  'M50 0H40V20H50',
  'M40 10H48',
  sPath(57),
  'M73 4L77 0V20',
  'M83 0H92L85 20',
];
