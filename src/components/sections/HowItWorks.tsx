import { useRef, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import type { ImageName } from '@/content/images';
import { Picture } from '@/components/ui/Picture';

interface Step {
  title: string;
  text: string;
}

/** One illustration per step of the process, in order. */
const STEP_IMAGES: ImageName[] = ['art-cadastre', 'art-control-network', 'total-station', 'art-profile', 'art-survey-plan'];

/**
 * "How it works": a scroll-driven process. On large screens the section pins to the
 * viewport while the visitor scrolls; the active step expands, its large title is shown
 * on the left and the matching image crossfades on the right. On small screens the steps
 * are simply stacked. All step text is always in the HTML.
 */
export function HowItWorks() {
  const { t } = useTranslation('home');
  const steps = t('method.steps', { returnObjects: true }) as Step[];
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length * 0.999)));
    setActive((prev) => (prev === next ? prev : next));
  });

  /** Jump to a step by scrolling to its slice of the pinned section. */
  const goTo = (index: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((index + 0.5) / steps.length) * travel, behavior: reduce ? 'auto' : 'smooth' });
  };

  const current = steps[active];

  return (
    <section ref={ref} aria-labelledby="method-title" className="relative bg-graphite text-paper lg:h-[calc(var(--steps)*75vh+25vh)]" style={{ '--steps': steps.length } as CSSProperties}>
      <div className="survey-grid survey-grid-dark lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="container-wide pb-10 pt-20 text-center md:pt-24 lg:pb-8 lg:pt-[calc(var(--header-h)+2rem)]">
          <h2 id="method-title" className="type-display text-[clamp(2.1rem,1.4rem+2.6vw,3.75rem)]">
            {t('method.title')}
          </h2>
          <svg viewBox="0 0 220 14" className="mx-auto mt-3 h-3 w-44 text-signal" aria-hidden="true">
            <path d="M2 9C40 3 70 12 110 7s70-5 108 1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-paper/70">{t('method.lede')}</p>
        </div>

        <div className="container-wide grid flex-1 gap-10 pb-20 lg:min-h-0 lg:grid-cols-12 lg:gap-8 lg:pb-12">
          {/* Large title of the active step (desktop). */}
          <div className="hidden lg:col-span-4 lg:flex lg:flex-col lg:justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden="true"
              >
                <p className="type-coord mb-4 text-paper/55">
                  {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                </p>
                <p className="font-serif text-[clamp(2rem,1.2rem+1.8vw,3.25rem)] italic leading-tight">{current?.title}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step list. */}
          <ol className="flex flex-col lg:col-span-4 lg:justify-center">
            {steps.map((step, i) => {
              const isActive = i === active;
              return (
                <li key={step.title} className="border-t border-paper/15 last:border-b">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={isActive ? 'step' : undefined}
                    className={`flex w-full items-baseline gap-5 py-4 text-left transition-colors duration-300 lg:py-3.5 ${
                      isActive ? 'text-paper' : 'text-paper lg:text-paper/45 lg:hover:text-paper/80'
                    }`}
                  >
                    <span className="font-serif text-xl italic tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-serif text-xl italic leading-snug md:text-2xl">{step.title}</span>
                  </button>
                  {/* Collapsed steps keep their text in the DOM; grid rows animate the height. */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-survey)] ${
                      isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[1fr] opacity-100 lg:grid-rows-[0fr] lg:opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pl-11 leading-relaxed text-paper/70">{step.text}</p>
                      <div className="mb-6 ml-11 aspect-[4/3] overflow-hidden lg:hidden">
                        <Picture name={STEP_IMAGES[i] ?? 'art-survey-plan'} alt="" sizes="90vw" className="h-full w-full object-cover" />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Image of the active step (desktop). */}
          <div className="relative hidden overflow-hidden lg:col-span-4 lg:block lg:min-h-[22rem]" aria-hidden="true">
            {STEP_IMAGES.slice(0, steps.length).map((image, i) => (
              <div
                key={image}
                className={`absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-[var(--ease-survey)] ${
                  i === active ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
                }`}
              >
                <Picture name={image} alt="" sizes="33vw" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
