import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, ArrowUpRight, Info } from 'lucide-react';
import { companyConfig } from '@/config/company';
import { projects } from '@/content/projects';
import { ImmersiveHero } from '@/components/sections/ImmersiveHero';
import { ServicesAccordion } from '@/components/sections/ServicesAccordion';
import { MethodTraverse } from '@/components/sections/MethodTraverse';
import { FaqList } from '@/components/sections/FaqList';
import { ContactCta } from '@/components/sections/ContactCta';
import { StatsSection } from '@/components/sections/StatsSection';
import { Reveal } from '@/components/animations/Reveal';
import { Picture } from '@/components/ui/Picture';
import { LinkButton } from '@/components/ui/Button';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { TrigMarker } from '@/components/ui/TrigMarker';

interface TitledText {
  title: string;
  text: string;
}

interface ProjectText {
  title: string;
  category: string;
  imageAlt: string;
}

export function HomePage() {
  const { t } = useTranslation('home');

  return (
    <>
      <ImmersiveHero
        image="hero-video-poster"
        videoSrc="/videos/hero.mp4"
        imageAlt={t('hero.imageAlt')}
        aside={t('common:brand.tagline')}
        title={t('hero.title')}
        lede={t('hero.lede')}
        giantWord={companyConfig.name}
        actions={
          <>
            <LinkButton to="/services" variant="onDark" icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              {t('hero.ctaPrimary')}
            </LinkButton>
            <LinkButton to="/contacts" variant="outlineOnDark">
              {t('hero.ctaSecondary')}
            </LinkButton>
          </>
        }
      />
      <Intro />
      <section aria-labelledby="services-title" className="container-wide py-24 md:py-32">
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <Reveal className="max-w-2xl">
            <h2 id="services-title" className="type-display text-[clamp(2.25rem,1.5rem+3vw,4.25rem)]">
              {t('services.title')}
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">{t('services.lede')}</p>
          </Reveal>
          <LocalizedLink to="/services" className="group inline-flex items-center gap-2 font-medium">
            <span className="link-underline">{t('common:actions.allServices')}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </LocalizedLink>
        </div>
        <ServicesAccordion />
      </section>
      <MethodTraverse />
      <Technology />
      <Projects />
      <StatsSection />
      <WhyUs />
      <section aria-labelledby="faq-title" className="container-wide grid gap-12 py-24 md:grid-cols-6 md:py-32">
        <Reveal className="md:col-span-2">
          <h2 id="faq-title" className="type-display text-[clamp(2rem,1.4rem+2.4vw,3.5rem)]">
            {t('faq.title')}
          </h2>
          <p className="mt-4 text-ink-muted">{t('faq.lede')}</p>
          <LocalizedLink to="/faq" className="group mt-8 inline-flex items-center gap-2 font-medium">
            <span className="link-underline">{t('faq.link')}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </LocalizedLink>
        </Reveal>
        <div className="md:col-span-4">
          <FaqList limit={4} />
        </div>
      </section>
      <ContactCta title={t('cta.title')} text={t('cta.text')} button={t('cta.button')} />
    </>
  );
}

function Intro() {
  const { t } = useTranslation('home');
  const paragraphs = t('intro.paragraphs', { returnObjects: true }) as string[];
  return (
    <section aria-labelledby="intro-title" className="survey-grid relative">
      <div className="container-wide pb-24 pt-20 md:pb-36 md:pt-32">
        <div className="grid md:grid-cols-6">
          <Reveal className="md:col-span-5 md:col-start-2">
            <h2 id="intro-title" className="type-statement md:indent-[calc((100vw-2*var(--gutter))/6)] xl:indent-[calc((min(100vw,90rem)-2*var(--gutter))/6)]">
              {t('intro.title')}
            </h2>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-6 md:gap-0">
          <div className="md:col-span-3 md:pr-10">
            <Reveal kind="curtain">
              <Picture
                name="terrain-scan"
                alt={t('intro.imageAlt')}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[4/5] w-full object-cover object-[58%_50%]"
              />
            </Reveal>
          </div>
          <Reveal className="flex flex-col justify-end md:col-span-2 md:col-start-5" delay={150}>
            {paragraphs.map((p) => (
              <p key={p} className="mb-5 text-[1.0625rem] leading-relaxed text-graphite-soft">
                {p}
              </p>
            ))}
            <LocalizedLink to="/about" className="group mt-4 inline-flex items-center gap-2 font-medium">
              <span className="link-underline">{t('intro.link')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </LocalizedLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Technology() {
  const { t } = useTranslation('home');
  const items = t('technology.items', { returnObjects: true }) as TitledText[];
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-8%', '8%']);

  return (
    <section aria-labelledby="tech-title" className="container-wide grid gap-14 py-24 md:grid-cols-12 md:py-36">
      <div ref={ref} className="md:col-span-5">
        <Reveal kind="curtain" className="relative aspect-[3/4] overflow-hidden">
          <motion.div style={{ y }} className="absolute -inset-y-[10%] inset-x-0">
            <Picture
              name="total-station"
              alt={t('about:technology.imageAlt')}
              sizes="(min-width: 768px) 40vw, 100vw"
              className="h-full w-full object-cover object-[64%_50%]"
            />
          </motion.div>
        </Reveal>
      </div>
      <div className="md:col-span-6 md:col-start-7 md:self-center">
        <Reveal>
          <h2 id="tech-title" className="type-display text-[clamp(2.1rem,1.4rem+2.8vw,4rem)]">
            {t('technology.title')}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">{t('technology.lede')}</p>
        </Reveal>
        <dl className="mt-12 border-t border-graphite/15">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 80} className="grid gap-2 border-b border-graphite/15 py-6 sm:grid-cols-[14rem_1fr] sm:gap-8">
              <dt className="flex items-start gap-3 font-serif text-xl leading-snug">
                <TrigMarker className="mt-1.5 h-3.5 w-3.5 shrink-0 text-olive" />
                {item.title}
              </dt>
              <dd className="leading-relaxed text-ink-muted">{item.text}</dd>
            </Reveal>
          ))}
        </dl>
        <p className="mt-6 flex items-start gap-2 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t('technology.note')}
        </p>
      </div>
    </section>
  );
}

