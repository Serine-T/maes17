import { useTranslation } from 'react-i18next';
import { Clock, MapPin, MessageCircle, Phone, Send, UserRound } from 'lucide-react';
import { companyConfig } from '@/config/company';
import { useLocale } from '@/i18n/useLocale';
import { PaperHero } from '@/components/sections/PaperHero';
import { ContactForm } from '@/components/contact/ContactForm';
import { TopographicBackground } from '@/components/animations/TopographicBackground';
import { AnchorButton } from '@/components/ui/Button';
import { TrigMarker } from '@/components/ui/TrigMarker';
import { LogoSymbol } from '@/components/brand/Logo';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
import { telUrl, whatsappUrl } from '@/components/contact/inquiry';

export function ContactsPage() {
  const { t } = useTranslation('contacts');
  const locale = useLocale();
  const { contact, social, owner, serviceArea } = companyConfig;

  const rows = [
    { icon: UserRound, label: t('details.owner'), value: `${owner.localizedName[locale]}, ${t('details.ownerRole').toLowerCase()}` },
    { icon: Clock, label: t('details.hours'), value: contact.hours ?? t('common:common.hoursByArrangement') },
    {
      icon: MapPin,
      label: t('details.area'),
      value: serviceArea.confirmed ? serviceArea.name : t('details.areaPending'),
    },
  ];

  return (
    <>
      <PaperHero title={t('hero.title')} lede={t('hero.lede')} />

      <div className="container-wide grid gap-16 py-20 md:py-28 lg:grid-cols-12">
        <section aria-labelledby="details-title" className="lg:col-span-5">
          <h2 id="details-title" className="font-serif text-lg italic text-olive-deep">
            {t('details.title')}
          </h2>
          <p className="mt-6 text-sm text-ink-muted">{t('details.phone')}</p>
          <a href={telUrl} className="type-condensed mt-1 block text-[clamp(3rem,2rem+4vw,5.25rem)] text-graphite transition-colors hover:text-olive-deep">
            {contact.phoneDisplay}
          </a>
          <div className="mt-8 flex flex-wrap gap-3">
            <AnchorButton href={telUrl} variant="signal" icon={<Phone className="h-4 w-4" aria-hidden="true" />}>
              {t('common:actions.call')}
            </AnchorButton>
            <AnchorButton
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
              aria-label={t('details.openWhatsapp')}
            >
              {t('details.whatsapp')}
            </AnchorButton>
            <AnchorButton
              href={social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              icon={<Send className="h-4 w-4" aria-hidden="true" />}
              aria-label={t('details.openTelegram')}
            >
              {t('details.telegram')}
            </AnchorButton>
            <AnchorButton
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              icon={<InstagramIcon />}
              aria-label={t('details.openInstagram')}
            >
              {t('details.instagram')}
            </AnchorButton>
          </div>

          <dl className="mt-12 border-t border-graphite/15">
            {rows.map((row) => (
              <div key={row.label} className="border-b border-graphite/15 py-5">
                <dt className="flex items-center gap-3 text-sm text-ink-muted">
                  <row.icon className="h-4 w-4 shrink-0 text-olive-deep" aria-hidden="true" />
                  {row.label}
                </dt>
                <dd className="mt-1 pl-7 font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>

          <figure className="relative mt-12 aspect-[4/3] overflow-hidden border border-graphite/15 bg-paper-deep">
            <TopographicBackground
              className="absolute inset-0 h-full w-full text-olive/40"
              viewBox="0 0 800 600"
              summits={[
                { cx: 470, cy: 280, radius: 300, levels: 15, seed: 3 },
                { cx: 120, cy: 520, radius: 160, levels: 7, seed: 9, stretch: 1.5 },
              ]}
            />
            <div className="absolute left-[56%] top-[45%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
              <LogoSymbol className="h-12 w-12 text-graphite" accent="var(--color-signal)" />
            </div>
            <span className="sr-only">{t('map.label')}</span>
            <figcaption className="absolute inset-x-0 bottom-0 bg-paper/90 p-5">
              <p className="flex items-center gap-2 font-serif text-lg">
                <TrigMarker className="h-3.5 w-3.5 text-signal" />
                {t('map.title')}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t('map.text')}</p>
            </figcaption>
          </figure>
        </section>

        <section className="lg:col-span-6 lg:col-start-7">
          <div className="border border-graphite/10 bg-paper-deep p-6 sm:p-10">
            <ContactForm />
          </div>
        </section>
      </div>
    </>
  );
}
