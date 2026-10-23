import { defaultLocale, locales, type Locale } from '@/config/site';

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Splits "/ru/services/x" into { locale: "ru", rest: "/services/x" }. */
export function splitLocalePath(pathname: string): { locale: Locale | null; rest: string } {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  const first = match?.[1];
  if (isLocale(first)) {
    return { locale: first, rest: normalizeRest(match?.[2] ?? '/') };
  }
  return { locale: null, rest: normalizeRest(pathname) };
}

function normalizeRest(rest: string): string {
  if (!rest || rest === '/') return '/';
  return rest.replace(/\/+$/, '') || '/';
}

/**
 * Builds a locale-prefixed path. `to` is locale-neutral ("/", "/services", "services/x").
 * Section pages end with a trailing slash so they match the prerendered directory index.
 */
export function localizePath(locale: Locale, to: string = '/'): string {
  const [pathPart = '', hash = ''] = to.split('#');
  const clean = pathPart.replace(/^\/+|\/+$/g, '');
  const base = clean ? `/${locale}/${clean}/` : `/${locale}/`;
  return hash ? `${base}#${hash}` : base;
}

/** The same page in another language. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const { rest } = splitLocalePath(pathname);
  return localizePath(target, rest);
}

/** Locale guess for the root redirect: stored preference first, then the default. Never browser sniffing for crawlers. */
export function resolveInitialLocale(stored: string | null | undefined): Locale {
  return isLocale(stored) ? stored : defaultLocale;
}
