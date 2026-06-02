'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const STEPS = ['business', 'project', 'technical', 'timeline'] as const;

const STEP_FIELDS: Record<(typeof STEPS)[number], string[]> = {
  business: ['fullName', 'email', 'company', 'website', 'industry', 'businessDescription'],
  project: ['serviceType', 'projectGoal', 'targetAudience'],
  technical: ['platform', 'currentTools', 'integrations', 'hasContent', 'language', 'tone'],
  timeline: ['timeline', 'budget', 'maintenance', 'extraNotes'],
};

// Select fields and their option values (order matters). Labels are translated
// via `fields.<key>.options.<value>` so the source of truth for order is here.
const SELECT_OPTIONS: Record<string, string[]> = {
  serviceType: ['chatbot', 'workflow', 'both', 'consulting'],
  targetAudience: ['customers', 'business', 'internal', 'mixed'],
  hasContent: ['yes_ready', 'yes_partial', 'no'],
  tone: ['professional', 'friendly', 'technical', 'sales'],
  timeline: ['asap', '1month', 'flexible', 'discuss'],
  budget: ['under500', '500_1500', '1500_3000', 'over3000', 'discuss'],
  maintenance: ['yes', 'no', 'maybe'],
};

const PLATFORM_OPTIONS = ['telegram', 'whatsapp', 'website', 'voice', 'instagram', 'other'];
const TEXTAREA_FIELDS = new Set([
  'businessDescription',
  'projectGoal',
  'extraNotes',
  'currentTools',
  'integrations',
]);

// The site nav links to /contact?service=<SERVICE_CATEGORIES key>; map those to
// this form's narrower service set so the dropdown is pre-selected when relevant.
const SERVICE_PREFILL: Record<string, string> = {
  chatbot: 'chatbot',
  workflow: 'workflow',
  techConsulting: 'consulting',
};

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

type FormState = {
  fullName: string;
  email: string;
  company: string;
  website: string;
  industry: string;
  businessDescription: string;
  serviceType: string;
  projectGoal: string;
  targetAudience: string;
  platform: string[];
  currentTools: string;
  integrations: string;
  hasContent: string;
  language: string;
  tone: string;
  timeline: string;
  budget: string;
  maintenance: string;
  extraNotes: string;
};

const EMPTY: FormState = {
  fullName: '', email: '', company: '', website: '', industry: '',
  businessDescription: '', serviceType: '', projectGoal: '', targetAudience: '',
  platform: [], currentTools: '', integrations: '', hasContent: '',
  language: '', tone: '', timeline: '', budget: '', maintenance: '', extraNotes: '',
};

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function DiscoveryForm() {
  const t = useTranslations('discovery');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const prefillService = SERVICE_PREFILL[searchParams.get('service') ?? ''] ?? '';

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<FormState>({ ...EMPTY, serviceType: prefillService });

  const current = STEPS[step];
  const fields = STEP_FIELDS[current];
  const total = STEPS.length;
  const progress = Math.round(((step + 1) / total) * 100);

  const set = (field: keyof FormState, value: string) => {
    setData((p) => ({ ...p, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: '' } : e));
  };

  const togglePlatform = (value: string) =>
    setData((p) => ({
      ...p,
      platform: p.platform.includes(value)
        ? p.platform.filter((v) => v !== value)
        : [...p.platform, value],
    }));

  // Per-step validation with localized messages. Only the essentials block.
  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (current === 'business') {
      if (data.fullName.trim().length < 2) next.fullName = t('errors.fullName');
      if (!isEmail(data.email.trim())) next.email = t('errors.email');
    }
    if (current === 'project') {
      if (!data.serviceType) next.serviceType = t('errors.serviceType');
      if (data.projectGoal.trim().length < 5) next.projectGoal = t('errors.projectGoal');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, total - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok && !body?.demo) {
        if (res.status === 429) {
          toast.error(t('errors.rateLimited'));
          return;
        }
        toast.error(body?.message ?? t('errors.submit'));
        return;
      }
      setSubmitted(true);
      document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      toast.error(t('errors.submit'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight">{t('success.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('success.message')}</p>
      </div>
    );
  }

  const renderField = (key: string) => {
    const label = t(`fields.${key}.label`);

    if (key === 'platform') {
      return (
        <div key={key} className="space-y-2">
          <Label>
            {label}{' '}
            <span className="font-normal text-muted-foreground">{t('fields.platform.note')}</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((value) => {
              const active = data.platform.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => togglePlatform(value)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40',
                  )}
                >
                  {t(`fields.platform.options.${value}`)}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (SELECT_OPTIONS[key]) {
      return (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={key}>{label}</Label>
          <select
            id={key}
            value={data[key as keyof FormState] as string}
            onChange={(e) => set(key as keyof FormState, e.target.value)}
            className={SELECT_CLASS}
            aria-invalid={!!errors[key]}
          >
            <option value="">{t(`fields.${key}.placeholder`)}</option>
            {SELECT_OPTIONS[key].map((value) => (
              <option key={value} value={value}>
                {t(`fields.${key}.options.${value}`)}
              </option>
            ))}
          </select>
          {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
        </div>
      );
    }

    return (
      <div key={key} className="space-y-1.5">
        <Label htmlFor={key}>{label}</Label>
        {TEXTAREA_FIELDS.has(key) ? (
          <Textarea
            id={key}
            rows={3}
            value={data[key as keyof FormState] as string}
            onChange={(e) => set(key as keyof FormState, e.target.value)}
            placeholder={t(`fields.${key}.placeholder`)}
            aria-invalid={!!errors[key]}
          />
        ) : (
          <Input
            id={key}
            type={key === 'email' ? 'email' : 'text'}
            value={data[key as keyof FormState] as string}
            onChange={(e) => set(key as keyof FormState, e.target.value)}
            placeholder={t(`fields.${key}.placeholder`)}
            aria-invalid={!!errors[key]}
          />
        )}
        {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            {t('step')} {step + 1} {t('of')} {total} — {t(`sections.${current}`)}
          </span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-muted')}
            />
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5">{fields.map(renderField)}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={goBack}>
            {t('back')}
          </Button>
        ) : (
          <span />
        )}
        {step < total - 1 ? (
          <Button type="button" onClick={goNext}>
            {t('next')}
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting} className="gap-2">
            {submitting ? t('submitting') : t('submit')}
            {!submitting && <Send className="h-4 w-4 rtl:rotate-180" />}
          </Button>
        )}
      </div>
    </div>
  );
}
