export const locales = ['hy', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'hy';

/** BCP 47 tags used for hreflang and og:locale. */
export const localeMeta: Record<Locale, { hreflang: string; ogLocale: string; nativeName: string; short: string }> = {
  hy: { hreflang: 'hy', ogLocale: 'hy_AM', nativeName: 'Հայերեն', short: 'Հայ' },
  ru: { hreflang: 'ru', ogLocale: 'ru_RU', nativeName: 'Русский', short: 'Рус' },
  en: { hreflang: 'en', ogLocale: 'en_US', nativeName: 'English', short: 'Eng' },
};

const FALLBACK_SITE_URL = 'http://localhost:4173';

/** Absolute site origin used for canonicals, sitemap and structured data. Set VITE_SITE_URL at build time. */
export const siteUrl: string = (import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, '');
export const isSiteUrlConfigured = Boolean(import.meta.env.VITE_SITE_URL);

export const LANGUAGE_STORAGE_KEY = 'maes17.lang';
