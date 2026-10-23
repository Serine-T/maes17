import type { ReactNode } from 'react';
import { TopographicBackground } from '@/components/animations/TopographicBackground';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useBreadcrumbs } from '@/app/usePage';

interface Props {
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}

/** Light page header for inner pages: contour plan excerpt, breadcrumbs, headline. */
export function PaperHero({ title, lede, children }: Props) {
  const crumbs = useBreadcrumbs();
  return (
    <section className="survey-grid relative isolate overflow-hidden border-b border-graphite/10">
      <TopographicBackground
        className="absolute inset-0 -z-10 h-full w-full text-graphite/[0.13]"
        summits={[
          { cx: 1300, cy: 300, radius: 480, levels: 17, seed: 5 },
          { cx: 120, cy: 900, radius: 340, levels: 12, seed: 17, stretch: 1.7 },
        ]}
      />
      <div className="container-wide pb-16 pt-[calc(var(--header-h)+2.5rem)] md:pb-24 md:pt-[calc(var(--header-h)+4rem)]">
        <Breadcrumbs items={crumbs} />
        <h1 className="type-display mt-10 max-w-5xl text-[clamp(2.6rem,1.6rem+4.4vw,6rem)] md:mt-16">{title}</h1>
        {lede ? <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">{lede}</p> : null}
        {children}
      </div>
    </section>
  );
}
