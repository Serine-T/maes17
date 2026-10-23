import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App } from '@/app/App';
import { Providers } from '@/app/providers';
import type { Locale } from '@/config/site';
import { createI18n } from '@/i18n/config';
import { loadResources } from '@/i18n/resources';
import { locales } from '@/config/site';

export async function renderApp(url: string, lng: Locale) {
  const i18n = await createI18n(lng, await loadResources(locales));
  const utils = render(
    <Providers i18n={i18n}>
      <MemoryRouter initialEntries={[url]}>
        <App />
      </MemoryRouter>
    </Providers>,
  );
  return { ...utils, i18n };
}
