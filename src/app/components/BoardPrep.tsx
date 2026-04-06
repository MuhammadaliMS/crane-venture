import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  FileText, Download, Share2, Sparkles, ChevronDown, ChevronRight, ExternalLink,
  TrendingUp, Users, Target, Flame, Rocket, Banknote, Calendar, Clock, Hash,
  ArrowUpRight, ArrowDownRight, Minus, Mail, Headphones, Link2, CheckCircle2,
  Circle, StickyNote, AlertTriangle, Activity, ListTodo, Eye
} from 'lucide-react';
import { companies, flags, todos, activityFeed, getHealthColor, getRAGColor, formatCurrency } from './mock-data';
import { FlagIcon } from './FlagIcon';

// ── Source tag component ──
function SourceTag({ label }: { label: string }) {
  return (
    <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 whitespace-nowrap">
      Source: {label}
    </span>
  );
}

// ── Delta arrow helper ──
function DeltaArrow({ from, to, unit = '', invert = false }: { from: number; to: number; unit?: string; invert?: boolean }) {
  const diff = to - from;
  const isUp = diff > 0;
  const isPositive = invert ? !isUp : isUp;
  const color = diff === 0 ? 'text-slate-400' : isPositive ? 'text-emerald-600' : 'text-red-500';
  const Icon = diff === 0 ? Minus : isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="flex items-center gap-1 text-[12px]">
      <span className="text-slate-400">{from}{unit}</span>
      <span className="text-slate-300">&rarr;</span>
      <span className={`font-semibold ${color}`}>{to}{unit}</span>
      <Icon className={`w-3 h-3 ${color}`} />
    </div>
  );
}

