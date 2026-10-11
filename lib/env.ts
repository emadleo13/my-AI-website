/**
 * Read once and report what's configured. The site is intentionally tolerant
 * of missing keys (demo mode) so the UI can be previewed before provisioning.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  // OpenRouter (OpenAI-compatible). The chat tries free models first and falls
  // back to one cheap paid model, so it keeps answering when the free tier is
  // rate-limited. Free models come and go — override the list without a code
  // change via OPENROUTER_FREE_MODELS (comma-separated). OPENROUTER_MODEL, if
  // set, is tried first. OPENROUTER_PAID_MODEL='' disables the paid fallback.
  openrouterKey: process.env.OPENROUTER_API_KEY ?? '',
  openrouterModel: process.env.OPENROUTER_MODEL ?? '',
  openrouterFreeModels: (
    process.env.OPENROUTER_FREE_MODELS ??
    'google/gemma-4-31b-it:free,nvidia/nemotron-3-super-120b-a12b:free,google/gemma-4-26b-a4b-it:free'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  openrouterPaidModel: process.env.OPENROUTER_PAID_MODEL ?? 'anthropic/claude-haiku-5.5',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
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
export const isOpenRouterConfigured = Boolean(env.openrouterKey);
export const isAdminConfigured =
  isSupabaseConfigured &&
  Boolean(env.supabaseServiceKey) &&
  env.adminEmails.length > 0;
export const isStripeConfigured = Boolean(env.stripeSecretKey) && Boolean(env.stripePublishableKey);

/** Public flags safe to read in client components. */
export const publicFlags = {
  supabase: isSupabaseConfigured,
  stripe: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
};
