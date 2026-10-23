import type { Locale } from '@/config/site';
import type { KnowledgeBase } from './chat-types';

// One JSON knowledge base per language, loaded only when the assistant is opened.
const loaders = import.meta.glob<{ default: KnowledgeBase }>('../../content/chat/*.json');

export async function loadKnowledgeBase(locale: Locale): Promise<KnowledgeBase> {
  const loader = loaders[`../../content/chat/${locale}.json`];
  if (!loader) throw new Error(`Missing chat knowledge base for ${locale}`);
  return (await loader()).default;
}
