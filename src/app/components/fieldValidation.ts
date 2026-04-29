// Shared field validation for editable financial values
// Used by both the Command Centre inline editing and the Data Confirmation popup

export type FieldKey =
  | 'arr'
  | 'revenue'
  | 'ebitda'
  | 'grossMargin'
  | 'cashBalance'
  | 'cashBurn'
  | 'runway'
  | 'headcount';

export type ValidationResult = {
  valid: boolean;
  error?: string;
  parsedNumber?: number;     // The numeric value (in base units, e.g. £ not £K)
  normalized?: string;       // Display-formatted output (e.g. "£540K")
};

// Parse user input like "540K", "£1.5M", "540,000", "1500000", "70%" into a number
function parseNumericInput(raw: string): number | null {
  if (!raw) return null;
  // Strip currency symbols, percent signs, commas, whitespace
  let s = raw.toString().trim().replace(/[£$€,\s%]/g, '');
  if (!s) return null;

  // Detect M/K suffix (case-insensitive)
  let mult = 1;
  const last = s.slice(-1).toUpperCase();
  if (last === 'M') { mult = 1_000_000; s = s.slice(0, -1); }
  else if (last === 'K') { mult = 1_000; s = s.slice(0, -1); }
  else if (last === 'B') { mult = 1_000_000_000; s = s.slice(0, -1); }

  // Must look like a number after stripping
  if (!/^-?\d*\.?\d+$/.test(s)) return null;

  const n = parseFloat(s) * mult;
  return Number.isFinite(n) ? n : null;
}

// Format a number back to a user-friendly currency display (£540K, £1.5M, £45)
function formatCurrencyDisplay(n: number, currency: 'GBP' | 'USD' | 'EUR' = 'GBP'): string {
  const sym = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`;
  if (abs >= 1_000) return `${sign}${sym}${Math.round(abs / 1_000)}K`;
  return `${sign}${sym}${Math.round(abs)}`;
}

// Per-field rules
const fieldRules: Record<FieldKey, {
  label: string;
  type: 'currency' | 'currency-negative' | 'currency-any' | 'percentage' | 'integer';
  min?: number;
  max?: number;
  hint: string;
}> = {
  arr:           { label: 'ARR',          type: 'currency',          min: 0, hint: 'e.g. 540K, £1.5M, 540000' },
  revenue:       { label: 'Revenue',      type: 'currency',          min: 0, hint: 'e.g. 60K, £45000' },
  ebitda:        { label: 'EBITDA',       type: 'currency-any',              hint: 'Can be negative — e.g. -3K, -£25K' },
  grossMargin:   { label: 'Gross Margin', type: 'percentage',        min: 0, max: 100, hint: '0–100, e.g. 70 or 70%' },
  cashBalance:   { label: 'Cash Balance', type: 'currency',          min: 0, hint: 'e.g. 2.1M, £450K' },
  cashBurn:      { label: 'Cash Burn',    type: 'currency-negative',         hint: 'Must be negative — e.g. -120K, -£25K' },
  runway:        { label: 'Runway',       type: 'integer',           min: 0, max: 120, hint: 'Months — positive integer' },
  headcount:     { label: 'Headcount',    type: 'integer',           min: 0, max: 10_000, hint: 'Positive integer' },
};

export function validateFieldValue(
  field: FieldKey,
  rawInput: string,
  currency: 'GBP' | 'USD' | 'EUR' = 'GBP'
): ValidationResult {
  const rule = fieldRules[field];
  if (!rule) return { valid: true };

  const n = parseNumericInput(rawInput);

  if (n === null) {
    return { valid: false, error: `Invalid format. ${rule.hint}` };
  }

  // Type-specific rules
  switch (rule.type) {
    case 'currency':
      if (n < 0) return { valid: false, error: `${rule.label} cannot be negative` };
      break;
    case 'currency-negative':
      // Auto-flip positive to negative for cash burn
      if (n > 0) {
        const flipped = -n;
        return { valid: true, parsedNumber: flipped, normalized: formatCurrencyDisplay(flipped, currency) };
      }
      if (n === 0) return { valid: false, error: 'Cash Burn cannot be zero' };
      break;
    case 'percentage':
      if (n < 0) return { valid: false, error: 'Cannot be negative' };
      if (n > 100) return { valid: false, error: 'Cannot exceed 100%' };
      return { valid: true, parsedNumber: n, normalized: `${Math.round(n)}%` };
    case 'integer':
      if (!Number.isInteger(n)) return { valid: false, error: 'Must be a whole number' };
      if (rule.min !== undefined && n < rule.min) return { valid: false, error: `Cannot be below ${rule.min}` };
      if (rule.max !== undefined && n > rule.max) return { valid: false, error: `Cannot exceed ${rule.max}` };
      return { valid: true, parsedNumber: n, normalized: String(n) };
  }

  // Range checks for currency types
  if (rule.min !== undefined && n < rule.min) return { valid: false, error: `Cannot be below ${rule.min}` };
  if (rule.max !== undefined && n > rule.max) return { valid: false, error: `Cannot exceed ${rule.max}` };

  return { valid: true, parsedNumber: n, normalized: formatCurrencyDisplay(n, currency) };
}

// Map field keys to the display label used in the UI
export function fieldLabelFor(field: FieldKey): string {
  return fieldRules[field]?.label ?? field;
}
