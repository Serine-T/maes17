import { useTranslation } from 'react-i18next';
import { MessageCircle, Phone, Send } from 'lucide-react';
import { companyConfig } from '@/config/company';
import { TopographicBackground } from '@/components/animations/TopographicBackground';
import { Reveal } from '@/components/animations/Reveal';
import { AnchorButton, LinkButton } from '@/components/ui/Button';
import { telUrl, whatsappUrl } from '@/components/contact/inquiry';
import { InstagramIcon } from '@/components/ui/InstagramIcon';

interface Props {
  title: string;
  text: string;
  button: string;
}

/** Closing call to action with the oversized brand signature and direct contact actions. */
export function ContactCta({ title, text, button }: Props) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="cta-title" className="survey-grid survey-grid-dark relative isolate overflow-hidden bg-graphite text-paper">
      <TopographicBackground
        className="absolute inset-0 -z-10 h-full w-full text-paper/[0.09]"
        summits={[
          { cx: 1250, cy: 720, radius: 520, levels: 18, seed: 7 },
          { cx: 200, cy: 120, radius: 300, levels: 10, seed: 41, stretch: 1.8 },
        ]}
        animate={false}
      />
      <div className="container-wide py-24 md:py-36">
        <Reveal className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-4">
            <h2 id="cta-title" className="type-display text-[clamp(2.25rem,1.5rem+3.4vw,4.75rem)]">
              {title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/75">{text}</p>
          </div>
        </Reveal>
        <p
          aria-hidden="true"
          className="type-condensed mt-14 select-none whitespace-nowrap text-[clamp(4.5rem,21vw,20rem)] text-paper"
        >
          {companyConfig.branding.signature}
        </p>
        <div className="mt-12 flex flex-wrap gap-3">
          <AnchorButton href={telUrl} variant="signal" icon={<Phone className="h-4 w-4" aria-hidden="true" />}>
            <span className="tabular-nums">{t('actions.callNumber')}</span>
          </AnchorButton>
          <AnchorButton
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlineOnDark"
            icon={<MessageCircle className="h-4 w-4" aria-hidden="true" />}
          >
            {t('actions.whatsapp')}
          </AnchorButton>
          <AnchorButton
            href={companyConfig.social.telegram}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlineOnDark"
            icon={<Send className="h-4 w-4" aria-hidden="true" />}
          >
            {t('actions.telegram')}
          </AnchorButton>
          <AnchorButton
            href={companyConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlineOnDark"
            icon={<InstagramIcon />}
          >
            {t('actions.instagram')}
          </AnchorButton>
          <LinkButton to="/contacts" variant="onDark">
            {button}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