// ── Section header (collapsible) ──
function SectionHeader({ title, expanded, onClick, borderColor, icon }: {
  title: string; expanded: boolean; onClick: () => void; borderColor?: string; icon?: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 p-4 hover:bg-slate-50/60 transition-colors">
      {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      {icon}
      <h3 className="text-[14px] font-semibold text-slate-900">{title}</h3>
    </button>
  );
}

// ── RAG dot row ──
function RAGDots({ history, current }: { history: string[]; current: string }) {
  const all = [...history, current];
  return (
    <div className="flex items-center gap-1">
      {all.map((r, i) => (
        <div
          key={i}
          className={`rounded-full ${i === all.length - 1 ? 'w-3 h-3 ring-2 ring-white shadow-sm' : 'w-2 h-2 opacity-50'}`}
          style={{ background: getRAGColor(r as any) }}
          title={`${i === all.length - 1 ? 'Current' : `Q${i + 1}`}: ${r}`}
        />
      ))}
    </div>
  );
}

export function BoardPrep() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(companies.find(c => c.nextBoard)?.id || companies[0].id);
  const company = companies.find(c => c.id === selectedCompany)!;
  const companyFlags = flags.filter(f => f.companyId === selectedCompany);
  const companyTodos = todos.filter(t => t.companyName === company.name && !t.completed);
  const companyActivity = activityFeed.filter(a => a.companyName === company.name).slice(0, 5);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['context', 'snapshot', 'changes', 'flags', 'questions', 'notes'])
  );
  const [boardNotes, setBoardNotes] = useState('');
  const [showPrevNotes, setShowPrevNotes] = useState(false);

  const toggleSection = (s: string) => {
    const next = new Set(expandedSections);
    if (next.has(s)) next.delete(s); else next.add(s);
    setExpandedSections(next);
  };

  const companiesWithBoards = companies.filter(c => c.nextBoard).sort((a, b) =>
    new Date(a.nextBoard!).getTime() - new Date(b.nextBoard!).getTime()
  );

  // ── Derived board context data ──
  const boardDate = company.nextBoard ? new Date(company.nextBoard) : null;
  const lastBoardDate = new Date('2025-12-15'); // mock: last board was ~3 months ago
  const daysSinceLastBoard = boardDate ? Math.floor((boardDate.getTime() - lastBoardDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const boardNumber = 4; // mock
  const boardMembers = [
    ...company.owners.map(o => ({ name: o, role: 'Board Observer (Crane)' })),
    { name: company.managementTeam.split(',')[0]?.trim() || 'CEO', role: 'CEO / Founder' },
    { name: 'Independent Director', role: 'Independent' },
  ];
  const lastBoardDecisions = [
    'Approved Q1 budget with 15% increase in engineering spend',
    'Agreed to explore Series A timing for mid-2026',
    'Action: founder to send monthly KPI updates by 5th of each month',
  ];

  // ── Source documents ──
  const sourceDocuments = [
    { name: 'Q4 2025 Board Deck', source: 'Dropbox', date: '12 Mar 2026', icon: FileText, color: '#3B82F6' },
    { name: 'Founder monthly update', source: 'Email', date: '5 Mar 2026', icon: Mail, color: '#10B981' },
    { name: 'Board prep call', source: 'Granola', date: '8 Mar 2026', icon: Headphones, color: '#8B5CF6' },
    { name: 'Investor metrics export', source: 'Attio', date: '10 Mar 2026', icon: Activity, color: '#F59E0B' },
  ];

  // ── Metrics with sources ──
  const prevMRR = company.mrrTrend[2] * 1000;
  const prevRunway = company.runway + 3;
  const prevCustomers = company.customers - 4;
  const prevHeadcount = company.headcount - 2;
  const prevBurn = Math.round(company.burn * 0.92);

  const suggestedQuestions = [
    { q: `Burn increased ${Math.round(((company.burn - prevBurn) / prevBurn) * 100)}% but headcount only grew by ${company.headcount - prevHeadcount} — what's driving the cost increase beyond new hires?`, src: 'Calculated from financials' },
    { q: `MRR growth is ${company.arrGrowth > 10 ? 'strong' : 'slowing'} at ${company.arrGrowth}% — what does the pipeline look like for next quarter? Any at-risk contracts?`, src: 'Board deck, Q4 2025' },
    { q: `Runway is at ${company.runway} months (down from ${prevRunway}) — what's the fundraising timeline and how much bridge is needed?`, src: 'Calculated from burn rate' },
    { q: `Customer count at ${company.customers} (was ${prevCustomers}) — any notable churn, and what's the expansion revenue story?`, src: 'Founder email, 5 Mar' },
    { q: `What key hires are planned next quarter? The team is at ${company.headcount} — is that enough to hit Q2 targets?`, src: 'Granola transcript, 8 Mar' },
  ];

  const severityColor = (s: string) => {
    switch (s) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[24px] font-semibold tracking-tight text-slate-900">Board Prep</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="text-[13px] border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {companiesWithBoards.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — Board {new Date(c.nextBoard!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </option>
            ))}
            <option disabled>──────────</option>
            {companies.filter(c => !c.nextBoard).map(c => (
              <option key={c.id} value={c.id}>{c.name} — No board scheduled</option>
            ))}
          </select>
          <button className="text-[12px] px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors">
            <Share2 className="w-3 h-3" /> Share
          </button>
          <button className="text-[12px] px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 transition-colors">
            <Download className="w-3 h-3" /> Export PDF
          </button>
        </div>
      </div>

      {/* ── Status badges ── */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-[11px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
          Draft — Not yet shared
        </span>
        <div className="flex items-center gap-2 text-[12px] text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI-generated brief from {sourceDocuments.length} sources.</span>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Last refreshed: 2 hours ago</span>
        </div>
      </div>

      {/* ══════════════════ TWO-COLUMN LAYOUT ══════════════════ */}
      <div className="flex gap-5">

        {/* ── LEFT COLUMN (65%) ── */}
        <div className="flex-1 min-w-0 space-y-3" style={{ flexBasis: '65%' }}>

          {/* §1 Board Context */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <SectionHeader title="Board Context" expanded={expandedSections.has('context')} onClick={() => toggleSection('context')} icon={<Calendar className="w-4 h-4 text-blue-500" />} />
            {expandedSections.has('context') && (
              <div className="px-5 pb-5 pt-0 space-y-4 animate-fade-in-up">
                {/* Board date strip */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[13px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 font-medium">
                      {boardDate ? boardDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Not scheduled'}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                    Board #{boardNumber}
                  </span>
                  <span className="text-[12px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {daysSinceLastBoard} days since last board
                  </span>
                </div>

                {/* Last board info */}
                <div className="bg-slate-50 rounded-lg p-3.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">Last Board — {lastBoardDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  <ul className="space-y-1.5">
                    {lastBoardDecisions.map((d, i) => (
                      <li key={i} className="text-[12px] text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                  <SourceTag label="Q4 board minutes" />
                </div>

                {/* Board members */}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">Board Attendees</p>
                  <div className="flex flex-wrap gap-2">
                    {boardMembers.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-medium text-slate-700">{m.name}</p>
                          <p className="text-[10px] text-slate-400">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* §2 Company Snapshot (enhanced) */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <SectionHeader title="Company Snapshot" expanded={expandedSections.has('snapshot')} onClick={() => toggleSection('snapshot')} />
            {expandedSections.has('snapshot') && (
              <div className="px-5 pb-5 pt-0 space-y-3 animate-fade-in-up">
                {/* 6-metric grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Health */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400 mb-1">Health Status</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: getHealthColor(company.health) }} />
                      <span className="text-[14px] font-medium text-slate-700">{company.health}</span>
                    </div>
                    <SourceTag label="Calculated" />
                  </div>
                  {/* RAG */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400 mb-1">RAG Status</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-slate-700">{company.rag}</span>
                      <RAGDots history={company.ragHistory} current={company.rag} />
                    </div>
                    <SourceTag label="Team assessment" />
                  </div>
                  {/* MRR */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400 mb-1">MRR</p>
                    <p className="text-[14px] font-mono-num font-medium text-slate-700">{formatCurrency(company.mrr, company.currency)}</p>
                    <p className="text-[11px] text-emerald-600">+{company.arrGrowth}% MoM</p>
                    <SourceTag label="Board deck" />
                  </div>
                  {/* ARR */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400 mb-1">ARR</p>
                    <p className="text-[14px] font-mono-num font-medium text-slate-700">{formatCurrency(company.mrr * 12, company.currency)}</p>
                    <SourceTag label="Calculated" />
                  </div>
                  {/* Runway */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400 mb-1">Runway</p>
                    <p className={`text-[14px] font-mono-num font-medium ${company.runway < 6 ? 'text-red-600' : 'text-slate-700'}`}>{company.runway} months</p>
                    {company.runway < 6 && <p className="text-[10px] text-red-500 flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> Below threshold</p>}
                    <SourceTag label="Calculated" />
                  </div>
                  {/* Customers */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400 mb-1">Customers</p>
                    <p className="text-[14px] font-mono-num font-medium text-slate-700">{company.customers}</p>
                    <SourceTag label="Email update" />
                  </div>
                </div>

                {/* Changes since last board strip */}
                <div className="bg-blue-50/60 border border-blue-200/40 rounded-lg p-3.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-600 mb-2.5">Changes Since Last Board</p>
                  <div className="grid grid-cols-5 gap-3">
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">MRR</p>
                      <DeltaArrow from={Math.round(prevMRR / 1000)} to={Math.round(company.mrr / 1000)} unit="K" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Runway</p>
                      <DeltaArrow from={prevRunway} to={company.runway} unit="mo" invert />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Customers</p>
                      <DeltaArrow from={prevCustomers} to={company.customers} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Headcount</p>
                      <DeltaArrow from={prevHeadcount} to={company.headcount} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 mb-0.5">Burn</p>
                      <DeltaArrow from={Math.round(prevBurn / 1000)} to={Math.round(company.burn / 1000)} unit="K" invert />
                    </div>
                  </div>
                  <div className="mt-2">
                    <SourceTag label="Board deck + calculated" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* §3 Key Changes Since Last Board */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <SectionHeader title="Key Changes Since Last Board" expanded={expandedSections.has('changes')} onClick={() => toggleSection('changes')} />
            {expandedSections.has('changes') && (
              <div className="px-5 pb-5 pt-0 animate-fade-in-up">
                <ul className="space-y-2.5">
                  {[
                    { Icon: TrendingUp, color: '#10B981', text: `MRR grew from ${formatCurrency(prevMRR, company.currency)} to ${formatCurrency(company.mrr, company.currency)} (+${company.arrGrowth}% MoM average)`, src: 'Q4 board deck' },
                    { Icon: Users, color: '#3B82F6', text: `Team grew from ${prevHeadcount} to ${company.headcount} — hired 2 engineers`, src: 'Founder email, 5 Mar' },
                    { Icon: Target, color: '#8B5CF6', text: `Customer count increased from ${prevCustomers} to ${company.customers}`, src: 'Board deck' },
                    { Icon: Flame, color: '#F97316', text: `Burn rate increased 8% QoQ, driven by new hires and infrastructure costs`, src: 'Calculated from financials' },
                    { Icon: Rocket, color: '#3B82F6', text: 'Shipped v2.0 with enterprise SSO and audit logging', src: 'Founder email, 5 Mar' },
                    { Icon: Banknote, color: '#10B981', text: 'Founder exploring Series A timing for Q3 2026', src: 'Granola transcript, 8 Mar' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: item.color + '15' }}>
                        <item.Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <span className="text-slate-700">{item.text}</span>
                        <div className="mt-0.5">
                          <SourceTag label={item.src} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* §4 Active Flags */}
          {companyFlags.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-200/80 overflow-hidden">
              <SectionHeader title={`Active Flags (${companyFlags.length})`} expanded={expandedSections.has('flags')} onClick={() => toggleSection('flags')} />
              {expandedSections.has('flags') && (
                <div className="px-5 pb-5 pt-0 space-y-2 animate-fade-in-up">
                  {companyFlags.map(flag => (
                    <div key={flag.id} className="flex items-start gap-2.5 bg-amber-50/50 rounded-lg p-3">
                      <FlagIcon type={flag.type} size={14} />
                      <div className="flex-1">
                        <p className="text-[13px] text-slate-700">{flag.headline}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{flag.explanation}</p>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${flag.urgency === 'high' ? 'text-red-600 bg-red-50' : flag.urgency === 'medium' ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-50'}`}>
                        {flag.urgency}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* §5 Suggested Discussion Points */}
          <div className="bg-white rounded-xl border border-blue-200/60 overflow-hidden">
            <SectionHeader
              title="Suggested Discussion Points"
              expanded={expandedSections.has('questions')}
              onClick={() => toggleSection('questions')}
              icon={<Sparkles className="w-4 h-4 text-indigo-500" />}
            />
            {expandedSections.has('questions') && (
              <div className="px-5 pb-5 pt-0 animate-fade-in-up">
                <ol className="space-y-2.5">
                  {suggestedQuestions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px]">
                      <span className="text-[11px] bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 font-medium">{i + 1}</span>
                      <div className="flex-1">
                        <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50 rounded px-1 -mx-1 block text-slate-700">{item.q}</span>
                        <div className="mt-0.5">
                          <SourceTag label={item.src} />
                        </div>
                      </div>
                    </li>
                  ))}
                  <li className="flex items-start gap-2.5 text-[13px] text-slate-400">
                    <span className="text-[11px] bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">+</span>
                    <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-slate-50 rounded px-1 -mx-1 flex-1 italic">Add your own question...</span>
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* §6 Your Board Notes */}
          <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
            <SectionHeader
              title="Your Board Notes"
              expanded={expandedSections.has('notes')}
              onClick={() => toggleSection('notes')}
              icon={<StickyNote className="w-4 h-4 text-amber-500" />}
            />
            {expandedSections.has('notes') && (
              <div className="px-5 pb-5 pt-0 animate-fade-in-up">
                <textarea
                  value={boardNotes}
                  onChange={e => setBoardNotes(e.target.value)}
                  placeholder="Add your personal notes for this board meeting..."
                  className="w-full h-32 text-[13px] text-slate-700 bg-slate-50 border border-slate-200/60 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-200 placeholder:text-slate-300"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> These notes are private and won't be shared
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (35%) ── */}
        <div className="space-y-3" style={{ flexBasis: '35%', minWidth: 0 }}>

          {/* §A Sources Used */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-3">Sources Used</p>
            <div className="space-y-1">
              {sourceDocuments.map((doc, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/company/${selectedCompany}`)}
                  className="w-full flex items-center gap-2.5 text-[12px] py-2 px-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: doc.color + '12' }}>
                    <doc.icon className="w-3.5 h-3.5" style={{ color: doc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 font-medium truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">{doc.source} &middot; {doc.date}</p>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* §B Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-3">Recent Activity</p>
            {companyActivity.length === 0 ? (
              <p className="text-[12px] text-slate-400 italic">No recent activity</p>
            ) : (
              <div className="space-y-0">
                {companyActivity.map((event, i) => (
                  <button
                    key={event.id}
                    onClick={() => navigate(`/company/${selectedCompany}`)}
                    className="w-full flex items-start gap-2.5 py-2 px-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                  >
                    <div className="flex flex-col items-center mt-1">
                      <div className={`w-2 h-2 rounded-full ${event.severity === 'high' ? 'bg-red-400' : event.severity === 'medium' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                      {i < companyActivity.length - 1 && <div className="w-px h-6 bg-slate-200 mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-slate-700 font-medium truncate">{event.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">{event.description}</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">{new Date(event.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* §C Open To-Dos */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-3 flex items-center gap-1.5">
              <ListTodo className="w-3 h-3" /> Open To-Dos
            </p>
            {companyTodos.length === 0 ? (
              <p className="text-[12px] text-slate-400 italic">No pending tasks</p>
            ) : (
              <div className="space-y-1.5">
                {companyTodos.map(todo => (
                  <div key={todo.id} className="flex items-start gap-2 py-1.5">
                    <Circle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${todo.priority === 'high' ? 'text-red-400' : todo.priority === 'medium' ? 'text-amber-400' : 'text-slate-300'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-slate-700 leading-snug">{todo.title}</p>
                      <p className="text-[10px] text-slate-400">Due {new Date(todo.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* §D Quick Links */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mb-3">Quick Links</p>
            <div className="space-y-1">
              <button
                onClick={() => navigate(`/company/${selectedCompany}`)}
                className="w-full flex items-center gap-2.5 text-[12px] text-slate-700 py-2 px-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <Eye className="w-3.5 h-3.5 text-blue-500" />
                <span className="flex-1">View Company Detail</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-[12px] text-slate-700 py-2 px-2.5 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="flex-1">Open in Attio</span>
                <ExternalLink className="w-3 h-3 text-slate-300" />
              </a>
              <button
                onClick={() => navigate(`/company/${selectedCompany}`)}
                className="w-full flex items-center gap-2.5 text-[12px] text-slate-700 py-2 px-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <FileText className="w-3.5 h-3.5 text-violet-500" />
                <span className="flex-1">View Board Deck</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </button>
              <button
                onClick={() => setShowPrevNotes(!showPrevNotes)}
                className="w-full flex items-center gap-2.5 text-[12px] text-slate-700 py-2 px-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                <span className="flex-1">Previous Board Notes</span>
                {showPrevNotes ? <ChevronDown className="w-3 h-3 text-slate-300" /> : <ChevronRight className="w-3 h-3 text-slate-300" />}
              </button>
              {showPrevNotes && (
                <div className="ml-6 bg-slate-50 rounded-lg p-3 text-[12px] text-slate-600 space-y-1.5">
                  <p className="text-[10px] text-slate-400 font-medium">Board #3 — 15 Dec 2025</p>
                  <p>Discussed runway extension options. Founder confident in closing 3 enterprise deals in Q1. Agreed to revisit Series A timing at next board.</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-2">Board #2 — 18 Sep 2025</p>
                  <p>Product launch went well. Onboarded first 5 paying customers. Team hiring plan approved for 2 additional engineers.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
