import type { TFunction } from 'i18next';
import { companyConfig } from '@/config/company';
import { siteUrl, locales, localeMeta, type Locale } from '@/config/site';
import { services } from '@/content/services';

export type JsonLd = Record<string, unknown>;

const orgId = `${siteUrl}/#organization`;
const ownerId = `${siteUrl}/#owner`;
const websiteId = `${siteUrl}/#website`;

const areaServed = companyConfig.serviceArea.confirmed
  ? { areaServed: { '@type': 'Country', name: companyConfig.serviceArea.name } }
  : {};

/**
 * Organization, not LocalBusiness: there is no verified street address yet.
 * The same @id is used in every locale so search engines see one entity.
 */
export function organizationSchema(locale: Locale, t: TFunction): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId,
    name: companyConfig.name,
    url: `${siteUrl}/${locale}/`,
    logo: `${siteUrl}${companyConfig.branding.symbol.replace('.svg', '-512.png')}`,
    image: `${siteUrl}${companyConfig.branding.ogImage}`,
    description: t('common:meta.defaultDescription'),
    telephone: companyConfig.contact.phone,
    founder: {
      '@type': 'Person',
      '@id': ownerId,
      name: companyConfig.owner.name,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: companyConfig.contact.phone,
      contactType: 'customer service',
      availableLanguage: locales.map((l) => localeMeta[l].hreflang),
    },
    sameAs: [companyConfig.social.instagram],
    knowsAbout: services.map((s) => t(`services:items.${s.slug}.title`)),
    ...areaServed,
  };
}

export function websiteSchema(locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: companyConfig.name,
    url: `${siteUrl}/${locale}/`,
    inLanguage: localeMeta[locale].hreflang,
    publisher: { '@id': orgId },
  };
}

export function serviceSchema(args: { name: string; description: string; url: string; locale: Locale }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: args.name,
    serviceType: args.name,
    description: args.description,
    url: args.url,
    inLanguage: localeMeta[args.locale].hreflang,
    provider: { '@id': orgId },
    ...areaServed,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[], locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: localeMeta[locale].hreflang,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
