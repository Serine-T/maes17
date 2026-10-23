import { useMemo } from 'react';
import { generateContours, type Summit } from './contours';

interface Props {
  summits?: Summit[];
  viewBox?: string;
  className?: string;
  /** Draw the lines in on first paint (CSS only, disabled for reduced motion). */
  animate?: boolean;
  strokeClassName?: string;
}

const DEFAULT_SUMMITS: Summit[] = [
  { cx: 1180, cy: 260, radius: 420, levels: 16, seed: 11 },
  { cx: 260, cy: 760, radius: 360, levels: 13, seed: 29, stretch: 1.6 },
];

/** Decorative SVG contour lines, like an excerpt from a topographic plan. */
export function TopographicBackground({
  summits = DEFAULT_SUMMITS,
  viewBox = '0 0 1600 1000',
  className = '',
  animate = true,
  strokeClassName = 'stroke-current',
}: Props) {
  const paths = useMemo(() => generateContours(summits), [summits]);
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none ${className}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          pathLength={1}
          className={`${strokeClassName} ${animate ? 'contour-draw' : ''}`}
          strokeWidth={p.index ? 1.4 : 0.7}
          vectorEffect="non-scaling-stroke"
          style={animate ? { animationDelay: `${120 + (p.level * 70 + (i % 3) * 40)}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
