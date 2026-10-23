import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { splitLocalePath } from '@/i18n/locale-utils';
import { getBreadcrumbs } from '@/seo/metadata';
import { matchRoute, type RouteMatch } from './routes';

export function useRouteMatch(): RouteMatch {
  const { pathname } = useLocation();
  return matchRoute(splitLocalePath(pathname).rest);
}

export function useBreadcrumbs() {
  const route = useRouteMatch();
  const { t } = useTranslation();
  return getBreadcrumbs(route, t);
}
