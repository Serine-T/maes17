import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { LocalizedLink } from '@/components/ui/LocalizedLink';
import type { Crumb } from '@/seo/metadata';

export function Breadcrumbs({ items, tone = 'dark' }: { items: Crumb[]; tone?: 'dark' | 'light' }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  const muted = tone === 'light' ? 'text-paper/65 hover:text-paper' : 'text-ink-muted hover:text-graphite';
  const current = tone === 'light' ? 'text-paper' : 'text-graphite';
  return (
    <nav aria-label={t('breadcrumbs.label')}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem]">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className={current}>
                  {item.name}
                </span>
              ) : (
                <>
                  <LocalizedLink to={item.path} className={`transition-colors ${muted}`}>
                    {item.name}
                  </LocalizedLink>
                  <ChevronRight className={`h-3 w-3 ${tone === 'light' ? 'text-paper/40' : 'text-ink-muted/60'}`} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
