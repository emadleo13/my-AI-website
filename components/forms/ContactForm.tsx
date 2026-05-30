'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { contactSchema, type ContactInput } from '@/lib/validators';
import { SERVICE_CATEGORIES } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const CHANNELS = ['telegram', 'google-meet'] as const;

export function ContactForm() {
  const t = useTranslations('contact.form');
  const tCat = useTranslations('services.categories');
  const tErr = useTranslations('common');
  const searchParams = useSearchParams();

  const initialService = searchParams.get('service') ?? '';
  const validService = SERVICE_CATEGORIES.some((c) => c.key === initialService)
    ? initialService
    : '';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { service: validService, channel: 'telegram', company: '' },
  });

  const channel = watch('channel');

  const onSubmit = async (data: ContactInput) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok && !body?.demo) {
        if (res.status === 429) {
          toast.error(tErr('rateLimited'));
          return;
        }
        toast.error(body?.message ?? t('error'));
        return;
      }
      toast.success(t('success'));
      reset({ name: '', email: '', company: '', service: validService, channel: 'telegram', message: '' });
      document.getElementById('schedule')?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      toast.error(t('error'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t('name')}</Label>
          <Input id="name" placeholder={t('namePlaceholder')} {...register('name')} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="company">{t('company')}</Label>
          <Input id="company" placeholder={t('companyPlaceholder')} {...register('company')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">{t('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t('emailPlaceholder')}
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="service">{t('service')}</Label>
        <select
          id="service"
          {...register('service')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">{t('serviceGeneral')}</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {tCat(`${c.key}.title`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>{t('channel')}</Label>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('channel', c, { shouldValidate: true })}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                channel === c
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40',
              )}
            >
              {c === 'telegram' ? t('channelTelegram') : t('channelGoogleMeet')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">{t('message')}</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder={t('messagePlaceholder')}
          {...register('message')}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? t('submitting') : t('submit')}
        {!isSubmitting && <Send className="h-4 w-4 rtl:rotate-180" />}
      </Button>
    </form>
  );
}
