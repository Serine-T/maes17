import { useTranslation } from 'react-i18next';
import { companyConfig } from '@/config/company';
import { Logo } from '@/components/brand/Logo';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { services } from '@/content/services';
import { telUrl, whatsappUrl } from '@/components/contact/inquiry';
import { navItems } from './nav-items';

export function Footer() {
  const { t } = useTranslation(['common', 'services']);
  const year = new Date().getFullYear();
  const linkClass = 'link-underline text-paper/70 transition-colors hover:text-paper';

  return (
    <footer className="survey-grid survey-grid-dark relative bg-graphite text-paper">
      <div className="container-wide grid gap-12 pb-28 pt-20 md:grid-cols-6 md:pb-12">
        <div className="md:col-span-2">
          <LocalizedLink to="/" aria-label={t('brand.logoAlt')} className="inline-block text-paper">
            <Logo accent="var(--color-signal)" />
          </LocalizedLink>
          <p className="mt-6 max-w-xs font-serif text-lg italic text-paper/85">{t('brand.tagline')}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/60">{t('footer.about')}</p>
        </div>

        <nav aria-labelledby="footer-pages" className="md:col-span-1">
          <h2 id="footer-pages" className="text-sm text-paper/50">
            {t('footer.navigation')}
          </h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            {navItems.map((item) => (
              <li key={item.to}>
                <LocalizedLink to={item.to} className={linkClass}>
                  {t(item.key)}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-services" className="md:col-span-2">
          <h2 id="footer-services" className="text-sm text-paper/50">
            {t('footer.services')}
          </h2>
          <ul className="mt-4 grid gap-2.5 text-[0.9375rem] sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <LocalizedLink to={`/services/${s.slug}`} className={linkClass}>
                  {t(`services:items.${s.slug}.short`)}
                </LocalizedLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-1">
          <h2 className="text-sm text-paper/50">{t('footer.contact')}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
            <li>
              <a href={telUrl} className={`${linkClass} tabular-nums`}>
                {companyConfig.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {t('actions.whatsapp')}
              </a>
            </li>
            <li>
              <a href={companyConfig.social.telegram} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {t('actions.telegram')}
              </a>
            </li>
            <li>
              <a href={companyConfig.social.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {t('actions.instagram')}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-wide flex flex-col gap-3 border-t border-paper/10 py-6 pb-24 text-xs text-paper/55 md:flex-row md:items-center md:justify-between md:pb-6">
        <p>{t('footer.legal')}</p>
        <p>{t('footer.copyright', { year })}</p>
      </div>
    </footer>
  );
}
