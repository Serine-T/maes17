import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { App } from '@/app/App';
import { Providers } from '@/app/providers';
import { matchRoute, type RouteMatch } from '@/app/routes';
import { defaultLocale } from '@/config/site';
import { createI18n } from '@/i18n/config';
import { splitLocalePath } from '@/i18n/locale-utils';
import { loadResources } from '@/i18n/resources';
import { getPageMeta } from '@/seo/metadata';
import { buildHeadTags, renderHeadTags } from '@/seo/head-tags';

export interface RenderResult {
  html: string;
  head: string;
  lang: string;
  route: RouteMatch;
}

/** Renders one URL to static HTML plus its head tags. Used by scripts/prerender.mjs. */
export async function render(url: string): Promise<RenderResult> {
  const { locale, rest } = splitLocalePath(url);
  const lng = locale ?? defaultLocale;
  const i18n = await createI18n(lng, await loadResources(lng === 'en' ? ['en'] : [lng, 'en']));
  const route: RouteMatch = locale ? matchRoute(rest) : { id: 'notFound' };
  const meta = getPageMeta(route, lng, i18n.getFixedT(lng));

  const html = renderToString(
    <Providers i18n={i18n}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </Providers>,
  );

  return { html, head: renderHeadTags(buildHeadTags(meta)), lang: lng, route };
}

export { indexableRoutes, routeToPath } from '@/app/routes';
export { locales, defaultLocale, siteUrl, isSiteUrlConfigured, localeMeta } from '@/config/site';
export { localizePath } from '@/i18n/locale-utils';
export { canonicalUrl } from '@/seo/canonical';
