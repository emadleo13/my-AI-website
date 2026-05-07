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

export interface BookingPayload {
  serviceType: string;
  serviceLabel: string;
  date: string;
  time: string;
  guestName: string;
  guestEmail: string;
  phone?: string;
  notes?: string;
}

export async function sendBookingEmails(payload: BookingPayload): Promise<void> {
  if (!client) return;

  const detailRows = `
    <p><strong>Service:</strong> ${escape(payload.serviceLabel)}</p>
    <p><strong>Date:</strong> ${escape(payload.date)} at ${escape(payload.time)} (Europe/Bucharest)</p>
    ${payload.phone ? `<p><strong>Phone:</strong> ${escape(payload.phone)}</p>` : ''}
    ${payload.notes ? `<p><strong>Notes:</strong></p><p style="white-space:pre-wrap;background:#0B1220;padding:12px;border-radius:8px">${escape(payload.notes)}</p>` : ''}
  `;

  // Confirmation to the booker.
  const userHtml = shell(
    `Your consultation is booked`,
    `<p>Hi ${escape(payload.guestName)},</p>
     <p>Thanks for booking — I've received your request and will follow up shortly with a calendar invite.</p>
     ${detailRows}
     <p style="margin-top:20px">— Emad</p>`,
  );

  const adminHtml = EMAIL_TO_ADMIN
    ? shell(
        `New booking: ${payload.serviceLabel}`,
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
            subject: `[booking] ${payload.serviceLabel} — ${payload.date} ${payload.time}`,
            html: adminHtml,
          })
        : Promise.resolve(),
    ]);
  } catch (err) {
    console.error('[email] sendBookingEmails failed', err);
  }
}
