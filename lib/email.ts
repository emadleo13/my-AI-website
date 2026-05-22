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
  if (!client) return;

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
