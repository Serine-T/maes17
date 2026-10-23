import { useTranslation } from 'react-i18next';
import { FlaskConical } from 'lucide-react';

export function DemoBadge({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center gap-1.5 border border-paper/40 bg-graphite/70 px-2.5 py-1 text-[0.6875rem] font-medium text-paper ${className}`}
    >
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      {t('common.demoBadge')}
    </span>
  );
}
