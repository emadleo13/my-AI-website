import { google } from 'googleapis';

export const isGoogleSheetsConfigured =
  Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID) &&
  Boolean(process.env.GOOGLE_SHEETS_CLIENT_EMAIL) &&
  Boolean(process.env.GOOGLE_SHEETS_PRIVATE_KEY);

function getClient() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL ?? '';
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  if (!spreadsheetId || !clientEmail || !privateKey) {
    const missing = [
      !spreadsheetId && 'GOOGLE_SHEETS_SPREADSHEET_ID',
      !clientEmail   && 'GOOGLE_SHEETS_CLIENT_EMAIL',
      !privateKey    && 'GOOGLE_SHEETS_PRIVATE_KEY',
    ].filter(Boolean);
    console.warn('[google-sheets] skipped — missing env vars:', missing.join(', '));
    return null;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return { sheets: google.sheets({ version: 'v4', auth }), spreadsheetId };
}

export async function logUserSignup(email: string, date: string): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: 'Signups!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[date, email, 'signup']] },
    });
  } catch (err) {
    console.error('[google-sheets] logUserSignup failed', err);
  }
}

export async function logServiceRequest(
  email: string,
  serviceType: string,
  status: string,
  date: string,
): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: 'Requests!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[date, email, serviceType, status]] },
    });
  } catch (err) {
    console.error('[google-sheets] logServiceRequest failed', err);
  }
}

type SheetsClient = NonNullable<ReturnType<typeof getClient>>;

/**
 * Ensures a tab with the given title exists, creating it (with a header row)
 * if it doesn't. This makes logging resilient: a freshly provisioned
 * spreadsheet — or one missing the tab — gets it on first write rather than
 * silently failing the append.
 */
async function ensureSheet(
  client: SheetsClient,
  title: string,
  header: string[],
): Promise<void> {
  const meta = await client.sheets.spreadsheets.get({
    spreadsheetId: client.spreadsheetId,
    fields: 'sheets.properties.title',
  });
  const exists = meta.data.sheets?.some(
    (s) => s.properties?.title === title,
  );
  if (exists) return;

  await client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: client.spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  });
  await client.sheets.spreadsheets.values.append({
    spreadsheetId: client.spreadsheetId,
    range: `${title}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [header] },
  });
}

export interface LeadRow {
  date: string;
  name: string;
  email: string;
  company?: string;
  channel: string;
  service?: string;
  message?: string;
}

export async function logLead(row: LeadRow): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await ensureSheet(client, 'Leads', [
      'Date', 'Name', 'Email', 'Company', 'Channel', 'Service', 'Message',
    ]);
    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: 'Leads!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          row.date,
          row.name,
          row.email,
          row.company ?? '',
          row.channel,
          row.service ?? '',
          row.message ?? '',
        ]],
      },
    });
  } catch (err) {
    console.error('[google-sheets] logLead failed', err);
  }
}

export interface BookingRow {
  date: string;
  guestName: string;
  guestEmail: string;
  phone?: string;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  scope?: string;
  socialPlatform?: string;
  socialContact?: string;
  notes?: string;
}

export async function logBooking(row: BookingRow): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    await client.sheets.spreadsheets.values.append({
      spreadsheetId: client.spreadsheetId,
      range: 'Booking!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          row.date,
          row.guestName,
          row.guestEmail,
          row.phone ?? '',
          row.serviceType,
          row.bookingDate,
          row.bookingTime,
          row.scope ?? '',
          row.socialPlatform ?? '',
          row.socialContact ?? '',
          row.notes ?? '',
        ]],
      },
    });
  } catch (err) {
    console.error('[google-sheets] logBooking failed', err);
  }
}
