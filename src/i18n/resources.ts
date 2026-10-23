import type { Resource, ResourceLanguage } from 'i18next';
import type { Locale } from '@/config/site';

export const namespaces = ['common', 'home', 'about', 'services', 'contacts', 'faq'] as const;
export type Namespace = (typeof namespaces)[number];

type JsonModule = { default: Record<string, unknown> };

// Each language is a separate chunk; only the active language is downloaded by the browser.
const loaders = import.meta.glob<JsonModule>('../locales/*/*.json');

const cache = new Map<Locale, ResourceLanguage>();

export async function loadLocaleResources(locale: Locale): Promise<ResourceLanguage> {
  const cached = cache.get(locale);
  if (cached) return cached;
  const entries = await Promise.all(
    namespaces.map(async (ns) => {
      const loader = loaders[`../locales/${locale}/${ns}.json`];
      if (!loader) throw new Error(`Missing translation file: ${locale}/${ns}.json`);
      const mod = await loader();
      return [ns, mod.default] as const;
    }),
  );
  const resources = Object.fromEntries(entries) as ResourceLanguage;
  cache.set(locale, resources);
  return resources;
}

export async function loadResources(locales: readonly Locale[]): Promise<Resource> {
  const pairs = await Promise.all(locales.map(async (l) => [l, await loadLocaleResources(l)] as const));
  return Object.fromEntries(pairs);
}
