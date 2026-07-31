import { google } from 'googleapis';
import type { Reading } from './types';

const toNumber = (value: unknown): number | null => {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export async function getReadings(): Promise<Reading[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const tab = process.env.GOOGLE_SHEET_TAB || 'Daily Log';
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!sheetId || !email || !privateKey) {
    throw new Error('Missing Google Sheets environment variables.');
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${tab}'!A2:L`
  });

  return (response.data.values || [])
    .filter((row) => row.some((value) => String(value).trim() !== ''))
    .map((row) => ({
      date: String(row[0] || ''),
      beforeBreakfastTime: String(row[1] || ''),
      fastingSugar: toNumber(row[2]),
      breakfastInsulin: toNumber(row[3]),
      breakfastInsulinTime: String(row[4] || ''),
      postBreakfastTime: String(row[5] || ''),
      postBreakfastSugar: toNumber(row[6]),
      dinnerInsulin: toNumber(row[7]),
      dinnerInsulinTime: String(row[8] || ''),
      nightTestTime: String(row[9] || ''),
      nightSugar: toNumber(row[10]),
      notes: String(row[11] || '')
    }));
}
