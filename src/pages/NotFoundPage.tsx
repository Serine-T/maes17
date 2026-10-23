import { useTranslation } from 'react-i18next';
import { TopographicBackground } from '@/components/animations/TopographicBackground';
import { LinkButton } from '@/components/ui/Button';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="survey-grid relative isolate flex min-h-[85svh] items-center overflow-hidden">
      <TopographicBackground className="absolute inset-0 -z-10 h-full w-full text-graphite/[0.12]" />
      <div className="container-wide pt-[var(--header-h)]">
        <p className="type-condensed text-[clamp(7rem,30vw,22rem)] text-graphite/15" aria-hidden="true">
          {t('notFound.code')}
        </p>
        <h1 className="type-display -mt-6 max-w-3xl text-[clamp(2.25rem,1.5rem+3vw,4.5rem)]">{t('notFound.title')}</h1>
        <p className="mt-5 max-w-xl text-lg text-ink-muted">{t('notFound.text')}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton to="/">{t('notFound.home')}</LinkButton>
          <LinkButton to="/services" variant="outline">
            {t('notFound.services')}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
