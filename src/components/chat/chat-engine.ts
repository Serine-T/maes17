import type { ChatEngine, ChatIntent, ChatReply, KnowledgeBase } from './chat-types';

/** Lowercases, unifies ё/е, removes punctuation (including Armenian ՞ ՛ ՜ ։) and collapses spaces. */
export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/ё/g, 'е')
    // Armenian stress, emphasis and question marks sit inside words: drop them without a space.
    .replace(/[\u055B\u055C\u055E]/g, '')
    .replace(/[\p{P}\p{S}]+/gu, (m) => (m.includes('-') ? '-' : ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

const SMALL_TALK = new Set(['greeting', 'thanks']);
const MIN_STEM = 4;

function keywordScore(k: string, text: string, tokens: string[]): number {
  if (!k) return 0;
  if (k.includes(' ') || k.includes('-')) {
    // Phrase: must start at a word boundary.
    return ` ${text} `.includes(` ${k}`) ? 2 : 0;
  }
  if (k.length < MIN_STEM) {
    // Short keywords only count as whole words ("ок", "где", "կապ").
    return tokens.includes(k) ? 1 : 0;
  }
  // Longer keywords act as stems so inflected forms match ("услуг" → "услуги", "услугах").
  return tokens.some((t) => t.startsWith(k)) ? (k.length >= 6 ? 1.5 : 1) : 0;
}

export function scoreIntent(intent: ChatIntent, input: string): number {
  const text = normalize(input);
  if (!text) return 0;
  if (text === normalize(intent.question)) return 100;
  const tokens = text.split(' ');
  // Normalise and de-duplicate first, so spelling variants (съёмка/съемка) count once.
  const keywords = new Set(intent.keywords.map(normalize));
  let score = 0;
  for (const k of keywords) score += keywordScore(k, text, tokens);
  return SMALL_TALK.has(intent.id) ? score * 0.5 : score;
}

export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => vars[key] ?? match);
}

export function matchIntent(kb: KnowledgeBase, input: string): ChatIntent | null {
  let best: ChatIntent | null = null;
  let bestScore = 0;
  for (const intent of kb.intents) {
    const score = scoreIntent(intent, input);
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return bestScore >= 0.5 ? best : null;
}

/** Rule-based FAQ assistant: answers only from the prepared knowledge base. */
export function createLocalChatEngine(kb: KnowledgeBase, vars: Record<string, string>): ChatEngine {
  return {
    async reply(input: string): Promise<ChatReply> {
      const intent = matchIntent(kb, input);
      if (!intent) {
        return { intentId: null, text: interpolate(kb.fallback.answer, vars), links: kb.fallback.links };
      }
      return { intentId: intent.id, text: interpolate(intent.answer, vars), links: intent.links };
    },
  };
}
