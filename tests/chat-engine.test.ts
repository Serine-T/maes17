import { describe, expect, it } from 'vitest';
import { createLocalChatEngine, normalize } from '@/components/chat/chat-engine';
import type { KnowledgeBase } from '@/components/chat/chat-types';
import { companyInterpolation } from '@/config/company';
import { locales, type Locale } from '@/config/site';
import en from '@/content/chat/en.json';
import ru from '@/content/chat/ru.json';
import hy from '@/content/chat/hy.json';

const kbs: Record<Locale, KnowledgeBase> = { en, ru, hy };
const engine = (l: Locale) => createLocalChatEngine(kbs[l], companyInterpolation(l));

describe('normalize', () => {
  it('lowercases, unifies ё and strips Armenian question marks inside words', () => {
    expect(normalize('Съёмка?')).toBe('съемка');
    expect(normalize('Ի՞նչ արժե')).toBe('ինչ արժե');
  });
});

describe('local chat engine', () => {
  const cases: [Locale, string, string][] = [
    ['en', 'What services do you offer?', 'services'],
    ['en', 'how much does it cost', 'price'],
    ['en', 'What documents should I prepare?', 'documents'],
    ['en', 'what is your phone number', 'contact'],
    ['en', 'Do I need a topographic plan with contours', 'topographic'],
    ['ru', 'Сколько стоит съёмка?', 'price'],
    ['ru', 'Сколько стоит топосъёмка участка?', 'price'],
    ['ru', 'Какие документы нужны?', 'documents'],
    ['ru', 'Как с вами связаться?', 'contact'],
    ['ru', 'Какие услуги вы оказываете', 'services'],
    ['hy', 'Ի՞նչ արժե', 'price'],
    ['hy', 'Ինչ փաստաթղթեր են պետք', 'documents'],
    ['hy', 'Ի՞նչ ծառայություններ եք մատուցում', 'services'],
  ];

  for (const [locale, question, intent] of cases) {
    it(`[${locale}] "${question}" → ${intent}`, async () => {
      expect((await engine(locale).reply(question)).intentId).toBe(intent);
    });
  }

  it('answers every suggested question with its own intent in every language', async () => {
    for (const l of locales) {
      for (const id of kbs[l].suggestions) {
        const intent = kbs[l].intents.find((i) => i.id === id);
        expect(intent, `${l}:${id}`).toBeDefined();
        expect((await engine(l).reply(intent!.question)).intentId).toBe(id);
      }
    }
  });

  it('falls back transparently, with contact details, for unknown questions', async () => {
    const reply = await engine('en').reply('Can you repair my car engine?');
    expect(reply.intentId).toBeNull();
    expect(reply.text).toContain(companyInterpolation('en').phone);
    expect(reply.links.some((l) => l.to === '/contacts')).toBe(true);
  });

  it('fills company placeholders from configuration', async () => {
    const reply = await engine('hy').reply('հեռախոս');
    expect(reply.text).not.toMatch(/\{\{/);
    expect(reply.text).toContain(companyInterpolation('hy').phone);
  });
});
