import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Download, ChevronDown, ChevronUp, Flag as FlagIcon, Pencil, AlertCircle, Undo2, CheckCircle2 } from 'lucide-react';
import { validateFieldValue, type FieldKey } from './fieldValidation';
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

// Staging edits type — tracks per-company field overrides before confirmation
type StagedEdit = { companyId: string; field: string; value: string };

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

  // Staging: editable fields pushed to staging before confirm
  const [editingCell, setEditingCell] = useState<{ companyId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState<string>('');
  const [stagedEdits, setStagedEdits] = useState<StagedEdit[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const hasStagedEdits = stagedEdits.length > 0;

  const tryStageEdit = (companyId: string, field: string, rawValue: string, currency: 'GBP' | 'USD' | 'EUR' = 'GBP') => {
    const result = validateFieldValue(field as FieldKey, rawValue, currency);
    if (!result.valid) {
      setEditError(result.error || 'Invalid value');
      return false;
    }
    setStagedEdits(prev => {
      const filtered = prev.filter(e => !(e.companyId === companyId && e.field === field));
      return [...filtered, { companyId, field, value: result.normalized || rawValue }];
    });
    setEditingCell(null);
    setEditError(null);
    setDraftValue('');
    return true;
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditError(null);
    setDraftValue('');
  };

  const discardEdit = (companyId: string, field: string) => {
    setStagedEdits(prev => prev.filter(e => !(e.companyId === companyId && e.field === field)));
  };

  // Mock data source map — in production this comes from the database
  const getDataSource = (companyId: string, field: string): { source: string; when: string } => {
    const sources = [
      { source: 'Founder Form', when: 'Q1 2026' },
      { source: 'Granola transcript', when: '3 days ago' },
      { source: 'Edited by Anna', when: '2 days ago' },
      { source: 'Edited by Marcus', when: '1 week ago' },
      { source: 'Gmail email', when: '5 days ago' },
      { source: 'Notion doc', when: '2 weeks ago' },
      { source: 'Attio', when: 'Yesterday' },
    ];
    // Deterministic per (companyId, field)
    const hash = (companyId + field).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return sources[hash % sources.length];
  };

  const getStagedValue = (companyId: string, field: string): string | undefined => {
    return stagedEdits.find(e => e.companyId === companyId && e.field === field)?.value;
  };

  const confirmAllEdits = () => {
    // In production: push staged edits to database
    setStagedEdits([]);
    setShowConfirm(false);
  };

  const discardAllEdits = () => {
    setStagedEdits([]);
    setShowConfirm(false);
  };

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
            {activeCompanies.length} active companies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={ownerFilter}
            onChange={e => setOwnerFilter(e.target.value)}
            className="text-[12px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Lead Partners</option>
            {Array.from(new Set(companies.flatMap(c => c.owners))).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <button
            onClick={() => generateAssetMetrixXLSX(funds[0], companies)}
            className="text-[12px] flex items-center gap-1.5 text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Staging banner — appears when there are uncommitted edits */}
      {hasStagedEdits && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[13px] text-amber-800 font-medium">
              {stagedEdits.length} pending {stagedEdits.length === 1 ? 'change' : 'changes'} in staging
            </span>
            <span className="text-[11px] text-amber-600">— review the highlighted cells, then confirm to save</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={discardAllEdits}
              className="text-[12px] px-3 py-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
            >
              Discard all
            </button>
            <button
              onClick={confirmAllEdits}
              className="text-[12px] px-4 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirm all changes
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200">
                {[
                  { key: 'name', label: 'Company', align: 'left' as const, w: 'min-w-[180px]' },
                  { key: 'rag', label: 'RAG', align: 'center' as const, w: 'w-[52px]' },
                  { key: 'arr', label: 'ARR', align: 'right' as const, w: '' },
                  { key: 'revenue', label: 'Revenue', align: 'right' as const, w: '' },
                  { key: 'ebitda', label: 'EBITDA', align: 'right' as const, w: '' },
                  { key: 'grossMargin', label: 'Gross Margin', align: 'right' as const, w: '' },
                  { key: 'cashBalance', label: 'Cash Balance', align: 'right' as const, w: '' },
                  { key: 'cashBurn', label: 'Cash Burn', align: 'right' as const, w: '' },
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
                    className={`border-b border-slate-100/80 last:border-0 hover:bg-slate-50/80 transition-[background-color,box-shadow] h-[42px] ${
                      isExited ? 'opacity-50' : ''
                    }`}
                    style={{ borderLeft: `3px solid ${ragColor}` }}
                  >
                    {/* Company — only this cell navigates */}
                    <td className="px-3 py-1.5">
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => navigate(`/company/${company.id}`)}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
                          style={{ background: company.logoColor }}
                        >
                          {company.name[0]}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-slate-700 truncate block hover:text-indigo-600">{company.name}</span>
                          <span className="text-[10px] text-slate-400">{company.stage} · {company.sector}</span>
                        </div>
                      </div>
                    </td>
                    {/* RAG */}
                    <td className="px-3 py-1.5 text-center">
                      <div
                        className="w-3 h-3 rounded-full mx-auto"
                        style={{ background: ragColor }}
                        title={company.rag}
                      />
                    </td>
                    {/* Editable cells — double-click to edit, staged before confirm */}
                    {(() => {
                      const latest = company.monthlyFinancials[company.monthlyFinancials.length - 1];
                      const ebitdaVal = latest ? ((latest.revenue ?? 0) + (latest.revenueOther ?? 0)) - ((latest.cogs ?? 0) + (latest.rdCosts ?? 0) + (latest.salesMarketingCosts ?? 0) + (latest.generalAdminCosts ?? 0)) : 0;
                      const gmVal = latest && latest.revenue ? ((latest.revenue - (latest.cogs ?? 0)) / latest.revenue * 100).toFixed(0) + '%' : '—';

                      const editableFields: { field: string; display: string; className?: string }[] = [
                        { field: 'arr', display: !isExited ? formatCurrency(company.mrr * 12, company.currency) : '—' },
                        { field: 'revenue', display: !isExited && latest ? formatCurrency(latest.revenue ?? 0, company.currency) : '—' },
                        { field: 'ebitda', display: !isExited ? formatCurrency(ebitdaVal, company.currency) : '—', className: ebitdaVal < 0 ? 'text-red-500' : '' },
                        { field: 'grossMargin', display: !isExited ? gmVal : '—' },
                        { field: 'cashBalance', display: !isExited ? formatCurrency(latestCash, company.currency) : '—' },
                        { field: 'cashBurn', display: !isExited ? '-' + formatCurrency(company.burn, company.currency) : '—', className: 'text-red-500' },
                      ];

                      return editableFields.map(({ field, display, className }) => {
                        const staged = getStagedValue(company.id, field);
                        const isEditing = editingCell?.companyId === company.id && editingCell?.field === field;
                        const src = getDataSource(company.id, field);

                        return (
                          <td
                            key={field}
                            className={`px-3 py-1.5 text-right font-mono-num text-[12px] tabular-nums relative group/cell transition-colors ${
                              isEditing ? 'bg-indigo-50/50' : staged ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            {isEditing ? (
                              <div className="relative">
                                <input
                                  autoFocus
                                  value={draftValue}
                                  onChange={e => { setDraftValue(e.target.value); setEditError(null); }}
                                  className={`w-full text-right text-[12px] font-mono-num border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 ${
                                    editError ? 'border-red-400 focus:ring-red-200' : 'border-indigo-300 focus:ring-indigo-200'
                                  }`}
                                  onFocus={() => { if (!draftValue) setDraftValue(staged || display.replace(/[£$€,\s]/g, '')); }}
                                  onBlur={() => { if (draftValue) tryStageEdit(company.id, field, draftValue, company.currency as any); }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') { tryStageEdit(company.id, field, draftValue, company.currency as any); }
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  onClick={e => e.stopPropagation()}
                                />
                                {editError && (
                                  <div className="absolute top-full right-0 mt-1 z-20 bg-red-500 text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1 max-w-[260px]">
                                    <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="truncate">{editError}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className={`inline-flex items-center justify-end gap-1 ${className || 'text-slate-600'}`}>
                                {/* Undo button — only when this cell has a staged edit */}
                                {staged && (
                                  <button
                                    onClick={e => { e.stopPropagation(); discardEdit(company.id, field); }}
                                    className="text-amber-500 hover:text-amber-600 transition-colors"
                                    title="Discard this edit"
                                  >
                                    <Undo2 className="w-3 h-3" />
                                  </button>
                                )}
                                {/* Pencil to enter edit mode */}
                                <button
                                  onClick={() => { if (!isExited) { setEditingCell({ companyId: company.id, field }); setEditError(null); } }}
                                  className="text-indigo-400 hover:text-indigo-600 opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                  title="Edit this value"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <span className={staged ? 'text-amber-700 font-medium' : ''}>
                                  {staged || display}
                                </span>

                                {/* Hover tooltip — previous value + source */}
                                <span className="invisible group-hover/cell:visible absolute z-30 bottom-full right-2 mb-1 bg-slate-800 text-white text-[10px] font-normal rounded-lg shadow-lg px-3 py-2 whitespace-nowrap text-left pointer-events-none">
                                  {staged ? (
                                    <>
                                      <div className="text-amber-300 font-medium mb-1">Pending change (not saved)</div>
                                      <div>Previous: <span className="font-mono-num">{display}</span></div>
                                      <div>New: <span className="font-mono-num text-amber-200">{staged}</span></div>
                                      <div className="mt-1 pt-1 border-t border-white/10 text-slate-300">Source: {src.source} · {src.when}</div>
                                    </>
                                  ) : (
                                    <>
                                      <div>Source: <span className="font-medium text-white">{src.source}</span></div>
                                      <div className="text-slate-300">{src.when}</div>
                                    </>
                                  )}
                                </span>
                              </span>
                            )}
                          </td>
                        );
                      });
                    })()}
                    {/* Headcount — sum of M+F+Ethnic Minority FTE matching founder form */}
                    {(() => {
                      const staged = getStagedValue(company.id, 'headcount');
                      const isEditing = editingCell?.companyId === company.id && editingCell?.field === 'headcount';
                      const latestFin = company.monthlyFinancials[company.monthlyFinancials.length - 1];
                      const headcountSum = latestFin
                        ? (latestFin.headcountMale ?? 0) + (latestFin.headcountFemale ?? 0) + (latestFin.headcountEthnicMinority ?? 0)
                        : company.headcount;
                      const hcSrc = getDataSource(company.id, 'headcount');
                      const displayValue = !isExited ? String(headcountSum) : '—';
                      return (
                        <td
                          className={`px-3 py-1.5 text-right font-mono-num text-[12px] tabular-nums relative group/cell transition-colors ${
                            isEditing ? 'bg-indigo-50/50' : staged ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          {isEditing ? (
                            <div className="relative">
                              <input
                                autoFocus
                                value={draftValue}
                                onChange={e => { setDraftValue(e.target.value); setEditError(null); }}
                                onFocus={() => { if (!draftValue) setDraftValue(staged || String(headcountSum)); }}
                                className={`w-full text-right text-[12px] font-mono-num border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 ${
                                  editError ? 'border-red-400 focus:ring-red-200' : 'border-indigo-300 focus:ring-indigo-200'
                                }`}
                                onBlur={() => { if (draftValue) tryStageEdit(company.id, 'headcount', draftValue, company.currency as any); }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') tryStageEdit(company.id, 'headcount', draftValue, company.currency as any);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                onClick={e => e.stopPropagation()}
                              />
                              {editError && (
                                <div className="absolute top-full right-0 mt-1 z-20 bg-red-500 text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1 max-w-[260px]">
                                  <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                                  <span className="truncate">{editError}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center justify-end gap-1 text-slate-600">
                              {staged && (
                                <button onClick={e => { e.stopPropagation(); discardEdit(company.id, 'headcount'); }} className="text-amber-500 hover:text-amber-600 transition-colors" title="Discard this edit">
                                  <Undo2 className="w-3 h-3" />
                                </button>
                              )}
                              <button onClick={() => { if (!isExited) { setEditingCell({ companyId: company.id, field: 'headcount' }); setEditError(null); } }} className="text-indigo-400 hover:text-indigo-600 opacity-0 group-hover/cell:opacity-100 transition-opacity" title="Edit this value">
                                <Pencil className="w-3 h-3" />
                              </button>
                              <span className={staged ? 'text-amber-700 font-medium' : ''}>{staged || displayValue}</span>
                              <span className="invisible group-hover/cell:visible absolute z-30 bottom-full right-2 mb-1 bg-slate-800 text-white text-[10px] font-normal rounded-lg shadow-lg px-3 py-2 whitespace-nowrap text-left pointer-events-none">
                                {staged ? (
                                  <>
                                    <div className="text-amber-300 font-medium mb-1">Pending change (not saved)</div>
                                    <div>Previous: <span className="font-mono-num">{displayValue}</span></div>
                                    <div>New: <span className="font-mono-num text-amber-200">{staged}</span></div>
                                    <div className="mt-1 pt-1 border-t border-white/10 text-slate-300">Source: {hcSrc.source} · {hcSrc.when}</div>
                                  </>
                                ) : (
                                  <>
                                    <div>Source: <span className="font-medium text-white">{hcSrc.source}</span></div>
                                    <div className="text-slate-300">{hcSrc.when}</div>
                                  </>
                                )}
                              </span>
                            </span>
                          )}
                        </td>
                      );
                    })()}
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
