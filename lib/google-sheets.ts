import { google } from 'googleapis';

export const isGoogleSheetsConfigured =
  Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID) &&
  Boolean(process.env.GOOGLE_SHEETS_CLIENT_EMAIL) &&
  Boolean(process.env.GOOGLE_SHEETS_PRIVATE_KEY);

function getClient() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL ?? '';
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

  if (!spreadsheetId || !clientEmail || !privateKey) return null;

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
