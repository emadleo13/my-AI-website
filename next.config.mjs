import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from '@ducanh2912/next-pwa';

const withNextIntl = createNextIntlPlugin('./lib/i18n.ts');
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://emadai.dev';

const securityHeaders = [
  // Prevent clickjacking (SAMEORIGIN allows our own presentation iframe)
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features not needed
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
  // Force HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // XSS protection (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Scripts: self + Next.js inline + Stripe
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.network https://www.google-analytics.com",
      // Styles: self + inline (Tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Images: self + data URIs + external hosts used by the app
      "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://picsum.photos https://fastly.picsum.photos https://placehold.co https://images.unsplash.com https://lh3.googleusercontent.com",
      // Connections: self + Supabase + Stripe + Anthropic
      `connect-src 'self' ${SITE_URL} https://*.supabase.co https://api.stripe.com https://m.stripe.com https://m.stripe.network https://q.stripe.com https://api.anthropic.com wss://*.supabase.co`,
      // Frames: self (presentation) + Stripe + OpenStreetMap (contact map) + Google Calendar appointment embed
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://m.stripe.com https://m.stripe.network https://www.openstreetmap.org https://calendar.google.com",
      // No plugins
      "object-src 'none'",
      // Base URI restricted
      "base-uri 'self'",
      // Form actions
      "form-action 'self'",
      // Upgrade insecure requests
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default withPWA(withNextIntl(nextConfig));
