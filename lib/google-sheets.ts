import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL ?? '';
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

export const isGoogleSheetsConfigured =
  Boolean(SPREADSHEET_ID) && Boolean(CLIENT_EMAIL) && Boolean(PRIVATE_KEY);

function getClient() {
  if (!isGoogleSheetsConfigured) return null;
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function logUserSignup(email: string, date: string): Promise<void> {
  const sheets = getClient();
  if (!sheets || !SPREADSHEET_ID) return;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
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
  const sheets = getClient();
  if (!sheets || !SPREADSHEET_ID) return;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
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
  const sheets = getClient();
  if (!sheets || !SPREADSHEET_ID) return;
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
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
