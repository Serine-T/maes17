import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, FileText, MessageCircle, Phone, Send } from 'lucide-react';
import { companyConfig } from '@/config/company';
import { getService, services } from '@/content/services';
import { ImmersiveHero } from '@/components/sections/ImmersiveHero';
import { Reveal } from '@/components/animations/Reveal';
import { Picture } from '@/components/ui/Picture';
import { AnchorButton, LinkButton } from '@/components/ui/Button';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { TrigMarker } from '@/components/ui/TrigMarker';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { telUrl, whatsappUrl } from '@/components/contact/inquiry';
import { useBreadcrumbs } from '@/app/usePage';
import { NotFoundPage } from './NotFoundPage';

export function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getService(slug);
  const { t } = useTranslation('services');
  const crumbs = useBreadcrumbs();
  if (!service) return <NotFoundPage />;

  const key = `items.${service.slug}`;
  const when = t(`${key}.when`, { returnObjects: true }) as string[];
  const includes = t(`${key}.includes`, { returnObjects: true }) as string[];
  const deliverables = t(`${key}.deliverables`, { returnObjects: true }) as string[];
  const related = service.related.map((s) => getService(s)).filter((s) => s !== undefined);
  const others = services.filter((s) => s.slug !== service.slug && !service.related.includes(s.slug));

  return (
    <>
      <ImmersiveHero
        size="tall"
        image={service.image}
        imageAlt=""
        top={<Breadcrumbs items={crumbs} tone="light" />}
        title={t(`${key}.title`)}
        lede={t(`${key}.summary`)}
        actions={
          <>
            <AnchorButton href={telUrl} variant="onDark" icon={<Phone className="h-4 w-4" aria-hidden="true" />}>
              {t('common:actions.callNumber')}
            </AnchorButton>
            <LinkButton to="/contacts" variant="outlineOnDark">
              {t('labels.request')}
            </LinkButton>
          </>
        }
      />

      <div className="container-wide grid gap-16 py-20 md:py-28 lg:grid-cols-12">
        <article className="lg:col-span-7">
          <Reveal as="section" aria-labelledby="involves">
            <h2 id="involves" className="font-serif text-lg italic text-olive-deep">
              {t('labels.involves')}
            </h2>
            <p className="type-display mt-5 text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] leading-snug">{t(`${key}.intro`)}</p>
          </Reveal>

          <div className="mt-16 grid gap-14 md:grid-cols-2">
            <Reveal as="section" aria-labelledby="when">
              <h2 id="when" className="border-b border-graphite/15 pb-3 font-serif text-2xl">
                {t('labels.when')}
              </h2>
              <ul className="mt-5 space-y-3.5">
                {when.map((w) => (
                  <li key={w} className="flex gap-3 leading-relaxed">
                    <TrigMarker className="mt-1.5 h-3 w-3 shrink-0 text-signal" />
                    {w}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal as="section" aria-labelledby="includes" delay={100}>
              <h2 id="includes" className="border-b border-graphite/15 pb-3 font-serif text-2xl">
                {t('labels.includes')}
              </h2>
              <ol className="mt-5 space-y-3.5">
                {includes.map((w, i) => (
                  <li key={w} className="flex gap-3 leading-relaxed">
                    <span className="type-coord mt-1 shrink-0 text-ink-muted">{String(i + 1).padStart(2, '0')}</span>
                    {w}
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <Reveal as="section" aria-labelledby="deliverables" className="mt-16 bg-paper-deep p-8 md:p-10">
            <h2 id="deliverables" className="font-serif text-2xl">
              {t('labels.deliverables')}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {deliverables.map((d) => (
                <li key={d} className="flex gap-3 leading-relaxed">
                  <FileText className="mt-1 h-4 w-4 shrink-0 text-olive-deep" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-muted">{t('labels.deliverablesNote')}</p>
          </Reveal>
        </article>

        <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="request">
          <div className="border border-graphite/15 bg-white p-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <h2 id="request" className="font-serif text-2xl">
              {t('labels.request')}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-muted">{t('labels.requestText')}</p>
            <a href={telUrl} className="type-condensed mt-6 block text-[2.75rem] text-graphite hover:text-olive-deep">
              {companyConfig.contact.phoneDisplay}
            </a>
            <div className="mt-6 flex flex-col gap-2">
              <AnchorButton href={whatsappUrl()} target="_blank" rel="noopener noreferrer" variant="outline" icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}>
                {t('common:actions.whatsapp')}
              </AnchorButton>
              <AnchorButton
                href={companyConfig.social.telegram}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                icon={<Send className="h-4 w-4" aria-hidden="true" />}
              >
                {t('common:actions.telegram')}
              </AnchorButton>
            </div>
          </div>
        </aside>
      </div>

      <section aria-labelledby="related" className="bg-paper-deep">
        <div className="container-wide py-20 md:py-28">
          <h2 id="related" className="type-display text-[clamp(2rem,1.4rem+2.2vw,3.25rem)]">
            {t('labels.related')}
          </h2>
          <ul className="mt-12 grid gap-8 md:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <LocalizedLink to={`/services/${r.slug}`} className="group block">
                  <div className="overflow-hidden">
                    <Picture
                      name={r.image}
                      alt=""
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="aspect-[16/9] w-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-survey)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-5 flex items-start justify-between gap-4 font-serif text-2xl leading-snug">
                    {t(`items.${r.slug}.title`)}
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                  </h3>
                  <p className="mt-2 text-ink-muted">{t(`items.${r.slug}.summary`)}</p>
                </LocalizedLink>
              </li>
            ))}
          </ul>
          <h2 className="mt-20 font-serif text-xl italic text-olive-deep">{t('labels.otherServices')}</h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {others.map((o) => (
              <li key={o.slug}>
                <LocalizedLink
                  to={`/services/${o.slug}`}
                  className="inline-flex min-h-10 items-center border border-graphite/20 px-4 text-sm transition-colors hover:border-graphite hover:bg-graphite hover:text-paper"
                >
                  {t(`items.${o.slug}.short`)}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
