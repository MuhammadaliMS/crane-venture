import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Play, SkipForward, Check, ChevronRight, Download, Clock, Send, FileText, Upload, Users, Sparkles, CheckCircle, AlertCircle, Edit3 } from 'lucide-react';
import { SparklineChart } from './SparklineChart';
import { companies, flags, formatCurrency, getHealthColor, getRAGColor, getActionColor, getFlagIcon, teamMembers, type RAGStatus } from './mock-data';

export function PortfolioReview() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'monthly' | 'quarterly' | 'founder-validation'>('select');
  const [quarterlyStep, setQuarterlyStep] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [commentaries, setCommentaries] = useState<Record<string, string>>({});
  const [managersCommentary, setManagersCommentary] = useState('');
  const [otherDevelopments, setOtherDevelopments] = useState('');
  const [companyCommentary, setCompanyCommentary] = useState<Record<string, {
    recentProgress: string; rag: RAGStatus; summary: string; keyConcerns: string; actionPoints: string;
    equityFundraising: string; debtFundraising: string; burnReduction: string; nearTermExit: string;
  }>>({});

  const activeCompanies = companies.filter(c => c.lifecycle === 'Active — Core');
  const sortedCompanies = [...activeCompanies].sort((a, b) => {
    const order: Record<string, number> = { 'Lean In': 0, 'Lean In / Anticipate': 1, 'Watch': 2, 'De-prioritise': 3 };
    return (order[a.action] || 0) - (order[b.action] || 0);
  });

  const current = sortedCompanies[currentIndex];
  const currentFlags = flags.filter(f => f.companyId === current?.id);
  const progress = ((reviewed.size + skipped.size) / activeCompanies.length) * 100;

  const handleReview = () => {
    setReviewed(prev => new Set(prev).add(current.id));
    if (currentIndex < sortedCompanies.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleSkip = () => {
    setSkipped(prev => new Set(prev).add(current.id));
    if (currentIndex < sortedCompanies.length - 1) setCurrentIndex(currentIndex + 1);
  };

  if (mode === 'select') {
    return (
      <div className="p-6 max-w-[900px] mx-auto space-y-6">
        <div className="text-center py-6">
          <h2 className="text-[20px] mb-2">Portfolio Review</h2>
          <p className="text-[13px] text-muted-foreground">Choose a review mode to get started</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <button onClick={() => setMode('monthly')}
            className="bg-card border-2 border-primary/30 rounded-xl p-5 text-left hover:shadow-lg hover:border-primary/50 transition-all ring-2 ring-primary/10 relative">
            <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 bg-primary text-primary-foreground rounded-full font-medium">
              Recommended
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-[15px] font-semibold mb-1">Monthly Internal Review</h3>
            <p className="text-[12px] text-muted-foreground">
              30-45 min team review. Step through companies in priority order with inline notes.
            </p>
            <p className="text-[12px] text-primary mt-3 flex items-center gap-1 font-medium">
              Start review <ChevronRight className="w-3 h-3" />
            </p>
          </button>
          <button onClick={() => { setMode('quarterly'); setQuarterlyStep(1); }}
            className="bg-card border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-[15px] mb-1">Quarterly LP Report</h3>
            <p className="text-[12px] text-muted-foreground">
              6-step workflow: auto-extract, founder validate, team commentary, manager's commentary, GP approval, report generation.
            </p>
            <p className="text-[11px] text-primary mt-3 flex items-center gap-1">
              Start workflow <ChevronRight className="w-3 h-3" />
            </p>
          </button>
          <button onClick={() => setMode('founder-validation')}
            className="bg-card border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-[15px] mb-1">Founder Validation</h3>
            <p className="text-[12px] text-muted-foreground">
              Pre-populated forms sent to founders. They accept, edit, or flag missing data. Replaces Gigs Excel plugin.
            </p>
            <p className="text-[11px] text-primary mt-3 flex items-center gap-1">
              Review & send <ChevronRight className="w-3 h-3" />
            </p>
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-[13px] mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Quarterly LP Report Workflow
          </h4>
          <div className="grid grid-cols-6 gap-2 text-[11px] text-muted-foreground">
            {[
              { step: '1', label: 'Auto-Extract', desc: 'Pull metrics from board decks & emails' },
              { step: '2', label: 'Founder Validate', desc: 'Founders review pre-filled data' },
              { step: '3', label: 'Team Commentary', desc: 'Qualitative updates per company' },
              { step: '4', label: "Manager's Commentary", desc: 'GP writes fund-level narrative' },
              { step: '5', label: 'GP Approval', desc: 'Final review and sign-off' },
              { step: '6', label: 'Generate Report', desc: 'PDF + Asset Metrix CSV' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-7 h-7 mx-auto mb-1 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[12px]">{s.step}</div>
                <p className="text-foreground text-[11px]">{s.label}</p>
                <p className="text-[10px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[13px] mb-3">Recent Reviews</h3>
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {[
              { date: 'Mar 10, 2026', type: 'Monthly', companies: 12, changes: 3, status: 'Complete' },
              { date: 'Feb 10, 2026', type: 'Monthly', companies: 12, changes: 5, status: 'Complete' },
              { date: 'Jan 15, 2026', type: 'Quarterly LP', companies: 12, changes: 8, status: 'Complete' },
              { date: 'Jan 10, 2026', type: 'Monthly', companies: 12, changes: 2, status: 'Complete' },
            ].map((review, i) => (
              <div key={i} className="p-3 flex items-center gap-3 text-[13px] hover:bg-muted/20 cursor-pointer">
                <span className={`text-[11px] px-2 py-0.5 rounded-md ${
                  review.type === 'Quarterly LP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>{review.type}</span>
                <span className="flex-1">{review.date}</span>
                <span className="text-muted-foreground">{review.companies} companies</span>
                <span className="text-muted-foreground">{review.changes} changes</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quarterly LP Report — 6-step workflow
  if (mode === 'quarterly') {
    const steps = [
      { num: 1, label: 'Auto-Extract Metrics' },
      { num: 2, label: 'Founder Validation' },
      { num: 3, label: 'Team Commentary' },
      { num: 4, label: "Manager's Commentary" },
      { num: 5, label: 'GP Approval' },
      { num: 6, label: 'Generate Report' },
    ];

    return (
      <div className="p-6 max-w-[1100px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('select')} className="text-[13px] text-muted-foreground hover:text-foreground">← Back</button>
          <h2 className="text-[16px]">Q1 2026 LP Report</h2>
          <span className="text-[12px] text-muted-foreground">Step {quarterlyStep} of 6</span>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1">
          {steps.map(s => (
            <button key={s.num} onClick={() => setQuarterlyStep(s.num)}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-colors ${
                quarterlyStep === s.num ? 'bg-primary text-primary-foreground' :
                quarterlyStep > s.num ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
              }`}>
              {quarterlyStep > s.num ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{s.num}.</span>}
              {s.label}
            </button>
          ))}
        </div>

        {/* Step 1: Auto-Extract */}
        {quarterlyStep === 1 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-[14px]">Auto-Extraction Complete</h3>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Metrics extracted from board decks, transcripts, and emails for {activeCompanies.length} companies.
                Each field shows source, confidence, and passage it was derived from.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {sortedCompanies.map(c => (
                <div key={c.id} className="p-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px]" style={{ background: c.logoColor }}>{c.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px]">{c.name}</span>
                    <p className="text-[11px] text-muted-foreground">14 of 14 fields extracted</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> High confidence
                  </span>
                  <span className="text-[10px] text-muted-foreground">Board deck + email</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setQuarterlyStep(2)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px]">
                Next: Founder Validation →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Founder Validation */}
        {quarterlyStep === 2 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="text-[14px] mb-1">Founder Data Validation</h3>
              <p className="text-[12px] text-muted-foreground">
                Lightweight web forms pre-populated with extracted data. Founders accept/edit per field.
                Only missing fields require manual input. Completable in &lt; 5 minutes, mobile-friendly.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              {sortedCompanies.map(c => {
                const lastDays = Math.floor((new Date().getTime() - new Date(c.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={c.id} className="p-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px]" style={{ background: c.logoColor }}>{c.name[0]}</div>
                    <div className="flex-1">
                      <span className="text-[13px]">{c.name}</span>
                      <p className="text-[11px] text-muted-foreground">{c.currency} · {c.stage} · Updated {lastDays}d ago</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Pre-filled
                    </span>
                    <button className="text-[11px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
                      <Send className="w-3 h-3" /> Send
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setQuarterlyStep(1)} className="text-[13px] text-muted-foreground">← Back</button>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-border rounded-lg text-[13px] flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" /> Send All
                </button>
                <button onClick={() => setQuarterlyStep(3)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px]">
                  Next: Team Commentary →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Team Commentary */}
        {quarterlyStep === 3 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-[14px] mb-1">Team Commentary</h3>
              <p className="text-[12px] text-muted-foreground">
                Each team member completes qualitative fields matching the LP report structure:
                Recent Progress, RAG Status, Summary, Key Concerns, Action Points, and fundraising status.
              </p>
            </div>
            <div className="space-y-3">
              {sortedCompanies.map(c => {
                const cc = companyCommentary[c.id] || {
                  recentProgress: c.recentProgress, rag: c.rag, summary: c.summary,
                  keyConcerns: c.keyConcerns.join('\n'), actionPoints: c.actionPoints.join('\n'),
                  equityFundraising: c.equityFundraisingStatus, debtFundraising: c.debtFundraisingStatus,
                  burnReduction: c.burnReductionActions, nearTermExit: c.nearTermExit,
                };
                return (
                  <div key={c.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[12px]" style={{ background: c.logoColor }}>{c.name[0]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px]">{c.name}</span>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: getRAGColor(c.rag) }} />
                          <span className="text-[11px] text-muted-foreground">{c.stage} · {c.fund}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">{c.ownerAvatar}</div>
                        <span className="text-[11px] text-muted-foreground">{c.owner}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-muted-foreground">RAG Status</label>
                        <select className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card" defaultValue={c.rag}>
                          <option value="Green">Green</option><option value="Amber">Amber</option>
                          <option value="Red">Red</option><option value="Grey">Grey</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Equity Fundraising</label>
                        <input className="w-full text-[12px] border border-border rounded-lg px-2 py-1.5 mt-1 bg-card" defaultValue={cc.equityFundraising} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] text-muted-foreground">Summary</label>
                        <textarea className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-card resize-none h-14" defaultValue={cc.summary} />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Key Concerns</label>
                        <textarea className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-card resize-none h-14" defaultValue={cc.keyConcerns} />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground">Action Points</label>
                        <textarea className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-card resize-none h-14" defaultValue={cc.actionPoints} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setQuarterlyStep(2)} className="text-[13px] text-muted-foreground">← Back</button>
              <button onClick={() => setQuarterlyStep(4)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px]">
                Next: Manager's Commentary →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Manager's Commentary */}
        {quarterlyStep === 4 && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="text-[14px] mb-1 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-purple-600" /> Manager's Commentary
              </h3>
              <p className="text-[12px] text-muted-foreground">
                Fund-level narrative for the LP report. The system provides a pre-assembled data pack with
                auto-generated charts. Write the market outlook and portfolio narrative below.
              </p>
            </div>

            {/* Pre-assembled data summary */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'TVPI (Net)', value: '1.72x', trend: '+0.04 vs Q4' },
                { label: 'Active Core', value: `${activeCompanies.length}`, trend: 'companies' },
                { label: 'Follow-ons', value: '2', trend: 'This quarter' },
                { label: 'NAV Change', value: '+£4.7M', trend: 'vs prior quarter' },
              ].map(m => (
                <div key={m.label} className="bg-card border border-border rounded-lg p-3">
                  <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  <p className="text-[18px]">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.trend}</p>
                </div>
              ))}
            </div>

            {/* AI Suggested outline */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-[12px] flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-amber-700">AI-suggested outline (editable)</span>
              </p>
              <ul className="text-[12px] text-muted-foreground space-y-1 list-disc pl-4">
                <li>Portfolio continues to deliver strong performance with TVPI at 1.72x</li>
                <li>Cortex AI emerging as breakout with Series B imminent — potential 3x+ return</li>
                <li>Two companies (Pulsetrack, Stackpilot) in Red status — active management in progress</li>
                <li>Fund I 80% deployed with £14M available for follow-ons</li>
              </ul>
            </div>

            <div>
              <label className="text-[12px] text-muted-foreground">Market Outlook & Portfolio Narrative</label>
              <textarea
                className="w-full text-[13px] border border-border rounded-lg px-4 py-3 mt-1 bg-card resize-none h-40"
                placeholder="Write the Manager's Commentary for the LP report..."
                value={managersCommentary}
                onChange={e => setManagersCommentary(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[12px] text-muted-foreground">Other Significant Developments</label>
              <textarea
                className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-card resize-none h-20"
                placeholder="Team hires, events, fund updates..."
                value={otherDevelopments}
                onChange={e => setOtherDevelopments(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <button onClick={() => setQuarterlyStep(3)} className="text-[13px] text-muted-foreground">← Back</button>
              <button onClick={() => setQuarterlyStep(5)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px]">
                Next: GP Approval →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: GP Approval */}
        {quarterlyStep === 5 && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-[16px] mb-2">GP Review & Approval</h3>
              <p className="text-[12px] text-muted-foreground mb-4">
                Review the compiled report: fund-level data + per-company commentary side by side.
                Approve, request edits, or add notes.
              </p>

              {/* Completion Dashboard */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <p className="text-[20px] text-emerald-700">{activeCompanies.length}</p>
                  <p className="text-[11px] text-muted-foreground">Companies Reviewed</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <p className="text-[20px] text-emerald-700">{managersCommentary ? '1' : '0'}/1</p>
                  <p className="text-[11px] text-muted-foreground">Manager's Commentary</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <p className="text-[20px] text-blue-700">Ready</p>
                  <p className="text-[11px] text-muted-foreground">Report Status</p>
                </div>
              </div>

              {/* Company status list */}
              <div className="bg-muted/20 rounded-lg divide-y divide-border">
                {sortedCompanies.map(c => (
                  <div key={c.id} className="p-3 flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px]" style={{ background: c.logoColor }}>{c.name[0]}</div>
                    <span className="text-[13px] flex-1">{c.name}</span>
                    <div className="w-3 h-3 rounded-full" style={{ background: getRAGColor(c.rag) }} />
                    <span className="text-[11px] text-muted-foreground">{c.rag}</span>
                    <span className="text-[11px] text-emerald-600">Complete</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setQuarterlyStep(4)} className="text-[13px] text-muted-foreground">← Back</button>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg text-[13px]">Request Edits</button>
                <button onClick={() => setQuarterlyStep(6)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[13px] flex items-center gap-1">
                  <Check className="w-4 h-4" /> Approve & Generate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Report Generation */}
        {quarterlyStep === 6 && (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-[18px] mb-2">Report Approved</h3>
              <p className="text-[13px] text-muted-foreground mb-4">
                Q1 2026 LP Report is ready for generation. ~75% auto-assembled from platform data.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow text-left">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-[14px] mb-1">LP Report PDF</h3>
                <p className="text-[11px] text-muted-foreground">
                  Full quarterly report matching Crane I structure: cover, standing data, commentary, company snapshots, data pages.
                </p>
              </button>
              <button className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow text-left">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-[14px] mb-1">Asset Metrix CSV</h3>
                <p className="text-[11px] text-muted-foreground">
                  Mapped to Asset Metrix ingestion schema. All required fields included with FX conversion.
                </p>
              </button>
              <button className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow text-left">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-[14px] mb-1">Internal Summary</h3>
                <p className="text-[11px] text-muted-foreground">
                  Changes made during this review cycle. RAG movements, commentary updates, follow-on activity.
                </p>
              </button>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setQuarterlyStep(5)} className="text-[13px] text-muted-foreground">← Back</button>
              <button onClick={() => setMode('select')} className="px-4 py-2 border border-border rounded-lg text-[13px]">Done</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'founder-validation') {
    return (
      <div className="p-6 max-w-[1000px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setMode('select')} className="text-[13px] text-muted-foreground hover:text-foreground">← Back</button>
          <button className="text-[12px] px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
            <Send className="w-3.5 h-3.5" /> Send All for Validation
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <h3 className="text-[14px] mb-2">Founder Data Validation</h3>
          <p className="text-[12px] text-muted-foreground">
            Replaces the Gigs Excel plugin. Pre-populated from auto-extraction. Founders accept, edit, or flag missing data.
            Stage-specific field visibility: pre-revenue companies skip P&L fields. Completable in &lt; 5 minutes, mobile-friendly, no login required.
          </p>
        </div>

        <div className="space-y-3">
          {sortedCompanies.map(c => {
            const dataComplete = c.mrr > 0 && c.burn > 0 && c.headcount > 0;
            const lastUpdateDays = Math.floor((new Date().getTime() - new Date(c.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={c.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[12px]" style={{ background: c.logoColor }}>{c.name[0]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px]">{c.name}</span>
                      <span className="text-[11px] px-1.5 py-0.5 bg-muted rounded">{c.stage}</span>
                      <span className="text-[10px] text-muted-foreground">{c.currency}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Source: board deck + email · Last update: {lastUpdateDays}d ago
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {dataComplete ? (
                      <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-lg flex items-center gap-1">
                        <Check className="w-3 h-3" /> Auto-extracted
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-lg">Missing data</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3">
                  {[
                    { label: 'ARR', value: formatCurrency(c.mrr * 12, c.currency), source: 'Board deck' },
                    { label: 'Revenue', value: formatCurrency(c.mrr, c.currency), source: 'Board deck' },
                    { label: 'Burn', value: formatCurrency(c.burn, c.currency) + '/mo', source: 'Board deck' },
                    { label: 'Cash Bal', value: formatCurrency(c.monthlyFinancials.length > 0 ? c.monthlyFinancials[c.monthlyFinancials.length - 1].cashBalance || 0 : 0, c.currency), source: 'Calculated' },
                    { label: 'Runway', value: c.runway + 'mo', source: 'Calculated' },
                    { label: 'Headcount', value: c.headcount.toString(), source: 'Email' },
                    { label: 'Customers', value: c.customers.toString(), source: 'Board deck' },
                  ].map(m => (
                    <div key={m.label} className="bg-muted/30 rounded-lg p-2">
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-[13px]">{m.value}</p>
                      <p className="text-[9px] text-muted-foreground">{m.source}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button className="text-[11px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-1">
                    <Send className="w-3 h-3" /> Send to Founder
                  </button>
                  <span className="text-[11px] text-muted-foreground">Secure token link — no login required</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Monthly review mode
  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMode('select')} className="text-[13px] text-muted-foreground hover:text-foreground">← Back</button>
        <span className="text-[12px] text-muted-foreground">
          {currentIndex + 1} of {sortedCompanies.length} companies
        </span>
      </div>

      <div className="bg-muted rounded-full h-2 overflow-hidden">
        <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
      </div>

      {current && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px]" style={{ background: current.logoColor }}>
              {current.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px]">{current.name}</h2>
                <span className="text-[11px] px-2 py-0.5 bg-muted rounded-md">{current.stage}</span>
                <span className="text-[11px] px-2 py-0.5 bg-muted rounded-md">{current.fund}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: getActionColor(current.action) + '15', color: getActionColor(current.action) }}>
                  {current.action}
                </span>
                {/* RAG strip */}
                <div className="flex items-center gap-1 ml-2">
                  {current.ragHistory.map((r, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ background: getRAGColor(r) }} title={`Q${i + 1}: ${r}`} />
                  ))}
                </div>
              </div>
              <p className="text-[13px] text-muted-foreground">{current.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground">Health</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: getHealthColor(current.health) }} />
                <span className="text-[13px]">{current.health}</span>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground">MRR</p>
              <p className="text-[13px] mt-1">{formatCurrency(current.mrr, current.currency)}</p>
              <span className={`text-[11px] ${current.arrGrowth >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                {current.arrGrowth >= 0 ? '+' : ''}{current.arrGrowth}%
              </span>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground">Burn</p>
              <p className="text-[13px] mt-1">{formatCurrency(current.burn, current.currency)}/mo</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground">Runway</p>
              <p className={`text-[13px] mt-1 ${current.runway < 6 ? 'text-destructive' : ''}`}>{current.runway}mo</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground">MoIC</p>
              <p className="text-[13px] mt-1">{current.accounting.moic.toFixed(1)}x</p>
            </div>
          </div>

          {currentFlags.length > 0 && (
            <div>
              <p className="text-[12px] text-muted-foreground mb-2">Active Alerts</p>
              {currentFlags.map(flag => (
                <div key={flag.id} className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 mb-1">
                  <span>{getFlagIcon(flag.type)}</span>
                  <div>
                    <p className="text-[12px]">{flag.headline}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-[12px] text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> Team Commentary
            </label>
            <textarea
              className="w-full text-[12px] border border-border rounded-lg px-3 py-2 mt-1 bg-background resize-none h-20"
              placeholder={`Add commentary for ${current.name}...`}
              value={commentaries[current.id] || ''}
              onChange={e => setCommentaries(prev => ({ ...prev, [current.id]: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleReview} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[13px] flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Mark Reviewed
            </button>
            <button onClick={handleSkip} className="px-4 py-2 border border-border rounded-lg text-[13px] hover:bg-muted flex items-center gap-1.5">
              <SkipForward className="w-4 h-4" /> Skip
            </button>
            <button onClick={() => navigate(`/company/${current.id}`)} className="ml-auto text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              View Full Detail <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
