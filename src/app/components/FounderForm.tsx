import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { companies, formatCurrencyFull } from './mock-data';
import type { Currency } from './mock-data';
import { Lock, Mail, CheckCircle2, Check, AlertCircle, Circle, Cloud, HelpCircle } from 'lucide-react';

// --- Quarter helper — current quarter + previous quarter ---
// Per Anna/Bonnie: form should show the previous quarter alongside the current
// quarter so founders can amend last quarter's submission and play catch-up.
function getQuarterInfo() {
  return {
    label: 'Q4 2025/26',
    quarters: [
      { key: 'q3', label: 'Q3 (previous)', editable: true,  isPrevious: true,  hint: 'Last submission. You may amend if there has been a material change.' },
      { key: 'q4', label: 'Q4 (current)',  editable: true,  isPrevious: false, hint: 'Latest completed quarter — please complete.' },
    ],
  };
}

// --- Row definitions ---
interface RowDef {
  key: string;
  label: string;
  section: string;
  isCurrency: boolean;
  isPercentage?: boolean;
  isCalculated?: boolean;
  dataKey: string; // key in MonthlyFinancials
  helpText: string; // shown in a tooltip on hover of the help icon
}

// Single neutral treatment — section identity comes from the label, not the color
const SECTION_HEADER = 'bg-muted text-muted-foreground border-border';
const SECTIONS = [
  { id: 'revenue',       label: 'Revenue & Growth',       color: SECTION_HEADER },
  { id: 'profitability', label: 'Profitability & Margins', color: SECTION_HEADER },
  { id: 'cash',          label: 'Cash Position',           color: SECTION_HEADER },
  { id: 'team',          label: 'Team & Diversity',        color: SECTION_HEADER },
] as const;

const ROWS: RowDef[] = [
  // Revenue & Growth
  { key: 'revenue', label: 'Revenue (core)', section: 'revenue', isCurrency: true, dataKey: 'revenue',
    helpText: 'Aggregate of revenue earned in the quarter (3 months) from your core product or service. Exclude one-off items such as grants, investment inflows, or non-recurring contracts.' },
  { key: 'arr', label: 'ARR', section: 'revenue', isCurrency: true, dataKey: 'arr',
    helpText: 'Annual Recurring Revenue at the END of the quarter (last reported month). If you only track MRR, multiply MRR × 12. Reflects the run-rate value of recurring contracts in place at quarter-end.' },
  // Profitability & Margins
  { key: 'grossMargin', label: 'Gross Margin (%)', section: 'profitability', isCurrency: false, isPercentage: true, dataKey: 'grossMargin',
    helpText: 'Gross margin % calculated across the full quarter: (Σ Revenue − Σ Cost of Sales) / Σ Revenue. Cost of Sales = direct costs to deliver your product (hosting, third-party services, payment processing, etc).' },
  { key: 'ebitda', label: 'EBITDA', section: 'profitability', isCurrency: true, dataKey: 'ebitda',
    helpText: 'Auto-calculated. Earnings Before Interest, Tax, Depreciation & Amortisation. Aggregate of all 3 months of the quarter. Negative if loss-making (which is normal at this stage).' },
  // Cash Position
  { key: 'cashBalance', label: 'Cash Balance', section: 'cash', isCurrency: true, dataKey: 'cashBalance',
    helpText: 'Total cash + cash equivalents in your bank account at the END of the quarter (last reported month-end).' },
  { key: 'cashBurn', label: 'Cash Burn (excl. funding)', section: 'cash', isCurrency: true, dataKey: 'monthlyNetBurn',
    helpText: 'Net cash outflow for the quarter (3-month aggregate). Should be a NEGATIVE figure — only positive if cash receipts exceeded operating expenses. EXCLUDES external funding inflows (e.g. fundraising, debt drawdowns, grants).' },
  // Team & Diversity
  { key: 'headcountMale', label: 'Headcount - Male (FTE)', section: 'team', isCurrency: false, dataKey: 'headcountMale',
    helpText: 'Number of male full-time-equivalent employees at quarter-end. Convert part-time employees to FTE proportionally (e.g. 0.5 FTE for half-time).' },
  { key: 'headcountFemale', label: 'Headcount - Female (FTE)', section: 'team', isCurrency: false, dataKey: 'headcountFemale',
    helpText: 'Number of female full-time-equivalent employees at quarter-end. Convert part-time employees to FTE proportionally.' },
  { key: 'headcountEthnicMinority', label: 'Headcount - Ethnic Minority (FTE)', section: 'team', isCurrency: false, dataKey: 'headcountEthnicMinority',
    helpText: 'Number of full-time-equivalent employees identifying as ethnic minority at quarter-end. This is a self-disclosed diversity metric — count only those who voluntarily disclose.' },
];

