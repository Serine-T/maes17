import { SYMBOL_VIEWBOX, symbolPaths, WORDMARK_WIDTH, wordmarkPaths } from './logo-paths';

interface SymbolProps {
  className?: string;
  /** Colour of the control-point triangle; defaults to the text colour. */
  accent?: string;
  title?: string;
}

export function LogoSymbol({ className = '', accent = 'currentColor', title }: SymbolProps) {
  return (
    <svg
      viewBox={SYMBOL_VIEWBOX}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={symbolPaths.outer} strokeWidth={2} opacity={0.55} />
      <path d={symbolPaths.inner} strokeWidth={2} />
      <path d={symbolPaths.triangle} strokeWidth={2.4} stroke={accent} />
      <circle {...symbolPaths.dot} fill={accent} stroke="none" />
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={`-1.5 -1.5 ${WORDMARK_WIDTH + 3} 23`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      {wordmarkPaths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/** Primary horizontal lockup: symbol + wordmark. Inherits text colour, so it works on light and dark. */
export function Logo({ className = '', accent }: { className?: string; accent?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoSymbol className="h-8 w-8 shrink-0" accent={accent} />
      <Wordmark className="h-[1.05rem] w-auto" />
    </span>
  );
}
