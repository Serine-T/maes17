import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { MessageCircle, Phone, Send } from 'lucide-react';
import { companyConfig } from '@/config/company';
import { LocalizedNavLink } from '@/components/ui/LocalizedLink';
import { TopographicBackground } from '@/components/animations/TopographicBackground';
import { telUrl, whatsappUrl } from '@/components/contact/inquiry';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
import { LanguageSwitcher } from './LanguageSwitcher';
import { navItems } from './nav-items';

export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const items = [{ to: '/', key: 'nav.home' } as const, ...navItems];

  return (
    <div
      id="mobile-menu"
      ref={ref}
      className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-graphite text-paper lg:hidden"
    >
      <TopographicBackground className="absolute inset-0 h-full w-full text-paper/10" animate={false} />
      <div className="container-wide relative flex min-h-full flex-col justify-between gap-12 py-10">
        <nav aria-label={t('nav.label')}>
          <ul className="flex flex-col">
            {items.map((item, i) => (
              <motion.li
                key={item.to}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="border-b border-paper/10"
              >
                <LocalizedNavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `type-display block py-4 text-[2.25rem] ${isActive ? 'text-paper' : 'text-paper/70 hover:text-paper'}`
                  }
                >
                  {t(item.key)}
                </LocalizedNavLink>
              </motion.li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-6">
          <LanguageSwitcher tone="light" onSwitch={onClose} />
          <div className="flex flex-col gap-2 text-sm">
            <a href={telUrl} className="inline-flex min-h-11 items-center gap-3">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="tabular-nums">{companyConfig.contact.phoneDisplay}</span>
            </a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-3">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t('actions.whatsapp')}
            </a>
            <a
              href={companyConfig.social.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-3"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {t('actions.telegram')}
            </a>
            <a
              href={companyConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-3"
            >
              <InstagramIcon />
              {t('actions.instagram')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
