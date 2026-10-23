import { useTranslation } from 'react-i18next';
import { PaperHero } from '@/components/sections/PaperHero';
import { FaqList } from '@/components/sections/FaqList';
import { ContactCta } from '@/components/sections/ContactCta';

export function FaqPage() {
  const { t } = useTranslation('faq');
  return (
    <>
      <PaperHero title={t('page.title')} lede={t('page.lede')} />
      <section className="container-wide py-16 md:py-24" aria-label={t('page.title')}>
        <div className="mx-auto max-w-4xl">
          <FaqList headingLevel={2} />
        </div>
      </section>
      <ContactCta title={t('home:cta.title')} text={t('home:cta.text')} button={t('home:cta.button')} />
    </>
  );
}
