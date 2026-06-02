import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Emad <onboarding@resend.dev>';
const EMAIL_TO_ADMIN = process.env.EMAIL_TO_ADMIN ?? '';

export const isEmailConfigured = Boolean(RESEND_API_KEY) && Boolean(EMAIL_TO_ADMIN);

const client = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(title: string, content: string): string {
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,sans-serif;background:#0F172A;color:#F8FAFC;padding:24px;margin:0">
  <div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid #1F2937;border-radius:12px;overflow:hidden">
    <div style="padding:20px 24px;background:linear-gradient(135deg,#1E3A8A,#B45309);color:#F8FAFC;font-weight:700;font-size:18px">${escape(title)}</div>
    <div style="padding:24px;line-height:1.55;font-size:15px">${content}</div>
    <div style="padding:14px 24px;border-top:1px solid #1F2937;font-size:12px;color:#9CA3AF">Sent from emad.dev portfolio</div>
  </div>
</body></html>`;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(payload: ContactPayload): Promise<void> {
  if (!client || !EMAIL_TO_ADMIN) return;
  const html = shell(
    `New contact: ${payload.subject}`,
    `<p><strong>From:</strong> ${escape(payload.name)} &lt;${escape(payload.email)}&gt;</p>
     <p><strong>Subject:</strong> ${escape(payload.subject)}</p>
     <p><strong>Message:</strong></p>
     <p style="white-space:pre-wrap;background:#0B1220;padding:12px;border-radius:8px">${escape(payload.message)}</p>`,
  );
  try {
    await client.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO_ADMIN,
      replyTo: payload.email,
      subject: `[contact] ${payload.subject} — ${payload.name}`,
      html,
    });
  } catch (err) {
    console.error('[email] sendContactNotification failed', err);
  }
}

export async function sendOwnerSignupAlert(email: string): Promise<void> {
  if (!client || !EMAIL_TO_ADMIN) return;
  const html = shell(
    'New user signed up',
    `<p>A new user registered on emadai.dev:</p>
     <p><strong>Email:</strong> ${escape(email)}</p>
     <p><strong>Time:</strong> ${new Date().toISOString()}</p>`,
  );
  try {
    await client.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO_ADMIN,
      subject: `[signup] New user: ${email}`,
      html,
    });
  } catch (err) {
    console.error('[email] sendOwnerSignupAlert failed', err);
  }
}

export async function sendServiceRequestAlert(
  userEmail: string,
  serviceType: string,
): Promise<void> {
  if (!client || !EMAIL_TO_ADMIN) return;
  const html = shell(
    `New service request: ${serviceType}`,
    `<p><strong>User:</strong> ${escape(userEmail)}</p>
     <p><strong>Service:</strong> ${escape(serviceType)}</p>
     <p><strong>Time:</strong> ${new Date().toISOString()}</p>
     <p>Check the <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/en/admin" style="color:#60A5FA">admin panel</a> to manage this request.</p>`,
  );
  try {
    await client.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO_ADMIN,
      replyTo: userEmail,
      subject: `[marketplace] ${serviceType} — ${userEmail}`,
      html,
    });
  } catch (err) {
    console.error('[email] sendServiceRequestAlert failed', err);
  }
}

const SCOPE_LABELS: Record<string, string> = {
  free:    'Free Discovery Call',
  session: 'Single Session',
  mini:    'Mini Project',
  full:    'Full Project',
};

const CHANNEL_LABELS: Record<string, string> = {
  'telegram': 'Telegram',
  'google-meet': 'Google Meet',
};

const APPOINTMENT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APPOINTMENT_URL ??
  'https://calendar.app.google/DZ7mqpaqh99pordF8';

const TELEGRAM_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? '@your_handle';
const TELEGRAM_URL = `https://t.me/${TELEGRAM_USERNAME.replace(/^@/, '')}`;

export interface DiscoveryPayload {
  name: string;
  email: string;
  company?: string;
  channel: string;
  service?: string;
  message: string;
}

/**
 * Sends the client a welcome / next-steps email and notifies the owner of a new
 * discovery-call request. Best-effort: silently no-ops when Resend isn't set.
 */
