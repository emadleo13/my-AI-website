'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { signInSchema, type SignInInput } from '@/lib/validators';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { Link, useRouter } from '@/lib/i18n-routing';
import { stripLocalePrefix } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignInForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  const onSubmit = async (data: SignInInput) => {
    const supa = getSupabaseBrowser();
    if (!supa) {
      toast.error(t('errors.demo'));
      return;
    }
    const { error } = await supa.auth.signInWithPassword(data);
    if (error) {
      toast.error(error.message || t('errors.invalid'));
      return;
    }
    toast.success(t('success.signedIn'));
    router.push(stripLocalePrefix(next) ?? '/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signin-email">{t('fields.email')}</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">{t('fields.password')}</Label>
          <Link
            href="/auth/reset-password"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t('signin.forgot')}
          </Link>
        </div>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('signin.submitting') : t('signin.submit')}
      </Button>
    </form>
  );
}
