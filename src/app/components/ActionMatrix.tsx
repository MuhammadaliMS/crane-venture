import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router';
import { SparklineChart } from './SparklineChart';
import { companies, getHealthColor, formatCurrency, type HealthStatus, type UpsideCategory, type Fund } from './mock-data';
import { useFundFilter } from './Layout';
import {
  TrendingUp, TrendingDown, Zap, Eye, Shield, ArrowDownRight,
  Users, Flag, Clock, ChevronRight, ArrowUpRight, Flame,
  Target, Crosshair, AlertTriangle, BarChart3
} from 'lucide-react';

const healthOrder: HealthStatus[] = ['On Track', 'At Risk', 'Underperforming'];
const upsideOrder: UpsideCategory[] = ['High Potential', 'Emerging', 'Limited Potential'];

const healthMeta: Record<HealthStatus, { icon: typeof TrendingUp; gradient: string; dot: string }> = {
  'On Track': { icon: TrendingUp, gradient: 'from-emerald-500 to-emerald-600', dot: '#10B981' },
  'At Risk': { icon: AlertTriangle, gradient: 'from-amber-500 to-orange-500', dot: '#F59E0B' },
  'Underperforming': { icon: TrendingDown, gradient: 'from-red-500 to-rose-600', dot: '#EF4444' },
};

const upsideMeta: Record<UpsideCategory, { icon: typeof Zap; label: string }> = {
  'High Potential': { icon: Zap, label: 'High' },
  'Emerging': { icon: Target, label: 'Emerging' },
  'Limited Potential': { icon: Shield, label: 'Limited' },
};

interface CellStyle {
  action: string;
  icon: typeof Zap;
  accentColor: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  textClass: string;
}

const cellConfig: Record<string, CellStyle> = {
  'On Track_High Potential': { action: 'Lean In', icon: Zap, accentColor: '#3B82F6', bgClass: 'bg-blue-50/80', borderClass: 'border-blue-200/60', badgeClass: 'bg-blue-100 text-blue-700', textClass: 'text-blue-600' },
  'At Risk_High Potential': { action: 'Anticipate', icon: Crosshair, accentColor: '#F59E0B', bgClass: 'bg-amber-50/80', borderClass: 'border-amber-200/60', badgeClass: 'bg-amber-100 text-amber-700', textClass: 'text-amber-600' },
  'Underperforming_High Potential': { action: 'Anticipate', icon: Crosshair, accentColor: '#F59E0B', bgClass: 'bg-amber-50/80', borderClass: 'border-amber-200/60', badgeClass: 'bg-amber-100 text-amber-700', textClass: 'text-amber-600' },
  'On Track_Emerging': { action: 'Lean In', icon: Zap, accentColor: '#3B82F6', bgClass: 'bg-blue-50/80', borderClass: 'border-blue-200/60', badgeClass: 'bg-blue-100 text-blue-700', textClass: 'text-blue-600' },
  'At Risk_Emerging': { action: 'Watch', icon: Eye, accentColor: '#8B5CF6', bgClass: 'bg-violet-50/80', borderClass: 'border-violet-200/60', badgeClass: 'bg-violet-100 text-violet-700', textClass: 'text-violet-600' },
  'Underperforming_Emerging': { action: 'Watch', icon: Eye, accentColor: '#8B5CF6', bgClass: 'bg-violet-50/80', borderClass: 'border-violet-200/60', badgeClass: 'bg-violet-100 text-violet-700', textClass: 'text-violet-600' },
  'On Track_Limited Potential': { action: 'Watch', icon: Eye, accentColor: '#8B5CF6', bgClass: 'bg-violet-50/80', borderClass: 'border-violet-200/60', badgeClass: 'bg-violet-100 text-violet-700', textClass: 'text-violet-600' },
  'At Risk_Limited Potential': { action: 'De-prioritise', icon: ArrowDownRight, accentColor: '#6B7280', bgClass: 'bg-gray-50/80', borderClass: 'border-gray-200/60', badgeClass: 'bg-gray-100 text-gray-600', textClass: 'text-gray-500' },
  'Underperforming_Limited Potential': { action: 'De-prioritise', icon: ArrowDownRight, accentColor: '#6B7280', bgClass: 'bg-gray-50/80', borderClass: 'border-gray-200/60', badgeClass: 'bg-gray-100 text-gray-600', textClass: 'text-gray-500' },
};

