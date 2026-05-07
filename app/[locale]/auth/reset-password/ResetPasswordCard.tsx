'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseBrowser } from '@/lib/supabase/client';

export function ResetPasswordCard() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const supa = getSupabaseBrowser();
    if (!supa) {
      toast.error(t('errors.demo'));
      return;
    }
    setBusy(true);
    try {
      const { error } = await supa.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/auth`,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reset.title')}</CardTitle>
        <CardDescription>{t('reset.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm flex items-start gap-3">
            <Mail className="h-4 w-4 mt-0.5 text-primary" />
            <p>{t('reset.sent')}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">{t('reset.email')}</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy || !email}>
              {busy ? t('reset.submitting') : t('reset.submit')}
            </Button>
          </form>
        )}

        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/auth">
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {t('reset.backToSignIn')}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
