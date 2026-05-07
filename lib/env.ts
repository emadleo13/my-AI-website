/**
 * Read once and report what's configured. The site is intentionally tolerant
 * of missing keys (demo mode) so the UI can be previewed before provisioning.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
};

/** Strict: a real http(s) URL, not a placeholder like `your_supabase_url`. */
function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  isValidHttpUrl(env.supabaseUrl) && Boolean(env.supabaseAnonKey);
export const isAnthropicConfigured = Boolean(env.anthropicKey);
export const isAdminConfigured =
  isSupabaseConfigured &&
  Boolean(env.supabaseServiceKey) &&
  env.adminEmails.length > 0;

/** Public flags safe to read in client components. */
export const publicFlags = {
  supabase: isSupabaseConfigured,
};
