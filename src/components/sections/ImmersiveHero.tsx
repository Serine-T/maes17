import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import type { ImageName } from '@/content/images';
import { Picture } from '@/components/ui/Picture';
import { Coordinate } from '@/components/ui/Coordinate';
import { TopographicBackground } from '@/components/animations/TopographicBackground';
import { HeroVideo } from './HeroVideo';

interface Props {
  image: ImageName;
  imageAlt: string;
  /** Optional looping background video; `image` then serves as its poster and fallback. */
  videoSrc?: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Small italic line, top-left (e.g. the tagline). */
  aside?: ReactNode;
  coordinate?: { value: string; caption?: string };
  /** Oversized condensed word anchored to the bottom edge; decorative. */
  giantWord?: string;
  top?: ReactNode;
  actions?: ReactNode;
  size?: 'full' | 'tall';
}

/**
 * Full-bleed photographic hero. On scroll the photograph drifts and a paper-coloured
 * "mist" rises from the bottom, dissolving the image into the page below.
 * The headline and image are rendered visible in the HTML; only decorative layers animate in.
 */
export function ImmersiveHero({
  image,
  imageAlt,
  videoSrc,
  title,
  lede,
  aside,
  coordinate,
  giantWord,
  top,
  actions,
  size = 'full',
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '16%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, reduce ? 1.02 : 1.14]);
  const mist = useTransform(scrollYProgress, [0.15, 0.8], [0, 1]);
  const wordY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-35%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-12%']);

  const height = size === 'full' ? 'h-[100svh] min-h-[40rem]' : 'h-[88svh] min-h-[36rem]';

  return (
    <section ref={ref} className={`relative isolate overflow-hidden bg-graphite text-paper ${height}`}>
      <motion.div className="absolute inset-0 -z-20" style={{ y: imageY, scale: imageScale }}>
        <Picture name={image} alt={imageAlt} priority sizes="100vw" className="h-full w-full object-cover" />
      </motion.div>
      {videoSrc ? <HeroVideo src={videoSrc} style={{ y: imageY, scale: imageScale }} /> : null}
      {videoSrc ? <div className="absolute inset-0 -z-10 bg-black/30" aria-hidden="true" /> : null}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(34_37_34/0.7)_0%,rgb(34_37_34/0.15)_32%,rgb(34_37_34/0.25)_60%,rgb(34_37_34/0.78)_100%)]"
        aria-hidden="true"
      />
      <div className="survey-grid survey-grid-dark absolute inset-0 -z-10" aria-hidden="true" />
      <TopographicBackground className="enter-fade absolute inset-0 -z-10 h-full w-full text-paper/20" />

      {giantWord ? (
        <motion.p
          aria-hidden="true"
          style={{ y: wordY }}
          className="type-condensed enter-rise pointer-events-none absolute inset-x-0 -bottom-[0.08em] -z-10 select-none text-center text-[min(27vw,46svh)] leading-[0.8] text-paper/90 [animation-delay:250ms]"
        >
          {giantWord}
        </motion.p>
      ) : null}

      <motion.div
        style={{ y: contentY }}
        className={`container-wide relative flex h-full flex-col pt-[calc(var(--header-h)+2rem)] ${
          giantWord ? 'pb-[min(24vw,38svh)] md:pb-[min(19vw,32svh)]' : 'pb-16 md:pb-24'
        } justify-end`}
      >
        {top ? <div className="mb-auto">{top}</div> : null}
        <div className="grid items-end gap-8 md:grid-cols-6">
          <div className="md:col-span-4">
            {aside ? <div className="enter-rise mb-6 font-serif text-lg italic text-paper/85">{aside}</div> : null}
            <h1 className="type-display text-shadow-soft text-[clamp(2.6rem,1.6rem+4.4vw,6.25rem)]">{title}</h1>
            {lede ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85 md:text-xl">{lede}</p> : null}
            {actions ? <div className="mt-9 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {coordinate ? (
            <Coordinate
              tone="light"
              value={coordinate.value}
              caption={coordinate.caption}
              className="enter-rise md:col-span-2 md:items-end md:text-right [animation-delay:500ms]"
            />
          ) : null}
        </div>
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ opacity: mist }}
        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(0deg,var(--color-paper)_8%,rgb(247_246_242/0.85)_45%,rgb(247_246_242/0)_100%)]"
      />
    </section>
  );
}
