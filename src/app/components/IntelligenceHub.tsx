import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Globe, TrendingUp, Filter, RefreshCw, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { companies, sectors } from './mock-data';

const sectorData = [
  { sector: 'DevTools', funding90d: 180, deals: 24, avgDeal: 7.5, hiring: '+12%', portfolioCos: companies.filter(c => c.sector === 'DevTools').length },
  { sector: 'Data Infra', funding90d: 320, deals: 18, avgDeal: 17.8, hiring: '+8%', portfolioCos: companies.filter(c => c.sector === 'Data Infra').length },
  { sector: 'AI/ML', funding90d: 890, deals: 45, avgDeal: 19.8, hiring: '+25%', portfolioCos: companies.filter(c => c.sector === 'AI/ML').length },
  { sector: 'Security', funding90d: 210, deals: 15, avgDeal: 14.0, hiring: '+6%', portfolioCos: companies.filter(c => c.sector === 'Security').length },
  { sector: 'Fintech', funding90d: 150, deals: 12, avgDeal: 12.5, hiring: '+3%', portfolioCos: companies.filter(c => c.sector === 'Fintech').length },
];

const competitorData = companies.slice(0, 8).map((c, i) => ({
  name: c.name,
  id: c.id,
  funding: parseFloat(c.checkSize.replace(/[£€$]/g, '').replace('M', '').replace('K', '')) * (c.checkSize.includes('M') ? 1 : 0.001),
  headcount: c.headcount,
  traffic: c.customers * 200 + i * 500,
  isPortfolio: true,
}));

const externalSignals = [
  { date: '2026-03-16', source: 'Specter', headline: 'CrowdAPI raises €15M Series A (API Security)', relevance: 'High', sector: 'Security' },
  { date: '2026-03-15', source: 'News', headline: 'Datadog acquires infrastructure monitoring startup for $200M', relevance: 'Medium', sector: 'Data Infra' },
  { date: '2026-03-14', source: 'Specter', headline: 'CodeReview.ai headcount up 40% in 3 months', relevance: 'High', sector: 'DevTools' },
  { date: '2026-03-13', source: 'Crunchbase', headline: 'AI agent frameworks see 3x funding increase YoY', relevance: 'Medium', sector: 'AI/ML' },
  { date: '2026-03-12', source: 'News', headline: 'EU AI Act enforcement timeline clarified — compliance deadlines moving up', relevance: 'Low', sector: 'AI/ML' },
  { date: '2026-03-11', source: 'LinkedIn', headline: 'Multiple senior hires at competitor DevOps tooling company', relevance: 'Medium', sector: 'DevTools' },
  { date: '2026-03-10', source: 'Specter', headline: 'Web traffic for DataPipeline.io up 85% MoM', relevance: 'High', sector: 'Data Infra' },
  { date: '2026-03-09', source: 'News', headline: 'FinAPI announces shutdown — market consolidation signal', relevance: 'Medium', sector: 'Fintech' },
];

const specterMappings = companies.map(c => ({
  company: c.name,
  domain: `${c.name.toLowerCase().replace(/\s/g, '')}.io`,
  status: Math.random() > 0.2 ? 'Matched' : 'Unmatched',
  lastSync: Math.random() > 0.3 ? '2 hours ago' : '1 day ago',
  signals: Math.random() > 0.3,
}));