export function ActionMatrix() {
  const navigate = useNavigate();
  const { fundFilter: globalFund } = useFundFilter();
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [localFundFilter, setLocalFundFilter] = useState<Fund | 'all'>('all');

  const effectiveFund = globalFund !== 'all' ? globalFund : localFundFilter;

  const activeCompanies = companies.filter(c => {
    if (c.lifecycle !== 'Active — Core') return false;
    if (effectiveFund !== 'all' && c.fund !== effectiveFund) return false;
    return true;
  });

  // Summary stats
  const totalCompanies = activeCompanies.length;
  const totalFlags = activeCompanies.reduce((s, c) => s + c.flagCount, 0);
  const avgRunway = totalCompanies > 0 ? Math.round(activeCompanies.reduce((s, c) => s + c.runway, 0) / totalCompanies) : 0;

  const actionCounts = activeCompanies.reduce((acc, c) => {
    acc[c.action] = (acc[c.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const actionFilters = [
    { label: 'All', value: null, color: '#030213', count: totalCompanies },
    { label: 'Lean In', value: 'Lean In', color: '#3B82F6', count: actionCounts['Lean In'] || 0 },
    { label: 'Anticipate', value: 'Lean In / Anticipate', color: '#F59E0B', count: actionCounts['Lean In / Anticipate'] || 0 },
    { label: 'Watch', value: 'Watch', color: '#8B5CF6', count: actionCounts['Watch'] || 0 },
    { label: 'De-prioritise', value: 'De-prioritise', color: '#6B7280', count: actionCounts['De-prioritise'] || 0 },
  ];

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      {/* Top summary strip */}
      <div className="flex items-center gap-3">
        {/* Stats cards */}
        <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[20px] leading-none">{totalCompanies}</p>
              <p className="text-[11px] text-muted-foreground">Active</p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Flag className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[20px] leading-none">{totalFlags}</p>
              <p className="text-[11px] text-muted-foreground">Flags</p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[20px] leading-none">{avgRunway}<span className="text-[13px] text-muted-foreground">mo</span></p>
              <p className="text-[11px] text-muted-foreground">Avg Runway</p>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Action filter pills */}
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1">
          {actionFilters.map(f => {
            const isActive = selectedAction === f.value;
            return (
              <button
                key={f.label}
                onClick={() => setSelectedAction(isActive ? null : f.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {f.value && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: isActive ? 'white' : f.color }} />
                )}
                {f.label}
                <span className={`text-[10px] ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fund filter */}
        <select
          value={localFundFilter}
          onChange={e => setLocalFundFilter(e.target.value as any)}
          className="text-[12px] border border-border rounded-xl px-3 py-2 bg-card appearance-none cursor-pointer"
        >
          <option value="all">All Funds</option>
          <option value="Fund I">Fund I</option>
          <option value="Fund II">Fund II</option>
          <option value="Fund III">Fund III</option>
        </select>
      </div>

      {/* Matrix */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Column headers */}
        <div className="grid" style={{ gridTemplateColumns: '120px repeat(3, 1fr)' }}>
          <div className="p-4 flex items-end">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
              <span className="block">Upside</span>
              <span className="block opacity-50">↓</span>
            </div>
          </div>
          {healthOrder.map(h => {
            const meta = healthMeta[h];
            const Icon = meta.icon;
            const count = activeCompanies.filter(c => c.health === h).length;
            return (
              <div key={h} className="p-4 border-l border-border">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] text-foreground">{h}</p>
                    <p className="text-[11px] text-muted-foreground">{count} companies</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Matrix rows */}
        {upsideOrder.map((u, uIdx) => {
          const uMeta = upsideMeta[u];
          const UIcon = uMeta.icon;

          return (
            <div
              key={u}
              className="grid border-t border-border"
              style={{ gridTemplateColumns: '120px repeat(3, 1fr)' }}
            >
              {/* Row label */}
              <div className="p-4 flex flex-col justify-center gap-1.5 border-r border-border">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <UIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-[12px] text-foreground leading-tight">{u}</p>
              </div>

              {/* Cells */}
              {healthOrder.map(h => {
                const key = `${h}_${u}`;
                const config = cellConfig[key];
                const ActionIcon = config.icon;
                let cellCompanies = activeCompanies.filter(c => c.health === h && c.upside === u);

                if (selectedAction !== null) {
                  const matchAction = selectedAction === 'Lean In / Anticipate'
                    ? config.action === 'Anticipate'
                    : config.action === selectedAction;
                  if (!matchAction) {
                    cellCompanies = [];
                  }
                }

                const dimmed = selectedAction !== null && cellCompanies.length === 0 &&
                  activeCompanies.filter(c => c.health === h && c.upside === u).length === 0;

                return (
                  <div
                    key={key}
                    className={`border-l border-border p-2.5 transition-all ${
                      selectedAction !== null && cellCompanies.length === 0 ? 'opacity-30' : ''
                    }`}
                  >
                    {/* Action badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md ${config.badgeClass}`}>
                        <ActionIcon className="w-3 h-3" />
                        {config.action}
                      </span>
                    </div>

                    {/* Company cards */}
                    <div className="space-y-1.5">
                      {cellCompanies.map(company => {
                        const isHovered = hoveredCompany === company.id;
                        return (
                          <div
                            key={company.id}
                            onClick={() => navigate(`/company/${company.id}`)}
                            onMouseEnter={() => setHoveredCompany(company.id)}
                            onMouseLeave={() => setHoveredCompany(null)}
                            className={`rounded-lg border cursor-pointer transition-all duration-200 ${
                              isHovered
                                ? `${config.bgClass} ${config.borderClass} shadow-md`
                                : 'bg-white border-gray-100 hover:shadow-sm'
                            }`}
                          >
                            <div className="px-3 py-2 flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] shrink-0 shadow-sm"
                                style={{ background: company.logoColor }}
                              >
                                {company.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] text-foreground truncate">{company.name}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span>{company.stage}</span>
                                  <span>·</span>
                                  <span>{formatCurrency(company.mrr)}/mo</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-0.5 shrink-0">
                                {company.flagCount > 0 && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                                    <Flame className="w-3 h-3" />
                                    {company.flagCount}
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground">{company.runway}mo</span>
                              </div>
                            </div>

                            {/* Expanded hover state */}
                            {isHovered && (
                              <div className="px-3 pb-2.5 space-y-2 border-t border-border/40">
                                <div className="pt-2 flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="h-[28px]">
                                      <SparklineChart data={company.mrrTrend} color={config.accentColor} height={28} />
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[11px]">
                                      {company.arrGrowth > 0 ? '+' : ''}{company.arrGrowth}%
                                      {company.arrGrowth > 0
                                        ? <ArrowUpRight className="w-3 h-3 text-emerald-500 inline ml-0.5" />
                                        : <TrendingDown className="w-3 h-3 text-red-500 inline ml-0.5" />
                                      }
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">ARR growth</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {/* RAG history */}
                                  <div className="flex items-center gap-0.5">
                                    {company.ragHistory.map((rag, i) => (
                                      <div
                                        key={i}
                                        className="w-1.5 h-4 rounded-full"
                                        style={{
                                          background: rag === 'Green' ? '#10B981' : rag === 'Amber' ? '#F59E0B' : rag === 'Red' ? '#EF4444' : '#D1D5DB'
                                        }}
                                      />
                                    ))}
                                    <span className="text-[9px] text-muted-foreground ml-1">4Q RAG</span>
                                  </div>
                                  <div className="flex-1" />
                                  <span className={`text-[10px] ${config.textClass} flex items-center gap-0.5`}>
                                    View <ChevronRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {cellCompanies.length === 0 && (
                        <div className="py-6 flex flex-col items-center justify-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                            <BarChart3 className="w-3 h-3 text-muted-foreground/50" />
                          </div>
                          <p className="text-[10px] text-muted-foreground/60">No companies</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom legend */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-5">
          {[
            { label: 'Lean In', color: '#3B82F6', Icon: Zap },
            { label: 'Anticipate', color: '#F59E0B', Icon: Crosshair },
            { label: 'Watch', color: '#8B5CF6', Icon: Eye },
            { label: 'De-prioritise', color: '#6B7280', Icon: ArrowDownRight },
          ].map(item => (
            <span key={item.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <item.Icon className="w-3 h-3" style={{ color: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Click any company to view details · Hover for quick insights
        </p>
      </div>
    </div>
  );
}
