import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Info } from 'lucide-react';
import { services } from '@/content/services';
import { PaperHero } from '@/components/sections/PaperHero';
import { ContactCta } from '@/components/sections/ContactCta';
import { Reveal } from '@/components/animations/Reveal';
import { Picture } from '@/components/ui/Picture';
import { LocalizedLink } from '@/components/ui/LocalizedLink';

export function ServicesPage() {
  const { t } = useTranslation('services');
  return (
    <>
      <PaperHero title={t('page.title')} lede={t('page.lede')}>
        <p className="mt-8 flex max-w-2xl items-start gap-2 text-sm text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {t('page.scopeNote')}
        </p>
      </PaperHero>

      <section className="container-wide py-20 md:py-28" aria-label={t('page.title')}>
        <ul className="flex flex-col">
          {services.map((service, i) => {
            const flip = i % 2 === 1;
            const when = t(`items.${service.slug}.when`, { returnObjects: true }) as string[];
            return (
              <li key={service.slug} className="border-t border-graphite/15 py-12 md:py-16">
                <LocalizedLink to={`/services/${service.slug}`} className="group grid items-center gap-8 md:grid-cols-12 md:gap-12">
                  <Reveal kind="curtain" className={`overflow-hidden md:col-span-5 ${flip ? 'md:order-2 md:col-start-8' : ''}`}>
                    <Picture
                      name={service.image}
                      alt=""
                      sizes="(min-width: 768px) 40vw, 100vw"
                      className="aspect-[3/2] w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-survey)] group-hover:scale-[1.04]"
                    />
                  </Reveal>
                  <div className={`md:col-span-6 ${flip ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
                    <service.icon className="h-5 w-5 text-olive-deep" aria-hidden="true" />
                    <h2 className="mt-4 font-serif text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] leading-tight">
                      {t(`items.${service.slug}.title`)}
                    </h2>
                    <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">{t(`items.${service.slug}.summary`)}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {when.slice(0, 2).map((w) => (
                        <li key={w} className="border border-graphite/15 px-3 py-1 text-[0.8125rem] text-graphite-soft">
                          {w}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-7 inline-flex items-center gap-2 font-medium">
                      <span className="link-underline">{t('common:actions.learnMore')}</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </LocalizedLink>
              </li>
            );
          })}
        </ul>
      </section>

      <ContactCta title={t('home:cta.title')} text={t('home:cta.text')} button={t('home:cta.button')} />
    </>
  );
}
