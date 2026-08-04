export type Reading = {
  date: string;
  beforeBreakfastTime: string;
  fastingSugar: number | null;
  breakfastInsulin: number | null;
  breakfastInsulinTime: string;
  postBreakfastTime: string;
  postBreakfastSugar: number | null;
  dinnerInsulin: number | null;
  dinnerInsulinTime: string;
  nightTestTime: string;
  nightSugar: number | null;
  notes: string;
};

export type SheetReading = Reading & {
  rowNumber: number;
};