export async function sendDiscoveryEmails(payload: DiscoveryPayload): Promise<void> {
  if (!client) {
    console.warn('[email] sendDiscoveryEmails skipped — RESEND_API_KEY not set');
    return;
  }

  const channelLabel = CHANNEL_LABELS[payload.channel] ?? payload.channel;
  const detailRows = `
    ${payload.company ? `<p><strong>Company:</strong> ${escape(payload.company)}</p>` : ''}
    ${payload.service ? `<p><strong>Service:</strong> ${escape(payload.service)}</p>` : ''}
    <p><strong>Preferred channel:</strong> ${escape(channelLabel)}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;background:#0B1220;padding:12px;border-radius:8px">${escape(payload.message)}</p>
  `;

  // The call-to-action depends on the channel the client chose:
  //  - Telegram   → open a direct chat with me on Telegram.
  //  - Google Meet → open my Google Calendar to pick a day/time (Google then
  //                  notifies me and adds the event + Meet link to my calendar).
  const isTelegram = payload.channel === 'telegram';
  const ctaUrl = isTelegram ? TELEGRAM_URL : APPOINTMENT_URL;
  const ctaLabel = isTelegram ? 'Chat with me on Telegram' : 'Pick a time';
  const ctaIntro = isTelegram
    ? `The last step is to message me on <strong>Telegram</strong> so we can arrange your call. Tap the button below to open a chat with me.`
    : `The last step is to pick a time that suits you — I'll meet you on <strong>Google Meet</strong>.`;

  // Welcome / next-steps to the client.
  const userHtml = shell(
    'Your free discovery call',
    `<p>Hi ${escape(payload.name)},</p>
     <p>Thanks for reaching out! ${ctaIntro}</p>
     <p style="margin:18px 0">
       <a href="${ctaUrl}" style="background:#1E3A8A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${ctaLabel}</a>
     </p>
     <p style="font-size:13px;color:#9CA3AF">Or open this link: ${escape(ctaUrl)}</p>
     <p style="margin-top:18px"><strong>Your request</strong></p>
     ${detailRows}
     <p style="margin-top:20px">— Emad</p>`,
  );

  const adminHtml = EMAIL_TO_ADMIN
    ? shell(
        `New discovery request: ${payload.service || 'General'}`,
        `<p><strong>From:</strong> ${escape(payload.name)} &lt;${escape(payload.email)}&gt;</p>
         ${detailRows}`,
      )
    : null;

  // Send the client welcome email. Surface Resend's per-message error instead
  // of letting it vanish — a 403 here almost always means EMAIL_FROM is still
  // on the unverified onboarding@resend.dev sender (Resend then only delivers
  // to the account owner, so the real client never receives anything).
  try {
    const { error } = await client.emails.send({
      from: EMAIL_FROM,
      to: payload.email,
      replyTo: EMAIL_TO_ADMIN || undefined,
      subject: 'Your free discovery call — next step',
      html: userHtml,
    });
    if (error) {
      console.error('[email] client welcome email rejected by Resend:', error);
    }
  } catch (err) {
    console.error('[email] client welcome email failed', err);
  }

  // Notify the owner.
  if (adminHtml && EMAIL_TO_ADMIN) {
    try {
      const { error } = await client.emails.send({
        from: EMAIL_FROM,
        to: EMAIL_TO_ADMIN,
        replyTo: payload.email,
        subject: `[discovery] ${payload.service || 'General'} — ${payload.name}`,
        html: adminHtml,
      });
      if (error) {
        console.error('[email] admin notification rejected by Resend:', error);
      }
    } catch (err) {
      console.error('[email] admin notification failed', err);
    }
  }
}

// Human-readable labels for the discovery form's coded select values, so the
// notification email reads naturally instead of showing raw keys like "yes_ready".
const DISCOVERY_LABELS: Record<string, Record<string, string>> = {
  serviceType: {
    chatbot: 'AI Chatbot Development',
    workflow: 'Workflow Automation',
    both: 'Chatbot + Automation',
    consulting: 'AI Strategy Consulting',
  },
  targetAudience: {
    customers: 'End customers (B2C)',
    business: 'Other businesses (B2B)',
    internal: 'Internal team / employees',
    mixed: 'Mixed audience',
  },
  hasContent: {
    yes_ready: 'Yes — ready to share',
    yes_partial: 'Yes — needs organizing',
    no: 'No — create from scratch',
  },
  tone: {
    professional: 'Professional & Formal',
    friendly: 'Friendly & Conversational',
    technical: 'Technical & Precise',
    sales: 'Persuasive & Sales-oriented',
  },
  timeline: {
    asap: 'ASAP — within 2 weeks',
    '1month': 'Within 1 month',
    flexible: 'Flexible — quality over speed',
    discuss: "Let's discuss",
  },
  budget: {
    under500: 'Under €500',
    '500_1500': '€500 – €1,500',
    '1500_3000': '€1,500 – €3,000',
    over3000: '€3,000+',
    discuss: 'Prefer to discuss',
  },
  maintenance: {
    yes: 'Yes — monthly support plan',
    no: 'No — one-time project',
    maybe: 'Possibly — discuss',
  },
  platform: {
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    website: 'Website Widget',
    voice: 'Voice Assistant',
    instagram: 'Instagram / Social Media',
    other: 'Other',
  },
};

