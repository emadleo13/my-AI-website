'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { updateProfileAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvatarUpload } from './AvatarUpload';

interface Props {
  userId: string;
  initial: {
    full_name: string;
    phone: string;
    notes: string;
    avatar_url: string | null;
  };
}

export function ProfileForm({ userId, initial }: Props) {
  const t = useTranslations('dashboard.profile');
  const [state, action, pending] = useActionState(updateProfileAction, null);
  const lastShown = React.useRef<typeof state>(null);

  React.useEffect(() => {
    if (state === lastShown.current) return;
    lastShown.current = state;
    if (state?.ok) toast.success(t('saved'));
    else if (state?.error && state.error !== 'demo') toast.error(t('saveFailed'));
  }, [state, t]);

  return (
    <div className="space-y-6">
      <AvatarUpload userId={userId} initialUrl={initial.avatar_url} />
      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="p-name">{t('fullName')}</Label>
          <Input id="p-name" name="full_name" defaultValue={initial.full_name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-phone">{t('phone')}</Label>
          <Input id="p-phone" name="phone" defaultValue={initial.phone} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-notes">{t('notes')}</Label>
          <Textarea
            id="p-notes"
            name="notes"
            rows={3}
            defaultValue={initial.notes}
          />
        </div>
        <Button type="submit" disabled={pending} className="gap-2">
          <Save className="h-4 w-4" />
          {pending ? t('saving') : t('save')}
        </Button>
      </form>
    </div>
  );
}
