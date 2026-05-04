import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Send, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, MinusCircle,
  ExternalLink, Copy, RefreshCw, Users, BarChart3, Download,
} from 'lucide-react';
import { companies, formatCurrency, type MonthlyFinancials, type Company } from './mock-data';
import { useFundFilter } from './Layout';

// ── Quarter → months mapping ─────────────────────────────────────────────
const QUARTER_MONTHS: Record<string, { label: string; iso: string }[]> = {
  'Q2 2025': [
    { label: 'Apr 2025', iso: '2025-04' },
    { label: 'May 2025', iso: '2025-05' },
    { label: 'Jun 2025', iso: '2025-06' },
  ],
  'Q3 2025': [
    { label: 'Jul 2025', iso: '2025-07' },
    { label: 'Aug 2025', iso: '2025-08' },
    { label: 'Sep 2025', iso: '2025-09' },
  ],
  'Q4 2025': [
    { label: 'Oct 2025', iso: '2025-10' },
    { label: 'Nov 2025', iso: '2025-11' },
    { label: 'Dec 2025', iso: '2025-12' },
  ],
  'Q1 2026': [
    { label: 'Jan 2026', iso: '2026-01' },
    { label: 'Feb 2026', iso: '2026-02' },
    { label: 'Mar 2026', iso: '2026-03' },
  ],
};

function getMonthlyData(company: Company, iso: string): MonthlyFinancials | undefined {
  return company.monthlyFinancials.find(m => m.month === iso);
}

// Core 9 metrics — matches founder form (Bonnie's confirmed list)
const ALL_METRICS: { label: string; key: keyof MonthlyFinancials | 'grossMargin'; isCurrency: boolean; isPercentage?: boolean; section: string; isCalc?: boolean }[] = [
  // Revenue & Growth
  { label: 'Revenue (core)', key: 'revenue', isCurrency: true, section: 'Revenue & Growth' },
  { label: 'ARR', key: 'arr', isCurrency: true, section: 'Revenue & Growth' },
  // Profitability & Margins
  { label: 'Gross Margin (%)', key: 'grossMargin', isCurrency: false, isPercentage: true, section: 'Profitability & Margins' },
  { label: 'EBITDA', key: 'ebitda', isCurrency: true, section: 'Profitability & Margins', isCalc: true },
  // Cash Position
  { label: 'Cash Balance', key: 'cashBalance', isCurrency: true, section: 'Cash Position' },
  { label: 'Cash Burn (excl. funding)', key: 'monthlyNetBurn', isCurrency: true, section: 'Cash Position' },
  // Team & Diversity
  { label: 'Headcount — Male (FTE)', key: 'headcountMale', isCurrency: false, section: 'Team & Diversity' },
  { label: 'Headcount — Female (FTE)', key: 'headcountFemale', isCurrency: false, section: 'Team & Diversity' },
  { label: 'Headcount — Ethnic Minority (FTE)', key: 'headcountEthnicMinority', isCurrency: false, section: 'Team & Diversity' },
];

// ── Types ────────────────────────────────────────────────────────────────
type SubmissionStatus = 'submitted' | 'partial' | 'sent' | 'not_sent';

interface QuarterSubmission {
  status: SubmissionStatus;
  submittedAt?: string;       // ISO date
  fieldsComplete?: number;    // out of total
  fieldsTotal?: number;
  sentAt?: string;
  founderNote?: string;
}

// ── Mock submission data ─────────────────────────────────────────────────
const QUARTERS = ['Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'];
const CURRENT_QUARTER = 'Q1 2026';