const discoveryLabel = (group: string, value?: string): string =>
  (value && DISCOVERY_LABELS[group]?.[value]) || value || '';

export interface DiscoveryRequestPayload {
  fullName: string;
  email: string;
  company?: string;
  website?: string;
  industry?: string;
  businessDescription?: string;
  serviceType: string;
  projectGoal: string;
  targetAudience?: string;
  platform?: string[];
  currentTools?: string;
  integrations?: string;
  hasContent?: string;
  language?: string;
  tone?: string;
  timeline?: string;
  budget?: string;
  maintenance?: string;
  extraNotes?: string;
}

/**
 * Notifies the owner of a new project-discovery submission and sends the client
 * a thank-you / next-steps email. Best-effort: silently no-ops without Resend.
 */
export async function sendDiscoveryRequestEmail(payload: DiscoveryRequestPayload): Promise<void> {
  if (!client) {
    console.warn('[email] sendDiscoveryRequestEmail skipped — RESEND_API_KEY not set');
    return;
  }

  const row = (label: string, value?: string) =>
    value ? `<p style="margin:6px 0"><strong>${escape(label)}:</strong> ${escape(value)}</p>` : '';
  const block = (label: string, value?: string) =>
    value
      ? `<p style="margin:12px 0 4px"><strong>${escape(label)}</strong></p>
         <p style="white-space:pre-wrap;background:#0B1220;padding:12px;border-radius:8px;margin:0">${escape(value)}</p>`
      : '';

  const platformList = (payload.platform ?? [])
    .map((p) => discoveryLabel('platform', p))
    .filter(Boolean)
    .join(', ');

  const details = `
    <p style="margin:12px 0 4px;color:#9CA3AF;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Business</p>
    ${row('Company', payload.company)}
    ${row('Website', payload.website)}
    ${row('Industry', payload.industry)}
    ${block('Business description', payload.businessDescription)}
    <p style="margin:18px 0 4px;color:#9CA3AF;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Project</p>
    ${row('Service', discoveryLabel('serviceType', payload.serviceType))}
    ${block('Main goal', payload.projectGoal)}
    ${row('Audience', discoveryLabel('targetAudience', payload.targetAudience))}
    <p style="margin:18px 0 4px;color:#9CA3AF;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Technical</p>
    ${row('Platforms', platformList)}
    ${row('Current tools', payload.currentTools)}
    ${row('Integrations', payload.integrations)}
    ${row('Existing content', discoveryLabel('hasContent', payload.hasContent))}
    ${row('Bot language(s)', payload.language)}
    ${row('Tone', discoveryLabel('tone', payload.tone))}
    <p style="margin:18px 0 4px;color:#9CA3AF;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Timeline & budget</p>
    ${row('Timeline', discoveryLabel('timeline', payload.timeline))}
    ${row('Budget', discoveryLabel('budget', payload.budget))}
    ${row('Maintenance', discoveryLabel('maintenance', payload.maintenance))}
    ${block('Additional notes', payload.extraNotes)}
  `;

  const serviceLabel = discoveryLabel('serviceType', payload.serviceType);

  // Notify the owner with the full submission.
  if (EMAIL_TO_ADMIN) {
    const adminHtml = shell(
      `New project discovery: ${serviceLabel}`,
      `<p><strong>From:</strong> ${escape(payload.fullName)} &lt;${escape(payload.email)}&gt;</p>${details}`,
    );
    try {
      const { error } = await client.emails.send({
        from: EMAIL_FROM,
        to: EMAIL_TO_ADMIN,
        replyTo: payload.email,
        subject: `[discovery] ${serviceLabel} — ${payload.fullName}`,
        html: adminHtml,
      });
      if (error) console.error('[email] discovery admin notification rejected by Resend:', error);
    } catch (err) {
      console.error('[email] discovery admin notification failed', err);
    }
  }

  // Thank-you to the client. The discovery form has no channel field, so we
  // point them at both the calendar and Telegram and let them choose.
  const userHtml = shell(
    'Thanks — I received your project details',
    `<p>Hi ${escape(payload.fullName)},</p>
     <p>Thank you for sharing the details of your project. I'll review everything and get back to you shortly with the next steps.</p>
     <p>In the meantime, you can book a free discovery call directly:</p>
     <p style="margin:18px 0">
       <a href="${APPOINTMENT_URL}" style="background:#1E3A8A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Pick a time</a>
     </p>
     <p style="font-size:13px;color:#9CA3AF">Or message me on Telegram: ${escape(TELEGRAM_URL)}</p>
     <p style="margin-top:18px"><strong>A copy of what you submitted</strong></p>
     ${details}
     <p style="margin-top:20px">— Emad</p>`,
  );
  try {
    const { error } = await client.emails.send({
      from: EMAIL_FROM,
      to: payload.email,
      replyTo: EMAIL_TO_ADMIN || undefined,
      subject: 'Thanks — I received your project details',
      html: userHtml,
    });
    if (error) console.error('[email] discovery client email rejected by Resend:', error);
  } catch (err) {
    console.error('[email] discovery client email failed', err);
  }
}

