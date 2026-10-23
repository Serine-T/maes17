export const locales = ['hy', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'hy';

/** BCP 47 tags used for hreflang and og:locale. */
export const localeMeta: Record<Locale, { hreflang: string; ogLocale: string; nativeName: string; short: string }> = {
  hy: { hreflang: 'hy', ogLocale: 'hy_AM', nativeName: 'Հայերեն', short: 'Հայ' },
  ru: { hreflang: 'ru', ogLocale: 'ru_RU', nativeName: 'Русский', short: 'Рус' },
  en: { hreflang: 'en', ogLocale: 'en_US', nativeName: 'English', short: 'Eng' },
};

/** Reserved placeholder origin (.invalid TLD) — must match scripts/site-origin.mjs. */
export const ORIGIN_PLACEHOLDER = 'https://site-origin.invalid';

const configured = (import.meta.env.VITE_SITE_URL || '').replace(/\/+$/, '');

/**
 * Absolute site origin for canonicals, hreflang, sitemap and structured data.
 *
 * Resolution order:
 * 1. Build time: VITE_SITE_URL or the hosting platform's production URL (see vite.config.ts).
 * 2. Browser: the origin the page is actually served from (window.location.origin).
 * 3. Prerender without a known origin: ORIGIN_PLACEHOLDER, which scripts/serve.mjs replaces
 *    with the requesting host on every response.
 */
export const siteUrl: string =
  configured || (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ORIGIN_PLACEHOLDER);
export const isSiteUrlConfigured = Boolean(configured);

export const LANGUAGE_STORAGE_KEY = 'maes17.lang';
