import { useLayoutEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? () => undefined : useLayoutEffect;

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style'> {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** "rise" fades content up; "curtain" uncovers an image from the bottom edge. */
  kind?: 'rise' | 'curtain';
  delay?: number;
  style?: CSSProperties;
}

/**
 * Scroll-triggered reveal without hiding prerendered content: elements are only hidden
 * after hydration, and only when they are still below the fold. Crawlers, no-JS visitors
 * and reduced-motion users always see the content.
 */
export function Reveal({ as: Tag = 'div', children, className = '', kind = 'rise', delay = 0, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    el.dataset.reveal = 'hidden';
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.reveal = 'shown';
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      {...rest}
      ref={ref}
      data-reveal-kind={kind}
      className={className}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  );
}
