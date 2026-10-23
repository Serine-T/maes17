import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { services } from '@/content/services';
import { Picture } from '@/components/ui/Picture';
import { LocalizedLink } from '@/components/ui/LocalizedLink';

/**
 * Horizontal accordion of service panels on large screens: the focused or hovered panel
 * opens while the others stay as narrow, softly blurred strips. On small screens every
 * panel is shown open as a stacked card. All titles and links are always in the DOM.
 */
export function ServicesAccordion() {
  const { t } = useTranslation('services');
  const [active, setActive] = useState(0);

  return (
    <ul className="flex flex-col gap-3 lg:h-[min(80vh,46rem)] lg:min-h-[34rem] lg:flex-row lg:gap-1.5">
      {services.map((service, index) => {
        const isActive = index === active;
        return (
          <li
            key={service.slug}
            data-active={isActive}
            className="relative h-[24rem] overflow-hidden bg-graphite text-paper transition-[flex-grow] duration-700 ease-[var(--ease-survey)] sm:h-[28rem] lg:h-auto lg:flex-[1_1_0%] lg:data-[active=true]:flex-[7_1_0%]"
          >
            <LocalizedLink
              to={`/services/${service.slug}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              className="group absolute inset-0 block focus-visible:outline-offset-[-4px]"
            >
              <Picture
                name={service.image}
                alt=""
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover transition-[filter,transform] duration-700 ease-[var(--ease-survey)] group-hover:scale-[1.03] lg:in-data-[active=false]:scale-110 lg:in-data-[active=false]:blur-[6px]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgb(34_37_34/0.15)_30%,rgb(34_37_34/0.85)_100%)] transition-colors duration-700 lg:in-data-[active=false]:bg-graphite/45"
              />

              <span
                aria-hidden="true"
                className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 rotate-180 whitespace-nowrap text-sm font-medium tracking-wide text-paper/90 [writing-mode:vertical-rl] lg:in-data-[active=false]:block"
              >
                {t(`items.${service.slug}.short`)}
              </span>

              <span className="absolute inset-x-0 bottom-0 flex flex-col p-6 transition-opacity duration-500 sm:p-8 lg:p-10 lg:in-data-[active=false]:pointer-events-none lg:in-data-[active=false]:opacity-0 lg:in-data-[active=true]:delay-200">
                <service.icon className="mb-5 h-5 w-5 text-paper/80" aria-hidden="true" />
                <h3 className="max-w-xl font-serif text-[1.75rem] italic leading-tight lg:text-[2.6rem]">
                  {t(`items.${service.slug}.title`)}
                </h3>
                <span className="mt-3 block max-w-md text-[0.9375rem] leading-relaxed text-paper/80">
                  {t(`items.${service.slug}.summary`)}
                </span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                  <span className="link-underline">{t('common:actions.learnMore')}</span>
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </LocalizedLink>
          </li>
        );
      })}
    </ul>
  );
}
