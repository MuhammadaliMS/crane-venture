import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { ArrowUpRight, ArrowDownRight, Filter, Download, ChevronDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { SparklineChart } from './SparklineChart';
import { useFundFilter } from './Layout';
import {
  companies, funds, formatCurrency, getHealthColor, getRAGColor, getUpsideColor, getActionColor,
  type HealthStatus, type UpsideCategory, type Stage, type Fund
} from './mock-data';
import React from 'react';

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#6B7280'];

export function PortfolioCommandCenter() {
  const navigate = useNavigate();
  const { fundFilter: globalFund } = useFundFilter();
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'all'>('all');
  const [upsideFilter, setUpsideFilter] = useState<UpsideCategory | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');
  const [localFundFilter, setLocalFundFilter] = useState<Fund | 'all'>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [tableView, setTableView] = useState<'active' | 'exited' | 'all'>('active');
  const [sortField, setSortField] = useState<string>('action');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const effectiveFund = globalFund !== 'all' ? globalFund : localFundFilter;
  const selectedFund = effectiveFund !== 'all' ? funds.find(f => f.name === effectiveFund) : null;

  const filtered = useMemo(() => {
    let result = [...companies];
    // Table view filter
    if (tableView === 'active') result = result.filter(c => c.lifecycle === 'Active — Core' || c.lifecycle === 'Active — Non-core');
    else if (tableView === 'exited') result = result.filter(c => c.lifecycle === 'Exited' || c.lifecycle === 'Wound Down');

    if (healthFilter !== 'all') result = result.filter(c => c.health === healthFilter);
    if (upsideFilter !== 'all') result = result.filter(c => c.upside === upsideFilter);
    if (stageFilter !== 'all') result = result.filter(c => c.stage === stageFilter);
    if (effectiveFund !== 'all') result = result.filter(c => c.fund === effectiveFund);
    if (ownerFilter !== 'all') result = result.filter(c => c.owner === ownerFilter);

    const actionOrder: Record<string, number> = { 'Lean In': 0, 'Lean In / Anticipate': 1, 'Watch': 2, 'De-prioritise': 3 };
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'moic': cmp = a.accounting.moic - b.accounting.moic; break;
        case 'mrr': cmp = a.mrr - b.mrr; break;
        case 'runway': cmp = a.runway - b.runway; break;
        case 'action': cmp = (actionOrder[a.action] || 0) - (actionOrder[b.action] || 0); break;
        case 'lastUpdate': cmp = new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime(); break;
        default: cmp = 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [healthFilter, upsideFilter, stageFilter, effectiveFund, ownerFilter, sortField, sortDir, tableView]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const activeCore = companies.filter(c => c.lifecycle === 'Active — Core');
  const onTrack = activeCore.filter(c => c.health === 'On Track').length;
  const atRisk = activeCore.filter(c => c.health === 'At Risk').length;
  const underperforming = activeCore.filter(c => c.health === 'Underperforming').length;
  const nonCore = companies.filter(c => c.lifecycle === 'Active — Non-core').length;
  const exited = companies.filter(c => c.lifecycle === 'Exited').length;
  const woundDown = companies.filter(c => c.lifecycle === 'Wound Down').length;
  const avgRunway = Math.round(activeCore.reduce((s, c) => s + c.runway, 0) / (activeCore.length || 1));
  const recentlyUpdated = activeCore.filter(c => {
    const d = new Date(c.lastUpdate);
    return (new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  }).length;
  const stale = activeCore.length - recentlyUpdated;

  // Compact matrix counts
  const healthOrder: HealthStatus[] = ['On Track', 'At Risk', 'Underperforming'];
  const upsideOrder: UpsideCategory[] = ['High Potential', 'Emerging', 'Limited Potential'];
  const matrixColors: Record<string, string> = {
    'On Track_High Potential': '#3B82F6', 'At Risk_High Potential': '#F59E0B', 'Underperforming_High Potential': '#F59E0B',
    'On Track_Emerging': '#3B82F6', 'At Risk_Emerging': '#8B5CF6', 'Underperforming_Emerging': '#8B5CF6',
    'On Track_Limited Potential': '#8B5CF6', 'At Risk_Limited Potential': '#6B7280', 'Underperforming_Limited Potential': '#6B7280',
  };
  const matrixLabels: Record<string, string> = {
    'On Track_High Potential': 'Lean In', 'At Risk_High Potential': 'Anticipate', 'Underperforming_High Potential': 'Anticipate',
    'On Track_Emerging': 'Lean In', 'At Risk_Emerging': 'Watch', 'Underperforming_Emerging': 'Watch',
    'On Track_Limited Potential': 'Watch', 'At Risk_Limited Potential': 'De-pri', 'Underperforming_Limited Potential': 'De-pri',
  };

  const summaryCards = [
    { label: 'Active Core', value: activeCore.length, sub: `${nonCore} non-core`, color: '#3B82F6' },
    { label: 'Green', value: onTrack, color: '#10B981' },
    { label: 'Amber', value: atRisk, color: '#F59E0B' },
    { label: 'Red', value: underperforming, color: '#EF4444' },
    { label: 'Avg Runway', value: `${avgRunway}mo`, color: '#8B5CF6' },
    { label: 'Updated (30d)', value: recentlyUpdated, color: '#0EA5E9' },
    { label: 'Stale (30d+)', value: stale, color: stale > 0 ? '#EF4444' : '#10B981' },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Fund Performance Panel — appears when a fund is selected */}
      {selectedFund && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              {selectedFund.name} Performance
              <span className="text-[11px] text-muted-foreground ml-2">Vintage {selectedFund.vintage} · {selectedFund.accountingBasis}</span>
            </h2>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: 'TVPI (Net)', value: `${selectedFund.tvpiNet}x`, trend: `${selectedFund.tvpiGross}x gross` },
              { label: 'DPI', value: `${selectedFund.dpi}x`, trend: 'Distributions / Paid-in' },
              { label: 'NAV', value: formatCurrency(selectedFund.navCurrent), trend: `vs ${formatCurrency(selectedFund.navPrior)} prior` },
              { label: 'Committed', value: formatCurrency(selectedFund.totalCommitted), trend: `${selectedFund.currency}` },
              { label: 'Deployed', value: `${selectedFund.deployedPct}%`, trend: formatCurrency(selectedFund.deployed) },
              { label: 'Available', value: formatCurrency(selectedFund.availableForDeployment), trend: 'For deployment' },
            ].map(m => (
              <div key={m.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-[11px] text-muted-foreground">{m.label}</p>
                <p className="text-[18px]">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.trend}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* TVPI/DPI Trend */}
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground mb-2">TVPI / DPI Trend</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={selectedFund.tvpiHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 9 }} interval={2} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="tvpiFund" stroke="#3B82F6" strokeWidth={2} dot={false} name="TVPI (Fund)" />
                  <Line type="monotone" dataKey="tvpiNet" stroke="#10B981" strokeWidth={2} dot={false} name="TVPI (Net)" />
                  <Line type="monotone" dataKey="dpi" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="DPI" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* NAV Waterfall */}
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground mb-2">NAV Waterfall</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={selectedFund.navWaterfall}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 8 }} interval={0} angle={-20} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `£${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {selectedFund.navWaterfall.map((entry, i) => (
                      <Cell key={i} fill={entry.value >= 0 ? '#3B82F6' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground mb-2">Geographic Distribution</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={140}>
                  <PieChart>
                    <Pie data={selectedFund.geographicDistribution.filter(g => g.pct > 0)} dataKey="pct" nameKey="region" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                      {selectedFund.geographicDistribution.filter(g => g.pct > 0).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1">
                  {selectedFund.geographicDistribution.filter(g => g.pct > 0).map((g, i) => (
                    <div key={g.region} className="flex items-center gap-2 text-[10px]">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span>{g.region}</span>
                      <span className="text-muted-foreground ml-auto">{g.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Uses of Funds */}
          <div>
            <p className="text-[11px] text-muted-foreground mb-2">Uses of Funds</p>
            <div className="grid grid-cols-6 gap-2">
              {selectedFund.usesOfFunds.map(u => (
                <div key={u.category} className="bg-muted/30 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">{u.category}</p>
                  <p className="text-[14px]">{formatCurrency(Math.abs(u.amount))}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zone 2: Summary Strip */}
      <div className="grid grid-cols-7 gap-2">
        {summaryCards.map(card => (
          <button
            key={card.label}
            className="bg-card border border-border rounded-xl p-3 text-left hover:shadow-sm transition-shadow"
            onClick={() => {
              if (card.label === 'Green') setHealthFilter('On Track');
              else if (card.label === 'Amber') setHealthFilter('At Risk');
              else if (card.label === 'Red') setHealthFilter('Underperforming');
              else setHealthFilter('all');
            }}
          >
            <p className="text-[20px]" style={{ color: card.color }}>{card.value}</p>
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
            {'sub' in card && card.sub && <p className="text-[10px] text-muted-foreground">{card.sub}</p>}
          </button>
        ))}
      </div>

      {/* Zone 3: Compact Action Matrix */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-[13px] text-muted-foreground mb-3">Action Matrix (Active Core only)</h3>
        <div className="grid grid-cols-4 gap-1 text-center">
          <div />
          {healthOrder.map(h => (
            <div key={h} className="text-[11px] text-muted-foreground pb-1">{h}</div>
          ))}
          {upsideOrder.map(u => (
            <React.Fragment key={u}>
              <div className="text-[11px] text-muted-foreground text-right pr-2 flex items-center justify-end">{u}</div>
              {healthOrder.map(h => {
                const key = `${h}_${u}`;
                const count = activeCore.filter(c => c.health === h && c.upside === u).length;
                return (
                  <button
                    key={key}
                    onClick={() => { setHealthFilter(h); setUpsideFilter(u); }}
                    className="rounded-lg p-2 transition-all hover:scale-105"
                    style={{ background: matrixColors[key] + '15', border: `1px solid ${matrixColors[key]}30` }}
                  >
                    <p className="text-[18px]" style={{ color: matrixColors[key] }}>{count}</p>
                    <p className="text-[9px] text-muted-foreground">{matrixLabels[key]}</p>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {/* Table view toggle */}
        <div className="flex border border-border rounded-lg overflow-hidden mr-2">
          {(['active', 'exited', 'all'] as const).map(v => (
            <button key={v} onClick={() => setTableView(v)}
              className={`text-[11px] px-3 py-1.5 ${tableView === v ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'}`}>
              {v === 'active' ? 'Active' : v === 'exited' ? 'Exited' : 'All'}
            </button>
          ))}
        </div>
        <select value={healthFilter} onChange={e => setHealthFilter(e.target.value as any)}
          className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
          <option value="all">All Health</option>
          <option value="On Track">On Track</option>
          <option value="At Risk">At Risk</option>
          <option value="Underperforming">Underperforming</option>
        </select>
        <select value={upsideFilter} onChange={e => setUpsideFilter(e.target.value as any)}
          className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
          <option value="all">All Upside</option>
          <option value="High Potential">High Potential</option>
          <option value="Emerging">Emerging</option>
          <option value="Limited Potential">Limited Potential</option>
        </select>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value as any)}
          className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
          <option value="all">All Stages</option>
          <option value="Pre-seed">Pre-seed</option>
          <option value="Seed">Seed</option>
          <option value="Series A">Series A</option>
          <option value="Series B+">Series B+</option>
        </select>
        {globalFund === 'all' && (
          <select value={localFundFilter} onChange={e => setLocalFundFilter(e.target.value as any)}
            className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
            <option value="all">All Funds</option>
            <option value="Fund I">Fund I</option>
            <option value="Fund II">Fund II</option>
            <option value="Fund III">Fund III</option>
          </select>
        )}
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}
          className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
          <option value="all">All Owners</option>
          {Array.from(new Set(companies.map(c => c.owner))).map(owner => (
            <option key={owner} value={owner}>{owner}</option>
          ))}
        </select>
        {(healthFilter !== 'all' || upsideFilter !== 'all' || stageFilter !== 'all' || localFundFilter !== 'all' || ownerFilter !== 'all') && (
          <button onClick={() => { setHealthFilter('all'); setUpsideFilter('all'); setStageFilter('all'); setLocalFundFilter('all'); setOwnerFilter('all'); }}
            className="text-[12px] text-muted-foreground hover:text-foreground underline">
            Clear filters
          </button>
        )}
        <div className="ml-auto">
          <button className="text-[12px] flex items-center gap-1 text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5">
            <Download className="w-3 h-3" /> Export
          </button>
        </div>
      </div>

      {/* Zone 4: Portfolio Table (LP Report Style) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { key: 'name', label: 'Company' },
                  { key: 'fund', label: 'Fund' },
                  { key: 'cost', label: 'Cost (£)' },
                  { key: 'cv', label: 'Carrying Value' },
                  { key: 'moic', label: 'MoIC' },
                  { key: 'rag', label: 'RAG' },
                  { key: 'mrr', label: 'ARR' },
                  { key: 'cash', label: 'Cash Bal' },
                  { key: 'burn', label: 'Net Burn' },
                  { key: 'runway', label: 'Runway' },
                  { key: 'fundraising', label: 'Fundraising' },
                  { key: 'owner', label: 'Owner' },
                  { key: 'lastUpdate', label: 'Updated' },
                ].map(col => (
                  <th key={col.key} className="px-3 py-2.5 text-left cursor-pointer hover:bg-muted/50 whitespace-nowrap select-none"
                    onClick={() => handleSort(col.key)}>
                    <span className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
                      {col.label}
                      <ChevronDown className={`w-3 h-3 transition-all ${
                        sortField === col.key ? 'opacity-100 text-primary' : 'opacity-0'
                      } ${sortField === col.key && sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(company => {
                const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(company.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
                const isExited = company.lifecycle === 'Exited' || company.lifecycle === 'Wound Down';
                const latestCash = company.monthlyFinancials.length > 0
                  ? company.monthlyFinancials[company.monthlyFinancials.length - 1].cashBalance || 0
                  : 0;
                return (
                  <tr key={company.id} className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer ${isExited ? 'opacity-60' : ''}`}
                    onClick={() => navigate(`/company/${company.id}`)}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] shrink-0" style={{ background: company.logoColor }}>
                          {company.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{company.name}</span>
                            {company.lifecycle !== 'Active — Core' && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded">{company.lifecycle}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{company.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[11px]">{company.fund}</td>
                    <td className="px-3 py-3 text-[12px]">{formatCurrency(company.accounting.costAtPeriodEnd)}</td>
                    <td className="px-3 py-3 text-[12px]">{formatCurrency(company.accounting.carryingValue)}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[12px] px-1.5 py-0.5 rounded ${
                        company.accounting.moic >= 2 ? 'bg-emerald-100 text-emerald-700' :
                        company.accounting.moic >= 1 ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {company.accounting.moic.toFixed(1)}x
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        company.rag === 'Green' ? 'bg-emerald-100 text-emerald-700' :
                        company.rag === 'Amber' ? 'bg-amber-100 text-amber-700' :
                        company.rag === 'Red' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        <div className="w-2 h-2 rounded-full" style={{ background: getRAGColor(company.rag) }} />
                        {company.rag}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12px]">
                      {!isExited ? formatCurrency(company.mrr * 12, company.currency) : '—'}
                    </td>
                    <td className="px-3 py-3 text-[12px]">
                      {!isExited && latestCash > 0 ? formatCurrency(latestCash, company.currency) : '—'}
                    </td>
                    <td className="px-3 py-3 text-[12px]">
                      {!isExited ? formatCurrency(company.burn, company.currency) + '/mo' : '—'}
                    </td>
                    <td className="px-3 py-3">
                      {!isExited ? (
                        <span className={`text-[12px] font-medium ${
                          company.runway < 6 ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' :
                          company.runway < 9 ? 'text-amber-600' :
                          'text-foreground'
                        }`}>{company.runway}mo</span>
                      ) : (
                        company.exitData ? (
                          <span className="text-[11px] text-muted-foreground">{company.exitData.exitType}</span>
                        ) : '—'
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] text-muted-foreground max-w-[160px] block" title={company.equityFundraisingStatus}>{company.equityFundraisingStatus}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5" title={company.owner}>
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium shrink-0">
                          {company.ownerAvatar}
                        </div>
                        <span className="text-[11px] text-muted-foreground hidden xl:inline">{company.owner.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[12px] ${
                        daysSinceUpdate > 30
                          ? 'text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded'
                          : daysSinceUpdate > 14
                          ? 'text-amber-600'
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(company.lastUpdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[12px] text-muted-foreground text-center">
        {filtered.length} of {companies.length} companies shown
        {exited > 0 && <span> · {exited} exited · {woundDown} wound down</span>}
      </p>
    </div>
  );
}