function getCurrencySymbol(cur: Currency): string {
  return cur === 'GBP' ? '\u00A3' : cur === 'USD' ? '$' : '\u20AC';
}

// Type for cell values keyed by "rowKey_monthKey"
type CellValues = Record<string, string>;

// Currencies supported (Bonnie's email + extensible)
const REPORTING_CURRENCIES = ['USD','GBP','EUR','CHF','INR','SGD','AUD','NZD','DKK','SEK','CAD','KRW','CNY'];

export function FounderForm() {
  const { token } = useParams<{ token: string }>();
  const company = companies.find((c) => c.id === token);

  const quarter = getQuarterInfo();

  // ── Email + OTP authentication gate ──
  const [authStep, setAuthStep] = useState<'email' | 'otp' | 'authed'>(() => {
    try {
      return sessionStorage.getItem(`crane.form.${token}.authed`) === 'true' ? 'authed' : 'email';
    } catch { return 'email'; }
  });
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [otpSending, setOtpSending] = useState(false);

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }
    setOtpSending(true);
    setTimeout(() => {
      setAuthStep('otp');
      setOtpSending(false);
    }, 600);
  };
  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authOtp || authOtp.length < 4) {
      setAuthError('Enter the 6-digit code from your email');
      return;
    }
    try { sessionStorage.setItem(`crane.form.${token}.authed`, 'true'); } catch {}
    setAuthStep('authed');
  };

  const [cellValues, setCellValues] = useState<CellValues>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [reportingCurrency, setReportingCurrency] = useState<string>(company?.currency || 'GBP');
  const [fyEnd, setFyEnd] = useState<string>('March');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autosave when cell values change
  useEffect(() => {
    if (Object.keys(cellValues).length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  }, [cellValues, additionalNotes]);

  // Company not found
  if (!company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-md border border-border p-8 max-w-md w-full text-center">
          <h1 className="font-display text-[26px] leading-tight text-foreground mb-2">Invalid link</h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed">This verification link is invalid or has expired. Please contact your Crane VC partner for a new link.</p>
        </div>
      </div>
    );
  }

  const latest = company.monthlyFinancials[company.monthlyFinancials.length - 1];
  const ceoName = company.managementTeam.match(/CEO:\s*([^,]+)/)?.[1]?.trim() ?? 'Founder';
  // Use the currency the founder selected (falls back to company default)
  const cur = (reportingCurrency as Currency) || company.currency;
  const sym = getCurrencySymbol(cur);

  // --- Helpers ---
  function getLastKnown(row: RowDef): number | undefined {
    if (row.isCalculated && row.key === 'ebitda') {
      const rev = (latest.revenue ?? 0) + (latest.revenueOther ?? 0);
      const costs = (latest.cogs ?? 0) + (latest.rdCosts ?? 0) + (latest.salesMarketingCosts ?? 0) + (latest.generalAdminCosts ?? 0);
      return rev - costs;
    }
    const val = (latest as Record<string, unknown>)[row.dataKey];
    return typeof val === 'number' ? val : undefined;
  }

  function formatDisplay(val: number | undefined, row: RowDef): string {
    if (val == null) return '--';
    if (row.isPercentage) return `${val}%`;
    if (row.isCurrency) return formatCurrencyFull(val, cur);
    return val.toLocaleString();
  }

  function cellKey(rowKey: string, monthKey: string): string {
    return `${rowKey}_${monthKey}`;
  }

  function getCellValue(rowKey: string, monthKey: string): string {
    return cellValues[cellKey(rowKey, monthKey)] ?? '';
  }

  function setCellValue(rowKey: string, monthKey: string, value: string) {
    const key = cellKey(rowKey, monthKey);
    setCellValues((prev) => ({ ...prev, [key]: value }));
    setEditedCells((prev) => new Set(prev).add(key));
  }

  // Track which cells were auto-populated vs edited by founder
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());
  // Original values per cell — used to flag amended PRIOR-quarter values in red
  const [originalValues, setOriginalValues] = useState<CellValues>({});

  // Initialize cells with last known values on first render
  const initDone = useMemo(() => {
    const initial: CellValues = {};
    for (const row of ROWS) {
      if (row.isCalculated) continue;
      const lk = getLastKnown(row);
      if (lk != null) {
        for (const q of quarter.quarters) {
          initial[cellKey(row.key, q.key)] = String(lk);
        }
      }
    }
    if (Object.keys(cellValues).length === 0 && Object.keys(initial).length > 0) {
      setCellValues(initial);
      setOriginalValues(initial);   // remember the baseline so we can detect amendments
    }
    return true;
  }, []);

  // Row status
  function getRowStatus(row: RowDef): 'complete' | 'partial' | 'empty' {
    if (row.isCalculated) return 'complete';
    let filled = 0;
    for (const q of quarter.quarters) {
      const v = getCellValue(row.key, q.key);
      if (v && v.trim() !== '') filled++;
    }
    if (filled === quarter.quarters.length) return 'complete';
    if (filled > 0) return 'partial';
    return 'empty';
  }

  // Progress
  const editableRows = ROWS.filter((r) => !r.isCalculated);
  const totalCells = editableRows.length * quarter.quarters.length;
  const filledCells = editableRows.reduce((acc, row) => {
    let count = 0;
    for (const q of quarter.quarters) {
      const v = getCellValue(row.key, q.key);
      if (v && v.trim() !== '') count++;
    }
    return acc + count;
  }, 0);
  const progressPct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

  // Partial submissions allowed — founders can submit even with empty fields
  const canSubmit = true;

  // --- Success screen ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card rounded-md border border-border p-10 max-w-md w-full text-center">
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center mx-auto mb-5">
            <Check className="w-4 h-4 text-foreground" strokeWidth={2} />
          </div>
          <h1 className="font-display text-[28px] leading-tight text-foreground mb-3">Submitted, with thanks.</h1>
          <p className="text-[13px] text-muted-foreground mb-1 leading-relaxed">
            {ceoName}, your {quarter.label} data for {company.name} has been received.
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            The Crane team will review and follow up if anything needs clarification.
          </p>
          <p className="text-[12px] text-muted-foreground/70 mt-6">You can close this page.</p>
        </div>
      </div>
    );
  }

  // --- Render helpers ---
  function renderSectionHeader(section: (typeof SECTIONS)[number]) {
    return (
      <tr key={`section-${section.id}`}>
        <td colSpan={1 + quarter.quarters.length} className={`px-3 py-2.5 text-[12px] font-semibold uppercase tracking-wider border-b ${section.color}`}>
          {section.label}
        </td>
      </tr>
    );
  }

  function renderRow(row: RowDef, rowIndex: number) {
    const isCalc = row.isCalculated;
    const isEven = rowIndex % 2 === 0;

    return (
      <tr key={row.key} className={isEven ? 'bg-card' : 'bg-muted/40'}>
        {/* Metric name + help tooltip (sticky) */}
        <td className="sticky left-0 z-10 px-3 py-2 text-[13px] font-medium text-foreground border-b border-border/60 bg-inherit whitespace-nowrap min-w-[200px]">
          <span className="inline-flex items-center gap-1.5">
            <span className={isCalc ? 'italic text-muted-foreground' : ''}>{row.label}</span>
            {isCalc && <span className="text-[10px] text-muted-foreground/70 font-normal">(auto)</span>}
            {row.helpText && (
              <span className="group/help relative inline-flex">
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-foreground cursor-help" strokeWidth={1.6} />
                <span className="invisible group-hover/help:visible absolute left-0 top-5 z-30 bg-foreground text-background text-[11px] font-normal rounded-md px-3 py-2 w-[280px] leading-relaxed pointer-events-none normal-case tracking-normal shadow-[var(--shadow-card-hover)]">
                  {row.helpText}
                </span>
              </span>
            )}
          </span>
        </td>

        {/* Quarter columns — previous quarter + current quarter */}
        {quarter.quarters.map((q) => {
          const key = cellKey(row.key, q.key);
          const val = getCellValue(row.key, q.key);
          const isEmpty = !val || val.trim() === '';
          const isAutoPopulated = !isEmpty && !editedCells.has(key);
          const original = originalValues[key];
          // For previous quarter, flag any amendment (value differs from baseline) in RED
          const isAmendedPrior = q.isPrevious && original !== undefined && val !== original && editedCells.has(key);

          return (
            <td key={q.key} className="px-1 py-1 border-b border-border/60 min-w-[140px] relative">
              <input
                type="text"
                inputMode="decimal"
                value={val}
                onChange={(e) => setCellValue(row.key, q.key, e.target.value)}
                placeholder={row.isCurrency ? `${sym}0` : '0'}
                className={`w-full border rounded-sm px-2 py-1.5 text-right font-mono-num text-[13px] placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-colors min-h-[36px] ${
                  isAmendedPrior
                    ? 'border-destructive/60 bg-destructive/[0.06] text-destructive font-semibold focus:ring-destructive/20 focus:border-destructive'
                    : isEmpty
                    ? 'border-[#B8763A]/40 bg-[#B8763A]/[0.04] text-foreground focus:ring-primary/20 focus:border-primary/40'
                    : isAutoPopulated
                    ? 'border-border bg-card text-muted-foreground focus:ring-primary/20 focus:border-primary/40'
                    : 'border-border bg-card text-foreground focus:ring-primary/20 focus:border-primary/40'
                }`}
              />
              {isAutoPopulated && !isAmendedPrior && (
                <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-foreground/40" title="Auto-populated from last known data" />
              )}
              {isAmendedPrior && (
                <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-destructive" title={`Amended from previous submission (was ${original})`} />
              )}
            </td>
          );
        })}
      </tr>
    );
  }

  // Group rows by section
  const rowsBySection = SECTIONS.map((section) => ({
    section,
    rows: ROWS.filter((r) => r.section === section.id),
  }));

  // ── Auth gate (email + OTP) — render before form if not authed ──
  if (authStep !== 'authed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <h1 className="font-display text-[40px] tracking-tight text-foreground mb-1 leading-none">Crane</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Quarterly Data Collection</p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="font-display text-[20px] text-foreground leading-none">{company.name}</span>
              <span className="text-[11px] text-muted-foreground font-mono-num uppercase tracking-wider">{quarter.label}</span>
            </div>
          </div>

          <div className="bg-card rounded-md border border-border p-7">
            {authStep === 'email' && (
              <form onSubmit={sendOtp} className="space-y-5">
                <div>
                  <h2 className="font-display text-[24px] leading-tight text-foreground">Verify your email</h2>
                  <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                    Enter your email to receive a 6-digit access code. The code is sent only to founders registered for {company.name}.
                  </p>
                </div>
                {authError && (
                  <div className="flex items-start gap-2 bg-destructive/[0.06] border border-destructive/20 rounded-md px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-destructive">{authError}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="founder-email" className="text-[12px] font-medium text-foreground/80">Email</label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" strokeWidth={1.6} />
                    <input
                      id="founder-email"
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="founder@yourcompany.com"
                      className="w-full pl-9 pr-3 h-10 text-[13px] border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={otpSending}
                  className={`w-full h-11 rounded-md text-[13px] font-medium transition-colors ${
                    otpSending ? 'bg-muted text-muted-foreground cursor-wait' : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}
                >
                  {otpSending ? 'Sending code…' : 'Send access code'}
                </button>
              </form>
            )}

            {authStep === 'otp' && (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div>
                  <h2 className="font-display text-[24px] leading-tight text-foreground">Enter access code</h2>
                  <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                    We sent a 6-digit code to <span className="font-medium text-foreground">{authEmail}</span>. Check your inbox.
                  </p>
                </div>
                {authError && (
                  <div className="flex items-start gap-2 bg-destructive/[0.06] border border-destructive/20 rounded-md px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-destructive">{authError}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="founder-otp" className="text-[12px] font-medium text-foreground/80">6-digit code</label>
                  <input
                    id="founder-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={authOtp}
                    onChange={e => setAuthOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full mt-1.5 px-3 h-12 text-[20px] font-mono-num tracking-[0.4em] text-center border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-11 rounded-md bg-foreground text-background text-[13px] font-medium hover:bg-foreground/90 transition-colors"
                >
                  Verify and continue
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthStep('email'); setAuthOtp(''); setAuthError(''); }}
                  className="w-full text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Use a different email
                </button>
              </form>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground/70 text-center mt-4 flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" strokeWidth={1.6} /> Secure access — your data is encrypted in transit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[900px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-[44px] tracking-tight text-foreground mb-1 leading-none">Crane</h1>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Quarterly Data Collection</p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="font-display text-[22px] text-foreground leading-none">{company.name}</span>
            <span className="text-[11px] text-muted-foreground font-mono-num uppercase tracking-wider">{quarter.label}</span>
          </div>
        </div>

        {/* Welcome + Financial Year End + Reporting Currency */}
        <div className="bg-card rounded-md border border-border p-5 mb-5 space-y-4">
          <p className="text-[14px] text-foreground leading-relaxed">
            Hi <span className="font-medium">{ceoName}</span>, please provide your quarterly data for{' '}
            <span className="font-medium">{company.name}</span> for the latest completed quarter.
            Fields are pre-populated with last known values — update as needed.
          </p>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Data for the previous quarter is also attached based on your last submission.
            You may amend the previous quarter's data if there has been a material change —
            <span className="text-destructive font-medium"> any changes will be highlighted in red</span> for our team.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/60">
            <div>
              <label className="text-[12px] font-medium text-foreground/80">Company Financial Year End</label>
              <select
                value={fyEnd}
                onChange={e => setFyEnd(e.target.value)}
                className="mt-1.5 w-full text-[13px] border border-border rounded-md px-3 h-9 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground/70 mt-1.5">Q1–Q4 align to your financial year</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-foreground/80">Reporting Currency</label>
              <select
                value={reportingCurrency}
                onChange={e => setReportingCurrency(e.target.value)}
                className="mt-1.5 w-full text-[13px] border border-border rounded-md px-3 h-9 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              >
                {REPORTING_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground/70 mt-1.5">All numeric values are reported in this currency</p>
            </div>
          </div>
        </div>

        {/* Progress + autosave indicator */}
        <div className="bg-card rounded-md border border-border p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium text-foreground font-mono-num">
              {filledCells} of {totalCells} cells filled
            </span>
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1"><Cloud className="w-3 h-3 animate-pulse" /> Saving</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>
              )}
              <span className="text-[13px] font-medium text-foreground font-mono-num">{progressPct}%</span>
            </div>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center gap-5 mt-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-foreground/40" /> Auto-populated</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#B8763A]" /> Empty — needs input</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Amended (previous quarter)</span>
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="bg-card rounded-md border border-border mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-muted/60 border-b border-border">
                  <th className="sticky left-0 z-10 bg-muted/60 px-3 py-2.5 text-left text-xs font-semibold text-foreground/80 uppercase tracking-wider min-w-[180px]">
                    Metric
                  </th>
                  {quarter.quarters.map((q) => (
                    <th key={q.key} className="px-2 py-2.5 text-center text-xs font-semibold text-foreground/80 uppercase tracking-wider min-w-[140px]">
                      <div className="text-[12px]">{q.label}</div>
                      {q.hint && <div className="text-[10px] font-normal text-muted-foreground/70 normal-case tracking-normal mt-0.5">{q.hint}</div>}
                    </th>
                  ))}
                  {/* Status column removed — empty cells highlighted instead */}
                </tr>
              </thead>
              <tbody>
                {rowsBySection.map(({ section, rows }) => {
                  let sectionRowIdx = 0;
                  return [
                    renderSectionHeader(section),
                    ...rows.map((row) => {
                      const el = renderRow(row, sectionRowIdx);
                      sectionRowIdx++;
                      return el;
                    }),
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-card rounded-md border border-border p-4 mb-6">
          <label className="block text-[13px] font-medium text-foreground mb-2">Additional notes <span className="text-muted-foreground font-normal">(optional)</span></label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any context, corrections, or comments for the Crane team..."
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-border text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-none bg-card placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Submit */}
        <button
          onClick={() => setSubmitted(true)}
          disabled={!canSubmit}
          className={`w-full h-12 rounded-md text-[14px] font-medium transition-colors ${
            canSubmit
              ? 'bg-foreground text-background hover:bg-foreground/90'
              : 'bg-muted text-muted-foreground/70 cursor-not-allowed'
          }`}
        >
          Submit quarterly data
        </button>
        <p className="text-[11px] text-center text-muted-foreground/70 mt-3">
          Partial submissions are welcome. You can fill in what you have now and update later.
        </p>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <Lock className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span className="text-xs text-muted-foreground/70">Your data is encrypted and transmitted securely.</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span className="text-xs text-muted-foreground/70">
            Questions? Contact{' '}
            <a href="mailto:anna@cranevc.com" className="text-primary hover:underline">anna@cranevc.com</a>
          </span>
        </div>
      </div>
    </div>
  );
}