/** Asymmetric editorial grid: cell placement and image proportion per position. */
const PROJECT_LAYOUT = [
  { cell: 'md:col-span-7', aspect: 'aspect-[4/5]' },
  { cell: 'md:col-span-5 md:mt-40', aspect: 'aspect-[4/3]' },
  { cell: 'md:col-span-5 md:col-start-2', aspect: 'aspect-[4/3]' },
  { cell: 'md:col-span-5 md:col-start-8 md:-mt-24', aspect: 'aspect-[4/5]' },
] as const;

function Projects() {
  const { t } = useTranslation('home');
  const texts = t('projects.items', { returnObjects: true }) as ProjectText[];
  return (
    <section aria-labelledby="projects-title" className="bg-paper-deep">
      <div className="container-wide py-24 md:py-36">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 id="projects-title" className="type-display text-[clamp(2.25rem,1.5rem+3vw,4.25rem)]">
              {t('projects.title')}
            </h2>
            <p className="mt-5 max-w-xl text-lg text-ink-muted">{t('projects.lede')}</p>
          </div>
          <p className="flex max-w-sm items-start gap-2 border-l-2 border-signal pl-4 text-sm text-graphite-soft">
            {t('projects.notice')}
          </p>
        </Reveal>
        <ul className="mt-16 grid gap-x-8 gap-y-14 md:grid-cols-12">
          {projects.map((project, i) => {
            const text = texts[i];
            const layout = PROJECT_LAYOUT[i % PROJECT_LAYOUT.length];
            if (!text || !layout) return null;
            return (
              <li key={project.id} className={layout.cell}>
                <LocalizedLink to={`/services/${project.service}`} className="group block">
                  <Reveal kind="curtain" className={`relative overflow-hidden ${layout.aspect}`}>
                    <Picture
                      name={project.image}
                      alt={text.imageAlt}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-survey)] group-hover:scale-[1.04]"
                    />
                    {project.demo ? <DemoBadge className="absolute left-4 top-4" /> : null}
                  </Reveal>
                  <p className="mt-5 font-serif text-[0.9375rem] italic text-olive-deep">{text.category}</p>
                  <h3 className="mt-1 flex items-start justify-between gap-4 font-serif text-2xl leading-snug">
                    {text.title}
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </h3>
                </LocalizedLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function WhyUs() {
  const { t } = useTranslation('home');
  const items = t('why.items', { returnObjects: true }) as TitledText[];
  return (
    <section aria-labelledby="why-title" className="survey-grid">
      <div className="container-wide grid gap-14 py-24 md:grid-cols-6 md:py-36">
        <Reveal className="md:col-span-2">
          <h2 id="why-title" className="type-display text-[clamp(2.1rem,1.4rem+2.6vw,3.75rem)]">
            {t('why.title')}
          </h2>
        </Reveal>
        <ul className="grid gap-x-12 gap-y-14 sm:grid-cols-2 md:col-span-4">
          {items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 90} className="border-t border-graphite/20 pt-6">
              <TrigMarker className="h-4 w-4 text-signal" />
              <h3 className="mt-5 font-serif text-2xl leading-snug">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">{item.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
