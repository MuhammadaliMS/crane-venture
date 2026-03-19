import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, StickyNote, Plus, CalendarDays, RefreshCw, ExternalLink,
  FileText, Activity, Users
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

export function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogNote, setShowLogNote] = useState(false);
  const [showNewTodo, setShowNewTodo] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAllFlags, setShowAllFlags] = useState(false);
  const { flags, activityFeed, getNotesForCompany, todos } = useWorkflow();
  const company = companies.find(c => c.id === id);
  if (!company) return <div className="p-8 text-center">Company not found</div>;

  const companyFlags = flags.filter(f => f.companyId === id);
  const companyActivity = activityFeed.filter(a => a.companyName === company.name);
  const companyNotes = getNotesForCompany(id || '');
  const companyTodos = todos.filter(t => t.companyName === company.name && !t.completed);
  const isExited = company.lifecycle === 'Exited' || company.lifecycle === 'Wound Down';

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'metrics', label: 'Metrics & Charts' },
    { id: 'documents', label: 'Documents' },
    { id: 'market', label: 'Market Context' },
    { id: 'notes', label: 'Notes & Actions' },
    { id: 'fundraising', label: 'Fundraising' },
  ];

  // Build chart data from monthly financials
  const fin = company.monthlyFinancials;
  const last12 = fin.slice(-12);
  // Build PY data (simulate prior year as 80% of current)
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

  const mockNotes = [
    { author: 'Anna', date: '2026-03-12', content: 'Strong quarter — enterprise traction picking up. Founder considering bringing on VP Sales.', tag: 'General' },
    { author: 'Scott', date: '2026-02-20', content: 'Discussed competitive landscape. Main threat is from larger players entering the space.', tag: 'Founder Check-in' },
    { author: 'Anna', date: '2026-01-15', content: 'Board went well. Agreed to extend runway planning horizon to 18 months.', tag: 'Board Prep' },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-[22px]" style={{ background: company.logoColor }}>
            {company.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[20px]">{company.name}</h1>
              <span className="text-[12px] px-2 py-0.5 bg-muted rounded-md">{company.stage}</span>
              <span className="text-[12px] px-2 py-0.5 bg-muted rounded-md">{company.sector}</span>
              <span className="text-[12px] px-2 py-0.5 bg-muted rounded-md">{company.fund}</span>
              {isExited && (
                <span className="text-[11px] px-2 py-0.5 bg-gray-200 rounded-md">{company.lifecycle}</span>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground mb-3">{company.description}</p>
            <div className="flex items-center gap-4 text-[12px] text-muted-foreground flex-wrap">
              <span>Cost: {formatCurrency(company.accounting.costAtPeriodEnd)}</span>
              <span>Carrying: {formatCurrency(company.accounting.carryingValue)}</span>
              <span className={`px-1.5 py-0.5 rounded ${
                company.accounting.moic >= 2 ? 'bg-emerald-100 text-emerald-700' :
                company.accounting.moic >= 1 ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {company.accounting.moic.toFixed(1)}x MoIC
              </span>
              <span>Ownership: {company.ownership}</span>
              {company.exitData && (
                <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                  Exited {company.exitData.exitDate} · {company.exitData.exitMoIC.toFixed(1)}x
                  {company.exitData.exitIRR && ` · ${company.exitData.exitIRR}% IRR`}
                </span>
              )}
            </div>
            {/* 4-Quarter RAG Strip */}
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-muted-foreground">RAG Status:</span>
              {company.ragHistory.map((rag, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ background: getRAGColor(rag) }} title={`Q${i + 1}: ${rag}`} />
                  <span className="text-[9px] text-muted-foreground">Q{i + 1}</span>
                </div>
              ))}
              <div className="w-5 h-5 rounded-full border-2 border-primary shadow-sm ml-1" style={{ background: getRAGColor(company.rag) }} title={`Current: ${company.rag}`} />
              <span className="text-[10px]">{company.rag}</span>
            </div>
          </div>
          {!isExited && (
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setShowLogNote(true)} className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                <StickyNote className="w-3 h-3" /> Log Note
              </button>
              <button onClick={() => setShowNewTodo(true)} className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> To-Do
              </button>
              <button onClick={() => setShowCheckIn(true)} className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Check-in
              </button>
              <button className="text-[12px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                onClick={() => navigate('/board-prep')}>
                <FileText className="w-3 h-3" /> Board Prep
              </button>
              <a href="https://app.attio.com" target="_blank" rel="noopener noreferrer" className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Attio
              </a>
            </div>
          )}
        </div>

        {companyFlags.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
              <FlagIcon type={companyFlags[0].type} size={18} />
              <div className="flex-1">
                <p className="text-[13px]">{companyFlags[0].headline}</p>
              </div>
              <FlagActionDropdown flag={companyFlags[0]} variant="button" />
              {companyFlags.length > 1 && (
                <button onClick={() => setShowAllFlags(!showAllFlags)} className="text-[12px] text-amber-700 hover:underline">
                  {showAllFlags ? 'Hide' : `+${companyFlags.length - 1} more`}
                </button>
              )}
            </div>
            {showAllFlags && companyFlags.slice(1).map(flag => (
              <div key={flag.id} className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-3 flex items-center gap-3">
                <FlagIcon type={flag.type} size={16} />
                <div className="flex-1">
                  <p className="text-[13px]">{flag.headline}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{flag.suggestedAction}</p>
                </div>
                <FlagActionDropdown flag={flag} variant="button" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-4 flex gap-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab — LP Report Page 1 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-4">
            {/* Company Details (LP Report style) */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-3">Company Details</h3>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div><span className="text-muted-foreground">Legal Name:</span> <span className="ml-1">{company.name} Ltd</span></div>
                <div><span className="text-muted-foreground">Location:</span> <span className="ml-1">{company.location}</span></div>
                <div><span className="text-muted-foreground">Industry:</span> <span className="ml-1">{company.sector}</span></div>
                <div><span className="text-muted-foreground">Website:</span> <span className="ml-1 text-primary">{company.website}</span></div>
                <div><span className="text-muted-foreground">Management:</span> <span className="ml-1">{company.managementTeam}</span></div>
                <div><span className="text-muted-foreground">Crane Lead:</span> <span className="ml-1">{company.owner}</span></div>
                <div><span className="text-muted-foreground">Currency:</span> <span className="ml-1">{company.currency}</span></div>
                <div><span className="text-muted-foreground">Region:</span> <span className="ml-1">{company.region}</span></div>
              </div>
            </div>

            {/* Company Description */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
              <p className="text-[13px]">{company.description}</p>
            </div>

            {/* Recent Progress */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-2">Recent Progress</h3>
              <p className="text-[13px]">{company.recentProgress}</p>
            </div>

            {/* Summary */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-2">Summary</h3>
              <p className="text-[13px]">{company.summary}</p>
            </div>

            {/* Key Concerns */}
            {company.keyConcerns.length > 0 && (
              <div className="bg-card border border-amber-200 rounded-xl p-4">
                <h3 className="text-[13px] text-amber-700 uppercase tracking-wider mb-2">Key Concerns</h3>
                <ul className="space-y-1">
                  {company.keyConcerns.map((c, i) => (
                    <li key={i} className="text-[13px]">{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Points */}
            {company.actionPoints.length > 0 && (
              <div className="bg-card border border-blue-200 rounded-xl p-4">
                <h3 className="text-[13px] text-blue-700 uppercase tracking-wider mb-2">Action Points</h3>
                <ul className="space-y-1">
                  {company.actionPoints.map((a, i) => (
                    <li key={i} className="text-[13px]">{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Investment Data */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] text-muted-foreground uppercase tracking-wider mb-3">Investment Data</h3>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div><span className="text-muted-foreground">Cost:</span> <span className="ml-1">{formatCurrency(company.accounting.costAtPeriodEnd)}</span></div>
                <div><span className="text-muted-foreground">Carrying Value:</span> <span className="ml-1">{formatCurrency(company.accounting.carryingValue)}</span></div>
                <div><span className="text-muted-foreground">MoIC:</span> <span className="ml-1">{company.accounting.moic.toFixed(2)}x</span></div>
                <div><span className="text-muted-foreground">NAV Uplift:</span> <span className="ml-1">{formatCurrency(company.accounting.navUplift)}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground">Valuation Basis:</span> <span className="ml-1">{company.accounting.valuationBasis}</span></div>
                <div><span className="text-muted-foreground">Equity Fundraising:</span> <span className="ml-1">{company.equityFundraisingStatus}</span></div>
                <div><span className="text-muted-foreground">Debt Fundraising:</span> <span className="ml-1">{company.debtFundraisingStatus}</span></div>
                <div><span className="text-muted-foreground">Burn Reduction:</span> <span className="ml-1">{company.burnReductionActions}</span></div>
                <div><span className="text-muted-foreground">Near-Term Exit:</span> <span className="ml-1">{company.nearTermExit}</span></div>
              </div>
            </div>
          </div>

          {/* Right: Activity Timeline */}
          <div className="col-span-2">
            <h3 className="text-[13px] mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Activity Timeline
            </h3>
            <div className="space-y-2">
              {companyActivity.length > 0 ? companyActivity.map(event => (
                <div key={event.id} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      event.severity === 'high' ? 'bg-red-100 text-red-700' :
                      event.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{event.type}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(event.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-[12px]">{event.title}</p>
                  <p className="text-[11px] text-muted-foreground">{event.description}</p>
                </div>
              )) : (
                <p className="text-[12px] text-muted-foreground text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Tab — LP Report Page 2 */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          {/* Header Strip */}
          {latestFin && (
            <div className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-4 text-[12px] flex-wrap">
                <span className="text-muted-foreground">Currency: <span className="text-foreground">{company.currency}</span></span>
                <span className="text-muted-foreground">ARR: <span className="text-foreground">{formatCurrency(latestFin.arr || 0, company.currency)}</span></span>
                <span className="text-muted-foreground">Revenue: <span className="text-foreground">{formatCurrency(latestFin.revenue || 0, company.currency)}</span></span>
                <span className="text-muted-foreground">COGS: <span className="text-foreground">{formatCurrency(latestFin.cogs || 0, company.currency)}</span></span>
                <span className="text-muted-foreground">GP: <span className="text-foreground">{latestFin.grossMargin}%</span></span>
                <span className="text-muted-foreground">EBITDA: <span className="text-foreground">{formatCurrency(latestFin.ebitda || 0, company.currency)}</span></span>
                <span className="text-muted-foreground">FTE: <span className="text-foreground">{latestFin.headcountFTE}</span></span>
              </div>
            </div>
          )}

          {/* Financial Charts with PY overlay */}
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
              <div key={chart.key} className="bg-card border border-border rounded-xl p-4">
                <h3 className="text-[13px] mb-2">{chart.label}</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartMonths}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => chart.isPct ? `${v}%` : formatCurrency(v, company.currency)} />
                    <Tooltip formatter={(v: number) => chart.isPct ? `${v}%` : formatCurrency(v, company.currency)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey={chart.pyKey} fill="#CBD5E1" name="Prior Year" radius={[2, 2, 0, 0]} />
                    <Bar dataKey={chart.key} fill="#3B82F6" name="Current" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}

            {/* Headcount */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] mb-2">Headcount (FTE)</h3>
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

          {/* Diversity Charts */}
          <h3 className="text-[14px] mt-2">Diversity Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Gender Split FTE */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] mb-2">Gender Split (FTE)</h3>
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
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] mb-2">Gender Split (Board)</h3>
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
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] mb-2">Ethnic Minority (FTE)</h3>
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
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-[13px] mb-2">Ethnic Minority (Board)</h3>
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
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input type="text" placeholder="Search documents..." className="text-[12px] border border-border rounded-lg px-3 py-1.5 w-64 bg-card" />
          </div>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {mockDocuments.map((doc, i) => (
              <div key={i} className="p-3 flex items-center gap-3 hover:bg-muted/20 cursor-pointer">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]">{doc.name}</p>
                  <p className="text-[11px] text-muted-foreground">{doc.type}</p>
                </div>
                <span className="text-[11px] px-2 py-0.5 bg-muted rounded-md">{doc.source}</span>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(doc.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[13px] mb-3">Sector Overview — {company.sector}</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Funding (90d)', value: '£245M', trend: '+18% vs prev' },
                { label: 'Deal Count', value: '34', trend: 'Last 90 days' },
                { label: 'Avg Deal Size', value: '£7.2M', trend: '+12% vs prev' },
                { label: 'Hiring Trend', value: '+8%', trend: 'Sector avg' },
              ].map(m => (
                <div key={m.label} className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  <p className="text-[16px]">{m.value}</p>
                  <p className="text-[11px] text-muted-foreground">{m.trend}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[13px] mb-3">Competitor Watch</h3>
            <div className="space-y-2">
              {[
                { name: 'CompetitorA', funding: '£12M', headcount: 45, traffic: '+22%', status: 'Raised Series A' },
                { name: 'CompetitorB', funding: '£5M', headcount: 18, traffic: '+8%', status: 'Expanding team' },
                { name: 'CompetitorC', funding: '£3M', headcount: 12, traffic: '-5%', status: 'Quiet period' },
              ].map(comp => (
                <div key={comp.name} className="border border-border rounded-lg p-3 flex items-center gap-4">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-[12px]">{comp.name[0]}</div>
                  <div className="flex-1">
                    <p className="text-[13px]">{comp.name}</p>
                    <p className="text-[11px] text-muted-foreground">{comp.status}</p>
                  </div>
                  <div className="text-[11px] text-right space-y-0.5">
                    <p>Funding: {comp.funding}</p>
                    <p>Headcount: {comp.headcount}</p>
                    <p>Traffic: {comp.traffic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-medium">Notes</h3>
              <button onClick={() => setShowLogNote(true)} className="text-[12px] px-3 py-1 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
                <Plus className="w-3 h-3" /> New Note
              </button>
            </div>
            <div className="space-y-2">
              {/* Real notes from WorkflowContext */}
              {companyNotes.map((note) => (
                <div key={note.id} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">{note.author[0]}</span>
                    <span className="text-[12px] font-medium">{note.author}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded ml-auto">{note.tag}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground whitespace-pre-line">{note.content}</p>
                </div>
              ))}
              {/* Static seed notes */}
              {[
                { author: 'Anna', date: '2026-03-12', content: 'Strong quarter — enterprise traction picking up. Founder considering bringing on VP Sales.', tag: 'General' },
                { author: 'Scott', date: '2026-02-20', content: 'Discussed competitive landscape. Main threat is from larger players entering the space.', tag: 'Founder Check-in' },
                { author: 'Anna', date: '2026-01-15', content: 'Board went well. Agreed to extend runway planning horizon to 18 months.', tag: 'Board Prep' },
              ].map((note, i) => (
                <div key={`seed-${i}`} className="bg-card border border-border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">{note.author[0]}</span>
                    <span className="text-[12px]">{note.author}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(note.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded ml-auto">{note.tag}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">{note.content}</p>
                </div>
              ))}
              {companyNotes.length === 0 && (
                <p className="text-[12px] text-muted-foreground text-center py-4">
                  No notes yet. Click "Log Note" to start recording.
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-[13px] font-medium mb-3">Pending Actions</h3>
            <div className="space-y-2">
              {companyTodos.map(todo => (
                <div key={todo.id} className={`bg-card border rounded-lg p-3 ${
                  new Date(todo.dueDate) < new Date() ? 'border-red-200 bg-red-50/30' : 'border-border'
                }`}>
                  <p className="text-[12px]">{todo.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] ${new Date(todo.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
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
                <p className="text-[12px] text-muted-foreground text-center py-4">No pending actions</p>
              )}
            </div>
            <button onClick={() => setShowNewTodo(true)}
              className="w-full mt-3 text-[12px] text-center py-2 border border-dashed border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" /> Add Action Item
            </button>
          </div>
        </div>
      )}

      {activeTab === 'fundraising' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[11px] text-muted-foreground">Equity Fundraising</p>
              <p className="text-[14px] mt-1">{company.equityFundraisingStatus}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[11px] text-muted-foreground">Debt Fundraising</p>
              <p className="text-[14px] mt-1">{company.debtFundraisingStatus}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[11px] text-muted-foreground">Current Runway</p>
              <p className="text-[14px] mt-1">{company.runway} months</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-[11px] text-muted-foreground">Crane Follow-on</p>
              <p className="text-[14px] mt-1">Under Review</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[13px] mb-3">Fundraising Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[12px]">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground w-20">{new Date(company.investmentDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                <span>{company.stage} round closed — {company.checkSize} from Crane</span>
              </div>
              {!isExited && (
                <>
                  <div className="flex items-center gap-3 text-[12px]">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-muted-foreground w-20">Feb 2026</span>
                    <span>{company.equityFundraisingStatus}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[12px]">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-muted-foreground w-20">Q3 2026</span>
                    <span className="text-muted-foreground">Expected raise window</span>
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
