import { z } from 'zod';
import type { Reading } from './types';
import {
  formatDateForInput,
  formatDateForStorage,
  formatTimeForInput,
  formatTimeForStorage,
  getTodayDateInputValue
} from './reading-format';

const numberField = z.string().trim().superRefine((value, ctx) => {
  if (!value) return;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a valid number.'
    });
  }
}).transform((value) => value ? Number(value) : null);

const readingFormSchema = z.object({
  date: z.string().trim().min(1, 'Date is required.'),
  beforeBreakfastTime: z.string().trim(),
  fastingSugar: numberField,
  breakfastInsulin: numberField,
  breakfastInsulinTime: z.string().trim(),
  postBreakfastTime: z.string().trim(),
  postBreakfastSugar: numberField,
  dinnerInsulin: numberField,
  dinnerInsulinTime: z.string().trim(),
  nightTestTime: z.string().trim(),
  nightSugar: numberField,
  notes: z.string().trim()
});

const readField = (formData: FormData, key: string) => String(formData.get(key) ?? '');
const toInputValue = (value: number | null) => value === null ? '' : String(value);

export type ReadingFormDefaults = {
  date: string;
  beforeBreakfastTime: string;
  fastingSugar: string;
  breakfastInsulin: string;
  breakfastInsulinTime: string;
  postBreakfastTime: string;
  postBreakfastSugar: string;
  dinnerInsulin: string;
  dinnerInsulinTime: string;
  nightTestTime: string;
  nightSugar: string;
  notes: string;
};

export const toReadingFormDefaults = (reading?: Reading | null): ReadingFormDefaults => ({
  date: reading ? formatDateForInput(reading.date) : getTodayDateInputValue(),
  beforeBreakfastTime: reading ? formatTimeForInput(reading.beforeBreakfastTime) : '',
  fastingSugar: toInputValue(reading?.fastingSugar ?? null),
  breakfastInsulin: toInputValue(reading?.breakfastInsulin ?? null),
  breakfastInsulinTime: reading ? formatTimeForInput(reading.breakfastInsulinTime) : '',
  postBreakfastTime: reading ? formatTimeForInput(reading.postBreakfastTime) : '',
  postBreakfastSugar: toInputValue(reading?.postBreakfastSugar ?? null),
  dinnerInsulin: toInputValue(reading?.dinnerInsulin ?? null),
  dinnerInsulinTime: reading ? formatTimeForInput(reading.dinnerInsulinTime) : '',
  nightTestTime: reading ? formatTimeForInput(reading.nightTestTime) : '',
  nightSugar: toInputValue(reading?.nightSugar ?? null),
  notes: reading?.notes ?? ''
});

export const validateReadingFormData = (formData: FormData) => {
  const parsed = readingFormSchema.safeParse({
    date: readField(formData, 'date'),
    beforeBreakfastTime: readField(formData, 'beforeBreakfastTime'),
    fastingSugar: readField(formData, 'fastingSugar'),
    breakfastInsulin: readField(formData, 'breakfastInsulin'),
    breakfastInsulinTime: readField(formData, 'breakfastInsulinTime'),
    postBreakfastTime: readField(formData, 'postBreakfastTime'),
    postBreakfastSugar: readField(formData, 'postBreakfastSugar'),
    dinnerInsulin: readField(formData, 'dinnerInsulin'),
    dinnerInsulinTime: readField(formData, 'dinnerInsulinTime'),
    nightTestTime: readField(formData, 'nightTestTime'),
    nightSugar: readField(formData, 'nightSugar'),
    notes: readField(formData, 'notes')
  });

  if (!parsed.success) {
    return {
      success: false as const,
      message: parsed.error.issues[0]?.message ?? 'Invalid form data.'
    };
  }

  const data: Reading = {
    date: formatDateForStorage(parsed.data.date),
    beforeBreakfastTime: formatTimeForStorage(parsed.data.beforeBreakfastTime),
    fastingSugar: parsed.data.fastingSugar,
    breakfastInsulin: parsed.data.breakfastInsulin,
    breakfastInsulinTime: formatTimeForStorage(parsed.data.breakfastInsulinTime),
    postBreakfastTime: formatTimeForStorage(parsed.data.postBreakfastTime),
    postBreakfastSugar: parsed.data.postBreakfastSugar,
    dinnerInsulin: parsed.data.dinnerInsulin,
    dinnerInsulinTime: formatTimeForStorage(parsed.data.dinnerInsulinTime),
    nightTestTime: formatTimeForStorage(parsed.data.nightTestTime),
    nightSugar: parsed.data.nightSugar,
    notes: parsed.data.notes
  };

  return {
    success: true as const,
    data
  };
};
