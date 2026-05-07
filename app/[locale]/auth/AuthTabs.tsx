'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { SignInForm } from '@/components/forms/SignInForm';
import { SignUpForm } from '@/components/forms/SignUpForm';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function AuthTabs() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const params = useSearchParams();
  const next = params.get('next');

  const handleGoogle = async () => {
    const supa = getSupabaseBrowser();
    if (!supa) {
      toast.error(t('errors.demo'));
      return;
    }
    const callback = new URL(`/${locale}/auth/callback`, window.location.origin);
    if (next) callback.searchParams.set('next', next);
    const { error } = await supa.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callback.toString() },
    });
    if (error) toast.error(error.message);
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">{t('signIn')}</TabsTrigger>
        <TabsTrigger value="signup">{t('signUp')}</TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>{t('signin.title')}</CardTitle>
            <CardDescription>{t('signin.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignInForm />
            <Separator label={t('or')} />
            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              <GoogleIcon />
              {t('google')}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>{t('signup.title')}</CardTitle>
            <CardDescription>{t('signup.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignUpForm />
            <Separator label={t('or')} />
            <Button variant="outline" className="w-full" onClick={handleGoogle}>
              <GoogleIcon />
              {t('google')}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Separator({ label }: { label: string }) {
  return (
    <div className="relative my-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-card px-2 text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.7h5.2c-.2 1.4-1.6 4.1-5.2 4.1-3.1 0-5.7-2.6-5.7-5.8s2.6-5.8 5.7-5.8c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.8 14.6 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c6.9 0 9.4-4.8 9.4-7.4 0-.5-.1-.9-.1-1.3L12 10.2z"
      />
    </svg>
  );
}
