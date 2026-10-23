import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowUp, RotateCcw, X } from 'lucide-react';
import { companyInterpolation } from '@/config/company';
import { LogoSymbol } from '@/components/brand/Logo';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import { useLocale } from '@/i18n/useLocale';
import { createLocalChatEngine, interpolate } from './chat-engine';
import { loadKnowledgeBase } from './knowledge-base';
import type { ChatEngine, ChatMessage, KnowledgeBase } from './chat-types';

const STORAGE_PREFIX = 'maes17.chat.';

function readHistory(locale: string): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + locale);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(locale: string, messages: ChatMessage[]) {
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + locale, JSON.stringify(messages));
  } catch {
    // History is a convenience; ignore storage failures.
  }
}

let counter = 0;
const nextId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => readHistory(locale));
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const vars = useMemo(() => companyInterpolation(locale), [locale]);

  useEffect(() => {
    let alive = true;
    loadKnowledgeBase(locale).then((data) => alive && setKb(data));
    setMessages(readHistory(locale));
    return () => {
      alive = false;
    };
  }, [locale]);

  const engine: ChatEngine | null = useMemo(() => (kb ? createLocalChatEngine(kb, vars) : null), [kb, vars]);

  useEffect(() => writeHistory(locale, messages), [locale, messages]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const ask = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (!text || !engine || typing) return;
      setMessages((m) => [...m, { id: nextId(), role: 'user', text }]);
      setInput('');
      setTyping(true);
      const reply = await engine.reply(text);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      await new Promise((r) => setTimeout(r, reduced ? 0 : 450 + Math.min(reply.text.length * 4, 700)));
      setTyping(false);
      setMessages((m) => [...m, { id: nextId(), role: 'assistant', text: reply.text, links: reply.links }]);
    },
    [engine, typing],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  const suggestions = kb ? kb.suggestions.map((id) => kb.intents.find((i) => i.id === id)).filter(Boolean) : [];

  return (
    <motion.div
      id="chat-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="chat-title"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-2 bottom-20 top-[calc(var(--header-h)+0.5rem)] flex origin-bottom-right flex-col overflow-hidden rounded-2xl border border-graphite/10 bg-paper shadow-[0_30px_80px_-30px_rgb(34_37_34/0.55)] sm:absolute sm:inset-auto sm:bottom-16 sm:right-0 sm:h-[min(36rem,calc(100vh-9rem))] sm:w-[24rem]"
    >
      <div className="flex items-start gap-3 border-b border-graphite/10 bg-graphite px-5 py-4 text-paper">
        <LogoSymbol className="mt-0.5 h-8 w-8 shrink-0" accent="var(--color-signal)" />
        <div className="min-w-0 flex-1">
          <h2 id="chat-title" className="font-serif text-lg leading-tight">
            {t('chat.title')}
          </h2>
          <p className="text-xs text-paper/65">{t('chat.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => setMessages([])}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-paper/70 hover:bg-paper/10 hover:text-paper"
          aria-label={t('chat.clear')}
          title={t('chat.clear')}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-paper/70 hover:bg-paper/10 hover:text-paper"
          aria-label={t('chat.close')}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div ref={logRef} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
        {kb ? <Bubble role="assistant" text={interpolate(kb.welcome, vars)} label={t('chat.assistant')} /> : null}
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.text} label={m.role === 'user' ? t('chat.you') : t('chat.assistant')}>
            {m.links && m.links.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {m.links.map((l) => (
                  <li key={l.to}>
                    <LocalizedLink
                      to={l.to}
                      onClick={onClose}
                      className="inline-flex min-h-8 items-center rounded-full border border-graphite/20 px-3 text-xs font-medium hover:border-graphite"
                    >
                      {l.label}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </Bubble>
        ))}
        {typing ? (
          <div className="flex items-center gap-1.5 px-1 py-2" role="status" aria-label={t('chat.typing')}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-olive"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        ) : null}
        {messages.length === 0 && suggestions.length > 0 ? (
          <div>
            <p className="mb-2 px-1 text-xs text-ink-muted">{t('chat.suggestionsLabel')}</p>
            <ul className="flex flex-col items-start gap-2">
              {suggestions.map((s) =>
                s ? (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => void ask(s.question)}
                      className="rounded-2xl border border-graphite/15 bg-white px-3.5 py-2 text-left text-sm transition-colors hover:border-graphite/50"
                    >
                      {s.question}
                    </button>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ) : null}
      </div>

      <p className="border-t border-graphite/10 px-4 py-2 text-[0.6875rem] leading-snug text-ink-muted">{t('chat.disclaimer')}</p>
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-graphite/10 p-3">
        <label htmlFor="chat-input" className="sr-only">
          {t('chat.inputLabel')}
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat.inputPlaceholder')}
          autoComplete="off"
          maxLength={300}
          className="min-h-11 flex-1 rounded-full border border-graphite/15 bg-white px-4 text-[0.9375rem] outline-none placeholder:text-ink-muted/70 focus:border-graphite/60"
        />
        <button
          type="submit"
          disabled={!input.trim() || !engine || typing}
          aria-label={t('chat.send')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-graphite text-paper transition-colors hover:bg-olive-deep disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </motion.div>
  );
}

function Bubble({
  role,
  text,
  label,
  children,
}: {
  role: 'user' | 'assistant';
  text: string;
  label: string;
  children?: ReactNode;
}) {
  const mine = role === 'user';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[0.9375rem] leading-relaxed ${
          mine ? 'rounded-br-sm bg-graphite text-paper' : 'rounded-bl-sm bg-paper-deep text-graphite'
        }`}
      >
        <span className="sr-only">{label}: </span>
        {text}
        {children}
      </div>
    </div>
  );
}
