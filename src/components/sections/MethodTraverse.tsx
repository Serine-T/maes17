import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { Reveal } from '@/components/animations/Reveal';
import { TrigMarker } from '@/components/ui/TrigMarker';

interface Step {
  title: string;
  text: string;
}

/**
 * The working process drawn as a survey traverse: a measured line that runs from
 * station to station as the visitor scrolls. Steps are a real sequence, so they are numbered.
 */
export function MethodTraverse() {
  const { t } = useTranslation('home');
  const steps = t('method.steps', { returnObjects: true }) as Step[];
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <section aria-labelledby="method-title" className="survey-grid survey-grid-dark relative overflow-hidden bg-graphite text-paper">
      <div className="container-wide py-24 md:py-36">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="method-title" className="type-statement">
            {t('method.title')}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-paper/70">{t('method.lede')}</p>
        </Reveal>

        <ol ref={ref} className="relative mx-auto mt-20 max-w-5xl md:mt-28">
          {/* Static dashed line + the solid measured line drawn with scroll. */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-[0.4375rem] top-0 w-px bg-[repeating-linear-gradient(180deg,rgb(247_246_242/0.3)_0_6px,transparent_6px_12px)] md:left-1/2"
          />
          <motion.span
            aria-hidden="true"
            style={{ scaleY: reduce ? 1 : progress }}
            className="absolute bottom-0 left-[0.4375rem] top-0 w-px origin-top bg-signal md:left-1/2"
          />
          {steps.map((step, i) => {
            const right = i % 2 === 1;
            return (
              <li key={step.title} className="relative grid pb-16 pl-10 last:pb-0 md:grid-cols-2 md:gap-24 md:pb-24 md:pl-0">
                <span className="absolute left-0 top-1 flex h-4 w-4 items-center justify-center bg-graphite md:left-1/2 md:-translate-x-1/2">
                  <TrigMarker className="h-4 w-4 text-signal" />
                </span>
                <Reveal className={right ? 'md:col-start-2' : 'md:text-right'}>
                  <p className="type-coord text-paper/55">ST {String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 font-serif text-2xl leading-snug md:text-[1.9rem]">{step.title}</h3>
                  <p className={`mt-3 max-w-md leading-relaxed text-paper/70 ${right ? '' : 'md:ml-auto'}`}>{step.text}</p>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
