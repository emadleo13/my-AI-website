import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Send, CalendarClock, MessageCircle } from 'lucide-react';
import { DiscoveryForm } from '@/components/forms/DiscoveryForm';
import { ChatBotV2 } from '@/components/chat/ChatBotV2';
import { DemoBanner } from '@/components/DemoBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/env';

const APPOINTMENT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL ??
  'https://calendar.app.google/DZ7mqpaqh99pordF8';

const TELEGRAM_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? '@your_handle';

// Only Google Calendar's full appointment-schedule URL (with ?gv=true) can be
// embedded in an iframe. Share links (calendar.app.google/…) send
// X-Frame-Options: DENY and render as a broken-document icon, so for those we
// show a prominent "open in new tab" card instead.
const isEmbeddableSchedule =
  /calendar\.google\.com\/calendar\/appointments\/schedules\//.test(APPOINTMENT_URL);

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

  const telegramHandle = TELEGRAM_USERNAME.replace(/^@/, '');

  return (
    <div className="container py-16 md:py-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight"><span className="text-gradient">{t('title')}</span></h1>
        <p className="mt-3 text-muted-foreground text-lg">{t('subtitle')}</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        {/* Lead form */}
        <div>
          {!isSupabaseConfigured && <DemoBanner message={tDemo('supabase')} />}
          <Suspense fallback={null}>
            <DiscoveryForm />
          </Suspense>
        </div>

        {/* Scheduling */}
        <aside id="schedule" className="space-y-4">
          <Card className="border-primary/30">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-semibold leading-tight">{t('schedule.title')}</h2>
                  <p className="text-xs text-muted-foreground">{t('schedule.subtitle')}</p>
                </div>
              </div>

              {isEmbeddableSchedule ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <iframe
                    title="Schedule a call"
                    src={APPOINTMENT_URL}
                    className="w-full h-[480px]"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                  <CalendarClock className="mx-auto h-8 w-8 text-primary" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t('schedule.embedFallback')}
                  </p>
                </div>
              )}

              <Button asChild variant={isEmbeddableSchedule ? 'outline' : 'accent'} className="w-full gap-2">
                <a href={APPOINTMENT_URL} target="_blank" rel="noreferrer">
                  <Send className="h-4 w-4 rtl:rotate-180" />
                  {t('schedule.openCalendar')}
                </a>
              </Button>

              <p className="text-sm text-muted-foreground">
                {t('telegram.hint')}{' '}
                <a
                  href={`https://t.me/${telegramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {TELEGRAM_USERNAME}
                </a>
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* Inline chatbot */}
      <div className="mt-16 max-w-3xl">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold leading-tight">{t('chat.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('chat.subtitle')}</p>
          </div>
        </div>
        <ChatBotV2 />
      </div>
    </div>
  );
}
