import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, StickyNote, Plus, CalendarDays, RefreshCw, ExternalLink,
  FileText, Activity, Users, MoreHorizontal, TrendingUp, TrendingDown,
  AlertTriangle, ChevronDown, Clock, CheckSquare, Square, Minus
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

export function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogNote, setShowLogNote] = useState(false);
  const [showNewTodo, setShowNewTodo] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAllFlags, setShowAllFlags] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
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

  const allTabs = [
    { id: 'overview', label: 'Overview', m1: true },
    { id: 'metrics', label: 'Metrics & Charts' },
    { id: 'documents', label: 'Documents' },
    { id: 'market', label: 'Market Context' },
    { id: 'notes', label: 'Notes & Actions' },
    { id: 'fundraising', label: 'Fundraising' },
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
                <span className="bg-white/10 text-white/80 text-[12px] px-2.5 py-1 rounded-md">{company.fund}</span>
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

            {/* Action buttons */}
            {!isExited && !isM1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogNote(true)}
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-2.5 transition-colors"
                  title="Log Note"
                >
                  <StickyNote className="w-4 h-4 text-white/80" />
                </button>
                <button
                  onClick={() => setShowNewTodo(true)}
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-2.5 transition-colors"
                  title="To-Do"
                >
                  <Plus className="w-4 h-4 text-white/80" />
                </button>
                <button
                  onClick={() => setShowCheckIn(true)}
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-2.5 transition-colors"
                  title="Schedule Check-in"
                >
                  <CalendarDays className="w-4 h-4 text-white/80" />
                </button>

                {/* More menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-2.5 transition-colors"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4 text-white/80" />
                  </button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[160px]">
                      <button
                        onClick={() => { navigate('/board-prep'); setShowMoreMenu(false); }}
                        className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Board Prep
                      </button>
                      <a
                        href="https://app.attio.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowMoreMenu(false)}
                        className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open in Attio
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== ZONE 2: Key Metrics Strip (2 rows of 5) ===== */}
      {!isM1 && <div className="bg-white rounded-xl border border-slate-200/60 p-1 mb-6">
        <div className="grid grid-cols-5 divide-x divide-slate-200 stagger-children">
          {/* Row 1 */}
          {/* Cost */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Cost</p>
            <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-0.5">{formatCurrency(company.accounting.costAtPeriodEnd)}</p>
          </div>
          {/* Carrying Value */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Carrying Value</p>
            <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-0.5">{formatCurrency(company.accounting.carryingValue)}</p>
          </div>
          {/* MoIC */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">MoIC</p>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-[18px] font-mono-num font-bold text-slate-700">{company.accounting.moic.toFixed(1)}x</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                company.accounting.moic >= 2 ? 'bg-emerald-100 text-emerald-700' :
                company.accounting.moic >= 1 ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {company.accounting.moic >= 2 ? 'Strong' : company.accounting.moic >= 1 ? 'On Track' : 'Below'}
              </span>
            </div>
          </div>
          {/* Ownership */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Ownership</p>
            <p className="text-[18px] font-mono-num font-bold text-slate-700 mt-0.5">{company.ownership}</p>
          </div>
          {/* MRR */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">MRR</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[18px] font-mono-num font-bold text-slate-700">{formatCurrency(company.mrr)}</span>
              {mrrUp ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
            </div>
          </div>
        </div>
        {/* Row 2 divider */}
        <div className="border-t border-slate-200" />
        <div className="grid grid-cols-5 divide-x divide-slate-200">
          {/* ARR */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">ARR</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[18px] font-mono-num font-bold text-slate-700">{formatCurrency(computedARR)}</span>
              {mrrUp ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
            </div>
          </div>
          {/* Runway */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Runway</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className={`text-[18px] font-mono-num font-bold ${company.runway <= 9 ? 'text-red-600' : 'text-slate-700'}`}>
                {company.runway}mo
              </span>
              {company.runway <= 9 && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
            </div>
          </div>
          {/* Customers */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Customers</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[18px] font-mono-num font-bold text-slate-700">{company.customers.toLocaleString()}</span>
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          {/* Burn */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Monthly Burn</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[18px] font-mono-num font-bold text-slate-700">{formatCurrency(company.burn, company.currency)}</span>
              {company.burn > 0 && <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
            </div>
          </div>
          {/* Headcount */}
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Headcount</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-[18px] font-mono-num font-bold text-slate-700">{company.headcount}</span>
              <Minus className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>
        </div>
      </div>}

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
              <button onClick={() => setShowLogNote(true)} className="text-[12px] px-3 py-1.5 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-1">
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