// companyId → quarter → submission
const submissionData: Record<string, Record<string, QuarterSubmission>> = {
  '1': { // Arcline
    'Q2 2025': { status: 'submitted', submittedAt: '2025-07-08', fieldsComplete: 18, fieldsTotal: 18 },
    'Q3 2025': { status: 'submitted', submittedAt: '2025-10-06', fieldsComplete: 18, fieldsTotal: 18 },
    'Q4 2025': { status: 'submitted', submittedAt: '2026-01-09', fieldsComplete: 18, fieldsTotal: 18 },
    'Q1 2026': { status: 'submitted', submittedAt: '2026-04-04', fieldsComplete: 18, fieldsTotal: 18, founderNote: 'Strong Q1. Planning Series A.' },
  },
  '2': { // Nebula Data
    'Q2 2025': { status: 'submitted', submittedAt: '2025-07-10', fieldsComplete: 18, fieldsTotal: 18 },
    'Q3 2025': { status: 'submitted', submittedAt: '2025-10-11', fieldsComplete: 18, fieldsTotal: 18 },
    'Q4 2025': { status: 'partial', submittedAt: '2026-01-14', fieldsComplete: 14, fieldsTotal: 18, founderNote: 'Gross margin data being confirmed with accountant.' },
    'Q1 2026': { status: 'sent', sentAt: '2026-04-02' },
  },
  '3': { // Vaultik
    'Q2 2025': { status: 'submitted', submittedAt: '2025-07-15', fieldsComplete: 18, fieldsTotal: 18 },
    'Q3 2025': { status: 'partial', submittedAt: '2025-10-20', fieldsComplete: 11, fieldsTotal: 18 },
    'Q4 2025': { status: 'partial', submittedAt: '2026-01-18', fieldsComplete: 10, fieldsTotal: 18, founderNote: 'Flagged some P&L fields — pivot mid-quarter made numbers messy.' },
    'Q1 2026': { status: 'sent', sentAt: '2026-04-02' },
  },
  '4': { // Synthwave
    'Q2 2025': { status: 'not_sent' },
    'Q3 2025': { status: 'submitted', submittedAt: '2025-10-14', fieldsComplete: 12, fieldsTotal: 18 },
    'Q4 2025': { status: 'submitted', submittedAt: '2026-01-13', fieldsComplete: 15, fieldsTotal: 18 },
    'Q1 2026': { status: 'not_sent' },
  },
  '5': { // Gridform
    'Q2 2025': { status: 'partial', submittedAt: '2025-07-22', fieldsComplete: 9, fieldsTotal: 18 },
    'Q3 2025': { status: 'partial', submittedAt: '2025-10-28', fieldsComplete: 8, fieldsTotal: 18 },
    'Q4 2025': { status: 'sent', sentAt: '2026-01-05' },
    'Q1 2026': { status: 'not_sent' },
  },
  '6': { // Deepform (default fallback for others)
    'Q2 2025': { status: 'submitted', submittedAt: '2025-07-09', fieldsComplete: 18, fieldsTotal: 18 },
    'Q3 2025': { status: 'submitted', submittedAt: '2025-10-07', fieldsComplete: 18, fieldsTotal: 18 },
    'Q4 2025': { status: 'submitted', submittedAt: '2026-01-08', fieldsComplete: 18, fieldsTotal: 18 },
    'Q1 2026': { status: 'partial', submittedAt: '2026-04-03', fieldsComplete: 13, fieldsTotal: 18 },
  },
};

// Fallback for companies not in submissionData
function getMockSubmission(companyId: string, quarter: string): QuarterSubmission {
  const fallbacks: Record<string, SubmissionStatus> = {
    'Q2 2025': 'submitted', 'Q3 2025': 'submitted', 'Q4 2025': 'partial', 'Q1 2026': 'not_sent',
  };
  return { status: fallbacks[quarter] ?? 'not_sent' };
}

function getSubmission(companyId: string, quarter: string): QuarterSubmission {
  return submissionData[companyId]?.[quarter] ?? getMockSubmission(companyId, quarter);
}

// ── Status helpers ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<SubmissionStatus, {
  label: string; dotColor: string; bg: string; text: string; border: string;
}> = {
  submitted: { label: 'Submitted', dotColor: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  partial:   { label: 'Partial',   dotColor: '#f59e0b', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  sent:      { label: 'Awaiting',  dotColor: '#6366f1', bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  not_sent:  { label: 'Not sent',  dotColor: '#94a3b8', bg: 'bg-slate-50',   text: 'text-slate-400',   border: 'border-slate-200'   },
};

function StatusBadge({ status, compact }: { status: SubmissionStatus; compact?: boolean }) {
  const cfg = STATUS_CONFIG[status];
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dotColor }} />
        {cfg.label}
      </span>
    );
  }
  return (
    <div className={`flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.border}`}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dotColor }} />
      <span className={`text-[11px] font-medium ${cfg.text} whitespace-nowrap`}>{cfg.label}</span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────
