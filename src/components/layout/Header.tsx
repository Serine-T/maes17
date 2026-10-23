import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Phone, X } from 'lucide-react';
import { companyConfig } from '@/config/company';
import { Logo } from '@/components/brand/Logo';
import { LocalizedLink, LocalizedNavLink } from '@/components/ui/LocalizedLink';
import { telUrl } from '@/components/contact/inquiry';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { navItems } from './nav-items';

interface Props {
  /** True when the page opens with a dark, full-bleed hero behind the header. */
  overDark: boolean;
}

export function Header({ overDark }: Props) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const light = overDark && !scrolled;
  const box = light
    ? 'border-paper/25 text-paper hover:border-paper/70'
    : 'border-graphite/15 text-graphite hover:border-graphite/60';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,color] duration-500 ${
        light ? 'border-b border-transparent bg-transparent' : 'border-b border-graphite/10 bg-paper'
      }`}
    >
      <div className="container-wide grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4">
        <nav aria-label={t('nav.label')} className="hidden lg:block">
          <ul className="flex items-center gap-1.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <LocalizedNavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex min-h-9 items-center border px-3.5 text-[0.8125rem] font-medium transition-colors duration-300 ${box} ${
                      isActive ? (light ? 'border-paper/70' : 'border-graphite/70') : ''
                    }`
                  }
                >
                  {t(item.key)}
                </LocalizedNavLink>
              </li>
            ))}
          </ul>
        </nav>

        <LocalizedLink
          to="/"
          aria-label={t('brand.logoAlt')}
          className={`col-start-1 justify-self-start lg:col-start-2 lg:justify-self-center ${light ? 'text-paper' : 'text-graphite'}`}
        >
          <Logo accent="var(--color-signal)" />
        </LocalizedLink>

        <div className="col-start-3 flex items-center justify-end gap-1.5">
          <LanguageSwitcher tone={light ? 'light' : 'dark'} className="hidden md:block" />
          <a
            href={telUrl}
            className={`hidden min-h-9 items-center gap-2 border px-3.5 text-[0.8125rem] font-medium transition-colors duration-300 md:inline-flex ${box}`}
            aria-label={t('actions.callNumber')}
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">{companyConfig.contact.phoneDisplay}</span>
          </a>
          <a
            href={telUrl}
            className={`inline-flex h-10 w-10 items-center justify-center border md:hidden ${box}`}
            aria-label={t('actions.callNumber')}
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('header.closeMenu') : t('header.openMenu')}
            className={`inline-flex h-10 w-10 items-center justify-center border lg:hidden ${box}`}
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MobileMenu onClose={() => setMenuOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
