import { isServiceSlug, serviceSlugs, type ServiceSlug } from '@/content/services';

/** Locale-neutral description of a page. Shared by the router, metadata, sitemap and prerendering. */
export type RouteMatch =
  | { id: 'home' }
  | { id: 'about' }
  | { id: 'services' }
  | { id: 'service'; slug: ServiceSlug }
  | { id: 'contacts' }
  | { id: 'faq' }
  | { id: 'notFound' };

export function matchRoute(rest: string): RouteMatch {
  const parts = rest.split('/').filter(Boolean);
  const [first, second, ...extra] = parts;
  if (extra.length > 0) return { id: 'notFound' };
  if (!first) return { id: 'home' };
  if (second === undefined) {
    if (first === 'about' || first === 'services' || first === 'contacts' || first === 'faq') {
      return { id: first };
    }
    return { id: 'notFound' };
  }
  if (first === 'services' && isServiceSlug(second)) return { id: 'service', slug: second };
  return { id: 'notFound' };
}

export function routeToPath(route: RouteMatch): string {
  switch (route.id) {
    case 'home':
      return '/';
    case 'service':
      return `/services/${route.slug}`;
    case 'notFound':
      return '/404';
    default:
      return `/${route.id}`;
  }
}

/** Every public, indexable page (per locale). */
export const indexableRoutes: RouteMatch[] = [
  { id: 'home' },
  { id: 'about' },
  { id: 'services' },
  ...serviceSlugs.map((slug) => ({ id: 'service', slug }) as const),
  { id: 'contacts' },
  { id: 'faq' },
];
