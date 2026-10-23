import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LANGUAGE_STORAGE_KEY } from '@/config/site';
import { localizePath, resolveInitialLocale } from '@/i18n/locale-utils';

/** "/" → stored language or the default locale. In production the static /index.html does the same. */
export function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      // ignore
    }
    navigate(localizePath(resolveInitialLocale(stored)), { replace: true });
  }, [navigate]);
  return null;
}
