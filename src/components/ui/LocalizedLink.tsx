import { forwardRef } from 'react';
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router';
import { useLocale } from '@/i18n/useLocale';
import { localizePath } from '@/i18n/locale-utils';

type Props = Omit<LinkProps, 'to'> & { to: string };

/** Link whose `to` is locale-neutral ("/services"); the current locale prefix is added automatically. */
export const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(function LocalizedLink({ to, ...rest }, ref) {
  const locale = useLocale();
  return <Link ref={ref} to={localizePath(locale, to)} {...rest} />;
});

type NavProps = Omit<NavLinkProps, 'to'> & { to: string };

export const LocalizedNavLink = forwardRef<HTMLAnchorElement, NavProps>(function LocalizedNavLink(
  { to, ...rest },
  ref,
) {
  const locale = useLocale();
  return <NavLink ref={ref} to={localizePath(locale, to)} {...rest} />;
});
