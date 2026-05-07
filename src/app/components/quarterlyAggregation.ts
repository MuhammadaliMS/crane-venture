// Bonnie's confirmed aggregation rules for quarterly data
// (from email 2026-04-29) — used everywhere we display quarterly figures

export type MonthlyRow = {
  month: string;
  revenue?: number | null;
  revenueOther?: number | null;
  arr?: number | null;
  cogs?: number | null;
  rdCosts?: number | null;
  salesMarketingCosts?: number | null;
  generalAdminCosts?: number | null;
  cashBalance?: number | null;
  monthlyNetBurn?: number | null;
  ebitda?: number | null;
  headcountMale?: number | null;
  headcountFemale?: number | null;
  headcountEthnicMinority?: number | null;
};

export type AggregateKey =
  | 'revenue'
  | 'arr'
  | 'grossMargin'
  | 'ebitda'
  | 'cashBalance'
  | 'cashBurn'
  | 'headcountMale'
  | 'headcountFemale'
  | 'headcountEthnicMinority';

/**
 * Aggregate quarterly value per Bonnie's rules:
 *   Revenue   → SUM of 3 months
 *   ARR       → LAST month (M3)
 *   GM %      → (ΣRevenue − ΣCOGS) / ΣRevenue
 *   EBITDA    → SUM of 3 months (can be negative)
 *   Cash Bal  → LAST month (M3)
 *   Cash Burn → SUM, FORCED NEGATIVE (excludes external funding inflows)
 *   Headcount → LAST month (M3)
 */
export function aggregateQuarter(
  monthData: MonthlyRow[],
  key: AggregateKey,
): number | null {
  if (!monthData || monthData.length === 0) return null;
  const last = monthData[monthData.length - 1];

  switch (key) {
    // ── LAST MONTH (M3) — point-in-time values ──
    case 'arr':
    case 'cashBalance':
    case 'headcountMale':
    case 'headcountFemale':
    case 'headcountEthnicMinority':
      return last[key] ?? null;

    // ── SUM of 3 months ──
    case 'revenue':
      return monthData.reduce((s, d) => s + (d.revenue ?? 0), 0);

    case 'ebitda': {
      // Calculated EBITDA = (Revenue + RevenueOther) − (COGS + R&D + S&M + G&A)
      // Aggregated across all 3 months
      return monthData.reduce((s, d) => {
        const rev = (d.revenue ?? 0) + (d.revenueOther ?? 0);
        const costs =
          (d.cogs ?? 0) +
          (d.rdCosts ?? 0) +
          (d.salesMarketingCosts ?? 0) +
          (d.generalAdminCosts ?? 0);
        return s + (rev - costs);
      }, 0);
    }

    // ── Cash Burn — sum, FORCED NEGATIVE per Bonnie ──
    case 'cashBurn': {
      const sum = monthData.reduce((s, d) => s + Math.abs(d.monthlyNetBurn ?? 0), 0);
      return sum === 0 ? null : -sum;
    }

    // ── Gross Margin % — derived from sums ──
    case 'grossMargin': {
      const rev = monthData.reduce((s, d) => s + (d.revenue ?? 0), 0);
      const cogs = monthData.reduce((s, d) => s + (d.cogs ?? 0), 0);
      if (rev <= 0) return null;
      return Math.round(((rev - cogs) / rev) * 100);
    }
  }
  return null;
}

// Returns ISO month strings (YYYY-MM) for a quarter relative to a financial year-end month.
// year is the calendar year of the END of Q4. quarter is 1-4.
// fyEndMonth is 1-12 (the LAST month of FY, e.g. March = 3).
export function monthsForQuarter(
  year: number,
  quarter: 1 | 2 | 3 | 4,
  fyEndMonth: number,
): string[] {
  // Q4 ends in fyEndMonth, Q3 ends in fyEndMonth-3, etc.
  const lastMonthIdx = (quarter * 3) - 1; // 0..11 within the FY
  const quarterEndAbsolute = (fyEndMonth - 12 + lastMonthIdx + 1) % 12; // 1..12
  // Actually simpler: build the 3 month indices for this quarter (1-based)
  const months: string[] = [];
  for (let i = 0; i < 3; i++) {
    // monthIndex within FY: 0 = first month of FY
    const monthIdxWithinFY = (quarter - 1) * 3 + i;
    // Map back to calendar month (fyStartMonth = fyEndMonth + 1)
    const fyStartMonth = (fyEndMonth % 12) + 1; // 1..12
    let m = fyStartMonth + monthIdxWithinFY;
    let y = year;
    while (m > 12) { m -= 12; y += 1; }
    // If FY ends in March (3), FY 2025/26 means Apr 2025 → Mar 2026. So year = end year (2026).
    // The starting year is year - 1 if start month > end month.
    if (fyStartMonth > fyEndMonth) y -= 1;
    while (m > 12) { m -= 12; y += 1; }
    months.push(`${y}-${String(m).padStart(2, '0')}`);
  }
  return months;
}

// Simpler helper for calendar-year quarters (Jan-Mar = Q1)
export function calendarMonthsForQuarter(year: number, quarter: 1 | 2 | 3 | 4): string[] {
  const startMonth = (quarter - 1) * 3 + 1;
  return [0, 1, 2].map(i => {
    const m = startMonth + i;
    return `${year}-${String(m).padStart(2, '0')}`;
  });
}

// ── Display helpers for the per-company financial year ────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Map a company-FY quarter (1-4) to the calendar month range it represents,
// formatted as e.g. "Apr–Jun 2025" or "Dec 2025 – Feb 2026".
// fyEndMonth: 1-12 (e.g. March = 3 means FY ends March, starts April).
// fyEndYear: calendar year that the FY ends in (e.g. 2026 for FY 2025/26).
export function quarterDateRange(quarter: 1 | 2 | 3 | 4, fyEndMonth: number, fyEndYear: number): string {
  const fyStartMonth = (fyEndMonth % 12) + 1;
  const fyStartYear  = fyStartMonth > fyEndMonth ? fyEndYear - 1 : fyEndYear;
  // First and last month of this quarter within FY (1-based offsets from FY start)
  const firstOffset = (quarter - 1) * 3;
  const lastOffset  = firstOffset + 2;
  const calc = (offset: number) => {
    let m = fyStartMonth + offset;
    let y = fyStartYear;
    while (m > 12) { m -= 12; y += 1; }
    return { m, y };
  };
  const { m: m1, y: y1 } = calc(firstOffset);
  const { m: m2, y: y2 } = calc(lastOffset);
  const lbl1 = MONTH_NAMES[m1 - 1];
  const lbl2 = MONTH_NAMES[m2 - 1];
  if (y1 === y2) return `${lbl1}–${lbl2} ${y1}`;
  return `${lbl1} ${y1} – ${lbl2} ${y2}`;
}

// Convert a month name ("January".."December") to its 1-12 index.
export function monthNameToIndex(name: string): number {
  const long = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const idx = long.indexOf(name);
  return idx >= 0 ? idx + 1 : 3; // default March
}

export function monthIndexToName(idx: number): string {
  const long = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return long[(idx - 1 + 12) % 12];
}

// Mock: deterministically assigns each company a financial year-end month
// (in production this is set on the company record by the founder form).
// Returns a number 1-12.
export function getCompanyFyEndMonth(companyId: string): number {
  const ends = [3, 12, 6, 9, 3, 12]; // mix of Mar / Dec / Jun / Sep
  const hash = companyId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return ends[hash % ends.length];
}
