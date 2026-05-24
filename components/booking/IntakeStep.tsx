'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export type Role = 'founder' | 'executive' | 'manager' | 'developer' | 'consultant' | 'other';
export type TeamSize = 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
export type AiExperience = 'none' | 'basic' | 'intermediate' | 'advanced';

export interface IntakeState {
  company: string;
  role: Role | '';
  teamSize: TeamSize | null;
  goal: string;
  aiExperience: AiExperience | null;
}

export interface IntakeErrors {
  company?: string;
  role?: string;
  goal?: string;
}

const ROLES: Role[] = ['founder', 'executive', 'manager', 'developer', 'consultant', 'other'];
const TEAM_SIZES: TeamSize[] = ['solo', 'small', 'medium', 'large', 'enterprise'];
const AI_EXPERIENCES: AiExperience[] = ['none', 'basic', 'intermediate', 'advanced'];

interface Props {
  value: IntakeState;
  onChange: (next: IntakeState) => void;
  errors?: IntakeErrors;
}

export function IntakeStep({ value, onChange, errors }: Props) {
  const t = useTranslations('booking.intake');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-base mb-1">{t('title')}</h3>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Company + Role */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="b-company">
            {t('company')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="b-company"
            value={value.company}
            onChange={(e) => onChange({ ...value, company: e.target.value })}
            placeholder={t('companyPlaceholder')}
            aria-invalid={!!errors?.company}
          />
          {errors?.company && (
            <p className="text-xs text-destructive">{errors.company}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="b-role">
            {t('role')} <span className="text-destructive">*</span>
          </Label>
          <select
            id="b-role"
            value={value.role}
            onChange={(e) => onChange({ ...value, role: e.target.value as Role })}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              !value.role && 'text-muted-foreground',
              errors?.role && 'border-destructive',
            )}
          >
            <option value="">{t('rolePlaceholder')}</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`roles.${r}`)}
              </option>
            ))}
          </select>
          {errors?.role && (
            <p className="text-xs text-destructive">{errors.role}</p>
          )}
        </div>
      </div>

      {/* Team size */}
      <div className="space-y-2">
        <Label>{t('teamSize')}</Label>
        <div className="flex flex-wrap gap-2">
          {TEAM_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onChange({ ...value, teamSize: size })}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                value.teamSize === size
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40',
              )}
            >
              {t(`sizes.${size}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Main goal */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="b-goal">
            {t('goal')} <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">{t('goalHint')}</span>
        </div>
        <Textarea
          id="b-goal"
          rows={3}
          value={value.goal}
          onChange={(e) => onChange({ ...value, goal: e.target.value })}
          placeholder={t('goalPlaceholder')}
          aria-invalid={!!errors?.goal}
          className="resize-none"
        />
        {errors?.goal && (
          <p className="text-xs text-destructive">{errors.goal}</p>
        )}
      </div>

      {/* AI experience */}
      <div className="space-y-2">
        <Label>{t('aiExperience')}</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {AI_EXPERIENCES.map((exp) => (
            <button
              key={exp}
              type="button"
              onClick={() => onChange({ ...value, aiExperience: exp })}
              className={cn(
                'px-3 py-2 rounded-lg text-xs text-start border transition-colors',
                value.aiExperience === exp
                  ? 'bg-primary/10 border-primary text-primary font-medium'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40',
              )}
            >
              {t(`experience.${exp}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
