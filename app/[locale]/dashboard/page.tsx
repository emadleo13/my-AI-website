import { setRequestLocale, getTranslations } from 'next-intl/server';
import { MessageSquare, CalendarPlus } from 'lucide-react';
import { Link } from '@/lib/i18n-routing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DemoBanner } from '@/components/DemoBanner';
import { NotSignedIn } from '@/components/dashboard/NotSignedIn';
import { BookingsList, type BookingRow } from '@/components/dashboard/BookingsList';
import { ServiceRequestsList, type ServiceRequestRow } from '@/components/dashboard/ServiceRequestsList';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { getSupabaseServer } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dashboard' });
  return { title: t('title') };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('dashboard');
  const tDemo = await getTranslations('demo');
  const tActions = await getTranslations('dashboard.actions');

  // Demo mode — Supabase not configured.
  if (!isSupabaseConfigured) {
    return (
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <DemoBanner message={tDemo('supabase')} />
          <NotSignedIn />
        </div>
      </div>
    );
  }

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!user || !supabase) {
    return (
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <NotSignedIn />
        </div>
      </div>
    );
  }

  // Profile + bookings + service requests in parallel.
  const today = new Date().toISOString().slice(0, 10);
  const [{ data: profileRow }, { data: upcomingRows }, { data: pastRows }, { data: serviceRequestRows }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, phone, notes, avatar_url')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('bookings')
        .select('id, service_type, booking_date, booking_time, status, notes')
        .eq('user_id', user.id)
        .gte('booking_date', today)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true }),
      supabase
        .from('bookings')
        .select('id, service_type, booking_date, booking_time, status, notes')
        .eq('user_id', user.id)
        .lt('booking_date', today)
        .order('booking_date', { ascending: false })
        .limit(20),
      supabase
        .from('service_requests')
        .select('id, service_type, status, is_automated, amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

  const profile = {
    full_name: profileRow?.full_name ?? '',
    phone: profileRow?.phone ?? '',
    notes: profileRow?.notes ?? '',
    avatar_url: (profileRow?.avatar_url as string | null) ?? null,
  };

  const greetName = profile.full_name || user.email?.split('@')[0] || '';

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('title')}
            </p>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">
              {greetName ? t('greet', { name: greetName }) : t('guestGreet')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/consultant">
                <MessageSquare className="h-3.5 w-3.5" />
                {tActions('openChat')}
              </Link>
            </Button>
            <Button asChild variant="accent" size="sm" className="gap-1.5">
              <Link href="/booking">
                <CalendarPlus className="h-3.5 w-3.5" />
                {tActions('newBooking')}
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-3">
                {t('upcoming.title')}
              </h2>
              <BookingsList
                bookings={(upcomingRows ?? []) as BookingRow[]}
                variant="upcoming"
              />
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-3">{t('past.title')}</h2>
              <BookingsList
                bookings={(pastRows ?? []) as BookingRow[]}
                variant="past"
              />
            </section>
            {(serviceRequestRows ?? []).length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">{t('services.title')}</h2>
                <ServiceRequestsList
                  requests={(serviceRequestRows ?? []) as ServiceRequestRow[]}
                  emptyMessage={t('services.empty')}
                />
              </section>
            )}
          </div>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileForm userId={user.id} initial={profile} />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
