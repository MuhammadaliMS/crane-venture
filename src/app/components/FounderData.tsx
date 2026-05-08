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

// ── Status helpers — quiet single-tone treatment, status conveyed by dot ────
const STATUS_CONFIG: Record<SubmissionStatus, {
  label: string; dotClass: string; tone: 'on' | 'off';
}> = {
  submitted: { label: 'Submitted', dotClass: 'bg-[#5C7A6E]', tone: 'on'  }, // sage
  partial:   { label: 'Partial',   dotClass: 'bg-[#B8763A]', tone: 'on'  }, // amber
  sent:      { label: 'Awaiting',  dotClass: 'bg-foreground/40', tone: 'on'  },
  not_sent:  { label: 'Not sent',  dotClass: 'bg-muted-foreground/30', tone: 'off' },
};

function StatusBadge({ status, compact }: { status: SubmissionStatus; compact?: boolean }) {
  const cfg = STATUS_CONFIG[status];
  const isOff = cfg.tone === 'off';
  const sizing = compact ? 'text-[11px] px-2 py-0.5' : 'text-[12px] px-2.5 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm ${sizing} ${
      isOff ? 'text-muted-foreground/70' : 'text-foreground/85'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
      {cfg.label}
    </span>
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
          <h1 className="font-display text-[34px] leading-tight text-foreground">Founder Data</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Track quarterly data submissions from portfolio founders
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[13px] rounded-lg hover:bg-[var(--primary-muted)] transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          Send {activeQuarter} Forms
        </button>
      </div>

      {/* ── Quarter tabs + stats ───────────────────────────────────── */}
      <div className="bg-white border border-border/70 rounded-xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center border-b border-border/60 px-4">
          {QUARTERS.map(q => (
            <button
              key={q}
              onClick={() => setActiveQuarter(q)}
              className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
                activeQuarter === q
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {q}
              {q === CURRENT_QUARTER && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded-full">Current</span>
              )}
            </button>
          ))}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 divide-x divide-border/60">
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
                  <p className="text-[20px] font-semibold text-foreground leading-tight">{count}</p>
                  <p className="text-[11px] text-muted-foreground">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Matrix table ──────────────────────────────────────────── */}
      <div className="bg-white border border-border/70 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid gap-0 border-b border-border/60"
          style={{ gridTemplateColumns: '2fr repeat(4, 1fr) 120px' }}>
          <div className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">Company</div>
          {QUARTERS.map(q => (
            <div key={q} className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-center ${
              q === activeQuarter ? 'text-primary' : 'text-muted-foreground/70'
            }`}>
              {q}
            </div>
          ))}
          <div className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 text-right">Actions</div>
        </div>

        {/* Rows */}
        {filteredCompanies.map((company, i) => {
          const isExpanded = expandedId === company.id;
          const currentSub = getSubmission(company.id, activeQuarter);
          const isCopied = copiedId === company.id;

          return (
            <div key={company.id} className={`border-b border-border/60 last:border-0 ${isExpanded ? 'bg-card' : ''}`}>
              {/* Main row */}
              <div
                className={`grid items-center cursor-pointer hover:bg-muted/60 transition-colors ${isExpanded ? 'bg-muted/40' : ''}`}
                style={{ gridTemplateColumns: '2fr repeat(4, 1fr) 120px' }}
                onClick={() => setExpandedId(isExpanded ? null : company.id)}
              >
                {/* Company */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-[11px] font-medium flex-shrink-0">
                    {company.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] text-foreground font-medium truncate">{company.name}</p>
                    <p className="text-[11px] text-muted-foreground/70">{company.stage} · {company.fund}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Quarter cells */}
                {QUARTERS.map(q => {
                  const sub = getSubmission(company.id, q);
                  return (
                    <div key={q} className={`px-3 py-3 flex justify-center ${q === activeQuarter ? 'bg-accent/30' : ''}`}
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
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend
                    </button>
                  ) : (
                    <button
                      onClick={() => {}}
                      title="Send a personalised invite to the founder"
                      className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 h-8 rounded-md text-foreground hover:bg-muted transition-colors"
                    >
                      <Send className="w-3 h-3" /> Send
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
                  <div className="px-4 pb-4 pt-0 border-t border-border/60">
                    <div className="ml-10 space-y-3">
                      {/* Status bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-primary">{activeQuarter}</span>
                          <StatusBadge status={sub.status} compact />
                          {sub.submittedAt && (
                            <span className="text-[11px] text-muted-foreground/70">
                              Submitted {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {sub.sentAt && !sub.submittedAt && (
                            <span className="text-[11px] text-muted-foreground/70">
                              Sent {new Date(sub.sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                          {sub.fieldsComplete !== undefined && (
                            <span className={`text-[11px] font-medium ${sub.status === 'submitted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {sub.fieldsComplete}/{sub.fieldsTotal} fields
                            </span>
                          )}
                        </div>
                        {/* Send / Resend buttons removed — already on the row, no need to duplicate inside */}
                      </div>

                      {/* Founder note */}
                      {sub.founderNote && (
                        <div className="bg-card rounded-md border border-border p-3">
                          <p className="text-[10px] text-muted-foreground/70 mb-1 uppercase tracking-[0.16em] font-medium">Founder note</p>
                          <p className="text-[13px] text-foreground italic leading-relaxed">"{sub.founderNote}"</p>
                        </div>
                      )}

                      {/* Not sent / awaiting state */}
                      {sub.status === 'not_sent' && (
                        <p className="text-[12px] text-muted-foreground/70 py-2">No form has been sent for {activeQuarter}.</p>
                      )}
                      {sub.status === 'sent' && (
                        <p className="text-[12px] text-muted-foreground/70 py-2">Form sent — awaiting founder response.</p>
                      )}

                      {/* Quarterly values — 9 metrics matching founder form, one quarter column */}
                      {(sub.status === 'submitted' || sub.status === 'partial') && (
                        <div className="overflow-hidden rounded-md border border-border bg-card">
                          <table className="w-full text-[12px]">
                            <thead>
                              <tr className="border-b border-border/60">
                                <th className="text-left px-3 py-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.16em] w-[260px]">Metric</th>
                                <th className="text-right px-3 py-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.16em]">{activeQuarter}</th>
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
                                          <td colSpan={2} className="px-3 pt-3 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.16em] border-t border-border/60">
                                            {metric.section}
                                          </td>
                                        </tr>
                                      )}
                                      <tr className="hover:bg-muted/40">
                                        <td className="px-3 py-1.5 text-foreground/85">
                                          {metric.label}
                                          {metric.isCalc && <span className="ml-1 text-[10px] text-muted-foreground/70">(auto)</span>}
                                        </td>
                                        <td className="px-3 py-1.5 text-right font-mono-num text-foreground">
                                          {val != null
                                            ? metric.isCurrency
                                              ? formatCurrency(val as number, company.currency)
                                              : metric.isPercentage
                                                ? val + '%'
                                                : (val as number).toString()
                                            : <span className="text-muted-foreground/50">—</span>}
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
      <p className="text-[12px] text-muted-foreground/70 text-center pb-4">
        Founder forms are pre-populated with last known values. Founders confirm, edit, or flag fields — no login required.
      </p>
    </div>
  );
}
