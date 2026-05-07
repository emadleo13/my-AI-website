'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { signUpSchema, type SignUpInput } from '@/lib/validators';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignUpForm() {
  const t = useTranslations('auth');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  const onSubmit = async (data: SignUpInput) => {
    const supa = getSupabaseBrowser();
    if (!supa) {
      toast.error(t('errors.demo'));
      return;
    }
    const { error } = await supa.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
    if (error) {
      toast.error(error.message || t('errors.generic'));
      return;
    }
    toast.success(t('success.signedUp'));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">{t('fields.fullName')}</Label>
        <Input
          id="signup-name"
          autoComplete="name"
          {...register('fullName')}
          aria-invalid={!!errors.fullName}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">{t('fields.email')}</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">{t('fields.password')}</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{t('errors.passwordMin')}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-confirm">{t('fields.confirmPassword')}</Label>
        <Input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{t('errors.passwordMatch')}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('signup.submitting') : t('signup.submit')}
      </Button>
    </form>
  );
}
