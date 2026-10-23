import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { companyConfig } from '@/config/company';
import { Reveal } from '@/components/animations/Reveal';
import { TopographicBackground } from '@/components/animations/TopographicBackground';

const format = (n: number) => new Intl.NumberFormat('en-US').format(n).replace(/,/g, ' ');

/**
 * Odometer-style figure: every digit rolls through a strip of numbers and lands on its
 * value, staggered from left to right. The strips are CSS-generated content, so the
 * HTML (and screen readers) only contain the real number. The server renders the final
 * position, so the figure is correct without JavaScript; the roll only plays on scroll.
 */
function Odometer({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<'final' | 'idle' | 'run'>('final');
  const text = `${format(value)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setState('idle');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      requestAnimationFrame(() => setState('run'));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let digitIndex = 0;
  return (
    <span ref={ref} className="odometer" data-state={state}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {[...text].map((ch, i) => {
          if (!/\d/.test(ch)) return <span key={i}>{ch === ' ' ? '\u2009' : ch}</span>;
          const d = Number(ch);
          const order = digitIndex++;
          return (
            <span key={i} className="odometer-cell">
              <span
                className="odometer-strip"
                style={{ '--d': d, '--delay': `${order * 110}ms` } as CSSProperties}
              />
              <span className="invisible">{ch}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

export function StatsSection() {
  const { t } = useTranslation('home');
  const { stats } = companyConfig;
  return (
    <section aria-labelledby="stats-title" className="survey-grid relative isolate overflow-hidden border-y border-graphite/10">
      <TopographicBackground
        className="absolute inset-0 -z-10 h-full w-full text-graphite/[0.08]"
        summits={[{ cx: 1400, cy: 500, radius: 520, levels: 16, seed: 13 }]}
        animate={false}
      />
      <div className="container-wide py-24 md:py-32">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 id="stats-title" className="type-display text-[clamp(2.1rem,1.4rem+2.6vw,3.75rem)]">
              {t('stats.title')}
            </h2>
            <p className="mt-4 max-w-xl text-lg text-ink-muted">{t('stats.lede')}</p>
          </div>
          {stats.items.some((item) => !item.confirmed) ? (
            <p className="max-w-xs border-l-2 border-signal pl-4 text-sm text-graphite-soft">{t('stats.notice')}</p>
          ) : null}
        </Reveal>
        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {stats.items.map((item, i) => (
            <Reveal key={item.key} delay={i * 90} className="flex flex-col border-t border-graphite/20 pt-5">
              <dt className="order-2 mt-3 max-w-[14rem] text-[0.9375rem] leading-snug text-ink-muted">{t(`stats.items.${item.key}`)}</dt>
              <dd className="order-1 type-condensed text-[clamp(3.75rem,2rem+6vw,8rem)] text-graphite">
                <Odometer value={item.value} suffix={item.suffix} />
                {!item.confirmed ? (
                  <span className="align-super font-sans text-[0.25em] text-signal" aria-hidden="true">
                    *
                  </span>
                ) : null}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
