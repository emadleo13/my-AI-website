'use client';

import { useTranslations } from 'next-intl';
import { Gift, Clock, Zap, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type ScopeKey = 'free' | 'session' | 'mini' | 'full';
export type SocialPlatform = 'whatsapp' | 'telegram' | 'facebook';

export interface ScopeState {
  scope: ScopeKey | null;
  socialPlatform: SocialPlatform | null;
  socialContact: string;
}

const SCOPE_ICONS: Record<ScopeKey, React.ComponentType<{ className?: string }>> = {
  free:    Gift,
  session: Clock,
  mini:    Zap,
  full:    Layers,
};

const SCOPE_KEYS: ScopeKey[] = ['free', 'session', 'mini', 'full'];
const PLATFORMS: SocialPlatform[] = ['whatsapp', 'telegram', 'facebook'];

interface Props {
  value: ScopeState;
  onChange: (next: ScopeState) => void;
  errors?: { socialContact?: string };
}

export function ScopeStep({ value, onChange, errors }: Props) {
  const t = useTranslations('booking.scope');

  const setScope = (scope: ScopeKey) =>
    onChange({ ...value, scope, socialPlatform: scope === 'free' ? (value.socialPlatform ?? 'whatsapp') : null, socialContact: scope !== 'free' ? '' : value.socialContact });

  const setPlatform = (socialPlatform: SocialPlatform) =>
    onChange({ ...value, socialPlatform });

  const setContact = (socialContact: string) =>
    onChange({ ...value, socialContact });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-base mb-1">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {SCOPE_KEYS.map((key) => {
          const Icon = SCOPE_ICONS[key];
          const selected = value.scope === key;
          const isFree = key === 'free';

          return (
            <button
              key={key}
              type="button"
              onClick={() => setScope(key)}
              className="text-start"
            >
              <Card
                className={cn(
                  'h-full transition-all hover:-translate-y-0.5 hover:shadow-md',
                  selected
                    ? isFree
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-primary ring-2 ring-primary/30'
                    : 'hover:border-primary/30',
                )}
              >
                <CardContent className="pt-5 pb-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        'grid h-9 w-9 place-items-center rounded-lg',
                        isFree
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        'mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                        isFree
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {t(isFree ? 'free.badge' : 'paid.badge')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm leading-tight">{t(`${key}.title`)}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(`${key}.desc`)}</p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Social contact — only shown when Free is selected */}
      {value.scope === 'free' && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20 p-4 space-y-4">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            {t('social.label')}
          </p>

          {/* Platform picker */}
          <div className="flex gap-2 flex-wrap">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  value.socialPlatform === p
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-border bg-background text-muted-foreground hover:border-emerald-400',
                )}
              >
                {t(`social.platforms.${p}`)}
              </button>
            ))}
          </div>

          {/* Contact number */}
          <div className="space-y-1.5">
            <Label htmlFor="b-social-contact">{t('social.number')}</Label>
            <Input
              id="b-social-contact"
              type="tel"
              value={value.socialContact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t('social.numberPlaceholder')}
              aria-invalid={!!errors?.socialContact}
            />
            {errors?.socialContact && (
              <p className="text-xs text-destructive">{errors.socialContact}</p>
            )}
          </div>
        </div>
      )}

      {/* Quote note for paid options */}
      {value.scope && value.scope !== 'free' && (
        <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/40 px-4 py-3">
          {t('quoteNote')}
        </p>
      )}
    </div>
  );
}
