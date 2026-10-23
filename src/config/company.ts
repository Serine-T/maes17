import type { Locale } from './site';

/**
 * Single source of truth for company identity and contact data.
 *
 * Everything that renders the phone number, owner name, messenger links or brand assets
 * (header, footer, contact page, floating contact launcher, chat fallback answers,
 * JSON-LD, metadata) reads from here. Translation JSON files reference these values
 * through interpolation placeholders such as {{phone}} and never repeat them literally.
 *
 * Fields set to `null` are unknown and intentionally not rendered. Fill them in only
 * with verified information.
 */
export const companyConfig = {
  name: 'MAES17',
  owner: {
    name: 'Erik Tovmasyan',
    role: 'Individual Entrepreneur',
    /**
     * Native-script spellings used in translated copy (Armenian grammar attaches case
     * endings directly to the name). Spellings must be confirmed by the owner.
     */
    localizedName: {
      hy: 'Էրիկ Թովմասյան',
      ru: 'Эрик Товмасян',
      en: 'Erik Tovmasyan',
    },
  },
  contact: {
    /** E.164 format, used in tel: links and structured data. */
    phone: '+37441171793',
    /** Human-readable form of the same number. */
    phoneDisplay: '+374 41 171793',
    whatsapp: '+37441171793',
    telegram: '+37441171793',
    email: null as string | null,
    address: null as string | null,
    /** Business hours are not confirmed yet; translations show "by arrangement" while this is null. */
    hours: null as string | null,
  },
  social: {
    whatsapp: 'https://wa.me/37441171793',
    /** Phone-number Telegram link. Unverified: confirm before launch (see README). */
    telegram: 'https://t.me/+37441171793',
    instagram: 'https://www.instagram.com/m.a.e.s.17/',
  },
  branding: {
    name: 'MAES17',
    tagline: '',
    /** Oversized signature word in the closing call-to-action section. */
    signature: 'MAES17',
    logo: '/images/brand/maes17-logo.svg',
    logoDark: '/images/brand/maes17-logo-light.svg',
    symbol: '/images/brand/maes17-symbol.svg',
    ogImage: '/images/brand/og-image.jpg',
  },
  /**
   * Figures for the statistics section. PLACEHOLDERS: replace with real numbers and set
   * `confirmed: true`; until then the section shows a "demonstration figures" notice.
   */
  stats: {
    confirmed: false,
    items: [
      { key: 'projects', value: 250, suffix: '+' },
      { key: 'clients', value: 180, suffix: '+' },
      { key: 'years', value: 10, suffix: '+' },
      { key: 'area', value: 1200, suffix: '+' },
    ],
  },
  /**
   * Geographic service area. Kept unconfirmed until the owner confirms it; while
   * `confirmed` is false the area is not rendered in copy or structured data.
   */
  serviceArea: {
    confirmed: false,
    name: 'Armenia',
  },
} as const;

export type CompanyConfig = typeof companyConfig;

/** Values exposed to translation strings as interpolation variables, e.g. "Call {{phone}}". */
export function companyInterpolation(locale: Locale) {
  return {
    company: companyConfig.name,
    owner: companyConfig.owner.localizedName[locale],
    phone: companyConfig.contact.phoneDisplay,
  };
}
