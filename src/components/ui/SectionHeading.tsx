import type { ReactNode } from 'react';

interface Props {
  id?: string;
  title: ReactNode;
  lede?: ReactNode;
  as?: 'h1' | 'h2';
  tone?: 'dark' | 'light';
  className?: string;
}

export function SectionHeading({ id, title, lede, as: Tag = 'h2', tone = 'dark', className = '' }: Props) {
  const muted = tone === 'light' ? 'text-paper/75' : 'text-ink-muted';
  return (
    <div className={`max-w-3xl ${className}`}>
      <Tag id={id} className="type-display text-[clamp(2.1rem,1.4rem+3vw,4.25rem)]">
        {title}
      </Tag>
      {lede ? <p className={`mt-5 max-w-xl text-lg leading-relaxed ${muted}`}>{lede}</p> : null}
    </div>
  );
}
