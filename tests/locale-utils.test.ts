import { describe, expect, it } from 'vitest';
import { localizePath, resolveInitialLocale, splitLocalePath, switchLocalePath } from '@/i18n/locale-utils';
import { matchRoute } from '@/app/routes';

describe('locale utilities', () => {
  it('splits locale prefixes', () => {
    expect(splitLocalePath('/ru/services/topographic-surveying/')).toEqual({ locale: 'ru', rest: '/services/topographic-surveying' });
    expect(splitLocalePath('/hy/')).toEqual({ locale: 'hy', rest: '/' });
    expect(splitLocalePath('/de/about')).toEqual({ locale: null, rest: '/de/about' });
  });

  it('builds localized paths with trailing slashes and hashes', () => {
    expect(localizePath('en', '/')).toBe('/en/');
    expect(localizePath('hy', '/services')).toBe('/hy/services/');
    expect(localizePath('ru', '/#method-title')).toBe('/ru/#method-title');
  });

  it('keeps the current page when switching language', () => {
    expect(switchLocalePath('/hy/services/cadastral-surveying/', 'en')).toBe('/en/services/cadastral-surveying/');
    expect(switchLocalePath('/ru/', 'hy')).toBe('/hy/');
  });

  it('falls back to the default locale for unknown stored values', () => {
    expect(resolveInitialLocale('ru')).toBe('ru');
    expect(resolveInitialLocale('xx')).toBe('hy');
    expect(resolveInitialLocale(null)).toBe('hy');
  });

  it('matches routes and rejects unknown ones', () => {
    expect(matchRoute('/')).toEqual({ id: 'home' });
    expect(matchRoute('/services/as-built-surveys')).toEqual({ id: 'service', slug: 'as-built-surveys' });
    expect(matchRoute('/services/unknown')).toEqual({ id: 'notFound' });
    expect(matchRoute('/about/team')).toEqual({ id: 'notFound' });
  });
});
