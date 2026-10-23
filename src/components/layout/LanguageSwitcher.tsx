import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { LANGUAGE_STORAGE_KEY, localeMeta, locales } from '@/config/site';
import { switchLocalePath } from '@/i18n/locale-utils';
import { useLocale } from '@/i18n/useLocale';

interface Props {
  tone?: 'dark' | 'light';
  className?: string;
  onSwitch?: () => void;
}

export function rememberLocale(locale: string) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (private mode); the URL still carries the language.
  }
}

/** Plain links to the same page in each language, so the alternates are crawlable too. */
export function LanguageSwitcher({ tone = 'dark', className = '', onSwitch }: Props) {
  const { t } = useTranslation();
  const { pathname, hash } = useLocation();
  const current = useLocale();
  const idle = tone === 'light' ? 'text-paper/65 hover:text-paper' : 'text-ink-muted hover:text-graphite';
  const active = tone === 'light' ? 'text-paper' : 'text-graphite';

  return (
    <nav aria-label={t('header.language')} className={className}>
      <ul className="flex items-center gap-1">
        {locales.map((l) => {
          const isCurrent = l === current;
          const meta = localeMeta[l];
          return (
            <li key={l}>
              <Link
                to={`${switchLocalePath(pathname, l)}${hash}`}
                hrefLang={meta.hreflang}
                lang={meta.hreflang}
                aria-current={isCurrent ? 'true' : undefined}
                aria-label={
                  isCurrent
                    ? t('header.currentLanguage', { language: meta.nativeName })
                    : t('header.switchLanguage', { language: meta.nativeName })
                }
                onClick={() => {
                  rememberLocale(l);
                  onSwitch?.();
                }}
                className={`relative inline-flex min-h-10 min-w-10 items-center justify-center px-2 text-[0.8125rem] font-medium transition-colors ${
                  isCurrent ? active : idle
                }`}
              >
                {meta.short}
                {isCurrent ? (
                  <span aria-hidden="true" className="absolute inset-x-2 bottom-1.5 h-px bg-current" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
