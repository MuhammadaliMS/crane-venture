import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Plus, Users, Database, Bell, Building2, Globe, Settings2, Landmark, FileText, Table, RotateCcw } from 'lucide-react';
import { teamMembers, companies, funds } from './mock-data';
import { useWorkflow } from './WorkflowContext';

export function Settings() {
  const [activeTab, setActiveTab] = useState('sources');
  const { resetAll } = useWorkflow();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tabs = [
    { id: 'sources', label: 'Data Sources', icon: Database },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'funds', label: 'Fund Management', icon: Landmark },
    { id: 'portfolio', label: 'Portfolio Config', icon: Settings2 },
    { id: 'lp-template', label: 'LP Report Template', icon: FileText },
    { id: 'gigs-mapping', label: 'Gigs Field Mapping', icon: Table },
    { id: 'alerts', label: 'Alert Rules', icon: Bell },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'external', label: 'External Data', icon: Globe },
  ];

  const connectors = [
    { name: 'Attio', status: 'Connected', lastSync: '2 hours ago', records: 58, desc: 'CRM — companies, founders, interactions' },
    { name: 'Dropbox', status: 'Connected', lastSync: '6 hours ago', records: 342, desc: 'Documents — IC papers, board decks, financials' },
    { name: 'Notion', status: 'Connected', lastSync: '1 day ago', records: 24, desc: 'Wiki — portfolio database, meeting notes' },
    { name: 'Granola', status: 'Error', lastSync: '3 days ago', records: 89, desc: 'Meeting transcripts, call notes' },
    { name: 'Gmail', status: 'Connected', lastSync: '30 min ago', records: 156, desc: 'Founder updates, investor communications' },
    { name: 'Specter', status: 'Connected', lastSync: '12 hours ago', records: 45, desc: 'Company signals, web traffic, hiring data' },
    { name: 'Fund Accounting', status: 'Connected', lastSync: '1 week ago', records: 17, desc: 'Cost basis, carrying value, NAV, TVPI/DPI' },
    { name: 'AlphaSense', status: 'Disconnected', lastSync: 'Never', records: 0, desc: 'Market intelligence, research reports' },
  ];

  const flagRules = [
    { name: 'Runway Alert', threshold: '< 6 months', enabled: true, desc: 'Flag when runway drops below threshold' },
    { name: 'Burn Acceleration', threshold: '> 20% increase', enabled: true, desc: 'Burn rate increased while revenue flat' },
    { name: 'Growth Inflection', threshold: '> 15% MoM', enabled: true, desc: 'Revenue growth acceleration detected' },
    { name: 'Engagement Gap', threshold: '> 30 days', enabled: true, desc: 'No team interaction with company' },
    { name: 'Board Coming Up', threshold: '< 14 days', enabled: true, desc: 'Board meeting approaching' },
    { name: 'Key Departure', threshold: 'Any senior', enabled: true, desc: 'Senior team member departure detected' },
    { name: 'Fundraising Signal', threshold: 'Any signal', enabled: true, desc: 'Fundraising activity detected' },
    { name: 'Market Signal', threshold: 'High relevance', enabled: false, desc: 'External market events' },
    { name: 'Pivot Signal', threshold: 'Any detection', enabled: false, desc: 'Product/positioning change detected' },
  ];

  const gigsFields = [
    { field: 'Currency', type: 'Enum', frequency: 'Per company', active: true, preRevenue: true },
    { field: 'Annual Recurring Revenue', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'Revenue', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'Cost of Sales', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'Overheads', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'Gross Profit', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'Gross Profit Margin', type: 'Percentage', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'EBITDA', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'EBITDA Margin', type: 'Percentage', frequency: 'Monthly', active: true, preRevenue: false },
    { field: 'Cash Burn LTM', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Cash Balance', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Monthly Net Burn', type: 'Currency', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Headcount (FTE)', type: 'Integer', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Board Headcount', type: 'Integer', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Female % (FTE)', type: 'Percentage', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Female % (Board)', type: 'Percentage', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Ethnic Minority % (FTE)', type: 'Percentage', frequency: 'Monthly', active: true, preRevenue: true },
    { field: 'Ethnic Minority % (Board)', type: 'Percentage', frequency: 'Monthly', active: true, preRevenue: true },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <div className="flex gap-6">
        <div className="w-48 shrink-0 space-y-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeTab === tab.id ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <h2 className="text-[16px]">Data Sources</h2>
              <p className="text-[13px] text-muted-foreground">Manage connections to your data sources. Configure sync frequency and authentication.</p>
              <div className="grid grid-cols-2 gap-3">
                {connectors.map(c => (
                  <div key={c.name} className={`bg-card rounded-xl p-4 hover:shadow-sm transition-all ${
                    c.status === 'Error'
                      ? 'border-2 border-red-300 bg-red-50/30 shadow-red-100/50'
                      : c.status === 'Disconnected'
                      ? 'border-2 border-dashed border-gray-300 opacity-70'
                      : 'border border-border'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[14px] font-medium ${
                        c.status === 'Error' ? 'bg-red-100 text-red-600' :
                        c.status === 'Disconnected' ? 'bg-gray-100 text-gray-400' :
                        'bg-muted text-foreground'
                      }`}>{c.name[0]}</div>
                      <div className="flex-1">
                        <p className="text-[14px] font-medium">{c.name}</p>
                        <p className="text-[11px] text-muted-foreground">{c.desc}</p>
                      </div>
                      {c.status === 'Connected' && <CheckCircle className="w-5 h-5 text-emerald-500" aria-label="Connected" />}
                      {c.status === 'Error' && <AlertCircle className="w-5 h-5 text-red-500" aria-label="Connection error" />}
                      {c.status === 'Disconnected' && <XCircle className="w-5 h-5 text-gray-300" aria-label="Disconnected" />}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'Connected' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'Error' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{c.status}</span>
                      <span>Last sync: {c.lastSync}</span>
                      <span>{c.records} records</span>
                    </div>
                    <button className={`w-full mt-3 text-[12px] text-center py-1.5 rounded-lg transition-colors font-medium ${
                      c.status === 'Error'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        : c.status === 'Disconnected'
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'border border-border hover:bg-muted'
                    }`}>
                      {c.status === 'Error' ? 'Fix Connection' : c.status === 'Disconnected' ? 'Connect' : 'Configure'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px]">Team Management</h2>
                  <p className="text-[13px] text-muted-foreground">{teamMembers.length} team members</p>
                </div>
                <button className="text-[12px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Invite Member
                </button>
              </div>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {teamMembers.map(member => (
                  <div key={member.name} className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[13px]">{member.avatar}</div>
                    <div className="flex-1">
                      <p className="text-[13px]">{member.name}</p>
                      <p className="text-[12px] text-muted-foreground">{member.role}</p>
                    </div>
                    <span className="text-[12px] text-muted-foreground">{member.companyCount} companies</span>
                    <select className="text-[12px] border border-border rounded-lg px-2 py-1 bg-card">
                      <option>{member.role === 'General Partner' || member.role === 'VP Operations' ? 'Admin' : 'Member'}</option>
                      <option>Admin</option>
                      <option>Member</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'funds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px]">Fund Management</h2>
                <button className="text-[12px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Fund
                </button>
              </div>
              <p className="text-[13px] text-muted-foreground">Define funds, standing data, accounting policy, and administrator details.</p>
              {funds.map(fund => (
                <div key={fund.id} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[15px]">{fund.name}</h3>
                      <p className="text-[12px] text-muted-foreground">Vintage {fund.vintage} · {fund.currency} · {fund.accountingBasis}</p>
                    </div>
                    <button className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted">Edit</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-[12px]">
                    <div><span className="text-muted-foreground">Committed:</span> <span className="ml-1">£{(fund.totalCommitted / 1000000).toFixed(1)}M</span></div>
                    <div><span className="text-muted-foreground">Deployed:</span> <span className="ml-1">{fund.deployedPct}%</span></div>
                    <div><span className="text-muted-foreground">TVPI (Net):</span> <span className="ml-1">{fund.tvpiNet}x</span></div>
                    <div><span className="text-muted-foreground">DPI:</span> <span className="ml-1">{fund.dpi}x</span></div>
                    <div><span className="text-muted-foreground">GP:</span> <span className="ml-1">{fund.gp}</span></div>
                    <div><span className="text-muted-foreground">Administrator:</span> <span className="ml-1">{fund.administrator}</span></div>
                    <div><span className="text-muted-foreground">NAV:</span> <span className="ml-1">£{(fund.navCurrent / 1000000).toFixed(1)}M</span></div>
                    <div><span className="text-muted-foreground">Available:</span> <span className="ml-1">£{(fund.availableForDeployment / 1000000).toFixed(1)}M</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <h2 className="text-[16px]">Portfolio Configuration</h2>
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-[13px] mb-2">Review Schedule</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Monthly Review Day</label>
                      <select className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card">
                        <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                        <option>Thursday</option><option>Friday</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Quarterly Report Month</label>
                      <select className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card">
                        <option>January (Q4)</option><option>April (Q1)</option>
                        <option>July (Q2)</option><option>October (Q3)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] mb-2">Exit Tracking Configuration</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Default Exit Types</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['Sale', 'Wind-down', 'Write-off', 'Secondary'].map(t => (
                          <span key={t} className="text-[11px] px-2 py-0.5 bg-muted rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Escrow Tracking</label>
                      <select className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card">
                        <option>Enabled</option><option>Disabled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Multi-Currency</label>
                      <select className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card">
                        <option>GBP + USD + EUR</option><option>GBP only</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lp-template' && (
            <div className="space-y-4">
              <h2 className="text-[16px]">LP Report Template</h2>
              <p className="text-[13px] text-muted-foreground">Customise branding, section order, and chart styles for the quarterly LP report.</p>
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground">Fund Name</label>
                    <input className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card" defaultValue="Crane VC" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Report Format</label>
                    <select className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card">
                      <option>PDF</option><option>PPTX</option><option>Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground">Chart Style</label>
                    <select className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card">
                      <option>Bar with PY overlay</option><option>Line charts</option><option>Area charts</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] mb-2">Report Sections (drag to reorder)</h3>
                  <div className="space-y-1">
                    {[
                      'Cover Page', 'Standing Data', "Manager's Commentary (NAV Waterfall, TVPI Charts)",
                      'Active Portfolio Table', 'Company Snapshots (RAG + Summary)',
                      'Company Data Pages (Charts + Diversity)', 'Exited Companies', 'Other Developments'
                    ].map((section, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 text-[12px]">
                        <span className="text-muted-foreground w-5">{i + 1}.</span>
                        <span className="flex-1">{section}</span>
                        <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <input type="checkbox" defaultChecked className="rounded border-border" /> Include
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gigs-mapping' && (
            <div className="space-y-4">
              <h2 className="text-[16px]">Gigs Template Field Mapping</h2>
              <p className="text-[13px] text-muted-foreground">
                Configure which fields are active per stage. These are the exact fields from the Gigs Performance Data Template.
              </p>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-2.5 text-left">Field</th>
                      <th className="px-3 py-2.5 text-left">Type</th>
                      <th className="px-3 py-2.5 text-left">Frequency</th>
                      <th className="px-3 py-2.5 text-center">Active</th>
                      <th className="px-3 py-2.5 text-center">Pre-Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gigsFields.map(f => (
                      <tr key={f.field} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">{f.field}</td>
                        <td className="px-3 py-2 text-muted-foreground">{f.type}</td>
                        <td className="px-3 py-2 text-muted-foreground">{f.frequency}</td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" defaultChecked={f.active} className="rounded border-border" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" defaultChecked={f.preRevenue} className="rounded border-border" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h2 className="text-[16px]">Alert & Flag Rules</h2>
              <p className="text-[13px] text-muted-foreground">Configure thresholds for proactive flags. Changes apply to all companies unless overridden.</p>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {flagRules.map(rule => (
                  <div key={rule.name} className="p-4 flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={rule.enabled} className="sr-only peer" />
                      <div className="w-9 h-5 bg-switch-background peer-checked:bg-primary rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                    <div className="flex-1">
                      <p className="text-[13px]">{rule.name}</p>
                      <p className="text-[11px] text-muted-foreground">{rule.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px]">{rule.threshold}</p>
                      <button className="text-[11px] text-primary hover:underline">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px]">Company Management</h2>
                  <p className="text-[13px] text-muted-foreground">{companies.length} portfolio companies ({companies.filter(c => c.lifecycle === 'Active — Core').length} active core)</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted">Import from Attio</button>
                  <button className="text-[12px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Company
                  </button>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {companies.map(c => (
                  <div key={c.id} className={`p-3 flex items-center gap-3 ${c.lifecycle !== 'Active — Core' ? 'opacity-60' : ''}`}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px]" style={{ background: c.logoColor }}>
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px]">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-muted rounded">{c.lifecycle}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-muted rounded">{c.sector}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-muted rounded">{c.stage}</span>
                    <span className="text-[11px] text-muted-foreground">{c.owner}</span>
                    <button className="text-[11px] text-primary hover:underline">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-4">
              <h2 className="text-[16px]">External Data Configuration</h2>
              <p className="text-[13px] text-muted-foreground">Configure external signal sources and sector taxonomy.</p>
              <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div>
                  <h3 className="text-[13px] mb-2">Sector Taxonomy</h3>
                  <div className="flex flex-wrap gap-2">
                    {['DevTools', 'Data Infra', 'AI/ML', 'Security', 'Fintech', 'Cloud Infra', 'Developer Experience'].map(s => (
                      <span key={s} className="text-[12px] px-3 py-1 bg-muted rounded-lg flex items-center gap-1">
                        {s}
                        <button className="text-muted-foreground hover:text-foreground ml-1">x</button>
                      </span>
                    ))}
                    <button className="text-[12px] px-3 py-1 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground">
                      + Add Sector
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-[13px] mb-2">Signal Priority Rules</h3>
                  <div className="space-y-2">
                    {[
                      { rule: 'Competitor raised > £5M', priority: 'High' },
                      { rule: 'Sector M&A activity', priority: 'Medium' },
                      { rule: 'Portfolio company mentioned in news', priority: 'High' },
                      { rule: 'Hiring changes in tangential companies', priority: 'Low' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-3 text-[12px]">
                        <span className="flex-1">{r.rule}</span>
                        <select className="border border-border rounded px-2 py-1 text-[11px] bg-card" defaultValue={r.priority}>
                          <option>High</option><option>Medium</option><option>Low</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Reset section — always shown at bottom */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-[14px] font-medium mb-2">Demo Controls</h3>
            <p className="text-[12px] text-muted-foreground mb-3">
              Reset all workflow data (notes, to-dos, flag actions, review progress) back to the initial demo state.
              This clears localStorage and reloads mock data.
            </p>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-[12px] px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-red-600 font-medium">Are you sure? This cannot be undone.</span>
                <button
                  onClick={() => { resetAll(); setShowResetConfirm(false); }}
                  className="text-[12px] px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="text-[12px] px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
