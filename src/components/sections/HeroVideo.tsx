import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, type MotionStyle } from 'motion/react';
import { Pause, Play } from 'lucide-react';

interface Props {
  src: string;
  /** Parallax transform shared with the poster layer. */
  style?: MotionStyle;
}

/**
 * Looping, muted background video layered over the prerendered poster image.
 * It is mounted only after hydration and skipped for reduced-motion and Save-Data
 * visitors, so it never delays the first paint or the LCP image. Playback pauses
 * while the hero is off-screen, and a visible control lets anyone stop it.
 */
export function HeroVideo({ src, style }: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!reduce && !connection?.saveData) setEnabled(true);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (entry.isIntersecting && !paused) void video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [enabled, paused]);

  if (!enabled) return null;

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => undefined);
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <>
      <motion.div className="absolute inset-0 -z-20" style={style}>
        <video
        ref={ref}
        className={`h-full w-full object-cover transition-opacity duration-[1.2s] ${visible ? 'opacity-100' : 'opacity-0'}`}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => setVisible(true)}
        />
      </motion.div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused}
        aria-label={paused ? t('video.play') : t('video.pause')}
        className="absolute bottom-24 right-4 z-20 inline-flex h-10 w-10 items-center justify-center border border-paper/30 text-paper/80 transition-colors hover:border-paper hover:text-paper md:bottom-8 md:right-[var(--gutter)]"
      >
        {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
      </button>
    </>
  );
}
