import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Plus, Users, Database, Bell, Building2, Globe, Settings2, Landmark, FileText, Table, RotateCcw } from 'lucide-react';
import { teamMembers, companies, funds } from './mock-data';
import { useWorkflow } from './WorkflowContext';
import { useMilestone } from './Layout';

export function Settings() {
  const [activeTab, setActiveTab] = useState('sources');
  const { resetAll } = useWorkflow();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { milestone } = useMilestone();
  const isM1 = milestone === 'm1';

  const allTabs = [
    { id: 'sources', label: 'Data Sources', icon: Database, m1: true },
    { id: 'team', label: 'Team', icon: Users, m1: true },
    { id: 'funds', label: 'Fund Management', icon: Landmark },
    { id: 'portfolio', label: 'Portfolio Config', icon: Settings2 },
    { id: 'lp-template', label: 'LP Report Template', icon: FileText },
    { id: 'gigs-mapping', label: 'Gigs Field Mapping', icon: Table },
    { id: 'alerts', label: 'Alert Rules', icon: Bell },
    { id: 'companies', label: 'Companies', icon: Building2, m1: true },
    { id: 'external', label: 'External Data', icon: Globe },
  ];

  const tabs = isM1 ? allTabs.filter(t => t.m1) : allTabs;

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

  const [alertToggles, setAlertToggles] = useState<Record<string, boolean>>({
    'Runway Alert': true,
    'Burn Acceleration': true,
    'Growth Inflection': true,
    'Engagement Gap': true,
    'Board Coming Up': true,
    'Key Departure': true,
    'Fundraising Signal': true,
    'Market Signal': false,
    'Pivot Signal': false,
  });

  const flagRules = [
    { name: 'Runway Alert', threshold: '< 6 months', desc: 'Flag when runway drops below threshold' },
    { name: 'Burn Acceleration', threshold: '> 20% increase', desc: 'Burn rate increased while revenue flat' },
    { name: 'Growth Inflection', threshold: '> 15% MoM', desc: 'Revenue growth acceleration detected' },
    { name: 'Engagement Gap', threshold: '> 30 days', desc: 'No team interaction with company' },
    { name: 'Board Coming Up', threshold: '< 14 days', desc: 'Board meeting approaching' },
    { name: 'Key Departure', threshold: 'Any senior', desc: 'Senior team member departure detected' },
    { name: 'Fundraising Signal', threshold: 'Any signal', desc: 'Fundraising activity detected' },
    { name: 'Market Signal', threshold: 'High relevance', desc: 'External market events' },
    { name: 'Pivot Signal', threshold: 'Any detection', desc: 'Product/positioning change detected' },
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
    <div className="max-w-[1200px] mx-auto">
      {/* Page title row */}
      <h1 className="text-[24px] font-semibold tracking-tight text-slate-900 mb-6">Settings & Configuration</h1>

      <div className="flex gap-6">
        <div className="w-48 shrink-0 space-y-0.5 pt-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
              <h2 className="text-[18px] font-semibold text-slate-900">Data Sources</h2>
              <p className="text-[14px] text-slate-500">Manage connections to your data sources. Configure sync frequency and authentication.</p>
              <div className="grid grid-cols-2 gap-3 stagger-children">
                {(isM1 ? connectors.filter(c => c.name === 'Attio') : connectors).map(c => (
                  <div key={c.name} className={`bg-white rounded-xl p-5 hover:shadow-sm transition-all ${
                    c.status === 'Error'
                      ? 'border-2 border-red-200 bg-red-50/30 shadow-red-100/50'
                      : c.status === 'Disconnected'
                      ? 'border-2 border-dashed border-gray-300 opacity-70'
                      : 'border border-slate-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-medium ${
                        c.status === 'Error' ? 'bg-red-100 text-red-600' :
                        c.status === 'Disconnected' ? 'bg-gray-100 text-gray-400' :
                        'bg-slate-100 text-slate-900'
                      }`}>{c.name[0]}</div>
                      <div className="flex-1">
                        <p className="text-[15px] font-semibold text-slate-900">{c.name}</p>
                        <p className="text-[13px] text-slate-500">{c.desc}</p>
                      </div>
                      {c.status === 'Connected' && <CheckCircle className="w-5 h-5 text-emerald-500" aria-label="Connected" />}
                      {c.status === 'Error' && <AlertCircle className="w-5 h-5 text-red-500" aria-label="Connection error" />}
                      {c.status === 'Disconnected' && <XCircle className="w-5 h-5 text-gray-300" aria-label="Disconnected" />}
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-slate-500">
                      <span className={`text-[12px] px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'Connected' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'Error' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{c.status}</span>
                      <span>Last sync: {c.lastSync}</span>
                      <span className="font-mono-num">{c.records} records</span>
                    </div>
                    <button className={`w-full mt-3 text-[13px] text-center py-1.5 rounded-lg transition-colors font-medium ${
                      c.status === 'Error'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                        : c.status === 'Disconnected'
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}>
                      {c.status === 'Error' ? 'Fix Connection' : c.status === 'Disconnected' ? 'Connect' : 'Configure'}
                    </button>
                  </div>
                ))}
              </div>

              {!isM1 && (
              <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
                <h3 className="text-[15px] font-semibold">Data Conflict Resolution</h3>
                <p className="text-[13px] text-slate-500">
                  When multiple sources report different values for the same metric (e.g., cash balance from board deck vs. founder email), the system flags the discrepancy for manual review.
                </p>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[12px] font-medium mb-2">Source Priority Order</p>
                  <div className="space-y-1.5">
                    {[
                      { rank: 1, label: 'Fund Accounting', note: 'highest' },
                      { rank: 2, label: 'Founder-validated data', note: '' },
                      { rank: 3, label: 'Board deck (OCR)', note: '' },
                      { rank: 4, label: 'Email updates', note: '' },
                      { rank: 5, label: 'External signals', note: 'lowest' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px]">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-medium shrink-0">{s.rank}</span>
                        <span className="flex-1">{s.label}</span>
                        {s.note && <span className="text-[11px] text-slate-500 italic">({s.note})</span>}
                        {i < 4 && <span className="text-slate-500 text-[11px]">&rarr;</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-[12px] text-orange-800">Conflicting values are highlighted in orange during the review workflow. The team resolves discrepancies before finalizing quarterly data.</p>
                </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-900">Team Management</h2>
                  <p className="text-[13px] text-slate-500">{teamMembers.length} team members</p>
                </div>
                <button className="text-[12px] px-3 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600 transition-colors rounded-lg flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Invite Member
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {teamMembers.map(member => (
                  <div key={member.name} className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center justify-center text-[13px]">{member.avatar}</div>
                    <div className="flex-1">
                      <p className="text-[13px]">{member.name}</p>
                      <p className="text-[12px] text-slate-500">{member.role}</p>
                    </div>
                    <span className="text-[12px] text-slate-500">{member.companyCount} companies</span>
                    <select className="text-[12px] border border-slate-200 rounded-lg px-2 py-1 bg-white">
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
                <h2 className="text-[16px] font-semibold text-slate-900">Fund Management</h2>
                <button className="text-[12px] px-3 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600 transition-colors rounded-lg flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Fund
                </button>
              </div>
              <p className="text-[13px] text-slate-500">Define funds, standing data, accounting policy, and administrator details.</p>
              {funds.map(fund => (
                <div key={fund.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[15px]">{fund.name}</h3>
                      <p className="text-[12px] text-slate-500">Vintage {fund.vintage} · {fund.currency} · {fund.accountingBasis}</p>
                    </div>
                    <button className="text-[12px] px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">Edit</button>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-[12px]">
                    <div><span className="text-slate-500">Committed:</span> <span className="ml-1">£{(fund.totalCommitted / 1000000).toFixed(1)}M</span></div>
                    <div><span className="text-slate-500">Deployed:</span> <span className="ml-1">{fund.deployedPct}%</span></div>
                    <div><span className="text-slate-500">TVPI (Net):</span> <span className="ml-1">{fund.tvpiNet}x</span></div>
                    <div><span className="text-slate-500">DPI:</span> <span className="ml-1">{fund.dpi}x</span></div>
                    <div><span className="text-slate-500">GP:</span> <span className="ml-1">{fund.gp}</span></div>
                    <div><span className="text-slate-500">Administrator:</span> <span className="ml-1">{fund.administrator}</span></div>
                    <div><span className="text-slate-500">NAV:</span> <span className="ml-1">£{(fund.navCurrent / 1000000).toFixed(1)}M</span></div>
                    <div><span className="text-slate-500">Available:</span> <span className="ml-1">£{(fund.availableForDeployment / 1000000).toFixed(1)}M</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-slate-900">Portfolio Configuration</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-2">Review Schedule</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500">Monthly Review Day</label>
                      <select className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white">
                        <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                        <option>Thursday</option><option>Friday</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500">Quarterly Report Month</label>
                      <select className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white">
                        <option>January (Q4)</option><option>April (Q1)</option>
                        <option>July (Q2)</option><option>October (Q3)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-2">Exit Tracking Configuration</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-500">Default Exit Types</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['Sale', 'Wind-down', 'Write-off', 'Secondary'].map(t => (
                          <span key={t} className="text-[11px] px-2 py-0.5 bg-slate-100 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500">Escrow Tracking</label>
                      <select className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white">
                        <option>Enabled</option><option>Disabled</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500">Multi-Currency</label>
                      <select className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white">
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
              <h2 className="text-[16px] font-semibold text-slate-900">LP Report Template</h2>
              <p className="text-[13px] text-slate-500">Customise branding, section order, and chart styles for the quarterly LP report.</p>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500">Fund Name</label>
                    <input className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white" defaultValue="Crane VC" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Report Format</label>
                    <select className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white">
                      <option>PDF</option><option>PPTX</option><option>Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Chart Style</label>
                    <select className="w-full text-[12px] border border-slate-200 rounded-lg px-3 py-2 mt-1 bg-white">
                      <option>Bar with PY overlay</option><option>Line charts</option><option>Area charts</option>
                    </select>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-2">Report Sections (drag to reorder)</h3>
                  <div className="space-y-1">
                    {[
                      'Cover Page', 'Standing Data', "Manager's Commentary (NAV Waterfall, TVPI Charts)",
                      'Active Portfolio Table', 'Company Snapshots (RAG + Summary)',
                      'Company Data Pages (Charts + Diversity)', 'Exited Companies', 'Other Developments'
                    ].map((section, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-[12px]">
                        <span className="text-slate-500 w-5">{i + 1}.</span>
                        <span className="flex-1">{section}</span>
                        <label className="flex items-center gap-1 text-[11px] text-slate-500">
                          <input type="checkbox" defaultChecked className="rounded border-slate-200" /> Include
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
              <h2 className="text-[16px] font-semibold text-slate-900">Gigs Template Field Mapping</h2>
              <p className="text-[13px] text-slate-500">
                Configure which fields are active per stage. These are the exact fields from the Gigs Performance Data Template.
              </p>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2.5 text-left">Field</th>
                      <th className="px-3 py-2.5 text-left">Type</th>
                      <th className="px-3 py-2.5 text-left">Frequency</th>
                      <th className="px-3 py-2.5 text-center">Active</th>
                      <th className="px-3 py-2.5 text-center">Pre-Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gigsFields.map(f => (
                      <tr key={f.field} className="border-b border-slate-200 last:border-0">
                        <td className="px-3 py-2">{f.field}</td>
                        <td className="px-3 py-2 text-slate-500">{f.type}</td>
                        <td className="px-3 py-2 text-slate-500">{f.frequency}</td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" defaultChecked={f.active} className="rounded border-slate-200" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" defaultChecked={f.preRevenue} className="rounded border-slate-200" />
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
              <div>
                <h2 className="text-[18px] font-semibold text-slate-900">Alert Configuration</h2>
                <p className="text-[14px] text-slate-500 mt-1">These thresholds will be refined based on team feedback. Expect iteration.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {flagRules.map(rule => (
                  <div key={rule.name} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[14px] font-semibold text-slate-900">{rule.name}</p>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={alertToggles[rule.name]}
                        onClick={() => setAlertToggles(prev => ({ ...prev, [rule.name]: !prev[rule.name] }))}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${alertToggles[rule.name] ? 'bg-indigo-500' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${alertToggles[rule.name] ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                    <p className="text-[12px] text-slate-500 mb-3">{rule.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="bg-slate-100 text-[11px] px-2 py-0.5 rounded-md font-mono-num text-slate-700">{rule.threshold}</span>
                      <button className="text-[11px] px-2.5 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-[12px] text-amber-800">Alert rules are being calibrated. The team will refine thresholds after seeing initial results in practice.</p>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-900">Company Management</h2>
                  <p className="text-[13px] text-slate-500">{companies.length} portfolio companies ({companies.filter(c => c.lifecycle === 'Active — Core').length} active core)</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-[12px] px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">Import from Attio</button>
                  <button className="text-[12px] px-3 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600 transition-colors rounded-lg flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Company
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                {companies.map(c => (
                  <div key={c.id} className={`p-3 flex items-center gap-3 ${c.lifecycle !== 'Active — Core' ? 'opacity-60' : ''}`}>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px]" style={{ background: c.logoColor }}>
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px]">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.description}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded">{c.lifecycle}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded">{c.sector}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded">{c.stage}</span>
                    <span className="text-[11px] text-slate-500">{c.owners.join(', ')}</span>
                    <button className="text-[11px] text-indigo-600 hover:underline">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'external' && (
            <div className="space-y-4">
              <h2 className="text-[16px] font-semibold text-slate-900">External Data Configuration</h2>
              <p className="text-[13px] text-slate-500">Configure external signal sources and sector taxonomy.</p>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-2">Sector Taxonomy</h3>
                  <div className="flex flex-wrap gap-2">
                    {['DevTools', 'Data Infra', 'AI/ML', 'Security', 'Fintech', 'Cloud Infra', 'Developer Experience'].map(s => (
                      <span key={s} className="text-[12px] px-3 py-1 bg-slate-100 rounded-lg flex items-center gap-1">
                        {s}
                        <button className="text-slate-500 hover:text-slate-900 ml-1">x</button>
                      </span>
                    ))}
                    <button className="text-[12px] px-3 py-1 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-slate-900">
                      + Add Sector
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 mb-2">Signal Priority Rules</h3>
                  <div className="space-y-2">
                    {[
                      { rule: 'Competitor raised > £5M', priority: 'High' },
                      { rule: 'Sector M&A activity', priority: 'Medium' },
                      { rule: 'Portfolio company mentioned in news', priority: 'High' },
                      { rule: 'Hiring changes in tangential companies', priority: 'Low' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-3 text-[12px]">
                        <span className="flex-1">{r.rule}</span>
                        <select className="border border-slate-200 rounded px-2 py-1 text-[11px] bg-white" defaultValue={r.priority}>
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
          <div className="mt-10 pt-6 border-t border-slate-200">
            <h3 className="text-[14px] font-medium mb-2">Demo Controls</h3>
            <p className="text-[13px] text-slate-500 mb-4">
              Reset all workflow data (notes, to-dos, flag actions, review progress) back to the initial demo state.
              This clears localStorage and reloads mock data.
            </p>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-[13px] px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
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
                  className="text-[12px] px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
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
