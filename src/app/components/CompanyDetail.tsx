import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, StickyNote, Plus, CalendarDays, RefreshCw, ExternalLink,
  FileText, Activity, Users, MoreHorizontal, TrendingUp, TrendingDown,
  AlertTriangle, ChevronDown, Clock, CheckSquare, Square, Minus,
  Search, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import {
  companies, formatCurrency, getHealthColor, getRAGColor,
  getActionColor, type MonthlyFinancials
} from './mock-data';
import { FlagIcon } from './FlagIcon';
import { useWorkflow } from './WorkflowContext';
import { LogNoteModal, NewTodoModal, ScheduleCheckInModal } from './ActionModals';
import { FlagActionDropdown } from './FlagActionDropdown';
import { useMilestone } from './Layout';
import { aggregateQuarter, getCompanyFyEndMonth, monthIndexToName, quarterDateRange } from './quarterlyAggregation';

export function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogNote, setShowLogNote] = useState(false);
  const [showNewTodo, setShowNewTodo] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAllFlags, setShowAllFlags] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResponse, setSearchResponse] = useState('');
  const [searchStreaming, setSearchStreaming] = useState(false);
  const [searchSources, setSearchSources] = useState<{ source: string; date: string }[]>([]);
  const { flags, activityFeed, getNotesForCompany, todos, toggleTodo } = useWorkflow();
  const { milestone } = useMilestone();
  const isM1 = milestone === 'm1';
  const company = companies.find(c => c.id === id);
  if (!company) return <div className="p-8 text-center">Company not found</div>;

  const companyFlags = flags.filter(f => f.companyId === id);
  const companyActivity = activityFeed.filter(a => a.companyName === company.name);
  const companyNotes = getNotesForCompany(id || '');
  const companyTodos = todos.filter(t => t.companyName === company.name && !t.completed);
  const isExited = company.lifecycle === 'Exited' || company.lifecycle === 'Wound Down';

  // Slimmed tabs — Market Context, Notes & Actions, Fundraising removed (descoped)
  const allTabs = [
    { id: 'overview', label: 'Overview', m1: true },
    { id: 'metrics', label: 'Metrics & Charts' },
    { id: 'documents', label: 'Documents' },
  ];
  const tabs = isM1 ? allTabs.filter(t => t.m1) : allTabs;

  // Build chart data from monthly financials
  const fin = company.monthlyFinancials;
  const last12 = fin.slice(-12);
  const chartMonths = last12.map((m, i) => {
    const monthLabel = new Date(m.month + '-01').toLocaleDateString('en-GB', { month: 'short' });
    return {
      month: monthLabel,
      arr: m.arr || 0,
      arrPY: Math.round((m.arr || 0) * 0.75),
      revenue: m.revenue || 0,
      revenuePY: Math.round((m.revenue || 0) * 0.72),
      grossProfit: m.grossProfit || 0,
      grossProfitPY: Math.round((m.grossProfit || 0) * 0.7),
      grossMargin: m.grossMargin || 0,
      grossMarginPY: Math.round((m.grossMargin || 0) * 0.95),
      ebitda: m.ebitda || 0,
      ebitdaPY: Math.round((m.ebitda || 0) * 0.8),
      cashBurn: m.monthlyNetBurn || 0,
      cashBurnPY: Math.round((m.monthlyNetBurn || 0) * 0.85),
      cashBalance: m.cashBalance || 0,
      cashBalancePY: Math.round((m.cashBalance || 0) * 1.2),
      headcount: m.headcountFTE || 0,
      femalePct: m.femalePctFTE || 0,
      malePct: m.malePctFTE || 0,
      femalePctBoard: m.femalePctBoard || 0,
      malePctBoard: m.malePctBoard || 0,
      ethnicMinorityPct: m.ethnicMinorityPctFTE || 0,
      ethnicMinorityPctBoard: m.ethnicMinorityPctBoard || 0,
    };
  });

  const latestFin = last12.length > 0 ? last12[last12.length - 1] : null;

  const mockDocuments = [
    { name: 'Q4 2025 Board Deck', type: 'Board Deck', source: 'Dropbox', date: '2026-01-15' },
    { name: 'Monthly Update - February', type: 'Email Update', source: 'Gmail', date: '2026-02-28' },
    { name: 'Monthly Update - January', type: 'Email Update', source: 'Gmail', date: '2026-01-31' },
    { name: 'Q3 2025 Board Deck', type: 'Board Deck', source: 'Dropbox', date: '2025-10-12' },
    { name: 'IC Paper', type: 'IC Paper', source: 'Dropbox', date: company.investmentDate },
    { name: 'Founder Call Notes - Mar 5', type: 'Transcript', source: 'Granola', date: '2026-03-05' },
    { name: 'Term Sheet', type: 'Legal', source: 'Dropbox', date: company.investmentDate },
  ];

  // MRR trend direction
  const mrrTrend = company.mrrTrend;
  const mrrUp = mrrTrend.length >= 2 && mrrTrend[mrrTrend.length - 1] > mrrTrend[mrrTrend.length - 2];

  // Last updated staleness
  const lastUpdateDate = new Date(company.lastUpdate);
  const daysSinceUpdate = Math.floor((Date.now() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24));
  const stalenessColor = daysSinceUpdate > 30 ? 'text-red-400' : daysSinceUpdate > 14 ? 'text-amber-400' : 'text-muted-foreground/70';
  const stalenessLabel = daysSinceUpdate > 30 ? 'Stale' : daysSinceUpdate > 14 ? 'Aging' : '';

  // Computed ARR
  const computedARR = company.mrr * 12;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Portfolio
      </button>

      {/* ===== ZONE 1: Editorial header — solid ink, no gradient ===== */}
      <div className="bg-foreground text-background rounded-md p-7 mb-6 animate-fade-in-up">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Avatar + Info */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-md bg-background/12 text-background flex items-center justify-center text-[18px] font-medium shrink-0 mt-1 border border-background/15">
              {company.name[0]}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[40px] tracking-tight text-background leading-[1.05]">
                {company.name}
              </h1>
              <p className="text-[14px] text-background/60 mt-1.5 max-w-xl leading-relaxed">{company.description}</p>
              {/* Badges */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="bg-background/10 text-background/85 text-[11px] px-2.5 py-1 rounded-sm">{company.stage}</span>
                <span className="bg-background/10 text-background/85 text-[11px] px-2.5 py-1 rounded-sm">{company.sector}</span>
                <span className="bg-background/10 text-background/85 text-[11px] px-2.5 py-1 rounded-sm" title="Company financial year-end">
                  FY ends {monthIndexToName(getCompanyFyEndMonth(company.id))}
                </span>
                {isExited && (
                  <span className="bg-background/10 text-background/65 text-[11px] px-2.5 py-1 rounded-sm">{company.lifecycle}</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: RAG + Action Badge + Last Updated + Actions */}
          <div className="flex flex-col items-end gap-3 shrink-0">
            {/* Top row: RAG + Action badge */}
            <div className="flex items-center gap-3">
              {/* RAG Status with history dots */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-1" title="RAG trend (last 4 quarters)">
                  {company.ragHistory.map((r, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full opacity-60"
                      style={{ background: getRAGColor(r) }}
                      title={`Q${i + 1}: ${r}`}
                    />
                  ))}
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: getRAGColor(company.rag) }}
                />
                <span className="text-[13px] text-muted-foreground/50">{company.rag}</span>
              </div>

              {/* Action Type Badge — neutral on dark hero, dot conveys color */}
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-sm bg-background/10 text-background/85 border border-background/15">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: getActionColor(company.action) }}
                />
                {company.action}
              </span>
            </div>

            {/* Last Updated with staleness */}
            <div className={`flex items-center gap-1.5 text-[11px] ${stalenessColor}`}>
              <Clock className="w-3 h-3" />
              <span>
                Updated {lastUpdateDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {stalenessLabel && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  daysSinceUpdate > 30 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {stalenessLabel}
                </span>
              )}
            </div>

            {/* Action buttons removed — descoped */}
          </div>
        </div>
      </div>

      {/* ===== ZONE 2: Key Metrics — Bonnie's quarterly aggregation rules ===== */}
      {(() => {
        // Use latest quarter Q4 2025/26 (Jan-Mar 2026)
        const latestQuarterMonths = ['2026-01','2026-02','2026-03'];
        const data = latestQuarterMonths.map(m => company.monthlyFinancials.find((f: any) => f.month === m)).filter(Boolean) as any[];
        if (data.length === 0) return null;
        const revenue = aggregateQuarter(data, 'revenue');
        const arr = aggregateQuarter(data, 'arr');
        const gm = aggregateQuarter(data, 'grossMargin');
        const ebitda = aggregateQuarter(data, 'ebitda');
        const cashBalance = aggregateQuarter(data, 'cashBalance');
        const cashBurn = aggregateQuarter(data, 'cashBurn');
        const hcM = aggregateQuarter(data, 'headcountMale') ?? 0;
        const hcF = aggregateQuarter(data, 'headcountFemale') ?? 0;
        const hcE = aggregateQuarter(data, 'headcountEthnicMinority') ?? 0;

        const metrics = [
          { label: 'Revenue', value: revenue != null ? formatCurrency(revenue, company.currency) : '—', source: 'Founder Form', when: 'Q4 2025/26' },
          { label: 'ARR', value: arr != null ? formatCurrency(arr, company.currency) : '—', source: 'Founder Form', when: 'M3 of Q4' },
          { label: 'Gross Margin', value: gm != null ? gm + '%' : '—', source: 'Founder Form', when: 'Q4 derived' },
          { label: 'EBITDA', value: ebitda != null ? formatCurrency(ebitda, company.currency) : '—', red: (ebitda ?? 0) < 0, source: 'Founder Form', when: 'Q4 sum' },
          { label: 'Cash Balance', value: cashBalance != null ? formatCurrency(cashBalance, company.currency) : '—', source: 'Founder Form', when: 'M3 of Q4' },
          { label: 'Cash Burn', value: cashBurn != null ? formatCurrency(cashBurn, company.currency) : '—', red: true, source: 'Founder Form', when: 'Q4 sum' },
          { label: 'Headcount — M', value: String(hcM), source: 'Founder Form', when: 'M3 of Q4' },
          { label: 'Headcount — F', value: String(hcF), source: 'Founder Form', when: 'M3 of Q4' },
          { label: 'Headcount — EM', value: String(hcE), source: 'Founder Form', when: 'M3 of Q4' },
        ];
        return (
          <div className="bg-white rounded-xl border border-border/60 p-1 mb-6">
            <div className="grid grid-cols-9 divide-x divide-border stagger-children">
              {metrics.map(m => (
                <div key={m.label} className="px-3 py-3 text-center group/m relative">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 leading-tight">{m.label}</p>
                  <p className={`text-[16px] font-mono-num font-bold mt-1 ${m.red ? 'text-red-600' : 'text-foreground'}`}>{m.value}</p>
                  <span className="invisible group-hover/m:visible absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-foreground text-white text-[10px] font-normal rounded-lg shadow-lg px-3 py-2 whitespace-nowrap text-left pointer-events-none">
                    <div className="text-background/70">Source: <span className="font-medium text-background">{m.source}</span></div>
                    <div className="text-background/55">{m.when}</div>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ===== ZONE 3: Alert Banner (conditional) ===== */}
      {!isM1 && companyFlags.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-[13px] font-medium text-amber-900">{companyFlags[0].headline}</p>
              {companyFlags[0].suggestedAction && (
                <p className="text-[12px] text-amber-700 mt-0.5">{companyFlags[0].suggestedAction}</p>
              )}
            </div>
            <FlagActionDropdown flag={companyFlags[0]} variant="button" />
            {companyFlags.length > 1 && (
              <button
                onClick={() => setShowAllFlags(!showAllFlags)}
                className="text-[12px] text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1"
              >
                {showAllFlags ? 'Hide' : `+${companyFlags.length - 1} more`}
                <ChevronDown className={`w-3 h-3 transition-transform ${showAllFlags ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          {showAllFlags && companyFlags.slice(1).map(flag => (
            <div key={flag.id} className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 flex items-center gap-3">
              <FlagIcon type={flag.type} size={16} />
              <div className="flex-1">
                <p className="text-[13px] text-amber-900">{flag.headline}</p>
                <p className="text-[12px] text-amber-700 mt-0.5">{flag.suggestedAction}</p>
              </div>
              <FlagActionDropdown flag={flag} variant="button" />
            </div>
          ))}
        </div>
      )}

      {/* ===== ZONE 4: Tabs + Content ===== */}
      {/* AI search bar removed — global Intelligence Hub on landing page handles this */}

      <div className="border-b border-border mb-6 flex gap-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============ Overview Tab ============ */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Investment Summary removed — descoped (no fund accounting data sources) */}

          {/* Two-column layout: Left = narrative + concerns, Right = activity + flags + todos */}
          <div className={`grid gap-5 ${isM1 ? 'grid-cols-1' : 'grid-cols-5'}`}>
          <div className={`space-y-4 ${isM1 ? '' : 'col-span-3'}`}>

            {/* Company Details */}
            <div className="bg-card rounded-md border border-border p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Company Details</h3>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><span className="text-muted-foreground/70">Legal Name:</span> <span className="ml-1 text-foreground">{company.name} Ltd</span></div>
                <div><span className="text-muted-foreground/70">Location:</span> <span className="ml-1 text-foreground">{company.location}</span></div>
                <div><span className="text-muted-foreground/70">Industry:</span> <span className="ml-1 text-foreground">{company.sector}</span></div>
                <div><span className="text-muted-foreground/70">Website:</span> <span className="ml-1 text-primary">{company.website}</span></div>
                <div><span className="text-muted-foreground/70">Management:</span> <span className="ml-1 text-foreground">{company.managementTeam}</span></div>
                <div><span className="text-muted-foreground/70">Crane Lead:</span> <span className="ml-1 text-foreground">{company.owners.join(', ')}</span></div>
                <div><span className="text-muted-foreground/70">Currency:</span> <span className="ml-1 text-foreground">{company.currency}</span></div>
                <div><span className="text-muted-foreground/70">Region:</span> <span className="ml-1 text-foreground">{company.region}</span></div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card rounded-md border border-border p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Description</h3>
              <p className="text-[13px] leading-relaxed text-foreground/80">{company.description}</p>
            </div>

            {/* Recent Progress */}
            {!isM1 && <div className="bg-card rounded-md border border-border p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Recent Progress</h3>
              <p className="text-[13px] leading-relaxed text-foreground/80">{company.recentProgress}</p>
            </div>}

            {/* Summary */}
            {!isM1 && <div className="bg-card rounded-md border border-border p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">Summary</h3>
              <p className="text-[13px] leading-relaxed text-foreground/80">{company.summary}</p>
            </div>}

            {/* Key Concerns */}
            {!isM1 && company.keyConcerns.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200/60 p-5">
                <h3 className="text-[13px] font-semibold text-amber-600 uppercase tracking-wider mb-2">Key Concerns</h3>
                <ul className="space-y-1.5">
                  {company.keyConcerns.map((c, i) => (
                    <li key={i} className="text-[13px] text-foreground/80 flex gap-2">
                      <span className="text-amber-500 font-mono-num shrink-0">{i + 1}.</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Points */}
            {!isM1 && company.actionPoints.length > 0 && (
              <div className="bg-white rounded-xl border border-primary/25/60 p-5">
                <h3 className="text-[13px] font-semibold text-primary uppercase tracking-wider mb-2">Action Points</h3>
                <ul className="space-y-1.5">
                  {company.actionPoints.map((a, i) => (
                    <li key={i} className="text-[13px] text-foreground/80 flex gap-2">
                      <span className="text-primary font-mono-num shrink-0">{i + 1}.</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exit Data */}
            {company.exitData && (
              <div className="bg-card rounded-md border border-border p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Exit Data</h3>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div><span className="text-muted-foreground/70">Exit Date:</span> <span className="ml-1 text-foreground">{company.exitData.exitDate}</span></div>
                  <div><span className="text-muted-foreground/70">Exit MoIC:</span> <span className="ml-1 font-mono-num font-semibold text-foreground">{company.exitData.exitMoIC.toFixed(1)}x</span></div>
                  {company.exitData.exitIRR && (
                    <div><span className="text-muted-foreground/70">Exit IRR:</span> <span className="ml-1 font-mono-num font-semibold text-foreground">{company.exitData.exitIRR}%</span></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Activity Timeline only (flags, todos, investment removed — descoped) */}
          {!isM1 && <div className="col-span-2 space-y-4">
            <div className="bg-card rounded-md border border-border/70 p-5">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70 mb-3 flex items-center gap-2">
                <Activity className="w-3 h-3" strokeWidth={1.6} /> Activity Timeline
              </h3>
              <div className="relative pl-4 space-y-3 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-px before:bg-border">
                {companyActivity.length > 0 ? companyActivity.map(event => (
                  <div key={event.id} className="relative">
                    <span className={`absolute -left-3.5 top-1 w-1.5 h-1.5 rounded-full ${
                      event.severity === 'high' ? 'bg-destructive' :
                      event.severity === 'medium' ? 'bg-[#B8763A]' :
                      'bg-muted-foreground/40'
                    }`} />
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[11px] font-medium text-foreground">{event.type}</span>
                      <span className="text-[11px] text-muted-foreground/70 font-mono-num">
                        {new Date(event.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground leading-snug">{event.title}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">{event.description}</p>
                  </div>
                )) : (
                  <p className="text-[12px] text-muted-foreground/70 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>}
          </div>
        </div>
      )}

      {/* ============ Metrics Tab ============ */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">

          {/* Latest Financials Summary */}
          {latestFin && (
            <div className="bg-card rounded-md border border-border p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Latest Financials</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Revenue</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-1">{formatCurrency(latestFin.revenue || 0, company.currency)}</p>
                </div>
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">COGS</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-1">{formatCurrency(latestFin.cogs || 0, company.currency)}</p>
                </div>
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Gross Profit</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-1">{formatCurrency(latestFin.grossProfit || 0, company.currency)}</p>
                </div>
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Gross Margin</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-1">{latestFin.grossMargin || 0}%</p>
                </div>
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">EBITDA</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-1">{formatCurrency(latestFin.ebitda || 0, company.currency)}</p>
                </div>
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">EBITDA Margin</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-1">{latestFin.ebitdaMargin || 0}%</p>
                </div>
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Cash Balance</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-1">{formatCurrency(latestFin.cashBalance || 0, company.currency)}</p>
                </div>
                <div className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Monthly Burn</p>
                  <p className="text-[18px] font-mono-num font-bold text-red-600 mt-1">{formatCurrency(latestFin.monthlyNetBurn || 0, company.currency)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Charts */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'arr', label: 'ARR', pyKey: 'arrPY' },
              { key: 'revenue', label: 'Revenue', pyKey: 'revenuePY' },
              { key: 'grossProfit', label: 'Gross Profit', pyKey: 'grossProfitPY' },
              { key: 'grossMargin', label: 'Gross Margin (%)', pyKey: 'grossMarginPY', isPct: true },
              { key: 'ebitda', label: 'EBITDA', pyKey: 'ebitdaPY' },
              { key: 'cashBurn', label: 'Cash Burn (Monthly)', pyKey: 'cashBurnPY' },
              { key: 'cashBalance', label: 'Cash Balance', pyKey: 'cashBalancePY' },
            ].map(chart => (
              <div key={chart.key} className="bg-card rounded-md border border-border p-5">
                <h3 className="text-[13px] font-medium text-foreground mb-2">{chart.label}</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D2" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} tickFormatter={v => chart.isPct ? `${v}%` : formatCurrency(v, company.currency)} />
                    <Tooltip
                      formatter={(v: number) => chart.isPct ? `${v}%` : formatCurrency(v, company.currency)}
                      cursor={{ fill: 'rgba(14, 23, 51, 0.04)' }}
                      contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E0D2', borderRadius: 8, fontSize: 11, fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 24px rgba(14, 23, 51, 0.07)', padding: '8px 10px' }}
                      labelStyle={{ color: '#6B675B', fontWeight: 500, marginBottom: 4 }}
                      itemStyle={{ color: '#0E1733', fontFamily: 'JetBrains Mono, monospace' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#6B675B', paddingTop: 8 }} iconType="square" iconSize={8} />
                    <Bar dataKey={chart.pyKey} fill="#D9CFB6" name="Prior Year" radius={[3, 3, 0, 0]} animationDuration={600} animationEasing="ease-out" />
                    <Bar dataKey={chart.key} fill="#0E1733" name="Current" radius={[3, 3, 0, 0]} animationDuration={600} animationEasing="ease-out" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}

            {/* Headcount */}
            <div className="bg-card rounded-md border border-border p-5">
              <h3 className="text-[13px] font-medium text-foreground mb-2">Headcount (FTE)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartMonths}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D2" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(14, 23, 51, 0.04)' }} contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E0D2', borderRadius: 8, fontSize: 11, fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 24px rgba(14, 23, 51, 0.07)', padding: '8px 10px' }} labelStyle={{ color: '#6B675B', fontWeight: 500 }} itemStyle={{ color: '#0E1733', fontFamily: 'JetBrains Mono, monospace' }} />
                  <Bar dataKey="headcount" fill="#0E1733" name="FTE" radius={[3, 3, 0, 0]} animationDuration={600} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diversity Metrics Section */}
          <div className="bg-card rounded-md border border-border p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Diversity Metrics</h3>
            {latestFin && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* FTE breakdown */}
                <div className="bg-muted/60 rounded-lg p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">FTE Headcount</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground/70">Male</span>
                      <span className="font-mono-num font-medium text-foreground">{latestFin.headcountMale || Math.round((latestFin.malePctFTE || 0) / 100 * (latestFin.headcountFTE || 0))}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${latestFin.malePctFTE || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground/70">Female</span>
                      <span className="font-mono-num font-medium text-foreground">{latestFin.headcountFemale || Math.round((latestFin.femalePctFTE || 0) / 100 * (latestFin.headcountFTE || 0))}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-[#8E5C2C] h-1.5 rounded-full" style={{ width: `${latestFin.femalePctFTE || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground/70">Ethnic Minority</span>
                      <span className="font-mono-num font-medium text-foreground">{latestFin.headcountEthnicMinority || Math.round((latestFin.ethnicMinorityPctFTE || 0) / 100 * (latestFin.headcountFTE || 0))}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-[#5C7A6E] h-1.5 rounded-full" style={{ width: `${latestFin.ethnicMinorityPctFTE || 0}%` }} />
                    </div>
                  </div>
                </div>
                {/* Board breakdown */}
                <div className="bg-muted/60 rounded-lg p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Board</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground/70">Male</span>
                      <span className="font-mono-num font-medium text-foreground">{latestFin.boardMale || Math.round((latestFin.malePctBoard || 0) / 100 * (latestFin.boardHeadcount || 0))}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${latestFin.malePctBoard || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground/70">Female</span>
                      <span className="font-mono-num font-medium text-foreground">{latestFin.boardFemale || Math.round((latestFin.femalePctBoard || 0) / 100 * (latestFin.boardHeadcount || 0))}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-[#8E5C2C] h-1.5 rounded-full" style={{ width: `${latestFin.femalePctBoard || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground/70">Ethnic Minority</span>
                      <span className="font-mono-num font-medium text-foreground">{latestFin.boardEthnicMinority || Math.round((latestFin.ethnicMinorityPctBoard || 0) / 100 * (latestFin.boardHeadcount || 0))}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-[#5C7A6E] h-1.5 rounded-full" style={{ width: `${latestFin.ethnicMinorityPctBoard || 0}%` }} />
                    </div>
                  </div>
                </div>
                {/* Percentage summary */}
                <div className="bg-muted/60 rounded-lg p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 mb-3">Percentages</p>
                  <div className="space-y-3 text-[12px]">
                    <div>
                      <div className="flex items-center justify-between text-muted-foreground/70">
                        <span>Female FTE</span>
                        <span className="font-mono-num font-medium text-foreground">{latestFin.femalePctFTE || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-muted-foreground/70">
                        <span>Female Board</span>
                        <span className="font-mono-num font-medium text-foreground">{latestFin.femalePctBoard || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-muted-foreground/70">
                        <span>Ethnic Min. FTE</span>
                        <span className="font-mono-num font-medium text-foreground">{latestFin.ethnicMinorityPctFTE || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-muted-foreground/70">
                        <span>Ethnic Min. Board</span>
                        <span className="font-mono-num font-medium text-foreground">{latestFin.ethnicMinorityPctBoard || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Diversity trend charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Gender Split FTE */}
              <div className="bg-card rounded-md border border-border p-5">
                <h3 className="text-[13px] font-medium text-foreground mb-2">Gender Split (FTE)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D2" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#6B675B', paddingTop: 8 }} iconType="square" iconSize={8} />
                    <Bar dataKey="femalePct" stackId="g" fill="#8E5C2C" name="Female %" />
                    <Bar dataKey="malePct" stackId="g" fill="#0E1733" name="Male %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gender Split Board */}
              <div className="bg-card rounded-md border border-border p-5">
                <h3 className="text-[13px] font-medium text-foreground mb-2">Gender Split (Board)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D2" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#6B675B', paddingTop: 8 }} iconType="square" iconSize={8} />
                    <Bar dataKey="femalePctBoard" stackId="g" fill="#8E5C2C" name="Female %" />
                    <Bar dataKey="malePctBoard" stackId="g" fill="#0E1733" name="Male %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Ethnic Minority FTE */}
              <div className="bg-card rounded-md border border-border p-5">
                <h3 className="text-[13px] font-medium text-foreground mb-2">Ethnic Minority (FTE)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths.map(m => ({ ...m, nonMinority: 100 - m.ethnicMinorityPct }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D2" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#6B675B', paddingTop: 8 }} iconType="square" iconSize={8} />
                    <Bar dataKey="ethnicMinorityPct" stackId="e" fill="#5C7A6E" name="Ethnic Minority %" />
                    <Bar dataKey="nonMinority" stackId="e" fill="#D9CFB6" name="Non-Minority %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Ethnic Minority Board */}
              <div className="bg-card rounded-md border border-border p-5">
                <h3 className="text-[13px] font-medium text-foreground mb-2">Ethnic Minority (Board)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths.map(m => ({ ...m, nonMinorityBoard: 100 - m.ethnicMinorityPctBoard }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D2" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B675B', fontFamily: 'JetBrains Mono, monospace' }} axisLine={{ stroke: '#E5E0D2' }} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#6B675B', paddingTop: 8 }} iconType="square" iconSize={8} />
                    <Bar dataKey="ethnicMinorityPctBoard" stackId="e" fill="#5C7A6E" name="Ethnic Minority %" />
                    <Bar dataKey="nonMinorityBoard" stackId="e" fill="#D9CFB6" name="Non-Minority %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Documents Tab ============ */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Search documents..." className="text-[13px] border border-border rounded-lg px-3 py-2 w-64 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" />
          </div>
          <div className="bg-white rounded-xl border border-border/60 divide-y divide-border/60">
            {mockDocuments.map((doc, i) => (
              <div key={i} className="p-4 flex items-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors">
                <FileText className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{doc.name}</p>
                  <p className="text-[11px] text-muted-foreground/70">{doc.type}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-muted rounded-md text-foreground/80">{doc.source}</span>
                <span className="text-[11px] text-muted-foreground/70">
                  {new Date(doc.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ Market Context Tab ============ */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-card rounded-md border border-border p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Sector Overview -- {company.sector}</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Funding (90d)', value: '\u00a3245M', trend: '+18% vs prev' },
                { label: 'Deal Count', value: '34', trend: 'Last 90 days' },
                { label: 'Avg Deal Size', value: '\u00a37.2M', trend: '+12% vs prev' },
                { label: 'Hiring Trend', value: '+8%', trend: 'Sector avg' },
              ].map(m => (
                <div key={m.label} className="bg-muted/60 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">{m.label}</p>
                  <p className="text-[18px] font-mono-num font-bold text-foreground mt-0.5">{m.value}</p>
                  <p className="text-[11px] text-muted-foreground/70">{m.trend}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-md border border-border p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Competitor Watch</h3>
            <div className="space-y-2">
              {[
                { name: 'CompetitorA', funding: '\u00a312M', headcount: 45, traffic: '+22%', status: 'Raised Series A' },
                { name: 'CompetitorB', funding: '\u00a35M', headcount: 18, traffic: '+8%', status: 'Expanding team' },
                { name: 'CompetitorC', funding: '\u00a33M', headcount: 12, traffic: '-5%', status: 'Quiet period' },
              ].map(comp => (
                <div key={comp.name} className="border border-border/60 rounded-lg p-3 flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-[12px] font-medium text-foreground">{comp.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-foreground">{comp.name}</p>
                    <p className="text-[11px] text-muted-foreground/70">{comp.status}</p>
                  </div>
                  <div className="text-[11px] text-right space-y-0.5 text-muted-foreground/70">
                    <p>Funding: <span className="font-mono-num text-foreground">{comp.funding}</span></p>
                    <p>Headcount: <span className="font-mono-num text-foreground">{comp.headcount}</span></p>
                    <p>Traffic: <span className="font-mono-num text-foreground">{comp.traffic}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============ Notes & Actions Tab ============ */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card rounded-md border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70">Notes</h3>
              <button onClick={() => setShowLogNote(true)} className="text-[12px] px-3 py-2 bg-primary text-white rounded-lg hover:bg-[var(--primary-muted)] transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> New Note
              </button>
            </div>
            <div className="space-y-2">
              {companyNotes.map((note) => (
                <div key={note.id} className="border border-border/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">{note.author[0]}</span>
                    <span className="text-[12px] font-medium text-foreground">{note.author}</span>
                    <span className="text-[10px] text-muted-foreground/70">{new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-accent text-primary rounded ml-auto">{note.tag}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground/70 whitespace-pre-line">{note.content}</p>
                </div>
              ))}
              {[
                { author: 'Anna', date: '2026-03-12', content: 'Strong quarter \u2014 enterprise traction picking up. Founder considering bringing on VP Sales.', tag: 'General' },
                { author: 'Scott', date: '2026-02-20', content: 'Discussed competitive landscape. Main threat is from larger players entering the space.', tag: 'Founder Check-in' },
                { author: 'Anna', date: '2026-01-15', content: 'Board went well. Agreed to extend runway planning horizon to 18 months.', tag: 'Board Prep' },
              ].map((note, i) => (
                <div key={`seed-${i}`} className="border border-border/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">{note.author[0]}</span>
                    <span className="text-[12px] font-medium text-foreground">{note.author}</span>
                    <span className="text-[10px] text-muted-foreground/70">{new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-muted text-foreground/80 rounded ml-auto">{note.tag}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground/70">{note.content}</p>
                </div>
              ))}
              {companyNotes.length === 0 && (
                <p className="text-[12px] text-muted-foreground/70 text-center py-4">
                  No notes yet. Click "Log Note" to start recording.
                </p>
              )}
            </div>
          </div>
          <div className="bg-card rounded-md border border-border p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-4">Pending Actions</h3>
            <div className="space-y-2">
              {companyTodos.map(todo => (
                <div key={todo.id} className={`border rounded-lg p-3 ${
                  new Date(todo.dueDate) < new Date() ? 'border-red-200 bg-red-50/30' : 'border-border/60'
                }`}>
                  <p className="text-[12px] text-foreground">{todo.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] ${new Date(todo.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-muted-foreground/70'}`}>
                      Due: {new Date(todo.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      todo.priority === 'high' ? 'bg-red-50 text-red-600' :
                      todo.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>{todo.priority}</span>
                    {todo.source === 'flag' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded">from alert</span>
                    )}
                  </div>
                </div>
              ))}
              {companyTodos.length === 0 && (
                <p className="text-[12px] text-muted-foreground/70 text-center py-4">No pending actions</p>
              )}
            </div>
            <button onClick={() => setShowNewTodo(true)}
              className="w-full mt-3 text-[12px] text-center py-2 border border-dashed border-border rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground/70 hover:text-foreground flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Add Action Item
            </button>
          </div>
        </div>
      )}

      {/* ============ Fundraising Tab ============ */}
      {activeTab === 'fundraising' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-card rounded-md border border-border p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Equity Fundraising</p>
              <p className="text-[15px] font-medium text-foreground mt-1">{company.equityFundraisingStatus}</p>
            </div>
            <div className="bg-card rounded-md border border-border p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Debt Fundraising</p>
              <p className="text-[15px] font-medium text-foreground mt-1">{company.debtFundraisingStatus}</p>
            </div>
            <div className="bg-card rounded-md border border-border p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Current Runway</p>
              <p className="text-[15px] font-mono-num font-medium text-foreground mt-1">{company.runway} months</p>
            </div>
            <div className="bg-card rounded-md border border-border p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Crane Follow-on</p>
              <p className="text-[15px] font-medium text-foreground mt-1">Under Review</p>
            </div>
          </div>
          <div className="bg-card rounded-md border border-border p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Fundraising Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground/70 w-24">{new Date(company.investmentDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                <span className="text-foreground">{company.stage} round closed -- {company.checkSize} from Crane</span>
              </div>
              {!isExited && (
                <>
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground/70 w-24">Feb 2026</span>
                    <span className="text-foreground">{company.equityFundraisingStatus}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
                    <span className="text-muted-foreground/70 w-24">Q3 2026</span>
                    <span className="text-muted-foreground/70">Expected raise window</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      <LogNoteModal open={showLogNote} onClose={() => setShowLogNote(false)} companyId={id} companyName={company.name} />
      <NewTodoModal open={showNewTodo} onClose={() => setShowNewTodo(false)} companyName={company.name} />
      <ScheduleCheckInModal open={showCheckIn} onClose={() => setShowCheckIn(false)} companyName={company.name} />
    </div>
  );
}
