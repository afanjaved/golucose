import { google } from 'googleapis';
import type { Reading, SheetReading } from './types';

const toNumber = (value: unknown): number | null => {
  if (value === '' || value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getSheetsClient = async (access: 'read' | 'write' = 'read') => {
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
    scopes: [access === 'write'
      ? 'https://www.googleapis.com/auth/spreadsheets'
      : 'https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  return {
    sheetId,
    sheets: google.sheets({ version: 'v4', auth }),
    tab
  };
};

const mapRowToReading = (row: unknown[]): Reading => ({
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
});

const toSheetValues = (reading: Reading) => [[
  reading.date,
  reading.beforeBreakfastTime,
  reading.fastingSugar === null ? '' : String(reading.fastingSugar),
  reading.breakfastInsulin === null ? '' : String(reading.breakfastInsulin),
  reading.breakfastInsulinTime,
  reading.postBreakfastTime,
  reading.postBreakfastSugar === null ? '' : String(reading.postBreakfastSugar),
  reading.dinnerInsulin === null ? '' : String(reading.dinnerInsulin),
  reading.dinnerInsulinTime,
  reading.nightTestTime,
  reading.nightSugar === null ? '' : String(reading.nightSugar),
  reading.notes
]];

export async function getReadings(): Promise<Reading[]> {
  const { sheetId, sheets, tab } = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${tab}'!A2:L`
  });

  return (response.data.values || [])
    .filter((row) => row.some((value) => String(value).trim() !== ''))
    .map((row) => mapRowToReading(row));
}

export async function getSheetReadings(): Promise<SheetReading[]> {
  const { sheetId, sheets, tab } = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${tab}'!A2:L`
  });

  return (response.data.values || [])
    .filter((row) => row.some((value) => String(value).trim() !== ''))
    .map((row, index) => ({
      rowNumber: index + 2,
      ...mapRowToReading(row)
    }));
}

export async function appendReading(reading: Reading) {
  const { sheetId, sheets, tab } = await getSheetsClient('write');

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `'${tab}'!A:L`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: toSheetValues(reading)
    }
  });
}

export async function updateReading(rowNumber: number, reading: Reading) {
  const { sheetId, sheets, tab } = await getSheetsClient('write');

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `'${tab}'!A${rowNumber}:L${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: toSheetValues(reading)
    }
  });
}
