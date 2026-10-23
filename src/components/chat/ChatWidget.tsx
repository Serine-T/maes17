import { lazy, Suspense, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import { MessagesSquare } from 'lucide-react';

// The panel, engine and knowledge base load only when a visitor opens the assistant.
const ChatPanel = lazy(() => import('./ChatPanel'));

export function ChatWidget() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    launcherRef.current?.focus();
  };

  return (
    <div className="floating-control fixed bottom-4 right-4 z-30 md:bottom-6 md:right-6">
      <AnimatePresence>
        {open ? (
          <Suspense fallback={null}>
            <ChatPanel key="panel" onClose={close} />
          </Suspense>
        ) : null}
      </AnimatePresence>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={open ? 'chat-panel' : undefined}
        aria-label={open ? t('chat.close') : t('chat.open')}
        className="flex h-13 items-center gap-2.5 rounded-full bg-graphite pl-4 pr-4 text-paper shadow-[0_10px_30px_-12px_rgb(34_37_34/0.7)] transition-colors hover:bg-graphite-soft md:pr-5"
      >
        <MessagesSquare className="h-5 w-5" aria-hidden="true" />
        <span className="hidden text-sm font-medium md:inline">{t('chat.title')}</span>
      </button>
    </div>
  );
}
