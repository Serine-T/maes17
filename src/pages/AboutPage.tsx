import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import { ImmersiveHero } from '@/components/sections/ImmersiveHero';
import { ContactCta } from '@/components/sections/ContactCta';
import { Reveal } from '@/components/animations/Reveal';
import { Picture } from '@/components/ui/Picture';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { TrigMarker } from '@/components/ui/TrigMarker';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useBreadcrumbs } from '@/app/usePage';

interface TitledText {
  title: string;
  text: string;
}

export function AboutPage() {
  const { t } = useTranslation('about');
  const crumbs = useBreadcrumbs();
  const overview = t('overview.paragraphs', { returnObjects: true }) as string[];
  const values = t('values.items', { returnObjects: true }) as TitledText[];
  const quality = t('quality.items', { returnObjects: true }) as string[];

  return (
    <>
      <ImmersiveHero
        size="tall"
        image="art-relief-dusk"
        imageAlt={t('hero.imageAlt')}
        top={<Breadcrumbs items={crumbs} tone="light" />}
        title={t('hero.title')}
        lede={t('hero.lede')}
      />

      <section aria-labelledby="overview-title" className="survey-grid">
        <div className="container-wide grid gap-12 py-24 md:grid-cols-6 md:py-36">
          <Reveal className="md:col-span-2">
            <h2 id="overview-title" className="type-display text-[clamp(2.1rem,1.4rem+2.6vw,3.75rem)]">
              {t('overview.title')}
            </h2>
          </Reveal>
          <Reveal className="md:col-span-3 md:col-start-4" delay={120}>
            {overview.map((p, i) => (
              <p key={p} className={i === 0 ? 'font-serif text-2xl leading-snug' : 'mt-6 text-lg leading-relaxed text-ink-muted'}>
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-label={`${t('mission.title')} / ${t('vision.title')}`} className="bg-graphite text-paper">
        <div className="container-wide grid md:grid-cols-2">
          {(['mission', 'vision'] as const).map((key, i) => (
            <Reveal
              key={key}
              delay={i * 120}
              className={`py-20 md:py-28 ${i === 0 ? 'md:border-r md:border-paper/15 md:pr-16' : 'border-t border-paper/15 md:border-t-0 md:pl-16'}`}
            >
              <h2 className="font-serif text-lg italic text-paper/70">{t(`${key}.title`)}</h2>
              <p className="type-statement mt-6 text-[clamp(1.5rem,1rem+1.8vw,2.6rem)]">{t(`${key}.text`)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="values-title" className="container-wide py-24 md:py-36">
        <Reveal>
          <h2 id="values-title" className="type-display max-w-2xl text-[clamp(2.1rem,1.4rem+2.6vw,3.75rem)]">
            {t('values.title')}
          </h2>
        </Reveal>
        <ul className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 80} className="border-t border-graphite/20 pt-6">
              <TrigMarker className="h-4 w-4 text-signal" />
              <h3 className="mt-5 font-serif text-2xl leading-snug">{v.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-muted">{v.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-labelledby="tech-title" className="bg-paper-deep">
        <div className="container-wide grid gap-14 py-24 md:grid-cols-12 md:py-36">
          <div className="md:col-span-5">
            <Reveal kind="curtain">
              <Picture
                name="total-station"
                alt={t('technology.imageAlt')}
                sizes="(min-width: 768px) 40vw, 100vw"
                className="aspect-[4/5] w-full object-cover object-[64%_50%]"
              />
            </Reveal>
          </div>
          <div className="flex flex-col justify-center gap-14 md:col-span-6 md:col-start-7">
            <Reveal>
              <h2 id="tech-title" className="type-display text-[clamp(2rem,1.4rem+2.2vw,3.25rem)]">
                {t('technology.title')}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-muted">{t('technology.text')}</p>
            </Reveal>
            <Reveal>
              <h2 className="type-display text-[clamp(2rem,1.4rem+2.2vw,3.25rem)]">{t('quality.title')}</h2>
              <ul className="mt-6 space-y-4">
                {quality.map((q) => (
                  <li key={q} className="flex gap-3 leading-relaxed">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-olive-deep" aria-hidden="true" />
                    {q}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="method-title" className="container-wide grid gap-12 py-24 md:grid-cols-6 md:py-32">
        <Reveal className="md:col-span-3">
          <h2 id="method-title" className="type-display text-[clamp(2rem,1.4rem+2.2vw,3.25rem)]">
            {t('methodology.title')}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted">{t('methodology.lede')}</p>
          <LocalizedLink to="/#method-title" className="group mt-8 inline-flex items-center gap-2 font-medium">
            <span className="link-underline">{t('methodology.link')}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </LocalizedLink>
        </Reveal>
        <Reveal className="border-l border-graphite/15 pl-8 md:col-span-2 md:col-start-5" delay={120}>
          <h2 className="font-serif text-2xl">{t('team.title')}</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">{t('team.text')}</p>
        </Reveal>
      </section>

      <ContactCta title={t('cta.title')} text={t('cta.text')} button={t('cta.button')} />
    </>
  );
}
