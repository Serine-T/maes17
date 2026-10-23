import type { TFunction } from 'i18next';
import { companyConfig } from '@/config/company';
import { localeMeta, locales, type Locale } from '@/config/site';
import { alternateUrls, assetUrl, canonicalUrl } from './canonical';
import { routeToPath, type RouteMatch } from '@/app/routes';
import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  serviceSchema,
  websiteSchema,
  type JsonLd,
} from './structured-data';

export interface Crumb {
  name: string;
  /** Locale-neutral path. */
  path: string;
}

export interface PageMeta {
  title: string;
  description: string;
  /** Absolute canonical URL, or null for pages that must not be indexed (404). */
  canonical: string | null;
  robots: string;
  alternates: { hreflang: string; href: string }[];
  ogType: 'website' | 'article';
  ogImage: string;
  ogLocale: string;
  ogLocaleAlternates: string[];
  jsonLd: JsonLd[];
  breadcrumbs: Crumb[];
}


interface FaqItem {
  question: string;
  answer: string;
  more: string;
}

/** Breadcrumb trail for a route (empty on the home page and the 404 page). */
export function getBreadcrumbs(route: RouteMatch, t: TFunction): Crumb[] {
  const home: Crumb = { name: t('common:breadcrumbs.home'), path: '/' };
  switch (route.id) {
    case 'home':
    case 'notFound':
      return [];
    case 'service':
      return [
        home,
        { name: t('common:nav.services'), path: '/services' },
        { name: t(`services:items.${route.slug}.short`), path: routeToPath(route) },
      ];
    case 'about':
      return [home, { name: t('common:nav.about'), path: '/about' }];
    case 'services':
      return [home, { name: t('common:nav.services'), path: '/services' }];
    case 'contacts':
      return [home, { name: t('common:nav.contacts'), path: '/contacts' }];
    case 'faq':
      return [home, { name: t('common:nav.faq'), path: '/faq' }];
  }
}

function titleAndDescription(route: RouteMatch, t: TFunction): { title: string; description: string } {
  switch (route.id) {
    case 'home':
      return { title: t('home:meta.title'), description: t('home:meta.description') };
    case 'about':
      return { title: t('about:meta.title'), description: t('about:meta.description') };
    case 'services':
      return { title: t('services:meta.title'), description: t('services:meta.description') };
    case 'service':
      return {
        title: t(`services:items.${route.slug}.metaTitle`),
        description: t(`services:items.${route.slug}.metaDescription`),
      };
    case 'contacts':
      return { title: t('contacts:meta.title'), description: t('contacts:meta.description') };
    case 'faq':
      return { title: t('faq:meta.title'), description: t('faq:meta.description') };
    case 'notFound':
      return { title: t('common:notFound.metaTitle'), description: t('common:notFound.metaDescription') };
  }
}

/**
 * Pure metadata builder used both by the prerenderer (static HTML head) and the client
 * head manager (client-side navigation), so both always agree.
 */
export function getPageMeta(route: RouteMatch, locale: Locale, t: TFunction): PageMeta {
  const { title, description } = titleAndDescription(route, t);
  const path = routeToPath(route);
  const indexable = route.id !== 'notFound';
  const canonical = indexable ? canonicalUrl(locale, path) : null;

  const alternates = indexable
    ? alternateUrls(path)
    : [];

  const breadcrumbs = getBreadcrumbs(route, t);
  const jsonLd: JsonLd[] = [];
  if (route.id === 'home') {
    jsonLd.push(organizationSchema(locale, t), websiteSchema(locale));
  } else if (indexable) {
    jsonLd.push(organizationSchema(locale, t));
  }
  if (route.id === 'service') {
    jsonLd.push(
      serviceSchema({
        name: t(`services:items.${route.slug}.title`),
        description: t(`services:items.${route.slug}.metaDescription`),
        url: canonicalUrl(locale, path),
        locale,
      }),
    );
  }
  if (route.id === 'faq') {
    const items = t('faq:items', { returnObjects: true }) as FaqItem[];
    jsonLd.push(faqSchema(items.map((i) => ({ question: i.question, answer: `${i.answer} ${i.more}` })), locale));
  }
  if (breadcrumbs.length > 0) {
    jsonLd.push(
      breadcrumbSchema(breadcrumbs.map((c) => ({ name: c.name, url: canonicalUrl(locale, c.path) }))),
    );
  }

  return {
    title,
    description,
    canonical,
    robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow',
    alternates,
    ogType: route.id === 'service' ? 'article' : 'website',
    ogImage: assetUrl(companyConfig.branding.ogImage),
    ogLocale: localeMeta[locale].ogLocale,
    ogLocaleAlternates: locales.filter((l) => l !== locale).map((l) => localeMeta[l].ogLocale),
    jsonLd,
    breadcrumbs,
  };
}
