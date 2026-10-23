// Resolves the public site origin at build time from explicit configuration or from the
// environment variables that common hosting platforms set automatically. Returns null when
// nothing is known; the build then uses ORIGIN_PLACEHOLDER and the origin is filled in at
// request time (scripts/serve.mjs) or in the browser (window.location.origin).

/** Reserved, never-resolvable origin (.invalid TLD, RFC 2606) used as a placeholder. */
export const ORIGIN_PLACEHOLDER = 'https://site-origin.invalid';

const withProtocol = (value) => (/^https?:\/\//.test(value) ? value : `https://${value}`);

export function resolveSiteOrigin(env = process.env) {
  const candidates = [
    env.VITE_SITE_URL, // explicit configuration always wins
    env.SITE_URL,
    env.VERCEL_ENV === 'production' && env.VERCEL_PROJECT_PRODUCTION_URL, // Vercel production domain
    env.CONTEXT === 'production' && env.URL, // Netlify primary URL
    env.CF_PAGES_BRANCH === 'main' && env.CF_PAGES_URL, // Cloudflare Pages
    env.RENDER_EXTERNAL_URL, // Render
    env.RAILWAY_PUBLIC_DOMAIN, // Railway
  ];
  const found = candidates.find((v) => typeof v === 'string' && v.trim());
  return found ? withProtocol(found.trim()).replace(/\/+$/, '') : null;
}
