'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSupabaseServer } from './supabase/server';
import { getSupabaseAdmin } from './supabase/admin';
import { getAdminUser } from './auth';

const profileSchema = z.object({
  full_name: z.string().min(0).max(120),
  phone: z.string().max(40).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export async function updateProfileAction(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: 'demo' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'not_authenticated' };

  const parsed = profileSchema.safeParse({
    full_name: formData.get('full_name') ?? '',
    phone: formData.get('phone') ?? '',
    notes: formData.get('notes') ?? '',
  });

  if (!parsed.success) return { error: 'invalid' };

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: parsed.data.full_name,
    phone: parsed.data.phone || null,
    notes: parsed.data.notes || null,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath('/[locale]/dashboard', 'page');
  return { ok: true };
}

export async function signOutAction(locale: string) {
  const supabase = await getSupabaseServer();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect(`/${locale}`);
}

const cancelBookingSchema = z.object({ id: z.string().uuid() });

export async function cancelBookingAction(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  if (!supabase) return { error: 'demo' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'unauthenticated' };

  const parsed = cancelBookingSchema.safeParse({ id: formData.get('id') });
  if (!parsed.success) return { error: 'invalid' };

  // RLS already enforces the user_id match, but we add it explicitly for
  // defense in depth.
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', parsed.data.id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/dashboard', 'page');
  return { ok: true };
}

const bookingStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

export async function updateBookingStatusAction(
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const admin = await getAdminUser();
  if (!admin) return { error: 'forbidden' };

  const parsed = bookingStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  });
  if (!parsed.success) return { error: 'invalid' };

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: 'demo' };

  const { error } = await supabase
    .from('bookings')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/admin', 'page');
  return { ok: true };
}
