'use client';

import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Printer, ArrowLeft } from 'lucide-react';
import {
  type FundEntity, type Company, type Currency,
  formatCurrency, formatCurrencyFull, getRAGColor,
} from './mock-data';

// ─── Props ──────────────────────────────────────────────────────────────────────

interface LPReportPreviewProps {
  fund: FundEntity;
  companies: Company[];
  managersCommentary: string;
  otherDevelopments: string;
  reportDate: string;
  onClose: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

const GEO_COLORS = ['#F472B6', '#FB923C', '#FACC15', '#34D399', '#60A5FA', '#A78BFA'];

const WATERFALL_COLORS: Record<string, string> = {
  'NAV Start': '#6366F1',
  'Contributions': '#22C55E',
  'Distributions': '#EF4444',
  'Realised Gains': '#10B981',
  'Unrealised Gains': '#3B82F6',
  'Operating': '#F59E0B',
  'GP Share': '#8B5CF6',
  'NAV End': '#6366F1',
};

function fmtM(value: number, currency: Currency = 'GBP'): string {
  const sym = currency === 'GBP' ? '\u00a3' : currency === 'USD' ? '$' : '\u20ac';
  return `${sym}${(value / 1_000_000).toFixed(2)}m`;
}

function fmtK(value: number, currency: Currency = 'GBP'): string {
  const sym = currency === 'GBP' ? '\u00a3' : currency === 'USD' ? '$' : '\u20ac';
  if (value >= 1_000_000) return `${sym}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${sym}${(value / 1_000).toFixed(0)}K`;
  return `${sym}${value.toLocaleString()}`;
}

const RAG_HEX: Record<string, string> = {
  Green: '#22C55E',
  Amber: '#F59E0B',
  Red: '#EF4444',
  Grey: '#9CA3AF',
};

const quarterLabel = (idx: number) => {
  const labels = ['Q-3', 'Q-2', 'Q-1', 'Current'];
  return labels[idx] ?? `Q${idx}`;
};

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 mb-4 print:mb-2">
      <h2 className="text-white text-lg font-bold tracking-wide">{children}</h2>
    </div>
  );
}

function SubSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3 mt-6 print:mt-3">
      {children}
    </h3>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <table className="w-full text-xs border-collapse mb-4">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className="bg-gray-100 border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-700"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, ci) => (
              <td key={ci} className="border border-gray-300 px-2 py-1.5">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KeyValueTable({ data }: { data: [string, string | React.ReactNode][] }) {
  return (
    <table className="w-full text-xs border-collapse mb-4">
      <tbody>
        {data.map(([key, val], i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="border border-gray-300 px-2 py-1.5 font-semibold text-gray-700 w-48">
              {key}
            </td>
            <td className="border border-gray-300 px-2 py-1.5 text-gray-800">{val}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RAGDots({ history }: { history: string[] }) {
  const display = history.slice(-4);
  while (display.length < 4) display.unshift('Grey');
  return (
    <div className="flex items-center gap-2">
      {display.map((rag, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: RAG_HEX[rag] ?? '#9CA3AF' }}
          />
          <span className="text-[9px] text-gray-500">{quarterLabel(i)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function LPReportPreview({
  fund,
  companies,
  managersCommentary,
  otherDevelopments,
  reportDate,
  onClose,
}: LPReportPreviewProps) {
  const currency = fund.currency;
  const activeCompanies = companies.filter(
    (c) => c.lifecycle === 'Active \u2014 Core' || c.lifecycle === 'Active \u2014 Non-core'
  );
  const allCompanies = companies;

  // Derived data for follow-on investments table
  const followOnCompanies = companies.filter((c) => c.accounting.followOnAmount && c.accounting.followOnAmount > 0);

  // Derived data for NAV uplift table
  const navUpliftCompanies = companies.filter((c) => c.accounting.navUplift !== 0);

  const latestFinancials = (c: Company) => {
    if (!c.monthlyFinancials || c.monthlyFinancials.length === 0) return null;
    return c.monthlyFinancials[c.monthlyFinancials.length - 1];
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── Toolbar (hidden in print) ────────────────────────────────── */}
      <div className="print:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">LP Quarterly Report Preview</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-500 hover:to-rose-500 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-[210mm] mx-auto px-8 py-6 print:px-0 print:py-0 print:max-w-none">
        {/* ════════════════════════════════════════════════════════════════
            SECTION 1: COVER PAGE
        ════════════════════════════════════════════════════════════════ */}
        <div className="min-h-[90vh] flex flex-col items-center justify-center print:min-h-screen print:break-after-page">
          {/* Crane Logo Area */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">C</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            {fund.name}
          </h1>
          <h2 className="text-xl text-gray-500 font-medium mb-8 text-center">
            LP Quarterly Report
          </h2>
          <div className="text-center text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">General Partner:</span> {fund.gp}</p>
            <p><span className="font-medium">Investment Manager:</span> Crane Venture Partners</p>
            <p><span className="font-medium">Report Date:</span> {reportDate}</p>
          </div>
          <div className="mt-16 text-xs text-gray-400">
            CONFIDENTIAL &mdash; FOR LP USE ONLY
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2: STANDING DATA
        ════════════════════════════════════════════════════════════════ */}
        <div className="print:break-before-page pt-8 print:pt-6">
          <SectionHeader>Standing Data</SectionHeader>
          <KeyValueTable
            data={[
              ['Fund Name', fund.name],
              ['Currency', fund.currency],
              ['Domicile', 'England & Wales'],
              ['Vintage Year', String(fund.vintage)],
              ['First Closing Date', `${fund.vintage}-01-01`],
              ['Final Closing Date', `${fund.vintage}-12-31`],
              ['Total Commitments', formatCurrencyFull(fund.totalCommitted, currency)],
              ['Investment Focus', 'Early-stage B2B SaaS & Deep Tech across Europe'],
              ['Investment Manager', 'Crane Venture Partners LLP'],
              ['General Partner', fund.gp],
              ['Administrator', fund.administrator],
              ['Auditor', 'PricewaterhouseCoopers LLP'],
              ['Accounting Policy', fund.accountingBasis],
            ]}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3: MANAGER'S COMMENTARY
        ════════════════════════════════════════════════════════════════ */}
        <div className="print:break-before-page pt-8 print:pt-6">
          <SectionHeader>Manager&apos;s Commentary</SectionHeader>

          {/* Commentary Text */}
          <div className="prose prose-sm max-w-none mb-6">
            {managersCommentary.split('\n').map((para, i) => (
              <p key={i} className="text-xs text-gray-700 mb-2 leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          {/* NAV Waterfall Chart */}
          <SubSectionHeader>NAV Waterfall</SubSectionHeader>
          <div className="flex justify-center mb-6">
            <BarChart width={650} height={320} data={fund.navWaterfall} margin={{ top: 10, right: 20, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9 }}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 9 }}
                tickFormatter={(v: number) => fmtM(v, currency)}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrencyFull(value, currency), 'Value']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {fund.navWaterfall.map((entry, idx) => (
                  <Cell key={idx} fill={WATERFALL_COLORS[entry.label] ?? '#6366F1'} />
                ))}
              </Bar>
            </BarChart>
          </div>

          {/* TVPI by Quarter Chart */}
          <SubSectionHeader>TVPI by Quarter</SubSectionHeader>
          <div className="flex justify-center mb-6">
            <LineChart width={650} height={280} data={fund.tvpiHistory} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="quarter" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 9 }} domain={[0, 'auto']} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="tvpiFund" name="TVPI Fund" stroke="#F472B6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="dpi" name="DPI" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="tvpiNet" name="TVPI Net" stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </div>

          {/* Portfolio Company Table */}
          <div className="print:break-before-page pt-4 print:pt-6">
            <SubSectionHeader>Portfolio Overview</SubSectionHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] border-collapse mb-4">
                <thead>
                  <tr>
                    {[
                      'Company', 'Cost', 'Carrying Value', 'Current ARR',
                      'Cash Balance', 'Monthly Burn', 'Runway (mo)',
                      'Equity Raising', 'Debt Raising', 'Burn Actions', 'Near Term Exit',
                    ].map((h, i) => (
                      <th key={i} className="bg-gray-100 border border-gray-300 px-1.5 py-1 text-left font-semibold text-gray-700 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allCompanies.map((c, ri) => {
                    const fin = latestFinancials(c);
                    return (
                      <tr key={c.id} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-1.5 py-1 font-medium">{c.name}</td>
                        <td className="border border-gray-300 px-1.5 py-1 text-right">{formatCurrency(c.accounting.costAtPeriodEnd, c.currency)}</td>
                        <td className="border border-gray-300 px-1.5 py-1 text-right">{formatCurrency(c.accounting.carryingValue, c.currency)}</td>
                        <td className="border border-gray-300 px-1.5 py-1 text-right">{fin?.arr ? formatCurrency(fin.arr, c.currency) : '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1 text-right">{fin?.cashBalance ? formatCurrency(fin.cashBalance, c.currency) : '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1 text-right">{fin?.monthlyNetBurn ? formatCurrency(Math.abs(fin.monthlyNetBurn), c.currency) : '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1 text-right">{c.runway > 0 ? `${c.runway}` : '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{c.equityFundraisingStatus || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{c.debtFundraisingStatus || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{c.burnReductionActions || '-'}</td>
                        <td className="border border-gray-300 px-1.5 py-1">{c.nearTermExit || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Follow-on Investments Table */}
          {followOnCompanies.length > 0 && (
            <>
              <SubSectionHeader>Follow-on Investments</SubSectionHeader>
              <DataTable
                headers={['Company', 'Amount', 'Description']}
                rows={followOnCompanies.map((c) => [
                  c.name,
                  formatCurrency(c.accounting.followOnAmount!, c.currency),
                  c.accounting.followOnDescription || '-',
                ])}
              />
            </>
          )}

          {/* NAV Uplift / Write-down Table */}
          {navUpliftCompanies.length > 0 && (
            <>
              <SubSectionHeader>NAV Uplift / Write-down Summary</SubSectionHeader>
              <DataTable
                headers={['Company', 'NAV Uplift', 'MoIC', 'Valuation Basis']}
                rows={navUpliftCompanies.map((c) => [
                  c.name,
                  fmtM(c.accounting.navUplift, c.currency),
                  `${c.accounting.moic.toFixed(2)}x`,
                  c.accounting.valuationBasis,
                ])}
              />
            </>
          )}

          {/* Uses of Funds Table */}
          {fund.usesOfFunds.length > 0 && (
            <>
              <SubSectionHeader>Uses of Funds</SubSectionHeader>
              <DataTable
                headers={['Category', 'Amount']}
                rows={[
                  ...fund.usesOfFunds.map((u) => [
                    u.category,
                    formatCurrencyFull(u.amount, currency),
                  ]),
                  [
                    <span key="total" className="font-bold">Total</span>,
                    <span key="totalval" className="font-bold">
                      {formatCurrencyFull(
                        fund.usesOfFunds.reduce((acc, u) => acc + u.amount, 0),
                        currency
                      )}
                    </span>,
                  ],
                ]}
              />
            </>
          )}

          {/* Geography Distribution */}
          <SubSectionHeader>Geographic Distribution</SubSectionHeader>
          <div className="flex items-center justify-center gap-8 mb-6">
            <PieChart width={280} height={280}>
              <Pie
                data={fund.geographicDistribution}
                dataKey="pct"
                nameKey="region"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={2}
                label={({ region, pct }: { region: string; pct: number }) => `${region} ${pct}%`}
                labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                style={{ fontSize: 10 }}
              >
                {fund.geographicDistribution.map((_, i) => (
                  <Cell key={i} fill={GEO_COLORS[i % GEO_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
            </PieChart>
            <div className="text-xs space-y-1">
              {fund.geographicDistribution.map((g, i) => (
                <div key={g.region} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: GEO_COLORS[i % GEO_COLORS.length] }} />
                  <span className="text-gray-700">{g.region}: {g.pct}% ({formatCurrency(g.amount, currency)})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Other Significant Developments */}
          {otherDevelopments && (
            <>
              <SubSectionHeader>Other Significant Developments</SubSectionHeader>
              <div className="prose prose-sm max-w-none mb-6">
                {otherDevelopments.split('\n').map((para, i) => (
                  <p key={i} className="text-xs text-gray-700 mb-2 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4: COMPANY SNAPSHOTS
        ════════════════════════════════════════════════════════════════ */}
        {activeCompanies.map((company, idx) => {
          const fin = latestFinancials(company);
          return (
            <div
              key={company.id}
              className={`print:break-before-page pt-8 print:pt-6 ${idx === 0 ? 'mt-8' : ''}`}
            >
              <SectionHeader>Company Snapshot: {company.name}</SectionHeader>

              {/* Company Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <KeyValueTable
                  data={[
                    ['Company Name', company.name],
                    ['Location', company.location],
                    ['Industry / Sector', company.sector],
                    ['Website', company.website],
                    ['Management Team', company.managementTeam],
                    ['Crane Lead Partner', company.owners.join(', ')],
                  ]}
                />
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">RAG Status History</div>
                  <RAGDots history={company.ragHistory} />
                  <div className="mt-3 text-xs">
                    <span className="font-medium text-gray-600">Current RAG: </span>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-bold"
                      style={{ backgroundColor: RAG_HEX[company.rag] ?? '#9CA3AF' }}
                    >
                      {company.rag}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Investment Details</div>
                    <table className="text-[10px] border-collapse">
                      <tbody>
                        <tr>
                          <td className="pr-3 font-medium text-gray-600 py-0.5">Stage:</td>
                          <td className="text-gray-800">{company.stage}</td>
                        </tr>
                        <tr>
                          <td className="pr-3 font-medium text-gray-600 py-0.5">Check Size:</td>
                          <td className="text-gray-800">{company.checkSize}</td>
                        </tr>
                        <tr>
                          <td className="pr-3 font-medium text-gray-600 py-0.5">Ownership:</td>
                          <td className="text-gray-800">{company.ownership}</td>
                        </tr>
                        <tr>
                          <td className="pr-3 font-medium text-gray-600 py-0.5">Cost:</td>
                          <td className="text-gray-800">{formatCurrency(company.accounting.costAtPeriodEnd, company.currency)}</td>
                        </tr>
                        <tr>
                          <td className="pr-3 font-medium text-gray-600 py-0.5">Carrying Value:</td>
                          <td className="text-gray-800">{formatCurrency(company.accounting.carryingValue, company.currency)}</td>
                        </tr>
                        <tr>
                          <td className="pr-3 font-medium text-gray-600 py-0.5">MoIC:</td>
                          <td className="text-gray-800">{company.accounting.moic.toFixed(2)}x</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Company Description */}
              <SubSectionHeader>Description</SubSectionHeader>
              <p className="text-xs text-gray-700 mb-4 leading-relaxed">{company.description}</p>

              {/* Recent Progress */}
              <SubSectionHeader>Recent Progress</SubSectionHeader>
              <p className="text-xs text-gray-700 mb-4 leading-relaxed">{company.recentProgress}</p>

              {/* Key Metrics */}
              {fin && (
                <>
                  <SubSectionHeader>Key Metrics (Latest Month)</SubSectionHeader>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'ARR', value: fin.arr ? formatCurrency(fin.arr, company.currency) : '-' },
                      { label: 'Cash Balance', value: fin.cashBalance ? formatCurrency(fin.cashBalance, company.currency) : '-' },
                      { label: 'Monthly Burn', value: fin.monthlyNetBurn ? formatCurrency(Math.abs(fin.monthlyNetBurn), company.currency) : '-' },
                      { label: 'Cash Runway', value: company.runway > 0 ? `${company.runway} months` : '-' },
                    ].map((m) => (
                      <div key={m.label} className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                        <div className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">{m.label}</div>
                        <div className="text-sm font-bold text-gray-900 mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Summary, Key Concerns, Action Points Table */}
              <SubSectionHeader>Assessment</SubSectionHeader>
              <table className="w-full text-xs border-collapse mb-4">
                <thead>
                  <tr>
                    {['Summary', 'Key Concerns', 'Action Points'].map((h) => (
                      <th key={h} className="bg-gray-100 border border-gray-300 px-2 py-1.5 text-left font-semibold text-gray-700 w-1/3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-2 align-top text-gray-700 leading-relaxed">
                      {company.summary}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 align-top">
                      <ul className="list-disc pl-3 space-y-0.5">
                        {company.keyConcerns.map((kc, i) => (
                          <li key={i} className="text-gray-700 leading-relaxed">{kc}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 align-top">
                      <ul className="list-disc pl-3 space-y-0.5">
                        {company.actionPoints.map((ap, i) => (
                          <li key={i} className="text-gray-700 leading-relaxed">{ap}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {/* ════════════════════════════════════════════════════════════════
            SECTION 5: COMPANY DATA PAGES
        ════════════════════════════════════════════════════════════════ */}
        {allCompanies.map((company) => {
          const fin = latestFinancials(company);
          return (
            <div key={`data-${company.id}`} className="print:break-before-page pt-8 print:pt-6">
              <SectionHeader>Company Data: {company.name}</SectionHeader>

              {/* Financial Summary Table */}
              <SubSectionHeader>Financial Summary</SubSectionHeader>
              <DataTable
                headers={['Metric', 'Value']}
                rows={[
                  ['ARR', fin?.arr ? formatCurrency(fin.arr, company.currency) : '-'],
                  ['Revenue (Monthly)', fin?.revenue ? formatCurrency(fin.revenue, company.currency) : '-'],
                  ['COGS', fin?.cogs ? formatCurrency(fin.cogs, company.currency) : '-'],
                  ['Gross Profit', fin?.grossProfit ? formatCurrency(fin.grossProfit, company.currency) : '-'],
                  ['Gross Margin', fin?.grossMargin ? `${(fin.grossMargin * 100).toFixed(1)}%` : '-'],
                  ['Overheads', fin?.overheads ? formatCurrency(fin.overheads, company.currency) : '-'],
                  ['EBITDA', fin?.ebitda ? formatCurrency(fin.ebitda, company.currency) : '-'],
                  ['Cash Balance', fin?.cashBalance ? formatCurrency(fin.cashBalance, company.currency) : '-'],
                  ['Monthly Net Burn', fin?.monthlyNetBurn ? formatCurrency(Math.abs(fin.monthlyNetBurn), company.currency) : '-'],
                  ['Cash Runway', company.runway > 0 ? `${company.runway} months` : '-'],
                  ['Headcount (FTE)', fin?.headcountFTE ? String(fin.headcountFTE) : String(company.headcount)],
                  ['Customers', String(company.customers)],
                ]}
              />

              {/* Investment Accounting */}
              <SubSectionHeader>Investment Accounting</SubSectionHeader>
              <DataTable
                headers={['Metric', 'Value']}
                rows={[
                  ['Cost at Period End', formatCurrency(company.accounting.costAtPeriodEnd, company.currency)],
                  ['Carrying Value', formatCurrency(company.accounting.carryingValue, company.currency)],
                  ['MoIC', `${company.accounting.moic.toFixed(2)}x`],
                  ['NAV Uplift', fmtM(company.accounting.navUplift, company.currency)],
                  ['Valuation Basis', company.accounting.valuationBasis],
                ]}
              />

              {/* Cost Breakdown */}
              {fin && (fin.rdCosts || fin.salesMarketingCosts || fin.generalAdminCosts) && (
                <>
                  <SubSectionHeader>Cost Breakdown</SubSectionHeader>
                  <DataTable
                    headers={['Category', 'Amount']}
                    rows={[
                      ['R&D Costs', fin.rdCosts ? formatCurrency(fin.rdCosts, company.currency) : '-'],
                      ['Sales & Marketing', fin.salesMarketingCosts ? formatCurrency(fin.salesMarketingCosts, company.currency) : '-'],
                      ['General & Admin', fin.generalAdminCosts ? formatCurrency(fin.generalAdminCosts, company.currency) : '-'],
                    ]}
                  />
                </>
              )}

              {/* Diversity & Inclusion */}
              {fin && fin.headcountFTE && (
                <>
                  <SubSectionHeader>Diversity &amp; Inclusion</SubSectionHeader>
                  <DataTable
                    headers={['Metric', 'FTE', 'Board']}
                    rows={[
                      ['Female %', fin.femalePctFTE ? `${fin.femalePctFTE}%` : '-', fin.femalePctBoard ? `${fin.femalePctBoard}%` : '-'],
                      ['Male %', fin.malePctFTE ? `${fin.malePctFTE}%` : '-', fin.malePctBoard ? `${fin.malePctBoard}%` : '-'],
                      ['Ethnic Minority %', fin.ethnicMinorityPctFTE ? `${fin.ethnicMinorityPctFTE}%` : '-', fin.ethnicMinorityPctBoard ? `${fin.ethnicMinorityPctBoard}%` : '-'],
                    ]}
                  />
                </>
              )}
            </div>
          );
        })}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="print:break-before-page pt-12 print:pt-6">
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-[10px] text-gray-400">
              This report is confidential and intended solely for the Limited Partners of {fund.name}.
              The information contained herein should not be distributed, published, or reproduced, in whole or in part,
              without the prior written consent of {fund.gp}.
            </p>
            <p className="text-[10px] text-gray-400 mt-2">
              Prepared by Crane Venture Partners &middot; {reportDate}
            </p>
          </div>
        </div>
      </div>

      {/* ── Print-specific styles ────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4;
            margin: 15mm 12mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:break-before-page {
            break-before: page;
          }
          .print\\:break-after-page {
            break-after: page;
          }
        }
      ` }} />
    </div>
  );
}
