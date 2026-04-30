import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { companies, formatCurrencyFull } from './mock-data';
import type { Currency } from './mock-data';
import { Lock, Mail, CheckCircle2, Check, AlertCircle, Circle, Cloud } from 'lucide-react';

// --- Quarter helper — now quarterly columns (Q1-Q4) based on financial year-end ---
function getQuarterInfo() {
  // Financial year 2025/26: Q1–Q4
  return {
    label: 'FY 2025/26',
    quarters: [
      { key: 'q1', label: 'Q1' },
      { key: 'q2', label: 'Q2' },
      { key: 'q3', label: 'Q3' },
      { key: 'q4', label: 'Q4' },
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
}

const SECTIONS = [
  { id: 'revenue', label: 'Revenue & Growth', color: 'bg-blue-50 text-blue-800 border-blue-100' },
  { id: 'profitability', label: 'Profitability & Margins', color: 'bg-green-50 text-green-800 border-green-100' },
  { id: 'cash', label: 'Cash Position', color: 'bg-purple-50 text-purple-800 border-purple-100' },
  { id: 'team', label: 'Team & Diversity', color: 'bg-amber-50 text-amber-800 border-amber-100' },
] as const;

const ROWS: RowDef[] = [
  // Revenue & Growth
  { key: 'revenue', label: 'Revenue (core)', section: 'revenue', isCurrency: true, dataKey: 'revenue' },
  { key: 'arr', label: 'ARR', section: 'revenue', isCurrency: true, dataKey: 'arr' },
  // Profitability & Margins
  { key: 'grossMargin', label: 'Gross Margin (%)', section: 'profitability', isCurrency: false, isPercentage: true, dataKey: 'grossMargin' },
  { key: 'ebitda', label: 'EBITDA', section: 'profitability', isCurrency: true, dataKey: 'ebitda' },
  // Cash Position
  { key: 'cashBalance', label: 'Cash Balance', section: 'cash', isCurrency: true, dataKey: 'cashBalance' },
  { key: 'cashBurn', label: 'Cash Burn (excl. funding)', section: 'cash', isCurrency: true, dataKey: 'monthlyNetBurn' },
  // Team & Diversity
  { key: 'headcountMale', label: 'Headcount - Male (FTE)', section: 'team', isCurrency: false, dataKey: 'headcountMale' },
  { key: 'headcountFemale', label: 'Headcount - Female (FTE)', section: 'team', isCurrency: false, dataKey: 'headcountFemale' },
  { key: 'headcountEthnicMinority', label: 'Headcount - Ethnic Minority (FTE)', section: 'team', isCurrency: false, dataKey: 'headcountEthnicMinority' },
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">&#128683;</div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Invalid Link</h1>
          <p className="text-slate-500">This verification link is invalid or has expired. Please contact your Crane VC partner for a new link.</p>
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
    if (filled === 4) return 'complete';
    if (filled > 0) return 'partial';
    return 'empty';
  }

  // Progress
  const editableRows = ROWS.filter((r) => !r.isCalculated);
  const totalCells = editableRows.length * 4;
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Data Submitted</h1>
          <p className="text-slate-500 mb-4">
            Thank you, {ceoName}. Your {quarter.label} data for {company.name} has been received and will be reviewed by the Crane team.
          </p>
          <p className="text-sm text-slate-400">You can close this page.</p>
        </div>
      </div>
    );
  }

  // --- Render helpers ---
  function renderSectionHeader(section: (typeof SECTIONS)[number]) {
    return (
      <tr key={`section-${section.id}`}>
        <td colSpan={5} className={`px-3 py-2.5 text-[12px] font-semibold uppercase tracking-wider border-b ${section.color}`}>
          {section.label}
        </td>
      </tr>
    );
  }

  function renderRow(row: RowDef, rowIndex: number) {
    const isCalc = row.isCalculated;
    const isEven = rowIndex % 2 === 0;

    return (
      <tr key={row.key} className={isEven ? 'bg-white' : 'bg-slate-50/60'}>
        {/* Metric name (sticky) */}
        <td className="sticky left-0 z-10 px-3 py-2 text-[13px] font-medium text-slate-700 border-b border-slate-100 bg-inherit whitespace-nowrap min-w-[180px]">
          <span className={isCalc ? 'italic text-slate-500' : ''}>{row.label}</span>
          {isCalc && <span className="ml-1.5 text-[10px] text-slate-400 font-normal">(auto)</span>}
        </td>

        {/* Q1, Q2, Q3, Q4 */}
        {quarter.quarters.map((q) => {
          const key = cellKey(row.key, q.key);
          const val = getCellValue(row.key, q.key);
          const isEmpty = !val || val.trim() === '';
          const isAutoPopulated = !isEmpty && !editedCells.has(key);

          return (
            <td key={q.key} className="px-1 py-1 border-b border-slate-100 min-w-[110px] relative">
              <input
                type="text"
                inputMode="decimal"
                value={val}
                onChange={(e) => setCellValue(row.key, q.key, e.target.value)}
                placeholder={row.isCurrency ? `${sym}0` : '0'}
                className={`w-full border rounded px-2 py-1.5 text-right font-mono text-[13px] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-shadow min-h-[44px] ${
                  isEmpty
                    ? 'border-amber-300 bg-amber-50/40 text-slate-800'
                    : isAutoPopulated
                    ? 'border-slate-200 bg-white text-slate-500'
                    : 'border-slate-200 bg-white text-slate-800'
                }`}
              />
              {isAutoPopulated && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-400" title="Auto-populated from last known data" />
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[440px]">
          <div className="text-center mb-6">
            <h1 className="text-[24px] font-bold tracking-tight text-indigo-600 mb-1">CRANE</h1>
            <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Quarterly Data Collection</p>
            <div className="mt-3">
              <span className="text-lg font-semibold text-slate-900">{company.name}</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold">{quarter.label}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            {authStep === 'email' && (
              <form onSubmit={sendOtp} className="space-y-4">
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-900">Verify your email</h2>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Enter your email to receive a 6-digit access code. The code is sent only to founders registered for {company.name}.
                  </p>
                </div>
                {authError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700">{authError}</p>
                  </div>
                )}
                <div>
                  <label className="text-[12px] font-medium text-slate-700">Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="founder@yourcompany.com"
                      className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                      autoFocus
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={otpSending}
                  className={`w-full py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                    otpSending ? 'bg-indigo-400 text-white cursor-wait' : 'bg-indigo-500 text-white hover:bg-indigo-600'
                  }`}
                >
                  {otpSending ? 'Sending code…' : 'Send access code'}
                </button>
              </form>
            )}

            {authStep === 'otp' && (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-900">Enter access code</h2>
                  <p className="text-[12px] text-slate-500 mt-1">
                    We sent a 6-digit code to <span className="font-medium text-slate-700">{authEmail}</span>. Check your inbox.
                  </p>
                </div>
                {authError && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-red-700">{authError}</p>
                  </div>
                )}
                <div>
                  <label className="text-[12px] font-medium text-slate-700">6-digit code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={authOtp}
                    onChange={e => setAuthOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full mt-1 px-3 py-2.5 text-[18px] font-mono tracking-[0.4em] text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-500 text-white text-[13px] font-medium hover:bg-indigo-600 transition-colors"
                >
                  Verify and continue
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthStep('email'); setAuthOtp(''); setAuthError(''); }}
                  className="w-full text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Use a different email
                </button>
              </form>
            )}
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure access — your data is encrypted in transit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[900px] mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-indigo-600 mb-1">CRANE</h1>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Quarterly Data Collection</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="text-lg font-semibold text-slate-900">{company.name}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">{quarter.label}</span>
          </div>
        </div>

        {/* Welcome + Financial Year End + Reporting Currency */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Hi <span className="font-semibold">{ceoName}</span>, please provide your quarterly data for{' '}
            <span className="font-semibold">{company.name}</span> for the latest completed quarter.
            Fields are pre-populated with last known values — update as needed.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[12px] font-medium text-slate-600">Company Financial Year End</label>
              <select
                value={fyEnd}
                onChange={e => setFyEnd(e.target.value)}
                className="mt-1 w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Q1–Q4 align to your financial year</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600">Reporting Currency</label>
              <select
                value={reportingCurrency}
                onChange={e => setReportingCurrency(e.target.value)}
                className="mt-1 w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {REPORTING_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">All numeric values are reported in this currency</p>
            </div>
          </div>
        </div>

        {/* Progress + autosave indicator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {filledCells} of {totalCells} cells filled
            </span>
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <span className="text-xs text-slate-400 flex items-center gap-1"><Cloud className="w-3.5 h-3.5 animate-pulse" /> Saving...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-xs text-emerald-500 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Data saved</span>
              )}
              <span className="text-sm font-semibold text-indigo-600">{progressPct}%</span>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Auto-populated</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2.5 rounded border border-amber-300 bg-amber-50/40" /> Empty — needs input</span>
          </div>
        </div>

        {/* Spreadsheet Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[180px]">
                    Metric
                  </th>
                  {quarter.quarters.map((q) => (
                    <th key={q.key} className="px-2 py-2.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[110px]">
                      <div className="text-[12px]">{q.label}</div>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes (optional)</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Any context, corrections, or comments for the Crane team..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-slate-50"
          />
        </div>

        {/* Submit */}
        <button
          onClick={() => setSubmitted(true)}
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
            canSubmit
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          Submit Quarterly Data
        </button>
        <p className="text-xs text-center text-slate-400 mt-2">
          Partial submissions are welcome. You can fill in what you have now and update later.
        </p>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Your data is encrypted and transmitted securely.</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-8">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">
            Questions? Contact{' '}
            <a href="mailto:anna@cranevc.com" className="text-indigo-500 hover:underline">anna@cranevc.com</a>
          </span>
        </div>
      </div>
    </div>
  );
}
