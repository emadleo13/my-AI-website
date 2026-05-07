import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ResetPasswordCard } from './ResetPasswordCard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.reset' });
  return { title: t('title') };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <ResetPasswordCard />
      </div>
    </div>
  );
}
