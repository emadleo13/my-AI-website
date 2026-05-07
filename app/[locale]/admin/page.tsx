import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DemoBanner } from '@/components/DemoBanner';
import { NotAdmin } from '@/components/admin/NotAdmin';
import {
  AdminBookings,
  type AdminBookingRow,
} from '@/components/admin/AdminBookings';
import {
  AdminContacts,
  type AdminContactRow,
} from '@/components/admin/AdminContacts';
import { LogoutButton } from '@/components/dashboard/LogoutButton';
import { getAdminUser } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isAdminConfigured } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  if (!isAdminConfigured) {
    return (
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <DemoBanner message={t('demo')} />
          <NotAdmin />
        </div>
      </div>
    );
  }

  const admin = await getAdminUser();
  if (!admin) {
    return (
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <NotAdmin />
        </div>
      </div>
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <NotAdmin />
        </div>
      </div>
    );
  }

  const [{ data: bookingsData }, { data: contactsData }] = await Promise.all([
    supabase
      .from('bookings')
      .select(
        'id, service_type, booking_date, booking_time, status, notes, guest_name, guest_email, user_id, created_at',
      )
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false })
      .limit(100),
    supabase
      .from('contacts')
      .select('id, name, email, subject, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const bookings = (bookingsData ?? []) as AdminBookingRow[];
  const contacts = (contactsData ?? []) as AdminContactRow[];

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('title')}
            </p>
            <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">
              {t('subtitle')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {admin.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <Tabs defaultValue="bookings">
          <TabsList>
            <TabsTrigger value="bookings">
              {t('tabs.bookings')}{' '}
              <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {bookings.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="contacts">
              {t('tabs.contacts')}{' '}
              <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {contacts.length}
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-6">
            <AdminBookings rows={bookings} />
          </TabsContent>
          <TabsContent value="contacts" className="mt-6">
            <AdminContacts rows={contacts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
