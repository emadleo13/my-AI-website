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
import {
  AdminDiscovery,
  type AdminDiscoveryRow,
} from '@/components/admin/AdminDiscovery';
import {
  AdminDocuments,
  type DocumentRow,
} from '@/components/admin/AdminDocuments';
import {
  AdminServiceRequests,
  type AdminServiceRequestRow,
} from '@/components/admin/AdminServiceRequests';
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

  const [
    { data: bookingsData },
    { data: contactsData },
    { data: discoveryData },
    { data: documentsData },
    { data: serviceRequestsData },
  ] = await Promise.all([
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
    supabase
      .from('discovery_requests')
      .select(
        'id, full_name, email, company, website, industry, business_description, service_type, project_goal, target_audience, platform, current_tools, integrations, has_content, language, tone, timeline, budget, maintenance, extra_notes, locale, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('documents')
      .select('id, title, source_type, char_count, chunk_count, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('service_requests')
      .select('id, user_id, service_type, status, is_automated, amount, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const bookings = (bookingsData ?? []) as AdminBookingRow[];
  const contacts = (contactsData ?? []) as AdminContactRow[];
  const discovery = (discoveryData ?? []) as AdminDiscoveryRow[];
  const documents = (documentsData ?? []) as DocumentRow[];
  const serviceRequests = (serviceRequestsData ?? []) as AdminServiceRequestRow[];

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
            <TabsTrigger value="discovery">
              {t('tabs.discovery')}{' '}
              <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {discovery.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="documents">
              {t('tabs.documents')}{' '}
              <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {documents.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="services">
              {t('tabs.services')}{' '}
              <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                {serviceRequests.length}
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="mt-6">
            <AdminBookings rows={bookings} />
          </TabsContent>
          <TabsContent value="contacts" className="mt-6">
            <AdminContacts rows={contacts} />
          </TabsContent>
          <TabsContent value="discovery" className="mt-6">
            <AdminDiscovery rows={discovery} />
          </TabsContent>
          <TabsContent value="documents" className="mt-6">
            <AdminDocuments initialDocuments={documents} />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <AdminServiceRequests rows={serviceRequests} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
