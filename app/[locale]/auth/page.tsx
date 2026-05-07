import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AuthTabs } from './AuthTabs';
import { DemoBanner } from '@/components/DemoBanner';
import { isSupabaseConfigured } from '@/lib/env';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('signIn') };
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tDemo = await getTranslations('demo');

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-md">
        {!isSupabaseConfigured && <DemoBanner message={tDemo('supabase')} />}
        <AuthTabs />
      </div>
    </div>
  );
}
