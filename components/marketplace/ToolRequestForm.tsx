'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type ServiceKey } from '@/lib/marketplace-services';

interface Props {
  serviceKey: ServiceKey;
  onSubmitted: (requestId: string) => void;
}

export function ToolRequestForm({ serviceKey, onSubmitted }: Props) {
  const t = useTranslations('marketplace');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const metadata: Record<string, string> = {};
    formData.forEach((val, key) => {
      if (typeof val === 'string') metadata[key] = val;
    });

    try {
      const res = await fetch('/api/service-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType: serviceKey, metadata }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed');
      onSubmitted(json.request.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serviceKey === 'telegram_bot' && <TelegramBotFields t={t} />}
      {serviceKey === 'travel_automation' && <TravelFields t={t} />}
      {serviceKey === 'voice_assistant' && <VoiceFields t={t} />}
      {['website_design', 'crm_automation', 'social_automation'].includes(serviceKey) && (
        <RequestFields t={t} serviceKey={serviceKey} />
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
}

function TelegramBotFields({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="businessName">{t('form.businessName')}</Label>
        <Input id="businessName" name="businessName" required maxLength={100} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="topics">{t('form.topics')}</Label>
        <Input id="topics" name="topics" placeholder={t('form.topicsPlaceholder')} maxLength={200} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tone">{t('form.tone')}</Label>
        <select
          id="tone"
          name="tone"
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="professional">Professional</option>
          <option value="friendly">Friendly</option>
          <option value="formal">Formal</option>
          <option value="casual">Casual</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>{t('form.faq')}</Label>
        {[1, 2, 3].map((i) => (
          <Input key={i} name={`faq_${i}`} placeholder={`FAQ ${i}: Question — Answer`} maxLength={200} />
        ))}
      </div>
    </>
  );
}

function TravelFields({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="origin">{t('form.origin')}</Label>
          <Input id="origin" name="origin" required maxLength={100} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destination">{t('form.destination')}</Label>
          <Input id="destination" name="destination" required maxLength={100} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dates">{t('form.travelDates')}</Label>
        <Input id="dates" name="dates" placeholder="e.g. 15 July – 22 July 2026" maxLength={100} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="budget">{t('form.budget')}</Label>
        <Input id="budget" name="budget" placeholder="e.g. €500 total" maxLength={100} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="preferences">{t('form.preferences')}</Label>
        <Textarea id="preferences" name="preferences" rows={2} maxLength={300} />
      </div>
    </>
  );
}

function VoiceFields({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="websiteUrl">{t('form.websiteUrl')}</Label>
        <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://yoursite.com" maxLength={200} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="businessName">{t('form.businessName')}</Label>
        <Input id="businessName" name="businessName" required maxLength={100} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="topics">{t('form.topics')}</Label>
        <Input id="topics" name="topics" placeholder={t('form.topicsPlaceholder')} maxLength={200} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="language">{t('form.language')}</Label>
        <select
          id="language"
          name="language"
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="English">English</option>
          <option value="Romanian">Romanian</option>
          <option value="Persian">Persian (Farsi)</option>
          <option value="German">German</option>
          <option value="French">French</option>
        </select>
      </div>
    </>
  );
}

function RequestFields({ t, serviceKey }: { t: ReturnType<typeof useTranslations>; serviceKey: string }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="businessName">{t('form.businessName')}</Label>
        <Input id="businessName" name="businessName" required maxLength={100} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="requirements">{t('form.requirements')}</Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={4}
          placeholder={t(`form.${serviceKey}Placeholder`)}
          maxLength={1000}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="budget">{t('form.budget')}</Label>
        <Input id="budget" name="budget" placeholder="e.g. €500" maxLength={100} />
      </div>
    </>
  );
}
