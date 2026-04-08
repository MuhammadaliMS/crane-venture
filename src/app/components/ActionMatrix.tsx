import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router';
import { companies, getRAGColor, formatCurrency, type HealthStatus, type UpsideCategory, type Fund } from './mock-data';
import { useFundFilter } from './Layout';
import { Flag as FlagIcon, ChevronDown } from 'lucide-react';

const healthOrder: HealthStatus[] = ['On Track', 'At Risk', 'Underperforming'];
const upsideOrder: UpsideCategory[] = ['High Potential', 'Emerging', 'Limited Potential'];

const cellActionMap: Record<string, string> = {
  'On Track_High Potential': 'Lean In',
  'At Risk_High Potential': 'Anticipate',
  'Underperforming_High Potential': 'Anticipate',
  'On Track_Emerging': 'Lean In',
  'At Risk_Emerging': 'Watch',
  'Underperforming_Emerging': 'Watch',
  'On Track_Limited Potential': 'Watch',
  'At Risk_Limited Potential': 'De-prioritise',
  'Underperforming_Limited Potential': 'De-prioritise',
};

const actionColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Lean In': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Anticipate': { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  'Watch': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  'De-prioritise': { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' },
};

const columnBorder: Record<HealthStatus, string> = {
  'On Track': 'border-l-emerald-400',
  'At Risk': 'border-l-amber-400',
  'Underperforming': 'border-l-red-400',
};

export function ActionMatrix() {
  const navigate = useNavigate();
  const { fundFilter: globalFund } = useFundFilter();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [localFundFilter, setLocalFundFilter] = useState<Fund | 'all'>('all');
  const [fundDropdownOpen, setFundDropdownOpen] = useState(false);

  const effectiveFund = globalFund !== 'all' ? globalFund : localFundFilter;

  const activeCompanies = companies.filter(c => {
    if (c.lifecycle !== 'Active — Core') return false;
    if (effectiveFund !== 'all' && c.fund !== effectiveFund) return false;
    return true;
  });

  const totalCompanies = activeCompanies.length;
  const totalFlags = activeCompanies.reduce((s, c) => s + c.flagCount, 0);
  const avgRunway = totalCompanies > 0 ? Math.round(activeCompanies.reduce((s, c) => s + c.runway, 0) / totalCompanies) : 0;

  const actionFilters = ['Lean In', 'Anticipate', 'Watch', 'De-prioritise'];
  const fundOptions = [
    { label: 'All Funds', value: 'all' as Fund | 'all' },
    { label: 'Fund I', value: 'Fund I' as Fund },
    { label: 'Fund II', value: 'Fund II' as Fund },
    { label: 'Fund III', value: 'Fund III' as Fund },
  ];
  const selectedFundLabel = fundOptions.find(f => f.value === localFundFilter)?.label || 'All Funds';

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-800">Action Matrix</h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {totalCompanies} active &middot; {totalFlags} flags &middot; {avgRunway}mo avg runway
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Action filter pills */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedAction(null)}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedAction === null ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            {actionFilters.map(a => {
              const colors = actionColors[a];
              const isActive = selectedAction === a;
              return (
                <button
                  key={a}
                  onClick={() => setSelectedAction(isActive ? null : a)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : colors.dot}`} />
                  {a === 'De-prioritise' ? 'De-pri' : a}
                </button>
              );
            })}
          </div>
          {/* Fund dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setFundDropdownOpen(!fundDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-600 hover:bg-slate-50"
            >
              {selectedFundLabel}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {fundDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFundDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[130px] animate-slide-down-fade">
                  {fundOptions.map(f => (
                    <button
                      key={f.value}
                      onClick={() => { setLocalFundFilter(f.value); setFundDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                        localFundFilter === f.value ? 'bg-slate-50 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="flex-1 min-h-0">
        <div
          className="grid h-full gap-px bg-slate-200/50 rounded-xl overflow-hidden border border-slate-200/80"
          style={{
            gridTemplateColumns: '100px repeat(3, 1fr)',
            gridTemplateRows: '36px repeat(3, 1fr)',
          }}
        >
          {/* Corner */}
          <div className="bg-slate-50 flex items-center justify-center">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Health →</span>
          </div>

          {/* Column headers */}
          {healthOrder.map(h => {
            const count = activeCompanies.filter(c => c.health === h).length;
            return (
              <div key={h} className="bg-slate-50 flex items-center justify-center gap-2 px-3">
                <span className={`w-2 h-2 rounded-full ${
                  h === 'On Track' ? 'bg-emerald-500' : h === 'At Risk' ? 'bg-amber-400' : 'bg-red-500'
                }`} />
                <span className="text-[12px] font-medium text-slate-600">{h}</span>
                <span className="text-[10px] text-slate-400 font-mono-num">{count}</span>
              </div>
            );
          })}

          {/* Rows */}
          {upsideOrder.map(u => (
            <React.Fragment key={u}>
              {/* Row header */}
              <div className="bg-slate-50 flex items-center px-3">
                <span className="text-[11px] text-slate-500 leading-tight">{u}</span>
              </div>

              {/* Cells */}
              {healthOrder.map(h => {
                const key = `${h}_${u}`;
                const cellAction = cellActionMap[key];
                const colors = actionColors[cellAction] || actionColors['De-prioritise'];
                let cellCompanies = activeCompanies.filter(c => c.health === h && c.upside === u);
                if (selectedAction !== null && cellAction !== selectedAction) cellCompanies = [];
                const isDimmed = selectedAction !== null && cellAction !== selectedAction;

                return (
                  <div
                    key={key}
                    className={`bg-white p-3 transition-opacity border-l-2 ${columnBorder[h]} ${isDimmed ? 'opacity-20' : ''}`}
                  >
                    {/* Action label */}
                    <span className={`inline-block text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                      {cellAction}
                    </span>

                    {/* Company cards */}
                    <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[calc(100%-28px)] stagger-children">
                      {cellCompanies.length > 0 ? cellCompanies.map(company => {
                        const runwayPct = Math.min(company.runway / 24, 1) * 100;
                        const runwayColor = company.runway <= 6 ? '#ef4444' : company.runway <= 9 ? '#f59e0b' : '#10b981';
                        return (
                          <div
                            key={company.id}
                            onClick={() => navigate(`/company/${company.id}`)}
                            className="flex items-center gap-2 rounded-md bg-slate-50/80 hover:bg-slate-100 px-2 py-1.5 cursor-pointer transition-all hover:-translate-y-px hover:shadow-sm group"
                          >
                            <div
                              className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                              style={{ background: company.logoColor }}
                            >
                              {company.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-medium text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                                  {company.name}
                                </span>
                                {company.flagCount > 0 && (
                                  <span className="flex items-center gap-0.5 text-[9px] text-red-500 font-semibold shrink-0">
                                    <FlagIcon className="w-2.5 h-2.5" />{company.flagCount}
                                  </span>
                                )}
                              </div>
                              {/* Inline runway bar */}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-[32px] h-[3px] rounded-full bg-slate-200 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${runwayPct}%`, background: runwayColor }} />
                                </div>
                                <span className="text-[9px] font-mono-num text-slate-400 tabular-nums">{company.runway}mo</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="py-3 flex items-center justify-center">
                          <span className="text-[10px] text-slate-300 italic">Empty</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
