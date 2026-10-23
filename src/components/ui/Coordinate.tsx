interface Props {
  value: string;
  caption?: string;
  tone?: 'dark' | 'light';
  className?: string;
}

/** Bracketed coordinate annotation, like a survey sheet callout. */
export function Coordinate({ value, caption, tone = 'dark', className = '' }: Props) {
  const color = tone === 'light' ? 'text-paper/80' : 'text-ink-muted';
  return (
    <p className={`flex flex-col gap-1 ${color} ${className}`}>
      <span className="type-coord" aria-hidden="true">[ {value} ]</span>
      {caption ? <span className="font-serif text-sm italic">{caption}</span> : null}
    </p>
  );
}
