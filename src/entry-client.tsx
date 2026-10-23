import './styles/fonts';
import './styles/globals.css';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from '@/app/App';
import { Providers } from '@/app/providers';
import { LANGUAGE_STORAGE_KEY } from '@/config/site';
import { createI18n } from '@/i18n/config';
import { resolveInitialLocale, splitLocalePath } from '@/i18n/locale-utils';
import { loadResources } from '@/i18n/resources';

function storedLocale(): string | null {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

const { locale } = splitLocalePath(window.location.pathname);
const lng = locale ?? resolveInitialLocale(storedLocale());

// Translations for the page language must be present before hydration so the first
// client render matches the prerendered HTML exactly.
const i18n = await createI18n(lng, await loadResources([lng]));

const container = document.getElementById('root') as HTMLElement;
const app = (
  <Providers i18n={i18n}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Providers>
);

if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
