import { setRequestLocale } from 'next-intl/server';

export const metadata = {
  title: 'Privacy Policy — emadai.dev',
  robots: { index: true, follow: true },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const updated = '22 May 2026';

  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updated}</p>

        <h2>1. Who we are</h2>
        <p>
          This website is operated by <strong>Emad Leodari</strong>, an independent AI consultant
          and software developer based in Baia Mare, Maramureș, Romania (<strong>emadai.dev</strong>).
          Contact: <a href="mailto:hamidleo1984@gmail.com">hamidleo1984@gmail.com</a>
        </p>

        <h2>2. What data we collect</h2>
        <ul>
          <li><strong>Account data:</strong> email address and full name when you register.</li>
          <li><strong>Profile data:</strong> phone number and notes you optionally provide.</li>
          <li><strong>Service requests:</strong> details you submit when requesting a service (business name, travel preferences, etc.).</li>
          <li><strong>Booking data:</strong> date, time, service type, and payment reference.</li>
          <li><strong>Contact messages:</strong> name, email, subject, and message content.</li>
          <li><strong>Technical data:</strong> IP address (for rate limiting only, not stored long-term), browser type via standard server logs.</li>
        </ul>

        <h2>3. Why we collect it (legal basis)</h2>
        <ul>
          <li><strong>Contract performance (Art. 6(1)(b) GDPR):</strong> to deliver the services you request and manage your bookings.</li>
          <li><strong>Legitimate interest (Art. 6(1)(f) GDPR):</strong> to protect our platform against abuse (rate limiting, security).</li>
          <li><strong>Consent (Art. 6(1)(a) GDPR):</strong> to send you service notifications and updates (you can withdraw at any time).</li>
        </ul>

        <h2>4. Who we share data with</h2>
        <ul>
          <li><strong>Supabase</strong> (database & authentication) — EU region, GDPR-compliant.</li>
          <li><strong>Stripe</strong> (payment processing) — your card details go directly to Stripe; we never see or store them.</li>
          <li><strong>Resend</strong> (transactional email) — used to send booking confirmations.</li>
          <li><strong>Anthropic</strong> (AI processing) — your service request content is sent to Claude to generate outputs. Anthropic does not train on API data.</li>
          <li><strong>Google</strong> (internal tracking only) — service request summaries are logged in a private Google Sheet accessible only to the site owner.</li>
        </ul>
        <p>We do not sell your data to third parties.</p>

        <h2>5. How long we keep your data</h2>
        <ul>
          <li>Account and profile data: until you delete your account.</li>
          <li>Booking records: 3 years (accounting obligation).</li>
          <li>Contact messages: 1 year.</li>
          <li>Service request outputs: until you request deletion.</li>
        </ul>

        <h2>6. Your rights (GDPR)</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you.</li>
          <li><strong>Correct</strong> inaccurate data.</li>
          <li><strong>Erase</strong> your data ("right to be forgotten").</li>
          <li><strong>Restrict</strong> processing.</li>
          <li><strong>Data portability</strong> — receive your data in a machine-readable format.</li>
          <li><strong>Object</strong> to processing based on legitimate interest.</li>
          <li><strong>Withdraw consent</strong> at any time without affecting prior processing.</li>
        </ul>
        <p>
          To exercise any right, email <a href="mailto:hamidleo1984@gmail.com">hamidleo1984@gmail.com</a>.
          We will respond within 30 days. You also have the right to lodge a complaint with
          the Romanian data protection authority (ANSPDCP) at <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">dataprotection.ro</a>.
        </p>

        <h2>7. Cookies</h2>
        <p>
          We use only essential cookies required for authentication (Supabase session) and
          security. No advertising or tracking cookies are set.
        </p>

        <h2>8. Security</h2>
        <p>
          Data is transmitted over HTTPS. Passwords are hashed by Supabase (bcrypt).
          Payment data is handled exclusively by Stripe and never touches our servers.
          We apply Content Security Policy, HSTS, and rate limiting to protect the platform.
        </p>

        <h2>9. Changes to this policy</h2>
        <p>
          We may update this policy. The "last updated" date at the top will reflect any changes.
          Continued use of the service after changes constitutes acceptance.
        </p>
      </div>
    </div>
  );
}
