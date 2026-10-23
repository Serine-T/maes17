export interface ChatLink {
  label: string;
  /** Locale-neutral internal path, e.g. "/services". */
  to: string;
}

export interface ChatIntent {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  links: ChatLink[];
}

export interface KnowledgeBase {
  welcome: string;
  suggestions: string[];
  intents: ChatIntent[];
  fallback: { answer: string; links: ChatLink[] };
}

export interface ChatReply {
  /** Matched intent id, or null when the fallback answer was used. */
  intentId: string | null;
  text: string;
  links: ChatLink[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  links?: ChatLink[];
}

/**
 * Anything that can answer a visitor's question. The local FAQ engine implements this
 * today; a server-side AI integration can implement the same interface later without
 * changing the UI. Never call an AI provider directly from the browser with a secret key.
 */
export interface ChatEngine {
  reply(input: string): Promise<ChatReply>;
}