export function FounderData() {
  const navigate = useNavigate();
  const { fundFilter } = useFundFilter();
  const [activeQuarter, setActiveQuarter] = useState(CURRENT_QUARTER);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCompanies = companies.filter(c =>
    c.lifecycle === 'Active — Core' || c.lifecycle === 'Active — Non-core'
  );

  const filteredCompanies = fundFilter !== 'all'
    ? activeCompanies.filter(c => c.fund === fundFilter)
    : activeCompanies;

  // Stats for active quarter
  const quarterStats = filteredCompanies.reduce(
    (acc, c) => {
      const s = getSubmission(c.id, activeQuarter).status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<SubmissionStatus, number>
  );

  const handleCopyLink = (companyId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/form/${companyId}`);
    setCopiedId(companyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-800 tracking-tight">Founder Data</h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Track quarterly data submissions from portfolio founders
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white text-[13px] rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Send {activeQuarter} Forms
        </button>
      </div>

      {/* ── Quarter tabs + stats ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-slate-100 px-4">
          {QUARTERS.map(q => (
            <button
              key={q}
              onClick={() => setActiveQuarter(q)}
              className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                activeQuarter === q
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {q}
              {q === CURRENT_QUARTER && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full">Current</span>
              )}
            </button>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          {(['submitted', 'partial', 'sent', 'not_sent'] as SubmissionStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const count = quarterStats[s] || 0;
            const icons = { submitted: CheckCircle2, partial: AlertCircle, sent: Clock, not_sent: MinusCircle };
            const Icon = icons[s];
            return (
              <div key={s} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bg} border ${cfg.border}`}>
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                </div>
                <div>
                  <p className="text-[20px] font-semibold text-slate-800 leading-tight">{count}</p>
                  <p className="text-[11px] text-slate-500">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Matrix table ──────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/70 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid gap-0 border-b border-slate-100"
          style={{ gridTemplateColumns: '2fr repeat(4, 1fr) 120px' }}>
          <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Company</div>
          {QUARTERS.map(q => (
            <div key={q} className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-center ${
              q === activeQuarter ? 'text-indigo-500' : 'text-slate-400'
            }`}>
              {q}
            </div>
          ))}
          <div className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 text-right">Actions</div>
        </div>

        {/* Rows */}
        {filteredCompanies.map((company, i) => {
          const isExpanded = expandedId === company.id;
          const currentSub = getSubmission(company.id, activeQuarter);
          const isCopied = copiedId === company.id;

          return (
            <div key={company.id} className={`border-b border-slate-100 last:border-0 ${isExpanded ? 'bg-slate-50/60' : ''}`}>
              {/* Main row */}
              <div
                className={`grid items-center cursor-pointer hover:bg-slate-50/60 transition-colors ${isExpanded ? 'bg-slate-50/60' : ''}`}
                style={{ gridTemplateColumns: '2fr repeat(4, 1fr) 120px' }}
                onClick={() => setExpandedId(isExpanded ? null : company.id)}
              >
                {/* Company */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0"
                    style={{ background: company.logoColor }}
                  >
                    {company.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-slate-700 font-medium truncate">{company.name}</p>
                    <p className="text-[11px] text-slate-400">{company.stage} · {company.fund}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-300 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Quarter cells */}
                {QUARTERS.map(q => {
                  const sub = getSubmission(company.id, q);
                  return (
                    <div key={q} className={`px-3 py-3 flex justify-center ${q === activeQuarter ? 'bg-indigo-50/30' : ''}`}
                      onClick={e => e.stopPropagation()}>
                      <StatusBadge status={sub.status} compact />
                    </div>
                  );
                })}

                {/* Actions */}
                <div className="px-3 py-3 flex items-center justify-end" onClick={e => e.stopPropagation()}>
                  {currentSub.status === 'sent' || currentSub.status === 'partial' || currentSub.status === 'submitted' ? (
                    <button
                      onClick={() => {}}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend
                    </button>
                  ) : (
                    <button
                      onClick={() => {}}
                      title="Sends a personalised invite to the founder via email"
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                    >
                      <Send className="w-3 h-3" /> Send personally
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded detail — quarterly value (one column) */}
              {isExpanded && (() => {
                const sub = getSubmission(company.id, activeQuarter);
                const months = QUARTER_MONTHS[activeQuarter] || [];
                // Aggregate to a single quarterly value per metric
                const quarterValueFor = (key: string, isCurrency: boolean): number | null => {
                  const monthData = months.map(m => getMonthlyData(company, m.iso)).filter(Boolean) as any[];
                  if (monthData.length === 0) return null;
                  if (key === 'grossMargin') {
                    const rev = monthData.reduce((s, d) => s + (d.revenue ?? 0), 0);
                    const cogs = monthData.reduce((s, d) => s + (d.cogs ?? 0), 0);
                    return rev > 0 ? Math.round(((rev - cogs) / rev) * 100) : null;
                  }
                  if (key === 'ebitda') {
                    return monthData.reduce((s, d) => {
                      const rev = (d.revenue ?? 0) + (d.revenueOther ?? 0);
                      const costs = (d.cogs ?? 0) + (d.rdCosts ?? 0) + (d.salesMarketingCosts ?? 0) + (d.generalAdminCosts ?? 0);
                      return s + (rev - costs);
                    }, 0);
                  }
                  if (key === 'cashBalance' || key === 'arr' || key.startsWith('headcount')) {
                    const last = monthData[monthData.length - 1];
                    return last[key] ?? null;
                  }
                  if (key === 'monthlyNetBurn') {
                    const sum = monthData.reduce((s, d) => s + (d[key] ?? 0), 0);
                    return -Math.abs(sum);
                  }
                  if (isCurrency) {
                    return monthData.reduce((s, d) => s + (d[key] ?? 0), 0);
                  }
                  return monthData[monthData.length - 1][key] ?? null;
                };

                return (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100">
                    <div className="ml-10 space-y-3">
                      {/* Status bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-indigo-700">{activeQuarter}</span>
                          <StatusBadge status={sub.status} compact />
                          {sub.submittedAt && (
                            <span className="text-[11px] text-slate-400">
                              Submitted {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {sub.sentAt && !sub.submittedAt && (
                            <span className="text-[11px] text-slate-400">
                              Sent {new Date(sub.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {sub.fieldsComplete !== undefined && (
                            <span className={`text-[11px] font-medium ${sub.status === 'submitted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {sub.fieldsComplete}/{sub.fieldsTotal} fields
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* "View submission" removed — form is private to founders, only data shown */}
                          {sub.status === 'not_sent' && (
                            <button className="flex items-center gap-1 text-[11px] px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                              <Send className="w-3 h-3" /> Send form
                            </button>
                          )}
                          {sub.status === 'sent' && (
                            <button className="flex items-center gap-1 text-[11px] px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                              <RefreshCw className="w-3 h-3" /> Resend
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Founder note */}
                      {sub.founderNote && (
                        <div className="bg-white rounded-lg border border-slate-100 p-2.5">
                          <p className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-[0.06em]">Founder note</p>
                          <p className="text-[12px] text-slate-600 italic">"{sub.founderNote}"</p>
                        </div>
                      )}

                      {/* Not sent / awaiting state */}
                      {sub.status === 'not_sent' && (
                        <p className="text-[12px] text-slate-400 py-2">No form has been sent for {activeQuarter}.</p>
                      )}
                      {sub.status === 'sent' && (
                        <p className="text-[12px] text-slate-400 py-2">Form sent — awaiting founder response.</p>
                      )}

                      {/* Quarterly values — 9 metrics matching founder form, one quarter column */}
                      {(sub.status === 'submitted' || sub.status === 'partial') && (
                        <div className="overflow-hidden rounded-lg border border-slate-100">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-2.5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] w-[260px]">Metric</th>
                                <th className="text-right px-2.5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em]">{activeQuarter}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                let lastSection = '';
                                return ALL_METRICS.map(metric => {
                                  const showSection = metric.section !== lastSection;
                                  lastSection = metric.section;
                                  const val = quarterValueFor(metric.key as string, metric.isCurrency);
                                  return (
                                    <React.Fragment key={metric.key}>
                                      {showSection && (
                                        <tr key={`section-${metric.section}`}>
                                          <td colSpan={2} className="px-2.5 pt-2.5 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.08em] bg-slate-50/50 border-t border-slate-100">
                                            {metric.section}
                                          </td>
                                        </tr>
                                      )}
                                      <tr className="hover:bg-slate-50/40 border-t border-slate-50">
                                        <td className="px-2.5 py-1.5 text-slate-600">
                                          {metric.label}
                                          {metric.isCalc && <span className="ml-1 text-[9px] text-slate-400">(auto)</span>}
                                        </td>
                                        <td className="px-2.5 py-1.5 text-right font-mono-num text-slate-700">
                                          {val != null
                                            ? metric.isCurrency
                                              ? formatCurrency(val as number, company.currency)
                                              : metric.isPercentage
                                                ? val + '%'
                                                : (val as number).toString()
                                            : <span className="text-slate-300">—</span>}
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* ── Footer note ───────────────────────────────────────────── */}
      <p className="text-[12px] text-slate-400 text-center pb-4">
        Founder forms are pre-populated with last known values. Founders confirm, edit, or flag fields — no login required.
      </p>
    </div>
  );
}
