import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Download, Share2, Sparkles, ChevronDown, ChevronRight, ExternalLink, TrendingUp, Users, Target, Flame, Rocket, Banknote } from 'lucide-react';
import { companies, flags, getHealthColor, formatCurrency } from './mock-data';
import { FlagIcon } from './FlagIcon';

export function BoardPrep() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(companies.find(c => c.nextBoard)?.id || companies[0].id);
  const company = companies.find(c => c.id === selectedCompany)!;
  const companyFlags = flags.filter(f => f.companyId === selectedCompany);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['snapshot', 'changes', 'questions', 'flags']));

  const toggleSection = (s: string) => {
    const next = new Set(expandedSections);
    if (next.has(s)) next.delete(s); else next.add(s);
    setExpandedSections(next);
  };

  const companiesWithBoards = companies.filter(c => c.nextBoard).sort((a, b) =>
    new Date(a.nextBoard!).getTime() - new Date(b.nextBoard!).getTime()
  );

  const suggestedQuestions = [
    `Burn increased but headcount is flat at ${company.headcount} — what's driving the cost increase?`,
    `MRR growth is ${company.arrGrowth > 10 ? 'strong' : 'slowing'} at ${company.arrGrowth}% — what's the pipeline looking like for next quarter?`,
    `Runway is at ${company.runway} months — what's the fundraising timeline and strategy?`,
    `Customer count is at ${company.customers} — any notable churn or expansion deals to discuss?`,
    `What key hires are planned for the next quarter and how does the current team handle the load?`,
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Company Selector */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">Prepare for:</span>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="text-[13px] border border-border rounded-lg px-3 py-1.5 bg-card"
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
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted flex items-center gap-1">
            <Share2 className="w-3 h-3" /> Share
          </button>
          <button className="text-[12px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted flex items-center gap-1">
            <Download className="w-3 h-3" /> Export PDF
          </button>
        </div>
      </div>

      {/* Status + AI Badge */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 font-medium">
          Draft — Not yet shared
        </span>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI-generated brief based on latest board deck, email updates, and call transcripts.</span>
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded">Last refreshed: 2 hours ago</span>
        </div>
      </div>

      {/* Brief Sections */}
      <div className="space-y-3">
        {/* Company Snapshot */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button onClick={() => toggleSection('snapshot')} className="w-full flex items-center gap-2 p-4 hover:bg-muted/20">
            {expandedSections.has('snapshot') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h3 className="text-[14px]">Company Snapshot</h3>
          </button>
          {expandedSections.has('snapshot') && (
            <div className="px-4 pb-4 pt-0">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">Health Status</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: getHealthColor(company.health) }} />
                    <span className="text-[14px]">{company.health}</span>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">MRR</p>
                  <p className="text-[14px] mt-1">{formatCurrency(company.mrr)}</p>
                  <p className="text-[11px] text-emerald-600">+{company.arrGrowth}% MoM</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">Runway</p>
                  <p className={`text-[14px] mt-1 ${company.runway < 6 ? 'text-destructive' : ''}`}>{company.runway} months</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">Customers</p>
                  <p className="text-[14px] mt-1">{company.customers}</p>
                </div>
              </div>
              <div className="bg-blue-50/60 border border-blue-200/40 rounded-lg p-3 mt-1">
                <p className="text-[11px] font-medium text-blue-700 mb-1">Changes since last board</p>
                <div className="grid grid-cols-3 gap-3 text-[12px]">
                  <div>
                    <span className="text-muted-foreground">MRR: </span>
                    <span className="text-blue-600">{formatCurrency(company.mrrTrend[2] * 1000)}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-semibold">{formatCurrency(company.mrr)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Runway: </span>
                    <span className="text-blue-600">{company.runway + 3}mo</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className={`font-semibold ${company.runway < 6 ? 'text-red-600' : ''}`}>{company.runway}mo</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customers: </span>
                    <span className="text-blue-600">{company.customers - 4}</span>
                    <span className="text-muted-foreground"> → </span>
                    <span className="font-semibold">{company.customers}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Changes */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button onClick={() => toggleSection('changes')} className="w-full flex items-center gap-2 p-4 hover:bg-muted/20">
            {expandedSections.has('changes') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h3 className="text-[14px]">Key Changes Since Last Board</h3>
          </button>
          {expandedSections.has('changes') && (
            <div className="px-4 pb-4 pt-0">
              <ul className="space-y-2.5">
                {[
                  { Icon: TrendingUp, color: '#10B981', text: `MRR grew from ${formatCurrency(company.mrrTrend[2] * 1000)} to ${formatCurrency(company.mrr)} (+${company.arrGrowth}% MoM average)` },
                  { Icon: Users, color: '#3B82F6', text: `Team grew from ${company.headcount - 2} to ${company.headcount} — hired 2 engineers` },
                  { Icon: Target, color: '#8B5CF6', text: `Customer count increased from ${company.customers - 4} to ${company.customers}` },
                  { Icon: Flame, color: '#F97316', text: `Burn rate increased 8% QoQ, driven by new hires` },
                  { Icon: Rocket, color: '#3B82F6', text: 'Shipped v2.0 with enterprise SSO and audit logging' },
                  { Icon: Banknote, color: '#10B981', text: 'Founder exploring Series A timing for Q3 2026' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px]">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: item.color + '15' }}>
                      <item.Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Active Flags */}
        {companyFlags.length > 0 && (
          <div className="bg-card border border-amber-200 rounded-xl overflow-hidden">
            <button onClick={() => toggleSection('flags')} className="w-full flex items-center gap-2 p-4 hover:bg-amber-50/50">
              {expandedSections.has('flags') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <h3 className="text-[14px]">Active Flags ({companyFlags.length})</h3>
            </button>
            {expandedSections.has('flags') && (
              <div className="px-4 pb-4 pt-0 space-y-2">
                {companyFlags.map(flag => (
                  <div key={flag.id} className="flex items-start gap-2 bg-amber-50/50 rounded-lg p-3">
                    <FlagIcon type={flag.type} size={14} />
                    <div>
                      <p className="text-[13px]">{flag.headline}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{flag.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggested Discussion Points */}
        <div className="bg-card border border-blue-200 rounded-xl overflow-hidden">
          <button onClick={() => toggleSection('questions')} className="w-full flex items-center gap-2 p-4 hover:bg-blue-50/30">
            {expandedSections.has('questions') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h3 className="text-[14px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" /> Suggested Discussion Points
            </h3>
          </button>
          {expandedSections.has('questions') && (
            <div className="px-4 pb-4 pt-0">
              <ol className="space-y-2">
                {suggestedQuestions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px]">
                    <span className="text-[11px] bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50 rounded px-1 -mx-1 flex-1">{q}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-[13px] text-muted-foreground">
                  <span className="text-[11px] bg-muted rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">+</span>
                  <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-muted/50 rounded px-1 -mx-1 flex-1 italic">Add your own question...</span>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Competitor Context */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button onClick={() => toggleSection('competitors')} className="w-full flex items-center gap-2 p-4 hover:bg-muted/20">
            {expandedSections.has('competitors') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h3 className="text-[14px]">Competitor Context</h3>
          </button>
          {expandedSections.has('competitors') && (
            <div className="px-4 pb-4 pt-0 text-[13px] text-muted-foreground">
              <p>No significant competitor movements detected since the last board meeting. Sector funding activity remains stable.</p>
            </div>
          )}
        </div>

        {/* Source Documents */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <button onClick={() => toggleSection('sources')} className="w-full flex items-center gap-2 p-4 hover:bg-muted/20">
            {expandedSections.has('sources') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <h3 className="text-[14px]">Source Documents</h3>
          </button>
          {expandedSections.has('sources') && (
            <div className="px-4 pb-4 pt-0 space-y-1">
              {[
                { name: 'Q4 2025 Board Deck', source: 'Dropbox', date: 'Jan 15, 2026' },
                { name: 'Monthly Update - February', source: 'Gmail', date: 'Feb 28, 2026' },
                { name: 'Founder Call Notes', source: 'Granola', date: 'Mar 5, 2026' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-[12px] py-1.5 hover:bg-muted/20 rounded px-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="flex-1">{doc.name}</span>
                  <span className="text-muted-foreground">{doc.source}</span>
                  <span className="text-muted-foreground">{doc.date}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
