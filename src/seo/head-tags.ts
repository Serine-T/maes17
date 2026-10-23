import { companyConfig } from '@/config/company';
import type { PageMeta } from './metadata';

export type HeadTag =
  | { tag: 'title'; content: string }
  | { tag: 'meta' | 'link'; attrs: Record<string, string> }
  | { tag: 'script'; attrs: Record<string, string>; content: string };

/** Converts page metadata into a flat list of head tags. */
export function buildHeadTags(meta: PageMeta): HeadTag[] {
  const tags: HeadTag[] = [
    { tag: 'title', content: meta.title },
    { tag: 'meta', attrs: { name: 'description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'robots', content: meta.robots } },
    ...(meta.canonical ? [{ tag: 'link', attrs: { rel: 'canonical', href: meta.canonical } } as HeadTag] : []),
    ...meta.alternates.map(
      (a): HeadTag => ({ tag: 'link', attrs: { rel: 'alternate', hreflang: a.hreflang, href: a.href } }),
    ),
    { tag: 'meta', attrs: { property: 'og:type', content: meta.ogType } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: companyConfig.name } },
    { tag: 'meta', attrs: { property: 'og:title', content: meta.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: meta.description } },
    ...(meta.canonical ? [{ tag: 'meta', attrs: { property: 'og:url', content: meta.canonical } } as HeadTag] : []),
    { tag: 'meta', attrs: { property: 'og:image', content: meta.ogImage } },
    { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
    { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
    { tag: 'meta', attrs: { property: 'og:locale', content: meta.ogLocale } },
    ...meta.ogLocaleAlternates.map(
      (l): HeadTag => ({ tag: 'meta', attrs: { property: 'og:locale:alternate', content: l } }),
    ),
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: meta.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: meta.ogImage } },
    ...meta.jsonLd.map(
      (data): HeadTag => ({
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        content: JSON.stringify(data),
      }),
    ),
  ];
  return tags;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** JSON inside <script> must not be able to close the tag. */
const escapeJsonForScript = (json: string) => json.replace(/</g, '\\u003c');

const SEO_ATTR = 'data-seo';

/** Serialises head tags for the prerendered HTML. */
export function renderHeadTags(tags: HeadTag[]): string {
  return tags
    .map((t) => {
      if (t.tag === 'title') return `<title>${escapeHtml(t.content)}</title>`;
      const attrs = Object.entries(t.attrs)
        .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
        .join(' ');
      if (t.tag === 'script') return `<script ${SEO_ATTR} ${attrs}>${escapeJsonForScript(t.content)}</script>`;
      return `<${t.tag} ${SEO_ATTR} ${attrs}>`;
    })
    .join('\n    ');
}

/** Replaces the managed head tags in the live document after client-side navigation. */
export function applyHeadTags(tags: HeadTag[], doc: Document = document): void {
  doc.head.querySelectorAll(`[${SEO_ATTR}]`).forEach((el) => el.remove());
  for (const t of tags) {
    if (t.tag === 'title') {
      doc.title = t.content;
      continue;
    }
    const el = doc.createElement(t.tag);
    el.setAttribute(SEO_ATTR, '');
    for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v);
    if (t.tag === 'script') el.textContent = t.content;
    doc.head.appendChild(el);
  }
}
