import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './render-helpers';

describe('routing and language switching', () => {
  it('renders the home page in Armenian', async () => {
    await renderApp('/hy/', 'hy');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ճշգրտություն');
  });

  it('renders a service detail page', async () => {
    await renderApp('/en/services/topographic-surveying/', 'en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Topographic surveying and terrain mapping');
  });

  it('shows the 404 page for unknown routes and unknown services', async () => {
    await renderApp('/en/nowhere/', 'en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This point is not on the map');
  });

  it('shows the 404 page for an unsupported language prefix', async () => {
    await renderApp('/de/', 'hy');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Այս կետը քարտեզի վրա չէ');
  });

  it('switches language and keeps the current page', async () => {
    const user = userEvent.setup();
    await renderApp('/en/services/', 'en');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Services');
    const switchers = screen.getAllByRole('link', { name: /Русский/ });
    await user.click(switchers[0]!);
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Услуги'));
    expect(document.documentElement.lang).toBe('ru');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toMatch(/\/ru\/services\/$/);
  });

  it('uses the owner name spelled for the active language', async () => {
    const { i18n } = await renderApp('/ru/contacts/', 'ru');
    expect(i18n.t('common:footer.legal')).toContain('Эрик Товмасян');
    await i18n.changeLanguage('en');
    expect(i18n.t('common:footer.legal')).toContain('Erik Tovmasyan');
  });
});
