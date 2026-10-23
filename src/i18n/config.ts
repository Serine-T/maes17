import { createInstance, type i18n as I18n, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { companyInterpolation } from '@/config/company';
import { locales, type Locale } from '@/config/site';
import { isLocale } from './locale-utils';
import { namespaces } from './resources';

/**
 * Creates an isolated i18next instance. A fresh instance per render keeps prerendering
 * of different languages from leaking state into each other.
 */
export async function createI18n(locale: Locale, resources: Resource): Promise<I18n> {
  const instance = createInstance();
  await instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: 'en',
    supportedLngs: [...locales],
    ns: [...namespaces],
    defaultNS: 'common',
    resources,
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false,
      // Company data ({{owner}}, {{phone}}, {{company}}) comes from src/config/company.ts.
      defaultVariables: companyInterpolation(locale),
    },
    returnNull: false,
    react: { useSuspense: false },
    initAsync: false,
  });
  // The owner's name is spelled per script, so the variables follow the active language.
  instance.on('languageChanged', (lng) => {
    if (isLocale(lng) && instance.options.interpolation) {
      instance.options.interpolation.defaultVariables = companyInterpolation(lng);
    }
  });
  return instance;
}
