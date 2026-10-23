import { useParams } from 'react-router';
import { defaultLocale, type Locale } from '@/config/site';
import { isLocale } from './locale-utils';

/** Current locale, taken from the URL so routing and language can never disagree. */
export function useLocale(): Locale {
  const { lang } = useParams();
  return isLocale(lang) ? lang : defaultLocale;
}
