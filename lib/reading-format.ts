const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLookup = new Map(
  monthLabels.flatMap((label, index) => [
    [label.toLowerCase(), index],
    [
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        timeZone: 'UTC'
      }).format(new Date(Date.UTC(2026, index, 1))).toLowerCase(),
      index
    ]
  ])
);

const pad = (value: number) => String(value).padStart(2, '0');

const toUtcDate = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month, day));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const parseReadingDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return toUtcDate(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }

  const labeledMatch = trimmed.match(/^(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ](\d{4})$/);
  if (labeledMatch) {
    const month = monthLookup.get(labeledMatch[2].toLowerCase());
    if (month !== undefined) {
      return toUtcDate(Number(labeledMatch[3]), month, Number(labeledMatch[1]));
    }
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;

  return toUtcDate(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const formatUtcDate = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'UTC'
  }).format(date);

export const formatDateForDisplay = (value: string) => {
  const parsed = parseReadingDate(value);
  if (!parsed) return value;

  return formatUtcDate(parsed, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateForChart = (value: string) => {
  const parsed = parseReadingDate(value);
  if (!parsed) return value;

  return formatUtcDate(parsed, {
    day: 'numeric',
    month: 'short'
  });
};

export const formatDateForInput = (value: string) => {
  const parsed = parseReadingDate(value);
  if (!parsed) return '';

  return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())}`;
};

export const formatDateForStorage = (value: string) => {
  const parsed = parseReadingDate(value);
  if (!parsed) return value;

  return `${parsed.getUTCDate()}-${monthLabels[parsed.getUTCMonth()]}-${parsed.getUTCFullYear()}`;
};

const toTwentyFourHour = (hours: number, meridiem: string) => {
  if (meridiem === 'AM') return hours === 12 ? 0 : hours;
  return hours === 12 ? 12 : hours + 12;
};

const parseTimeParts = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const meridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])$/);
  if (meridiemMatch) {
    const hours = Number(meridiemMatch[1]);
    const minutes = Number(meridiemMatch[2]);

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

    return {
      hours: toTwentyFourHour(hours, meridiemMatch[3].toUpperCase()),
      minutes
    };
  }

  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourMatch) {
    const hours = Number(twentyFourMatch[1]);
    const minutes = Number(twentyFourMatch[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return { hours, minutes };
  }

  return null;
};

export const formatTimeForInput = (value: string) => {
  const parsed = parseTimeParts(value);
  if (!parsed) return '';

  return `${pad(parsed.hours)}:${pad(parsed.minutes)}`;
};

export const formatTimeForStorage = (value: string) => {
  const parsed = parseTimeParts(value);
  if (!parsed) return '';

  const meridiem = parsed.hours >= 12 ? 'PM' : 'AM';
  const twelveHour = parsed.hours % 12 || 12;

  return `${twelveHour}:${pad(parsed.minutes)} ${meridiem}`;
};

export const getTodayDateInputValue = (referenceDate = new Date()) =>
  `${referenceDate.getFullYear()}-${pad(referenceDate.getMonth() + 1)}-${pad(referenceDate.getDate())}`;
