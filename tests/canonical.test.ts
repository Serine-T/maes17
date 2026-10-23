import { describe, expect, it } from 'vitest';
import { indexableRoutes, routeToPath } from '@/app/routes';
import { locales, siteUrl } from '@/config/site';
import { createI18n } from '@/i18n/config';
import { loadResources } from '@/i18n/resources';
import { alternateUrls, canonicalUrl, normalizePath } from '@/seo/canonical';
import { getPageMeta } from '@/seo/metadata';
import { buildHeadTags } from '@/seo/head-tags';

describe('canonical URL rules', () => {
  it('builds absolute, locale-prefixed URLs with a trailing slash', () => {
    expect(canonicalUrl('hy', '/faq')).toBe(`${siteUrl}/hy/faq/`);
    expect(canonicalUrl('en', '/')).toBe(`${siteUrl}/en/`);
  });

  it('normalises case, duplicate slashes, index.html, query strings and fragments', () => {
    expect(normalizePath('/FAQ//')).toBe('/faq/');
    expect(normalizePath('/faq/index.html')).toBe('/faq/');
    expect(canonicalUrl('ru', '/Services/Land-Surveying?utm_source=google#top')).toBe(
      `${siteUrl}/ru/services/land-surveying/`,
    );
  });

  it('lists every language plus x-default as alternates', () => {
    const alts = alternateUrls('/faq');
    expect(alts.map((a) => a.hreflang)).toEqual(['hy', 'ru', 'en', 'x-default']);
    expect(alts.at(-1)?.href).toBe(`${siteUrl}/hy/faq/`);
  });

  it('makes every indexable page canonical to itself in every language', async () => {
    const i18n = await createI18n('en', await loadResources(locales));
    for (const locale of locales) {
      const t = i18n.getFixedT(locale);
      for (const route of indexableRoutes) {
        const meta = getPageMeta(route, locale, t);
        const expected = `${siteUrl}/${locale}${routeToPath(route) === '/' ? '' : routeToPath(route)}/`;
        expect(meta.canonical, `${locale} ${route.id}`).toBe(expected);
        expect(meta.alternates.find((a) => a.hreflang === locale)?.href).toBe(expected);
      }
    }
  });

  it('gives the 404 page no canonical, no og:url and noindex', async () => {
    const i18n = await createI18n('hy', await loadResources(['hy']));
    const meta = getPageMeta({ id: 'notFound' }, 'hy', i18n.getFixedT('hy'));
    const tags = buildHeadTags(meta);
    expect(meta.canonical).toBeNull();
    expect(tags.some((t) => t.tag === 'link' && t.attrs.rel === 'canonical')).toBe(false);
    expect(tags.some((t) => t.tag === 'meta' && t.attrs.property === 'og:url')).toBe(false);
    expect(meta.robots).toContain('noindex');
  });
});
