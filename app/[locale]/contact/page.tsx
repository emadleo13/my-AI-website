import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Mail, Linkedin, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { DemoBanner } from '@/components/DemoBanner';
import { Card, CardContent } from '@/components/ui/card';
import { isSupabaseConfigured } from '@/lib/env';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: t('title') };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const tDemo = await getTranslations('demo');

  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-3 text-muted-foreground text-lg">{t('subtitle')}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {!isSupabaseConfigured && <DemoBanner message={tDemo('supabase')} />}
          <ContactForm />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4 text-sm">
              <InfoRow icon={<Mail className="h-4 w-4" />} label={t('info.email')}>
                <a className="hover:text-foreground" href="mailto:hello@example.com">
                  hello@example.com
                </a>
              </InfoRow>
              <InfoRow
                icon={<Linkedin className="h-4 w-4" />}
                label={t('info.linkedin')}
              >
                <a
                  className="hover:text-foreground"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  linkedin.com/in/emad
                </a>
              </InfoRow>
              <InfoRow
                icon={<MapPin className="h-4 w-4" />}
                label={t('info.location')}
              >
                {t('info.locationValue')}
              </InfoRow>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              title="Cluj-Napoca map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=23.5%2C46.7%2C23.7%2C46.8&amp;layer=mapnik"
              className="w-full h-64"
              loading="lazy"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary mt-0.5">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-foreground">{children}</p>
      </div>
    </div>
  );
}