export function IntelligenceHub() {
  const [activeTab, setActiveTab] = useState<'sectors' | 'competitors' | 'signals' | 'specter'>('sectors');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');

  const tabs = [
    { id: 'sectors', label: 'Sector Dashboards' },
    { id: 'competitors', label: 'Competitor Graph' },
    { id: 'signals', label: 'Signal Feed' },
    { id: 'specter', label: 'Specter Integration' },
  ];

  const filteredSignals = externalSignals
    .filter(s => sectorFilter === 'all' || s.sector === sectorFilter)
    .filter(s => relevanceFilter === 'all' || s.relevance === relevanceFilter);

  const chartData = sectorData.map(s => ({ name: s.sector, funding: s.funding90d, deals: s.deals }));

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      {/* Tabs */}
      <div className="border-b border-border flex gap-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-[13px] border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sectors' && (
        <div className="space-y-6">
          {/* Sector overview chart */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[13px] mb-3">Sector Funding Activity (Last 90 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `£${v}M`} />
                <Tooltip formatter={(v: number) => `£${v}M`} />
                <Bar dataKey="funding" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sector cards */}
          <div className="grid grid-cols-2 gap-3">
            {sectorData.map(s => (
              <div key={s.sector} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px]">{s.sector}</h3>
                  <span className="text-[11px] text-muted-foreground">{s.portfolioCos} portfolio companies</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Funding (90d)</p>
                    <p className="text-[15px]">£{s.funding90d}M</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Deals</p>
                    <p className="text-[15px]">{s.deals}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Avg Deal</p>
                    <p className="text-[15px]">£{s.avgDeal}M</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Hiring</p>
                    <p className="text-[15px] text-emerald-600">{s.hiring}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {companies.filter(c => c.sector === s.sector).map(c => (
                    <span key={c.id} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{c.name}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'competitors' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[13px] mb-1">Competitive Landscape</h3>
            <p className="text-[11px] text-muted-foreground mb-4">Bubble size = estimated web traffic. Blue = Crane portfolio.</p>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" dataKey="funding" name="Funding (€M)" tick={{ fontSize: 11 }} label={{ value: 'Funding (€M)', position: 'bottom', fontSize: 11 }} />
                <YAxis type="number" dataKey="headcount" name="Headcount" tick={{ fontSize: 11 }} label={{ value: 'Headcount', angle: -90, position: 'left', fontSize: 11 }} />
                <ZAxis type="number" dataKey="traffic" range={[100, 1000]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: number, name: string) => {
                  if (name === 'Funding (€M)') return `€${v.toFixed(1)}M`;
                  return v;
                }} />
                <Scatter data={competitorData} fill="#3B82F6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'signals' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}
              className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
              <option value="all">All Sectors</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={relevanceFilter} onChange={e => setRelevanceFilter(e.target.value)}
              className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
              <option value="all">All Relevance</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="space-y-2">
            {filteredSignals.map((signal, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3 hover:shadow-sm transition-shadow cursor-pointer">
                <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      signal.relevance === 'High' ? 'bg-red-100 text-red-700' :
                      signal.relevance === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{signal.relevance}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">{signal.sector}</span>
                    <span className="text-[10px] text-muted-foreground">{signal.source}</span>
                  </div>
                  <p className="text-[13px]">{signal.headline}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{signal.date}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="text-[10px] px-2 py-0.5 border border-border rounded hover:bg-muted" title="Pin as relevant">Pin</button>
                  <button className="text-[10px] px-2 py-0.5 border border-border rounded hover:bg-muted text-muted-foreground" title="Dismiss">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'specter' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-muted-foreground">
              {specterMappings.filter(m => m.status === 'Matched').length} of {specterMappings.length} companies matched
            </p>
            <button className="text-[12px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Sync All
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {specterMappings.map((m, i) => (
              <div key={i} className="p-3 flex items-center gap-3">
                {m.status === 'Matched' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">{m.company}</span>
                    <span className="text-[11px] text-muted-foreground">{m.domain}</span>
                  </div>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded ${
                  m.status === 'Matched' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{m.status}</span>
                <span className="text-[11px] text-muted-foreground">{m.lastSync}</span>
                {m.signals && <span className="text-[10px] text-emerald-600">Signals Active</span>}
              </div>
            ))}
          </div>

          {/* Budget Tracker */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-[13px] mb-3">Data Source Budget</h3>
            <div className="space-y-2">
              {[
                { name: 'Specter', status: 'Connected', cost: 'Existing sub', usage: '245 API calls/mo' },
                { name: 'AlphaSense', status: 'Connected', cost: 'Existing sub', usage: '52 queries/mo' },
                { name: 'Google News', status: 'Connected', cost: 'Free', usage: '120 alerts/mo' },
                { name: 'Crunchbase Basic', status: 'Connected', cost: 'Free', usage: '30 lookups/mo' },
                { name: 'LinkedIn', status: 'Manual', cost: 'Free', usage: 'Public profiles only' },
                { name: 'Crunchbase Pro', status: 'Not connected', cost: '~€500/mo', usage: '—' },
              ].map((source, i) => (
                <div key={i} className="flex items-center gap-3 text-[12px] py-1.5">
                  {source.status === 'Connected' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : source.status === 'Manual' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span className="w-32">{source.name}</span>
                  <span className="w-24 text-muted-foreground">{source.cost}</span>
                  <span className="flex-1 text-muted-foreground">{source.usage}</span>
                  <button className="text-[11px] text-primary hover:underline">Configure</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}