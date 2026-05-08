import { useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Plus, Users, Database, Building2, Shield, RotateCcw, X, Search } from 'lucide-react';
import { teamMembers, companies } from './mock-data';
import { useWorkflow } from './WorkflowContext';
import { useMilestone } from './Layout';

type ConnectorStatus = 'Connected' | 'Disconnected' | 'Expired';
type Connector = { name: string; status: ConnectorStatus; lastSync: string; records: number; desc: string };

export function Settings() {
  const [activeTab, setActiveTab] = useState('sources');
  const { resetAll } = useWorkflow();
  const { milestone } = useMilestone();
  const isM1 = milestone === 'm1';
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showImportAttio, setShowImportAttio] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

  // M1: only Data Sources + Team. Full MVP: also Companies + Conflict Resolution.
  const allTabs = [
    { id: 'sources',    label: 'Data Sources',        icon: Database,   m1: true },
    { id: 'team',       label: 'Team',                icon: Users,      m1: true },
    { id: 'companies',  label: 'Companies',           icon: Building2 },
    { id: 'conflict',   label: 'Conflict Resolution', icon: Shield },
  ];
  const tabs = isM1 ? allTabs.filter(t => t.m1) : allTabs;
  // If the active tab isn't valid for the current milestone, fall back to the first available tab
  const safeActiveTab = tabs.some(t => t.id === activeTab) ? activeTab : tabs[0].id;

  // Connectors: M1 only Attio (rest are Full MVP only)
  const allConnectors: (Connector & { m1?: boolean })[] = [
    { name: 'Attio',   status: 'Connected',    lastSync: '2 hours ago',  records: 58,  desc: 'CRM — companies, founders, interactions', m1: true },
    { name: 'Gmail',   status: 'Connected',    lastSync: '30 min ago',   records: 156, desc: 'Founder updates, investor communications' },
    { name: 'Granola', status: 'Expired',      lastSync: '8 days ago',   records: 89,  desc: 'Meeting transcripts, call notes' },
    { name: 'Dropbox', status: 'Connected',    lastSync: '6 hours ago',  records: 342, desc: 'Documents — IC papers, board decks, financials' },
    { name: 'Notion',  status: 'Disconnected', lastSync: 'Never',        records: 0,   desc: 'Wiki — portfolio database, meeting notes' },
  ];
  const [connectors, setConnectors] = useState<Connector[]>(allConnectors);
  const visibleConnectors = isM1 ? connectors.filter(c => allConnectors.find(a => a.name === c.name)?.m1) : connectors;

  const updateConnectorStatus = (name: string, status: ConnectorStatus) => {
    setConnectors(prev => prev.map(c => c.name === name ? { ...c, status, lastSync: status === 'Connected' ? 'just now' : c.lastSync } : c));
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <h1 className="font-display text-[34px] leading-tight text-foreground mb-6">Settings &amp; Configuration</h1>

      <div className="flex gap-6">
        <div className="w-48 shrink-0 space-y-0.5 pt-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                safeActiveTab === tab.id ? 'bg-accent text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {/* ─── DATA SOURCES ─── */}
          {safeActiveTab === 'sources' && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-semibold text-foreground">Data Sources</h2>
              <p className="text-[14px] text-muted-foreground">
                Manage connections to your data sources. Disconnect sources you no longer need; expired connections must be re-authorized.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {visibleConnectors.map(c => {
                  const isConnected = c.status === 'Connected';
                  const isExpired = c.status === 'Expired';
                  const isDisconnected = c.status === 'Disconnected';

                  return (
                    <div key={c.name} className={`bg-card rounded-md p-4 transition-colors border ${
                      isExpired ? 'border-[#B8763A]/40' :
                      isDisconnected ? 'border-dashed border-border' :
                      'border-border'
                    }`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-[13px] font-medium shrink-0">
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-foreground leading-tight">{c.name}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{c.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mb-3">
                        <span className={`inline-flex items-center gap-1.5 ${
                          isConnected ? 'text-foreground/80' :
                          isExpired ? 'text-[#B8763A]' :
                          'text-muted-foreground/70'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isConnected ? 'bg-[#5C7A6E]' :
                            isExpired ? 'bg-[#B8763A]' :
                            'bg-muted-foreground/30'
                          }`} />
                          {c.status}
                        </span>
                        <span className="text-muted-foreground">{c.lastSync}</span>
                        <span className="font-mono-num text-muted-foreground">{c.records} records</span>
                      </div>
                      {isConnected && (
                        <button
                          onClick={() => updateConnectorStatus(c.name, 'Disconnected')}
                          className="w-full text-[12px] h-9 rounded-md border border-border hover:border-foreground/20 hover:bg-muted text-foreground/85 font-medium transition-colors"
                        >
                          Disconnect
                        </button>
                      )}
                      {isExpired && (
                        <button
                          onClick={() => updateConnectorStatus(c.name, 'Connected')}
                          className="w-full text-[12px] h-9 rounded-md border border-[#B8763A]/50 text-[#B8763A] hover:bg-[#B8763A]/8 font-medium transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                        </button>
                      )}
                      {isDisconnected && (
                        <button
                          onClick={() => updateConnectorStatus(c.name, 'Connected')}
                          className="w-full text-[12px] h-9 rounded-md bg-foreground hover:bg-foreground/90 text-background font-medium transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {safeActiveTab === 'team' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">Team</h2>
                  <p className="text-[13px] text-muted-foreground">{teamMembers.length} team members · all are Admins for V1</p>
                </div>
                {!isM1 && (
                  <button
                    onClick={() => setShowInviteMember(true)}
                    className="text-[12px] px-3 py-2 bg-primary text-white hover:bg-[var(--primary-muted)] transition-colors rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Invite Member
                  </button>
                )}
              </div>
              <div className="bg-card rounded-md border border-border divide-y divide-border/60">
                {teamMembers.map(member => (
                  <div key={member.name} className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[12px] font-medium">{member.avatar}</div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-foreground">{member.name}</p>
                      <p className="text-[12px] text-muted-foreground">{member.role}</p>
                    </div>
                    <span className="text-[12px] text-muted-foreground font-mono-num">{member.companyCount} companies</span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Admin</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── COMPANIES ─── */}
          {safeActiveTab === 'companies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-foreground">Companies</h2>
                  <p className="text-[13px] text-muted-foreground">{companies.length} portfolio companies</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowImportAttio(true)}
                    className="text-[12px] px-3 py-2 border border-border rounded-lg hover:bg-muted/60 transition-colors flex items-center gap-1.5"
                  >
                    <Database className="w-3 h-3" /> Import from Attio
                  </button>
                  <button
                    onClick={() => setShowAddCompany(true)}
                    className="text-[12px] px-3 py-2 bg-primary text-white hover:bg-[var(--primary-muted)] transition-colors rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Company
                  </button>
                </div>
              </div>
              <div className="bg-card rounded-md border border-border divide-y divide-border/60">
                {companies.map(c => (
                  <div key={c.id} className={`p-3 flex items-center gap-3 ${c.lifecycle !== 'Active — Core' ? 'opacity-60' : ''}`}>
                    <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-[11px] font-medium">{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.description}</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 bg-muted rounded">{c.sector}</span>
                    <span className="text-[11px] px-2 py-0.5 bg-muted rounded">{c.stage}</span>
                    <span className="text-[11px] text-muted-foreground">{c.owners.join(', ')}</span>
                    <button className="text-[11px] text-primary hover:underline">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CONFLICT RESOLUTION ─── */}
          {safeActiveTab === 'conflict' && (
            <div className="space-y-4">
              <h2 className="text-[18px] font-semibold text-foreground">Conflict Resolution</h2>
              <p className="text-[13px] text-muted-foreground">
                Rules for resolving discrepancies when the same data point is detected from multiple sources.
              </p>
              <div className="bg-white rounded-xl border border-border p-5 space-y-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-foreground mb-3">Source Priority (highest → lowest)</h3>
                  <div className="space-y-2">
                    {[
                      { source: 'Founder-confirmed (form submission)', desc: 'Always wins — founder-validated quarterly data is canonical' },
                      { source: 'Crane team override (manual edit)', desc: 'Crane team can override the founder value if the founder confirms in writing' },
                      { source: 'Connector-detected (Granola, Gmail, Notion)', desc: 'Used when no founder/team value exists. Requires team confirmation before write.' },
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/60 border border-border/60">
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">{i + 1}</div>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{r.source}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{r.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <h3 className="text-[14px] font-semibold text-foreground mb-2">Timing Rule</h3>
                  <p className="text-[12px] text-foreground/80 leading-relaxed">
                    When two values exist for the same field, the <strong>most recent</strong> value wins, scoped within the priority above.
                    Edits made by the Crane team are stamped with the editor's name and timestamp; data ingested from connectors carries its source label and detection time.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reset section — always shown at bottom */}
          <div className="mt-10 pt-6 border-t border-border">
            <h3 className="text-[14px] font-medium mb-2">Demo Controls</h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              Reset all workflow data back to the initial demo state. This clears localStorage and reloads mock data.
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
                <button onClick={() => { resetAll(); setShowResetConfirm(false); }} className="text-[12px] px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Yes, reset</button>
                <button onClick={() => setShowResetConfirm(false)} className="text-[12px] px-4 py-2 border border-border rounded-lg hover:bg-muted/60 transition-colors">Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── ADD COMPANY MODAL ─── */}
      {showAddCompany && <AddCompanyModal onClose={() => setShowAddCompany(false)} />}
      {showImportAttio && <ImportAttioModal onClose={() => setShowImportAttio(false)} />}
      {showInviteMember && <InviteMemberModal onClose={() => setShowInviteMember(false)} />}
    </div>
  );
}

// ─── Add Company Modal ───────────────────────────────────────────────────
function AddCompanyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('Seed');
  const [leadPartner, setLeadPartner] = useState('');
  const [founderEmails, setFounderEmails] = useState<string[]>(['']);

  const addEmail = () => setFounderEmails([...founderEmails, '']);
  const updateEmail = (i: number, v: string) => setFounderEmails(prev => prev.map((e, idx) => idx === i ? v : e));
  const removeEmail = (i: number) => setFounderEmails(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-[480px] w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-foreground">Add new company</h3>
          <button onClick={onClose} className="text-muted-foreground/70 hover:text-foreground/80"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[12px] font-medium text-foreground/80">Company name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="e.g. Arcline" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-foreground/80">Sector</label>
              <input value={sector} onChange={e => setSector(e.target.value)} className="w-full mt-1 text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="e.g. DevTools" />
            </div>
            <div>
              <label className="text-[12px] font-medium text-foreground/80">Stage</label>
              <select value={stage} onChange={e => setStage(e.target.value)} className="w-full mt-1 text-[13px] border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40">
                <option>Pre-seed</option><option>Seed</option><option>Series A</option><option>Series B+</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground/80">Lead Partner</label>
            <input value={leadPartner} onChange={e => setLeadPartner(e.target.value)} className="w-full mt-1 text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="e.g. Anna Smith" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] font-medium text-foreground/80">Founder email(s)</label>
              <button onClick={addEmail} className="text-[11px] text-primary hover:text-primary font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add another
              </button>
            </div>
            <div className="space-y-2">
              {founderEmails.map((email, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={email} onChange={e => updateEmail(i, e.target.value)} className="flex-1 text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="founder@company.com" />
                  {founderEmails.length > 1 && (
                    <button onClick={() => removeEmail(i)} className="text-muted-foreground/70 hover:text-red-500 p-1.5"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/60 border-t border-border/60 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-foreground/80 hover:bg-secondary rounded-lg transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-white bg-primary hover:bg-[var(--primary-muted)] rounded-lg transition-colors">Add company</button>
        </div>
      </div>
    </div>
  );
}

// ─── Import from Attio Modal ─────────────────────────────────────────────
function ImportAttioModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Mock list of companies in Attio not yet imported
  const attioCompanies = [
    { id: 'a1', name: 'Tessellate AI',     sector: 'AI/ML',    stage: 'Seed' },
    { id: 'a2', name: 'Loomwave',          sector: 'DevTools', stage: 'Pre-seed' },
    { id: 'a3', name: 'Drift Analytics',   sector: 'Data Infra', stage: 'Seed' },
    { id: 'a4', name: 'Stencilize',        sector: 'DevTools', stage: 'Series A' },
    { id: 'a5', name: 'Permitio',          sector: 'Security', stage: 'Seed' },
    { id: 'a6', name: 'Ledgerway',         sector: 'Fintech',  stage: 'Seed' },
    { id: 'a7', name: 'Outpost Labs',      sector: 'Cloud Infra', stage: 'Pre-seed' },
    { id: 'a8', name: 'Nimbus Forms',      sector: 'DevTools', stage: 'Seed' },
  ];
  const filtered = attioCompanies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-[560px] w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Import from Attio</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{attioCompanies.length} companies in your Attio CRM not yet in Crane</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground/70 hover:text-foreground/80"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-3 border-b border-border/60 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" />
          </div>
          <button onClick={toggleAll} className="text-[12px] text-primary hover:text-primary font-medium">
            {selected.size === filtered.length && filtered.length > 0 ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {filtered.map(c => (
            <button key={c.id} onClick={() => toggle(c.id)} className="w-full px-6 py-2.5 flex items-center gap-3 hover:bg-muted/60 transition-colors text-left border-b border-border/50 last:border-0">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selected.has(c.id) ? 'bg-primary border-primary' : 'border-border'}`}>
                {selected.has(c.id) && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-foreground">{c.name}</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-muted rounded">{c.sector}</span>
              <span className="text-[11px] px-2 py-0.5 bg-muted rounded">{c.stage}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-6 py-6 text-[12px] text-muted-foreground/70 text-center">No companies match "{search}"</p>}
        </div>
        <div className="px-6 py-4 bg-muted/60 border-t border-border/60 flex items-center justify-between">
          <span className="text-[12px] text-muted-foreground">{selected.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-foreground/80 hover:bg-secondary rounded-lg transition-colors">Cancel</button>
            <button onClick={onClose} disabled={selected.size === 0} className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${selected.size === 0 ? 'bg-secondary text-muted-foreground/70 cursor-not-allowed' : 'bg-primary text-white hover:bg-[var(--primary-muted)]'}`}>
              Import {selected.size > 0 && `(${selected.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Invite Member Modal ─────────────────────────────────────────────────
function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-[440px] w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-foreground">Invite team member</h3>
          <button onClick={onClose} className="text-muted-foreground/70 hover:text-foreground/80"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[12px] font-medium text-foreground/80">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="e.g. Sarah Chen" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground/80">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full mt-1 text-[13px] border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40" placeholder="sarah@cranevc.com" />
            <p className="text-[11px] text-muted-foreground/70 mt-1.5">An invitation email with a sign-in link will be sent. The member will be added as Admin.</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/60 border-t border-border/60 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-foreground/80 hover:bg-secondary rounded-lg transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-white bg-primary hover:bg-[var(--primary-muted)] rounded-lg transition-colors">Send invite</button>
        </div>
      </div>
    </div>
  );
}
