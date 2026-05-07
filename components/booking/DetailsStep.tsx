'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export interface DetailsState {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface Props {
  value: DetailsState;
  onChange: (next: DetailsState) => void;
  errors?: Partial<Record<keyof DetailsState, string>>;
}

export function DetailsStep({ value, onChange, errors }: Props) {
  const t = useTranslations('booking.details');

  const set = <K extends keyof DetailsState>(k: K, v: DetailsState[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="b-name">{t('name')}</Label>
        <Input
          id="b-name"
          value={value.name}
          onChange={(e) => set('name', e.target.value)}
          aria-invalid={!!errors?.name}
        />
        {errors?.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-email">{t('email')}</Label>
        <Input
          id="b-email"
          type="email"
          value={value.email}
          onChange={(e) => set('email', e.target.value)}
          aria-invalid={!!errors?.email}
        />
        {errors?.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-phone">{t('phone')}</Label>
        <Input
          id="b-phone"
          value={value.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-notes">{t('notes')}</Label>
        <Textarea
          id="b-notes"
          rows={4}
          value={value.notes}
          placeholder={t('notesPlaceholder')}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
