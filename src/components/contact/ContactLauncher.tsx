import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, Phone, Send, X } from 'lucide-react';
import { companyConfig } from '@/config/company';
import { InstagramIcon } from '@/components/ui/InstagramIcon';
import { telUrl, whatsappUrl } from './inquiry';

/**
 * Direct contact options (call / WhatsApp / Telegram). Deliberately styled unlike the
 * FAQ assistant: a square signal-orange control on the left vs. the round assistant on the right.
 */
export function ContactLauncher() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const action =
    'flex min-h-12 items-center gap-3 border-t border-graphite/10 px-5 text-[0.9375rem] transition-colors hover:bg-paper-deep';

  return (
    <div className="floating-control fixed bottom-4 left-4 z-30 md:bottom-6 md:left-6">
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={t('contactLauncher.title')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-16 left-0 w-[min(20rem,calc(100vw-2rem))] border border-graphite/15 bg-paper shadow-[0_20px_60px_-20px_rgb(34_37_34/0.45)]"
          >
            <div className="px-5 pb-4 pt-5">
              <p className="font-serif text-xl">{t('contactLauncher.title')}</p>
              <p className="mt-1 text-sm text-ink-muted">{t('contactLauncher.text')}</p>
            </div>
            <a href={telUrl} className={action}>
              <Phone className="h-4 w-4 text-signal" aria-hidden="true" />
              <span className="tabular-nums">{t('contactLauncher.call')}</span>
            </a>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={action}>
              <MessageCircle className="h-4 w-4 text-signal" aria-hidden="true" />
              {t('contactLauncher.whatsapp')}
            </a>
            <a href={companyConfig.social.telegram} target="_blank" rel="noopener noreferrer" className={action}>
              <Send className="h-4 w-4 text-signal" aria-hidden="true" />
              {t('contactLauncher.telegram')}
            </a>
            <a href={companyConfig.social.instagram} target="_blank" rel="noopener noreferrer" className={action}>
              <InstagramIcon className="h-4 w-4 text-signal" />
              {t('contactLauncher.instagram')}
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? t('contactLauncher.close') : t('contactLauncher.open')}
        className="flex h-13 w-13 items-center justify-center bg-signal text-white shadow-[0_10px_30px_-10px_rgb(217_88_31/0.7)] transition-colors hover:bg-[#b94916]"
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Phone className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
