import { defaultLocale, locales, localeMeta, siteUrl, type Locale } from '@/config/site';
import { localizePath } from '@/i18n/locale-utils';

/**
 * Canonical URL rules — one place for every absolute page URL on the site
 * (<link rel="canonical">, hreflang alternates, og:url, sitemap, JSON-LD):
 *
 * 1. Absolute, on the configured origin (VITE_SITE_URL), never a relative path.
 * 2. Always locale-prefixed: /hy/…, /ru/…, /en/… (each language is its own canonical page).
 * 3. Lowercase path, single slashes, trailing slash (matches the prerendered directory index).
 * 4. No query string or fragment — tracking parameters (?utm_…, ?gclid) never create duplicates.
 * 5. Self-referencing: every indexable page is canonical to itself, never to another language.
 * 6. Non-indexable pages (404) get no canonical at all.
 */
export function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '';
  const clean = withoutQuery.toLowerCase().replace(/\/{2,}/g, '/').replace(/\/index\.html?$/, '/');
  return clean.startsWith('/') ? clean : `/${clean}`;
}

/** Absolute canonical URL for a locale-neutral path such as "/services/land-surveying". */
export function canonicalUrl(locale: Locale, neutralPath: string): string {
  return `${siteUrl}${localizePath(locale, normalizePath(neutralPath))}`;
}

/** hreflang alternates for a page, including x-default (the default-language version). */
export function alternateUrls(neutralPath: string): { hreflang: string; href: string }[] {
  return [
    ...locales.map((l) => ({ hreflang: localeMeta[l].hreflang, href: canonicalUrl(l, neutralPath) })),
    { hreflang: 'x-default', href: canonicalUrl(defaultLocale, neutralPath) },
  ];
}

/** Absolute URL for a static asset path such as "/images/brand/og-image.jpg". */
export const assetUrl = (path: string) => `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
