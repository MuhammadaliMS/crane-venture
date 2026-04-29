import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Download, ChevronDown, ChevronUp, Flag as FlagIcon } from 'lucide-react';
import { useFundFilter } from './Layout';
import {
  companies, funds, flags, formatCurrency, getRAGColor,
  type HealthStatus, type UpsideCategory, type Stage, type Fund
} from './mock-data';
import React from 'react';
import { generateAssetMetrixXLSX } from './ExportUtils';

// Inline runway bar — thin colored bar showing months relative to 24mo max
function RunwayBar({ months, isExited }: { months: number; isExited: boolean }) {
  if (isExited) return <span className="text-[11px] text-slate-400">—</span>;
  const pct = Math.min(months / 24, 1) * 100;
  const color = months <= 6 ? '#ef4444' : months <= 9 ? '#f59e0b' : months <= 14 ? '#3b82f6' : '#10b981';
  return (
    <div className="flex items-center gap-2 justify-end">
      <span className={`font-mono-num text-[12px] font-semibold tabular-nums ${
        months <= 6 ? 'text-red-600' : months <= 9 ? 'text-amber-600' : 'text-slate-600'
      }`}>
        {months}mo
      </span>
      <div className="w-[48px] h-[4px] rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

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
    if (tableView === 'active') result = result.filter(c => c.lifecycle === 'Active — Core' || c.lifecycle === 'Active — Non-core');
    else if (tableView === 'exited') result = result.filter(c => c.lifecycle === 'Exited' || c.lifecycle === 'Wound Down');
    if (healthFilter !== 'all') result = result.filter(c => c.health === healthFilter);
    if (upsideFilter !== 'all') result = result.filter(c => c.upside === upsideFilter);
    if (stageFilter !== 'all') result = result.filter(c => c.stage === stageFilter);
    if (effectiveFund !== 'all') result = result.filter(c => c.fund === effectiveFund);
    if (ownerFilter !== 'all') result = result.filter(c => c.owners.includes(ownerFilter));

    result.sort((a, b) => {
      let cmp = 0;
      const getLatest = (c: typeof a) => c.monthlyFinancials[c.monthlyFinancials.length - 1];
      switch (sortField) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'arr': cmp = (a.mrr * 12) - (b.mrr * 12); break;
        case 'revenue': cmp = (getLatest(a)?.revenue ?? 0) - (getLatest(b)?.revenue ?? 0); break;
        case 'cashBalance': cmp = (getLatest(a)?.cashBalance ?? 0) - (getLatest(b)?.cashBalance ?? 0); break;
        case 'cashBurn': cmp = a.burn - b.burn; break;
        case 'runway': cmp = a.runway - b.runway; break;
        case 'headcount': cmp = a.headcount - b.headcount; break;
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

  const activeCompanies = companies.filter(c => c.lifecycle === 'Active — Core' || c.lifecycle === 'Active — Non-core');
  const activeCore = companies.filter(c => c.lifecycle === 'Active — Core');
  const greenCount = activeCompanies.filter(c => c.rag === 'Green').length;
  const amberCount = activeCompanies.filter(c => c.rag === 'Amber').length;
  const redCount = activeCompanies.filter(c => c.rag === 'Red').length;
  const avgRunway = Math.round(activeCore.reduce((s, c) => s + c.runway, 0) / (activeCore.length || 1));
  const totalPortfolioValue = activeCompanies.reduce((s, c) => s + c.accounting.carryingValue, 0);

  const hasActiveFilters = healthFilter !== 'all' || upsideFilter !== 'all' || stageFilter !== 'all' || localFundFilter !== 'all' || ownerFilter !== 'all';

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 opacity-0 group-hover:opacity-30 transition-opacity duration-150" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-500" />
      : <ChevronDown className="w-3 h-3 text-indigo-500" />;
  };

  // RAG distribution bar widths
  const totalRAG = greenCount + amberCount + redCount;
  const gPct = totalRAG ? (greenCount / totalRAG) * 100 : 0;
  const aPct = totalRAG ? (amberCount / totalRAG) * 100 : 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-3">
      {/* Header row */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-800">Command Center</h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {activeCompanies.length} active companies &middot; {formatCurrency(totalPortfolioValue)} portfolio value &middot; {avgRunway}mo avg runway
          </p>
        </div>
        <div className="flex items-center gap-2">
          {globalFund === 'all' && (
            <select
              value={localFundFilter}
              onChange={e => setLocalFundFilter(e.target.value as Fund | 'all')}
              className="text-[12px] border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600"
            >
              <option value="all">All Funds</option>
              <option value="Fund I">Fund I</option>
              <option value="Fund II">Fund II</option>
              <option value="Fund III">Fund III</option>
            </select>
          )}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            {(['active', 'exited', 'all'] as const).map(v => (
              <button
                key={v}
                onClick={() => setTableView(v)}
                className={`text-[12px] px-3 py-1.5 font-medium transition-colors ${
                  tableView === v ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {v === 'active' ? 'Active' : v === 'exited' ? 'Exited' : 'All'}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const fund = funds.find(f => f.name === localFundFilter) || funds[0];
              generateAssetMetrixXLSX(fund, companies);
            }}
            className="text-[12px] flex items-center gap-1.5 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* RAG distribution bar + filter row */}
      <div className="flex items-center gap-4">
        {/* Compact RAG bar */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-[6px] w-[120px] rounded-full overflow-hidden bg-slate-100">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${gPct}%` }} />
            <div className="h-full bg-amber-400 transition-all" style={{ width: `${aPct}%` }} />
            <div className="h-full bg-red-500 transition-all" style={{ width: `${100 - gPct - aPct}%` }} />
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums font-mono-num">{greenCount}G {amberCount}A {redCount}R</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {[
            { value: healthFilter, setter: setHealthFilter, options: ['all', 'On Track', 'At Risk', 'Underperforming'], labels: ['Health', 'On Track', 'At Risk', 'Underperf.'] },
            { value: upsideFilter, setter: setUpsideFilter, options: ['all', 'High Potential', 'Emerging', 'Limited Potential'], labels: ['Upside', 'High Pot.', 'Emerging', 'Limited'] },
            { value: stageFilter, setter: setStageFilter, options: ['all', 'Pre-seed', 'Seed', 'Series A', 'Series B+'], labels: ['Stage', 'Pre-seed', 'Seed', 'Series A', 'B+'] },
            { value: ownerFilter, setter: setOwnerFilter, options: ['all', ...Array.from(new Set(companies.flatMap(c => c.owners)))], labels: ['Owner', ...Array.from(new Set(companies.flatMap(c => c.owners)))] },
          ].map((filter, i) => (
            <select
              key={i}
              value={filter.value}
              onChange={e => filter.setter(e.target.value as never)}
              className="text-[11px] border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-500 focus:ring-1 focus:ring-indigo-500/20"
            >
              {filter.options.map((opt, j) => (
                <option key={opt} value={opt}>{filter.labels[j]}</option>
              ))}
            </select>
          ))}
          {hasActiveFilters && (
            <button
              onClick={() => { setHealthFilter('all'); setUpsideFilter('all'); setStageFilter('all'); setLocalFundFilter('all'); setOwnerFilter('all'); }}
              className="text-[11px] text-indigo-500 hover:text-indigo-700 font-medium ml-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                {[
                  { key: 'name', label: 'Company', align: 'left' as const, w: 'min-w-[180px]' },
                  { key: 'fund', label: 'Fund', align: 'left' as const, w: '' },
                  { key: 'rag', label: 'RAG', align: 'center' as const, w: 'w-[52px]' },
                  { key: 'arr', label: 'ARR', align: 'right' as const, w: '' },
                  { key: 'revenue', label: 'Revenue', align: 'right' as const, w: '' },
                  { key: 'ebitda', label: 'EBITDA', align: 'right' as const, w: '' },
                  { key: 'grossMargin', label: 'Gross Margin', align: 'right' as const, w: '' },
                  { key: 'cashBalance', label: 'Cash Balance', align: 'right' as const, w: '' },
                  { key: 'cashBurn', label: 'Cash Burn', align: 'right' as const, w: '' },
                  { key: 'runway', label: 'Runway', align: 'right' as const, w: '' },
                  { key: 'headcount', label: 'Headcount', align: 'right' as const, w: '' },
                  { key: 'leadPartner', label: 'Lead Partner', align: 'left' as const, w: '' },
                ].map(col => (
                  <th
                    key={col.key}
                    className={`px-3 py-2 whitespace-nowrap select-none cursor-pointer group transition-colors ${col.w} ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider font-medium text-slate-400">
                      {col.label}
                      <SortIcon field={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((company, idx) => {
                const isExited = company.lifecycle === 'Exited' || company.lifecycle === 'Wound Down';
                const latestCash = company.monthlyFinancials.length > 0
                  ? company.monthlyFinancials[company.monthlyFinancials.length - 1].cashBalance || 0
                  : 0;
                const flagCount = flags.filter(f => f.companyId === company.id).length;
                const ragColor = getRAGColor(company.rag);

                return (
                  <tr
                    key={company.id}
                    className={`border-b border-slate-100/80 last:border-0 hover:bg-slate-50/80 transition-[background-color,box-shadow] cursor-pointer h-[42px] ${
                      isExited ? 'opacity-50' : ''
                    }`}
                    onClick={() => navigate(`/company/${company.id}`)}
                    style={{ borderLeft: `3px solid ${ragColor}` }}
                  >
                    {/* Company */}
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                          style={{ background: company.logoColor }}
                        >
                          {company.name[0]}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-slate-700 truncate block">{company.name}</span>
                          <span className="text-[10px] text-slate-400">{company.stage} · {company.sector}</span>
                        </div>
                      </div>
                    </td>
                    {/* Fund */}
                    <td className="px-3 py-1.5 text-[11px] text-slate-500">{company.fund}</td>
                    {/* RAG */}
                    <td className="px-3 py-1.5 text-center">
                      <div
                        className="w-3 h-3 rounded-full mx-auto"
                        style={{ background: ragColor }}
                        title={company.rag}
                      />
                    </td>
                    {/* ARR */}
                    <td className="px-3 py-1.5 text-right font-mono-num text-[12px] text-slate-600 tabular-nums">
                      {!isExited ? formatCurrency(company.mrr * 12, company.currency) : '—'}
                    </td>
                    {/* Revenue */}
                    <td className="px-3 py-1.5 text-right font-mono-num text-[12px] text-slate-500 tabular-nums">
                      {!isExited && company.monthlyFinancials.length > 0
                        ? formatCurrency(company.monthlyFinancials[company.monthlyFinancials.length - 1].revenue ?? 0, company.currency)
                        : '—'}
                    </td>
                    {/* EBITDA */}
                    <td className="px-3 py-1.5 text-right font-mono-num text-[12px] tabular-nums">
                      {(() => {
                        if (isExited) return '—';
                        const latest = company.monthlyFinancials[company.monthlyFinancials.length - 1];
                        if (!latest) return '—';
                        const rev = (latest.revenue ?? 0) + (latest.revenueOther ?? 0);
                        const costs = (latest.cogs ?? 0) + (latest.rdCosts ?? 0) + (latest.salesMarketingCosts ?? 0) + (latest.generalAdminCosts ?? 0);
                        const ebitda = rev - costs;
                        return <span className={ebitda < 0 ? 'text-red-500' : 'text-slate-600'}>{formatCurrency(ebitda, company.currency)}</span>;
                      })()}
                    </td>
                    {/* Gross Margin % */}
                    <td className="px-3 py-1.5 text-right font-mono-num text-[12px] text-slate-500 tabular-nums">
                      {(() => {
                        if (isExited) return '—';
                        const latest = company.monthlyFinancials[company.monthlyFinancials.length - 1];
                        if (!latest || !latest.revenue) return '—';
                        const gm = ((latest.revenue - (latest.cogs ?? 0)) / latest.revenue * 100).toFixed(0);
                        return `${gm}%`;
                      })()}
                    </td>
                    {/* Cash Balance */}
                    <td className="px-3 py-1.5 text-right font-mono-num text-[12px] text-slate-600 tabular-nums">
                      {!isExited ? formatCurrency(latestCash, company.currency) : '—'}
                    </td>
                    {/* Cash Burn */}
                    <td className="px-3 py-1.5 text-right font-mono-num text-[12px] text-slate-500 tabular-nums">
                      {!isExited ? <span className="text-red-500">-{formatCurrency(company.burn, company.currency)}</span> : '—'}
                    </td>
                    {/* Runway */}
                    <td className="px-3 py-1.5">
                      <RunwayBar months={company.runway} isExited={isExited} />
                    </td>
                    {/* Headcount */}
                    <td className="px-3 py-1.5 text-right font-mono-num text-[12px] text-slate-500 tabular-nums">
                      {!isExited ? company.headcount : '—'}
                    </td>
                    {/* Lead Partner */}
                    <td className="px-3 py-1.5 text-[11px] text-slate-500">
                      {company.owners[0] || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center">
        {filtered.length} of {companies.length} companies shown
      </p>
    </div>
  );
}
