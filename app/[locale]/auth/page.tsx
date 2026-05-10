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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#060818] to-[#0d1023] px-4 py-8">
      {!isSupabaseConfigured && (
        <div className="w-full max-w-4xl mb-4">
          <DemoBanner message={tDemo('supabase')} />
        </div>
      )}
      <div className="w-full max-w-4xl">
        <AuthTabs />
      </div>
    </div>
  );
}
