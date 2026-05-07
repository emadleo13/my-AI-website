'use client';

import { useTranslations } from 'next-intl';
import { Compass, Bot, Briefcase, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type ServiceKey = 'ai' | 'agent' | 'career' | 'tech';

const ITEMS: { key: ServiceKey; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'ai',     icon: Compass },
  { key: 'agent',  icon: Bot },
  { key: 'career', icon: Briefcase },
  { key: 'tech',   icon: Wrench },
];

interface Props {
  value: ServiceKey | null;
  onChange: (k: ServiceKey) => void;
}

export function ServiceStep({ value, onChange }: Props) {
  const t = useTranslations('booking.services');

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ITEMS.map(({ key, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className="text-start"
        >
          <Card
            className={cn(
              'h-full transition-all hover:-translate-y-0.5 hover:shadow-lg',
              value === key
                ? 'border-primary ring-2 ring-primary/30'
                : 'hover:border-primary/30',
            )}
          >
            <CardContent className="pt-6 space-y-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{t(`${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">
                {t(`${key}.desc`)}
              </p>
            </CardContent>
          </Card>
        </button>
      ))}
    </div>
  );
}
