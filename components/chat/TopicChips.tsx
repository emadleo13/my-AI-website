'use client';

import { Briefcase, Bot, Code2, Compass } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type TopicKey = 'job' | 'ai' | 'dev' | 'agents';

const ICONS: Record<TopicKey, React.ComponentType<{ className?: string }>> = {
  job: Briefcase,
  ai: Compass,
  dev: Code2,
  agents: Bot,
};

interface Props {
  onPick: (key: TopicKey) => void;
  disabled?: boolean;
}

export function TopicChips({ onPick, disabled }: Props) {
  const t = useTranslations('consultant.chips');
  const keys: TopicKey[] = ['job', 'ai', 'dev', 'agents'];

  return (
    <div className="flex flex-wrap gap-2">
      {keys.map((k) => {
        const Icon = ICONS[k];
        return (
          <button
            key={k}
            type="button"
            onClick={() => onPick(k)}
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent/10 hover:border-accent/40 disabled:opacity-50',
            )}
          >
            <Icon className="h-3.5 w-3.5 text-accent" />
            {t(k)}
          </button>
        );
      })}
    </div>
  );
}
