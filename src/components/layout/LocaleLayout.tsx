import { useEffect, useRef } from 'react';
import { useLocation, useOutlet, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { defaultLocale, LANGUAGE_STORAGE_KEY, type Locale } from '@/config/site';
import { isLocale, splitLocalePath } from '@/i18n/locale-utils';
import { loadLocaleResources, namespaces } from '@/i18n/resources';
import { matchRoute } from '@/app/routes';
import { getPageMeta } from '@/seo/metadata';
import { applyHeadTags, buildHeadTags } from '@/seo/head-tags';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ContactLauncher } from '@/components/contact/ContactLauncher';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { Header } from './Header';
import { Footer } from './Footer';

/** Pages whose hero is a dark full-bleed image, so the header starts transparent. */
const DARK_HERO = new Set(['home', 'about', 'service']);

/** Keeps i18next in sync with the language in the URL (the URL is the source of truth). */
function useSyncedLanguage(locale: Locale) {
  const { i18n } = useTranslation();
  useEffect(() => {
    let cancelled = false;
    if (i18n.language !== locale) {
      loadLocaleResources(locale).then((bundle) => {
        if (cancelled) return;
        for (const ns of namespaces) {
          if (!i18n.hasResourceBundle(locale, ns)) i18n.addResourceBundle(locale, ns, bundle[ns], true, true);
        }
        void i18n.changeLanguage(locale);
      });
    }
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    } catch {
      // ignore
    }
    return () => {
      cancelled = true;
    };
  }, [i18n, locale]);
}

function useHeadSync(locale: Locale) {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  useEffect(() => {
    if (i18n.language !== locale) return;
    const route = matchRoute(splitLocalePath(pathname).rest);
    applyHeadTags(buildHeadTags(getPageMeta(route, locale, i18n.getFixedT(locale))));
  }, [pathname, locale, i18n, i18n.language]);
}

function useRouteFocus() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (hash) {
      // Wait for the page transition to mount the new page before scrolling to the anchor.
      const id = decodeURIComponent(hash.slice(1));
      const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 350);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, hash]);
}

export function LocaleLayout() {
  const { lang } = useParams();
  const valid = isLocale(lang);
  const locale: Locale = valid ? lang : defaultLocale;
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  useSyncedLanguage(locale);
  useHeadSync(locale);
  useRouteFocus();

  const route = valid ? matchRoute(splitLocalePath(pathname).rest) : ({ id: 'notFound' } as const);
  const content = valid ? outlet : <NotFoundPage />;

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 bg-graphite px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t('header.skipToContent')}
      </a>
      <Header overDark={DARK_HERO.has(route.id)} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          id="main"
          tabIndex={-1}
          className="outline-none"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {content}
        </motion.main>
      </AnimatePresence>
      <Footer />
      {route.id !== 'contacts' ? <ContactLauncher /> : null}
      <ChatWidget />
    </>
  );
}
