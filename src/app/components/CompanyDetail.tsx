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
import { aggregateQuarter } from './quarterlyAggregation';

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
  const stalenessColor = daysSinceUpdate > 30 ? 'text-red-400' : daysSinceUpdate > 14 ? 'text-amber-400' : 'text-slate-400';
  const stalenessLabel = daysSinceUpdate > 30 ? 'Stale' : daysSinceUpdate > 14 ? 'Aging' : '';

  // Computed ARR
  const computedARR = company.mrr * 12;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[14px] text-slate-400 hover:text-white mb-3 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Portfolio
      </button>

      {/* ===== ZONE 1: Dark Gradient Hero Header ===== */}
      <div className="bg-gradient-to-r from-[#0f0f12] to-[#1a1a2e] text-white rounded-xl p-6 mb-6 animate-fade-in-up">
        <div className="flex items-start justify-between">
          {/* Left: Avatar + Info */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[20px] font-semibold shrink-0"
              style={{ background: company.logoColor }}
            >
              {company.name[0]}
            </div>
            <div>
              <h1 className="text-[24px] font-semibold tracking-tight text-white leading-tight">
                {company.name}
              </h1>
              <p className="text-[14px] text-slate-300 mt-0.5 max-w-xl">{company.description}</p>
              {/* Badges */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="bg-white/10 text-white/80 text-[12px] px-2.5 py-1 rounded-md">{company.stage}</span>
                <span className="bg-white/10 text-white/80 text-[12px] px-2.5 py-1 rounded-md">{company.sector}</span>
                {isExited && (
                  <span className="bg-white/10 text-white/60 text-[12px] px-2.5 py-1 rounded-md">{company.lifecycle}</span>
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
                <span className="text-[13px] text-slate-300">{company.rag}</span>
              </div>

              {/* Action Type Badge */}
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-md"
                style={{
                  background: getActionColor(company.action) + '22',
                  color: getActionColor(company.action),
                  border: `1px solid ${getActionColor(company.action)}44`,
                }}
              >
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
          <div className="bg-white rounded-xl border border-slate-200/60 p-1 mb-6">
            <div className="grid grid-cols-9 divide-x divide-slate-200 stagger-children">
              {metrics.map(m => (
                <div key={m.label} className="px-3 py-3 text-center group/m relative">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 leading-tight">{m.label}</p>
                  <p className={`text-[16px] font-mono-num font-bold mt-1 ${m.red ? 'text-red-600' : 'text-slate-700'}`}>{m.value}</p>
                  <span className="invisible group-hover/m:visible absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] font-normal rounded-lg shadow-lg px-3 py-2 whitespace-nowrap text-left pointer-events-none">
                    <div>Source: <span className="font-medium text-white">{m.source}</span></div>
                    <div className="text-slate-300">{m.when}</div>
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
      {/* AI search — streaming single-response */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Ask anything about ${company.name}...`}
            className="w-full pl-10 pr-20 py-2.5 text-[13px] border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-shadow"
            onKeyDown={e => {
              if (e.key === 'Enter' && searchQuery.trim() && !searchStreaming) {
                const fullResponse = `Based on the latest quarterly data, ${company.name}'s ARR is ${formatCurrency(company.mrr * 12, company.currency)} with a current cash runway of ${company.runway} months. The company is rated ${company.rag} status. Recent founder updates indicate continued momentum on customer acquisition, with the team flagging ${companyFlags.length > 0 ? `${companyFlags.length} active concern${companyFlags.length === 1 ? '' : 's'} this quarter` : 'no major concerns this quarter'}. Cash burn is approximately ${formatCurrency(company.burn, company.currency)} per month against a balance from the latest founder submission.`;
                setSearchResponse('');
                setSearchSources([
                  { source: 'Founder Form', date: 'Q1 2026 submission' },
                  { source: 'Granola transcript', date: 'Board call · 3 days ago' },
                  { source: 'Gmail thread', date: 'Latest founder update · 1 week ago' },
                ]);
                setSearchStreaming(true);
                // Stream characters one by one
                let i = 0;
                const stream = setInterval(() => {
                  i += 4;
                  setSearchResponse(fullResponse.slice(0, i));
                  if (i >= fullResponse.length) {
                    clearInterval(stream);
                    setSearchStreaming(false);
                  }
                }, 20);
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">AI</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
        </div>
        {(searchResponse || searchStreaming) && (
          <div className="mt-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {searchStreaming ? 'Generating answer…' : 'Answer'}
              </p>
              {!searchStreaming && (
                <button onClick={() => { setSearchResponse(''); setSearchQuery(''); setSearchSources([]); }} className="text-[11px] text-slate-400 hover:text-slate-600">Clear</button>
              )}
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              {searchResponse}
              {searchStreaming && <span className="inline-block w-1.5 h-3 bg-indigo-400 ml-0.5 animate-pulse align-middle" />}
            </p>
            {!searchStreaming && searchSources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-indigo-100">
                <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider mb-1.5">Sources</p>
                <div className="flex flex-wrap gap-1.5">
                  {searchSources.map((s, i) => (
                    <span key={i} className="text-[11px] bg-white border border-indigo-200 rounded-full px-2.5 py-1 text-slate-700">
                      <span className="font-medium text-indigo-600">{s.source}</span> · {s.date}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-b border-slate-200 mb-6 flex gap-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-foreground'
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
          {/* Investment Summary — full width (hidden in M1) */}
          {!isM1 && <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Investment Summary</h3>
            <div className="grid grid-cols-6 gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Investment Date</p>
                <p className="text-[14px] font-medium text-slate-700 mt-0.5">
                  {new Date(company.investmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Check Size</p>
                <p className="text-[14px] font-mono-num font-semibold text-slate-700 mt-0.5">{company.checkSize}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Valuation Basis</p>
                <p className="text-[14px] font-medium text-slate-700 mt-0.5">{company.accounting.valuationBasis}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">NAV Uplift</p>
                <p className="text-[14px] font-mono-num font-semibold text-slate-700 mt-0.5">{formatCurrency(company.accounting.navUplift, company.currency)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">MoIC</p>
                <p className="text-[14px] font-mono-num font-semibold text-slate-700 mt-0.5">{company.accounting.moic.toFixed(2)}x</p>
              </div>
              {company.accounting.followOnAmount && company.accounting.followOnAmount > 0 ? (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Follow-on</p>
                  <p className="text-[14px] font-mono-num font-semibold text-slate-700 mt-0.5">{formatCurrency(company.accounting.followOnAmount, company.currency)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Lifecycle</p>
                  <p className="text-[14px] font-medium text-slate-700 mt-0.5">{company.lifecycle}</p>
                </div>
              )}
            </div>
          </div>}

          {/* Two-column layout: Left = narrative + concerns, Right = activity + flags + todos */}
          <div className={`grid gap-5 ${isM1 ? 'grid-cols-1' : 'grid-cols-5'}`}>
          <div className={`space-y-4 ${isM1 ? '' : 'col-span-3'}`}>

            {/* Company Details */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Company Details</h3>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div><span className="text-slate-400">Legal Name:</span> <span className="ml-1 text-slate-700">{company.name} Ltd</span></div>
                <div><span className="text-slate-400">Location:</span> <span className="ml-1 text-slate-700">{company.location}</span></div>
                <div><span className="text-slate-400">Industry:</span> <span className="ml-1 text-slate-700">{company.sector}</span></div>
                <div><span className="text-slate-400">Website:</span> <span className="ml-1 text-indigo-600">{company.website}</span></div>
                <div><span className="text-slate-400">Management:</span> <span className="ml-1 text-slate-700">{company.managementTeam}</span></div>
                <div><span className="text-slate-400">Crane Lead:</span> <span className="ml-1 text-slate-700">{company.owners.join(', ')}</span></div>
                <div><span className="text-slate-400">Currency:</span> <span className="ml-1 text-slate-700">{company.currency}</span></div>
                <div><span className="text-slate-400">Region:</span> <span className="ml-1 text-slate-700">{company.region}</span></div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
              <p className="text-[13px] leading-relaxed text-slate-600">{company.description}</p>
            </div>

            {/* Recent Progress */}
            {!isM1 && <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Recent Progress</h3>
              <p className="text-[13px] leading-relaxed text-slate-600">{company.recentProgress}</p>
            </div>}

            {/* Summary */}
            {!isM1 && <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Summary</h3>
              <p className="text-[13px] leading-relaxed text-slate-600">{company.summary}</p>
            </div>}

            {/* Key Concerns */}
            {!isM1 && company.keyConcerns.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200/60 p-5">
                <h3 className="text-[13px] font-semibold text-amber-600 uppercase tracking-wider mb-2">Key Concerns</h3>
                <ul className="space-y-1.5">
                  {company.keyConcerns.map((c, i) => (
                    <li key={i} className="text-[13px] text-slate-600 flex gap-2">
                      <span className="text-amber-500 font-mono-num shrink-0">{i + 1}.</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Points */}
            {!isM1 && company.actionPoints.length > 0 && (
              <div className="bg-white rounded-xl border border-indigo-200/60 p-5">
                <h3 className="text-[13px] font-semibold text-indigo-600 uppercase tracking-wider mb-2">Action Points</h3>
                <ul className="space-y-1.5">
                  {company.actionPoints.map((a, i) => (
                    <li key={i} className="text-[13px] text-slate-600 flex gap-2">
                      <span className="text-indigo-500 font-mono-num shrink-0">{i + 1}.</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exit Data */}
            {company.exitData && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Exit Data</h3>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div><span className="text-slate-400">Exit Date:</span> <span className="ml-1 text-slate-700">{company.exitData.exitDate}</span></div>
                  <div><span className="text-slate-400">Exit MoIC:</span> <span className="ml-1 font-mono-num font-semibold text-slate-700">{company.exitData.exitMoIC.toFixed(1)}x</span></div>
                  {company.exitData.exitIRR && (
                    <div><span className="text-slate-400">Exit IRR:</span> <span className="ml-1 font-mono-num font-semibold text-slate-700">{company.exitData.exitIRR}%</span></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column: Activity + Flags + Todos + Investment Data (hidden in M1) */}
          {!isM1 && <div className="col-span-2 space-y-4">
            {/* Activity Timeline */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Activity Timeline
              </h3>
              <div className="space-y-2">
                {companyActivity.length > 0 ? companyActivity.map(event => (
                  <div key={event.id} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        event.severity === 'high' ? 'bg-red-100 text-red-700' :
                        event.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{event.type}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(event.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-700">{event.title}</p>
                    <p className="text-[11px] text-slate-400">{event.description}</p>
                  </div>
                )) : (
                  <p className="text-[12px] text-slate-400 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>

            {/* Active Flags */}
            {companyFlags.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200/60 p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-amber-600 mb-3">Active Flags</h3>
                <div className="space-y-2">
                  {companyFlags.map(flag => (
                    <div key={flag.id} className="flex items-start gap-3 border border-amber-100 rounded-lg p-3 bg-amber-50/30">
                      <FlagIcon type={flag.type} size={16} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            flag.urgency === 'high' ? 'bg-red-100 text-red-700' :
                            flag.urgency === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>{flag.urgency}</span>
                          <span className="text-[10px] text-slate-400">{flag.type}</span>
                        </div>
                        <p className="text-[13px] font-medium text-slate-700 mt-1">{flag.headline}</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">{flag.suggestedAction}</p>
                      </div>
                      <FlagActionDropdown flag={flag} variant="button" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open To-Dos */}
            {companyTodos.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <CheckSquare className="w-3.5 h-3.5" /> Open To-Dos
                </h3>
                <div className="space-y-2">
                  {companyTodos.map(todo => (
                    <div
                      key={todo.id}
                      className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                        new Date(todo.dueDate) < new Date() ? 'border-red-200 bg-red-50/30' : 'border-slate-100'
                      }`}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      <Square className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-700">{todo.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] ${new Date(todo.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-slate-400'}`}>
                            Due: {new Date(todo.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            todo.priority === 'high' ? 'bg-red-50 text-red-600' :
                            todo.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                            'bg-gray-50 text-gray-500'
                          }`}>{todo.priority}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Investment Data */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Investment Data</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-[12px] text-slate-400">Cost:</span> <span className="ml-1 text-[13px] font-semibold font-mono-num text-slate-700">{formatCurrency(company.accounting.costAtPeriodEnd)}</span></div>
                <div><span className="text-[12px] text-slate-400">Carrying Value:</span> <span className="ml-1 text-[13px] font-semibold font-mono-num text-slate-700">{formatCurrency(company.accounting.carryingValue)}</span></div>
                <div><span className="text-[12px] text-slate-400">MoIC:</span> <span className="ml-1 text-[13px] font-semibold font-mono-num text-slate-700">{company.accounting.moic.toFixed(2)}x</span></div>
                <div><span className="text-[12px] text-slate-400">NAV Uplift:</span> <span className="ml-1 text-[13px] font-semibold font-mono-num text-slate-700">{formatCurrency(company.accounting.navUplift)}</span></div>
                <div className="col-span-2"><span className="text-[12px] text-slate-400">Valuation Basis:</span> <span className="ml-1 text-[13px] font-medium text-slate-700">{company.accounting.valuationBasis}</span></div>
              </div>
              <div className="border-t border-slate-100 mt-3 pt-3 grid grid-cols-1 gap-2">
                <div><span className="text-[12px] text-slate-400">Equity Fundraising:</span> <span className="ml-1 text-[12px] text-slate-600">{company.equityFundraisingStatus}</span></div>
                <div><span className="text-[12px] text-slate-400">Debt Fundraising:</span> <span className="ml-1 text-[12px] text-slate-600">{company.debtFundraisingStatus}</span></div>
                <div><span className="text-[12px] text-slate-400">Burn Reduction:</span> <span className="ml-1 text-[12px] text-slate-600">{company.burnReductionActions}</span></div>
                <div><span className="text-[12px] text-slate-400">Near-Term Exit:</span> <span className="ml-1 text-[12px] text-slate-600">{company.nearTermExit}</span></div>
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
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Latest Financials</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Revenue</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-1">{formatCurrency(latestFin.revenue || 0, company.currency)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">COGS</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-1">{formatCurrency(latestFin.cogs || 0, company.currency)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Gross Profit</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-1">{formatCurrency(latestFin.grossProfit || 0, company.currency)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Gross Margin</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-1">{latestFin.grossMargin || 0}%</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">EBITDA</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-1">{formatCurrency(latestFin.ebitda || 0, company.currency)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">EBITDA Margin</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-1">{latestFin.ebitdaMargin || 0}%</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Cash Balance</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-1">{formatCurrency(latestFin.cashBalance || 0, company.currency)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Monthly Burn</p>
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
              <div key={chart.key} className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="text-[13px] font-medium text-slate-700 mb-2">{chart.label}</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => chart.isPct ? `${v}%` : formatCurrency(v, company.currency)} />
                    <Tooltip formatter={(v: number) => chart.isPct ? `${v}%` : formatCurrency(v, company.currency)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey={chart.pyKey} fill="#CBD5E1" name="Prior Year" radius={[2, 2, 0, 0]} />
                    <Bar dataKey={chart.key} fill="#6366f1" name="Current" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}

            {/* Headcount */}
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <h3 className="text-[13px] font-medium text-slate-700 mb-2">Headcount (FTE)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartMonths}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="headcount" fill="#8B5CF6" name="FTE" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Diversity Metrics Section */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Diversity Metrics</h3>
            {latestFin && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* FTE breakdown */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-3">FTE Headcount</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-400">Male</span>
                      <span className="font-mono-num font-medium text-slate-700">{latestFin.headcountMale || Math.round((latestFin.malePctFTE || 0) / 100 * (latestFin.headcountFTE || 0))}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${latestFin.malePctFTE || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-400">Female</span>
                      <span className="font-mono-num font-medium text-slate-700">{latestFin.headcountFemale || Math.round((latestFin.femalePctFTE || 0) / 100 * (latestFin.headcountFTE || 0))}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${latestFin.femalePctFTE || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-400">Ethnic Minority</span>
                      <span className="font-mono-num font-medium text-slate-700">{latestFin.headcountEthnicMinority || Math.round((latestFin.ethnicMinorityPctFTE || 0) / 100 * (latestFin.headcountFTE || 0))}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${latestFin.ethnicMinorityPctFTE || 0}%` }} />
                    </div>
                  </div>
                </div>
                {/* Board breakdown */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-3">Board</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-400">Male</span>
                      <span className="font-mono-num font-medium text-slate-700">{latestFin.boardMale || Math.round((latestFin.malePctBoard || 0) / 100 * (latestFin.boardHeadcount || 0))}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${latestFin.malePctBoard || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-400">Female</span>
                      <span className="font-mono-num font-medium text-slate-700">{latestFin.boardFemale || Math.round((latestFin.femalePctBoard || 0) / 100 * (latestFin.boardHeadcount || 0))}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${latestFin.femalePctBoard || 0}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-400">Ethnic Minority</span>
                      <span className="font-mono-num font-medium text-slate-700">{latestFin.boardEthnicMinority || Math.round((latestFin.ethnicMinorityPctBoard || 0) / 100 * (latestFin.boardHeadcount || 0))}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${latestFin.ethnicMinorityPctBoard || 0}%` }} />
                    </div>
                  </div>
                </div>
                {/* Percentage summary */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-3">Percentages</p>
                  <div className="space-y-3 text-[12px]">
                    <div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Female FTE</span>
                        <span className="font-mono-num font-medium text-slate-700">{latestFin.femalePctFTE || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Female Board</span>
                        <span className="font-mono-num font-medium text-slate-700">{latestFin.femalePctBoard || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Ethnic Min. FTE</span>
                        <span className="font-mono-num font-medium text-slate-700">{latestFin.ethnicMinorityPctFTE || 0}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Ethnic Min. Board</span>
                        <span className="font-mono-num font-medium text-slate-700">{latestFin.ethnicMinorityPctBoard || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Diversity trend charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Gender Split FTE */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="text-[13px] font-medium text-slate-700 mb-2">Gender Split (FTE)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="femalePct" stackId="g" fill="#EF4444" name="Female %" />
                    <Bar dataKey="malePct" stackId="g" fill="#8B5CF6" name="Male %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Gender Split Board */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="text-[13px] font-medium text-slate-700 mb-2">Gender Split (Board)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="femalePctBoard" stackId="g" fill="#EF4444" name="Female %" />
                    <Bar dataKey="malePctBoard" stackId="g" fill="#8B5CF6" name="Male %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Ethnic Minority FTE */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="text-[13px] font-medium text-slate-700 mb-2">Ethnic Minority (FTE)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths.map(m => ({ ...m, nonMinority: 100 - m.ethnicMinorityPct }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="ethnicMinorityPct" stackId="e" fill="#F59E0B" name="Ethnic Minority %" />
                    <Bar dataKey="nonMinority" stackId="e" fill="#CBD5E1" name="Non-Minority %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Ethnic Minority Board */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-5">
                <h3 className="text-[13px] font-medium text-slate-700 mb-2">Ethnic Minority (Board)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartMonths.map(m => ({ ...m, nonMinorityBoard: 100 - m.ethnicMinorityPctBoard }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="ethnicMinorityPctBoard" stackId="e" fill="#F59E0B" name="Ethnic Minority %" />
                    <Bar dataKey="nonMinorityBoard" stackId="e" fill="#CBD5E1" name="Non-Minority %" />
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
            <input type="text" placeholder="Search documents..." className="text-[13px] border border-slate-200 rounded-lg px-3 py-2 w-64 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 divide-y divide-slate-100">
            {mockDocuments.map((doc, i) => (
              <div key={i} className="p-4 flex items-center gap-3 hover:bg-slate-50/50 cursor-pointer transition-colors">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-700">{doc.name}</p>
                  <p className="text-[11px] text-slate-400">{doc.type}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">{doc.source}</span>
                <span className="text-[11px] text-slate-400">
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
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Sector Overview -- {company.sector}</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Funding (90d)', value: '\u00a3245M', trend: '+18% vs prev' },
                { label: 'Deal Count', value: '34', trend: 'Last 90 days' },
                { label: 'Avg Deal Size', value: '\u00a37.2M', trend: '+12% vs prev' },
                { label: 'Hiring Trend', value: '+8%', trend: 'Sector avg' },
              ].map(m => (
                <div key={m.label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{m.label}</p>
                  <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-0.5">{m.value}</p>
                  <p className="text-[11px] text-slate-400">{m.trend}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Competitor Watch</h3>
            <div className="space-y-2">
              {[
                { name: 'CompetitorA', funding: '\u00a312M', headcount: 45, traffic: '+22%', status: 'Raised Series A' },
                { name: 'CompetitorB', funding: '\u00a35M', headcount: 18, traffic: '+8%', status: 'Expanding team' },
                { name: 'CompetitorC', funding: '\u00a33M', headcount: 12, traffic: '-5%', status: 'Quiet period' },
              ].map(comp => (
                <div key={comp.name} className="border border-slate-100 rounded-lg p-3 flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[12px] font-medium text-slate-700">{comp.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-slate-700">{comp.name}</p>
                    <p className="text-[11px] text-slate-400">{comp.status}</p>
                  </div>
                  <div className="text-[11px] text-right space-y-0.5 text-slate-400">
                    <p>Funding: <span className="font-mono-num text-slate-700">{comp.funding}</span></p>
                    <p>Headcount: <span className="font-mono-num text-slate-700">{comp.headcount}</span></p>
                    <p>Traffic: <span className="font-mono-num text-slate-700">{comp.traffic}</span></p>
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
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400">Notes</h3>
              <button onClick={() => setShowLogNote(true)} className="text-[12px] px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> New Note
              </button>
            </div>
            <div className="space-y-2">
              {companyNotes.map((note) => (
                <div key={note.id} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">{note.author[0]}</span>
                    <span className="text-[12px] font-medium text-slate-700">{note.author}</span>
                    <span className="text-[10px] text-slate-400">{new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded ml-auto">{note.tag}</span>
                  </div>
                  <p className="text-[12px] text-slate-400 whitespace-pre-line">{note.content}</p>
                </div>
              ))}
              {[
                { author: 'Anna', date: '2026-03-12', content: 'Strong quarter \u2014 enterprise traction picking up. Founder considering bringing on VP Sales.', tag: 'General' },
                { author: 'Scott', date: '2026-02-20', content: 'Discussed competitive landscape. Main threat is from larger players entering the space.', tag: 'Founder Check-in' },
                { author: 'Anna', date: '2026-01-15', content: 'Board went well. Agreed to extend runway planning horizon to 18 months.', tag: 'Board Prep' },
              ].map((note, i) => (
                <div key={`seed-${i}`} className="border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">{note.author[0]}</span>
                    <span className="text-[12px] font-medium text-slate-700">{note.author}</span>
                    <span className="text-[10px] text-slate-400">{new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded ml-auto">{note.tag}</span>
                  </div>
                  <p className="text-[12px] text-slate-400">{note.content}</p>
                </div>
              ))}
              {companyNotes.length === 0 && (
                <p className="text-[12px] text-slate-400 text-center py-4">
                  No notes yet. Click "Log Note" to start recording.
                </p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Pending Actions</h3>
            <div className="space-y-2">
              {companyTodos.map(todo => (
                <div key={todo.id} className={`border rounded-lg p-3 ${
                  new Date(todo.dueDate) < new Date() ? 'border-red-200 bg-red-50/30' : 'border-slate-100'
                }`}>
                  <p className="text-[12px] text-slate-700">{todo.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] ${new Date(todo.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-slate-400'}`}>
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
                <p className="text-[12px] text-slate-400 text-center py-4">No pending actions</p>
              )}
            </div>
            <button onClick={() => setShowNewTodo(true)}
              className="w-full mt-3 text-[12px] text-center py-2 border border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-slate-700 flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Add Action Item
            </button>
          </div>
        </div>
      )}

      {/* ============ Fundraising Tab ============ */}
      {activeTab === 'fundraising' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Equity Fundraising</p>
              <p className="text-[15px] font-medium text-slate-700 mt-1">{company.equityFundraisingStatus}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Debt Fundraising</p>
              <p className="text-[15px] font-medium text-slate-700 mt-1">{company.debtFundraisingStatus}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Current Runway</p>
              <p className="text-[15px] font-mono-num font-medium text-slate-700 mt-1">{company.runway} months</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/60 p-5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Crane Follow-on</p>
              <p className="text-[15px] font-medium text-slate-700 mt-1">Under Review</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Fundraising Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[13px]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-400 w-24">{new Date(company.investmentDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                <span className="text-slate-700">{company.stage} round closed -- {company.checkSize} from Crane</span>
              </div>
              {!isExited && (
                <>
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-400 w-24">Feb 2026</span>
                    <span className="text-slate-700">{company.equityFundraisingStatus}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-slate-400 w-24">Q3 2026</span>
                    <span className="text-slate-400">Expected raise window</span>
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
