import { describe, expect, it } from 'vitest';
// @ts-expect-error -- plain ESM helper shared with the Node scripts
import { ORIGIN_PLACEHOLDER, resolveSiteOrigin } from '../scripts/site-origin.mjs';
import { ORIGIN_PLACEHOLDER as CLIENT_PLACEHOLDER } from '@/config/site';

describe('site origin resolution', () => {
  it('prefers an explicit VITE_SITE_URL and normalises it', () => {
    expect(resolveSiteOrigin({ VITE_SITE_URL: 'https://maes17.am/', URL: 'https://x.netlify.app', CONTEXT: 'production' })).toBe(
      'https://maes17.am',
    );
  });

  it('detects hosting platforms only for production deployments', () => {
    expect(resolveSiteOrigin({ VERCEL_ENV: 'production', VERCEL_PROJECT_PRODUCTION_URL: 'maes17.am' })).toBe('https://maes17.am');
    expect(resolveSiteOrigin({ VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'maes17.am' })).toBeNull();
    expect(resolveSiteOrigin({ CONTEXT: 'production', URL: 'https://maes17.netlify.app' })).toBe('https://maes17.netlify.app');
    expect(resolveSiteOrigin({ RAILWAY_PUBLIC_DOMAIN: 'maes17.up.railway.app' })).toBe('https://maes17.up.railway.app');
  });

  it('returns null when nothing is known (dynamic mode)', () => {
    expect(resolveSiteOrigin({})).toBeNull();
  });

  it('uses the same placeholder on the server and the client', () => {
    expect(CLIENT_PLACEHOLDER).toBe(ORIGIN_PLACEHOLDER);
  });
});