export interface BookingPayload {
  serviceType: string;
  serviceLabel: string;
  date: string;
  time: string;
  guestName: string;
  guestEmail: string;
  phone?: string;
  notes?: string;
  scope?: string;
  socialPlatform?: string;
  socialContact?: string;
}

export async function sendBookingEmails(payload: BookingPayload): Promise<void> {
  if (!client) {
    console.warn('[email] sendBookingEmails skipped — RESEND_API_KEY not set');
    return;
  }
  if (!EMAIL_TO_ADMIN) {
    console.warn('[email] sendBookingEmails — EMAIL_TO_ADMIN not set, admin copy will be skipped');
  }

  const scopeLabel = payload.scope ? (SCOPE_LABELS[payload.scope] ?? payload.scope) : null;
  const isFree = payload.scope === 'free';

  const detailRows = `
    <p><strong>Service:</strong> ${escape(payload.serviceLabel)}</p>
    <p><strong>Date:</strong> ${escape(payload.date)} at ${escape(payload.time)} (Europe/Bucharest)</p>
    ${scopeLabel ? `<p><strong>Engagement type:</strong> ${escape(scopeLabel)}</p>` : ''}
    ${isFree && payload.socialPlatform ? `<p><strong>Contact via:</strong> ${escape(payload.socialPlatform)} — ${escape(payload.socialContact ?? '')}</p>` : ''}
    ${payload.phone ? `<p><strong>Phone:</strong> ${escape(payload.phone)}</p>` : ''}
    ${payload.notes ? `<p><strong>Notes:</strong></p><p style="white-space:pre-wrap;background:#0B1220;padding:12px;border-radius:8px">${escape(payload.notes)}</p>` : ''}
  `;

  const userFollowUp = isFree
    ? `I'll reach out to you via ${escape(payload.socialPlatform ?? 'your preferred platform')} to confirm the call.`
    : `I'll review your request and send you a custom quote by email within 1–2 business days.`;

  // Confirmation to the booker.
  const userHtml = shell(
    isFree ? `Your free consultation is reserved` : `Your booking request is received`,
    `<p>Hi ${escape(payload.guestName)},</p>
     <p>Thanks for booking — ${userFollowUp}</p>
     ${detailRows}
     <p style="margin-top:20px">— Emad</p>`,
  );

  const adminSubject = isFree
    ? `[free call] ${payload.serviceLabel} — ${payload.date} ${payload.time}`
    : `[quote needed] ${payload.serviceLabel} / ${scopeLabel ?? ''} — ${payload.date} ${payload.time}`;

  const adminHtml = EMAIL_TO_ADMIN
    ? shell(
        `New booking: ${payload.serviceLabel} (${scopeLabel ?? 'n/a'})`,
        `<p><strong>From:</strong> ${escape(payload.guestName)} &lt;${escape(payload.guestEmail)}&gt;</p>
         ${detailRows}`,
      )
    : null;

  try {
    await Promise.allSettled([
      client.emails.send({
        from: EMAIL_FROM,
        to: payload.guestEmail,
        subject: `Booking confirmation — ${payload.serviceLabel}`,
        html: userHtml,
      }),
      adminHtml && EMAIL_TO_ADMIN
        ? client.emails.send({
            from: EMAIL_FROM,
            to: EMAIL_TO_ADMIN,
            replyTo: payload.guestEmail,
            subject: adminSubject,
            html: adminHtml,
          })
        : Promise.resolve(),
    ]);
  } catch (err) {
    console.error('[email] sendBookingEmails failed', err);
  }
}
