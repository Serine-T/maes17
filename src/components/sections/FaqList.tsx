import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  more: string;
}

/** Native <details> accordion: answers stay in the HTML for crawlers and work without JS. */
export function FaqList({ limit, headingLevel = 3 }: { limit?: number; headingLevel?: 2 | 3 }) {
  const { t } = useTranslation('faq');
  const items = (t('items', { returnObjects: true }) as FaqItem[]).slice(0, limit);
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div className="border-t border-graphite/15">
      {items.map((item) => (
        <details key={item.id} id={item.id} className="group border-b border-graphite/15">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
            <Heading className="font-serif text-xl leading-snug md:text-2xl">{item.question}</Heading>
            <Plus
              className="mt-1.5 h-5 w-5 shrink-0 text-olive-deep transition-transform duration-300 group-open:rotate-45"
              aria-hidden="true"
            />
          </summary>
          <div className="prose-measure pb-7 text-[1.0625rem] leading-relaxed">
            <p className="font-medium">{item.answer}</p>
            <p className="mt-3 text-ink-muted">{item.more}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
