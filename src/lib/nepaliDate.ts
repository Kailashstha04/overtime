// Bikram Sambat calendar conversion
// Reference: 2080-01-01 BS = April 14, 2023 AD (UTC)
// Verified: 2083-05-31 BS = September 16, 2026 AD (UTC)

const BS_DATA: Record<number, number[]> = {
  2078: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 30, 30, 30, 29, 29, 30, 31],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2086: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2087: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2088: [31, 31, 32, 31, 31, 30, 30, 30, 29, 29, 30, 30],
  2089: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 29, 31],
  2090: [31, 32, 31, 32, 30, 31, 30, 29, 30, 29, 30, 30],
};

const REF_BS_YEAR = 2080;
// Reference as UTC epoch days (avoids local-timezone off-by-one drift)
// April 14, 2023 UTC = Date.UTC(2023, 3, 14) / 86400000 = 19461 days since Unix epoch
const REF_UTC_DAY = Math.floor(Date.UTC(2023, 3, 14) / 86400000);

export const BS_MONTHS = [
  'Baisakh', 'Jestha', 'Ashadh', 'Shrawan',
  'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
  'Poush', 'Magh', 'Falgun', 'Chaitra',
];

export const BS_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'साउन',
  'भदौ', 'आश्विन', 'कार्तिक', 'मंसिर',
  'पुष', 'माघ', 'फागुन', 'चैत',
];

export interface BSDate {
  year: number;
  month: number;
  day: number;
}

// Convert a Date to its UTC calendar day number (no timezone drift)
function toUTCDay(date: Date): number {
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
}

export function adToBS(date: Date): BSDate {
  let daysOffset = toUTCDay(date) - REF_UTC_DAY;

  let bsYear = REF_BS_YEAR;
  let bsMonth = 1;
  let bsDay = 1;

  if (daysOffset < 0) {
    // Before reference - walk backward
    while (daysOffset < 0) {
      bsMonth--;
      if (bsMonth < 1) {
        bsMonth = 12;
        bsYear--;
      }
      const data = BS_DATA[bsYear];
      if (!data) break;
      daysOffset += data[bsMonth - 1];
    }
    bsDay = daysOffset + 1;
  } else {
    while (daysOffset > 0) {
      const data = BS_DATA[bsYear];
      if (!data) break;
      const monthDays = data[bsMonth - 1];
      if (daysOffset >= monthDays) {
        daysOffset -= monthDays;
        bsMonth++;
        if (bsMonth > 12) {
          bsMonth = 1;
          bsYear++;
        }
      } else {
        bsDay = daysOffset + 1;
        daysOffset = 0;
      }
    }
  }

  return { year: bsYear, month: bsMonth, day: bsDay };
}

export function bsToAD(bsYear: number, bsMonth: number, bsDay: number): Date {
  let daysOffset = 0;

  for (let y = REF_BS_YEAR; y < bsYear; y++) {
    const data = BS_DATA[y];
    if (!data) break;
    daysOffset += data.reduce((a, b) => a + b, 0);
  }

  const yearData = BS_DATA[bsYear];
  if (yearData) {
    for (let m = 1; m < bsMonth; m++) {
      daysOffset += yearData[m - 1];
    }
  }

  daysOffset += bsDay - 1;

  // Return as UTC midnight to avoid local-timezone drift
  const utcMs = (REF_UTC_DAY + daysOffset) * 86400000;
  return new Date(utcMs);
}

export function formatBS(bs: BSDate): string {
  return `${bs.year}-${String(bs.month).padStart(2, '0')}-${String(bs.day).padStart(2, '0')}`;
}

export function formatBSFull(bs: BSDate): string {
  return `${bs.year} ${BS_MONTHS[bs.month - 1]} ${bs.day}`;
}

// Parse an ISO date string "YYYY-MM-DD" as UTC midnight (not local midnight)
export function parseADString(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function parseBS(str: string): BSDate | null {
  const parts = str.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1], day: parts[2] };
}

export function formatAD(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Return today's date as a UTC-normalised Date (midnight UTC)
export function todayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function getBSMonthDays(year: number, month: number): number {
  return BS_DATA[year]?.[month - 1] ?? 30;
}

export function getCurrentBS(): BSDate {
  return adToBS(todayUTC());
}

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calcMinutes(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startTotal = sh * 60 + sm;
  let endTotal = eh * 60 + em;
  if (endTotal <= startTotal) endTotal += 24 * 60; // overnight
  return endTotal - startTotal;
}
