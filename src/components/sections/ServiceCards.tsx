import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { services } from '@/content/services';
import { Picture } from '@/components/ui/Picture';
import { LocalizedLink } from '@/components/ui/LocalizedLink';

/**
 * Portrait service cards: full-bleed image, soft overlay and centred content with an
 * outline button that fills on hover. Four per row on large screens; a swipeable row on
 * phones. Every card is a single link, so the whole surface is clickable.
 */
export function ServiceCards() {
  const { t } = useTranslation('services');

  return (
    <ul className="scrollbar-none -mx-[var(--gutter)] flex snap-x snap-mandatory gap-2 overflow-x-auto px-[var(--gutter)] pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-2 md:overflow-visible md:px-0 lg:grid-cols-4">
      {services.map((service) => (
        <li key={service.slug} className="w-[78vw] shrink-0 snap-start sm:w-[55vw] md:w-auto">
          <LocalizedLink
            to={`/services/${service.slug}`}
            className="group relative block aspect-[2/3] overflow-hidden bg-graphite text-paper focus-visible:outline-offset-[-4px]"
          >
            <Picture
              name={service.image}
              alt=""
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 78vw"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-survey)] group-hover:scale-[1.06]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgb(34_37_34/0.35)_0%,rgb(34_37_34/0.55)_55%,rgb(34_37_34/0.8)_100%)] transition-colors duration-700 group-hover:bg-graphite/60"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <h3 className="font-serif text-[1.65rem] leading-tight lg:text-[1.85rem]">{t(`items.${service.slug}.short`)}</h3>
              <span className="max-w-[16rem] text-[0.9375rem] leading-relaxed text-paper/80">{t(`items.${service.slug}.summary`)}</span>
              <span className="relative mt-2 inline-flex h-10 min-w-[9.5rem] items-center justify-center overflow-hidden rounded-[2px] border border-paper/50 px-5 text-[0.8125rem] font-medium transition-[background-color,border-color,color,border-radius] duration-500 ease-[var(--ease-survey)] group-hover:rounded-full group-hover:border-paper group-hover:bg-paper group-hover:text-signal-deep">
                <span className="transition-transform duration-500 ease-[var(--ease-survey)] group-hover:-translate-x-2">
                  {t('common:actions.learnMore')}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="absolute right-4 h-3.5 w-3.5 scale-0 opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-survey)] group-hover:scale-100 group-hover:opacity-100"
                />
              </span>
            </span>
          </LocalizedLink>
        </li>
      ))}
    </ul>
  );
}
