import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sparkles, Search, ArrowRight, Building2, FileText, Mic } from 'lucide-react';
import { companies, formatCurrency, currentUser } from './mock-data';

// ── Suggested questions shown as quick-click chips ──
const SUGGESTED = [
  'Which companies have less than 6 months runway?',
  'Show me companies with ARR growth above 50%',
  "Summarise Arcline's Q1 performance",
  "Which founders haven't submitted Q1 data?",
  'Companies with concerning EBITDA trends',
  'Compare Nebula Data vs Arcline ARR',
];

type SourceCitation = {
  type: 'company' | 'doc' | 'transcript';
  label: string;
  detail: string;
  companyId?: string;
};

export function IntelligenceHub() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sources, setSources] = useState<SourceCitation[]>([]);
  const [history, setHistory] = useState<{ q: string; a: string }[]>([]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const submit = (q: string) => {
    if (!q.trim() || streaming) return;
    setQuery(q);
    setResponse('');

    let mockResponse = '';
    let mockSources: SourceCitation[] = [];
    const lower = q.toLowerCase();
    const activeCore = companies.filter(c => c.lifecycle === 'Active — Core');

    if (lower.includes('runway') || lower.includes('cash')) {
      const lowRunway = activeCore.filter(c => c.runway < 9).slice(0, 3);
      mockResponse = `Across the active portfolio, ${lowRunway.length} companies have runway below 9 months. ${lowRunway.map(c => `${c.name} has ~${c.runway} months runway with ${formatCurrency(c.burn, c.currency)}/month burn`).join('. ')}. These should be prioritised for the next quarterly review.`;
      mockSources = lowRunway.map(c => ({ type: 'company' as const, label: c.name, detail: `${c.runway} months runway`, companyId: c.id }));
    } else if (lower.includes('arr') || lower.includes('growth')) {
      const high = [...activeCore].sort((a, b) => b.arrGrowth - a.arrGrowth).slice(0, 3);
      mockResponse = `The fastest growing companies in the portfolio: ${high.map(c => `${c.name} at ${c.arrGrowth}% ARR growth (${formatCurrency(c.mrr * 12, c.currency)} ARR)`).join(', ')}. These are showing strong product-market fit signals based on the latest founder submissions.`;
      mockSources = high.map(c => ({ type: 'company' as const, label: c.name, detail: `${c.arrGrowth}% growth`, companyId: c.id }));
    } else if (lower.includes('summari') || lower.includes('compare')) {
      const co = companies.find(c => lower.includes(c.name.toLowerCase())) || companies[0];
      mockResponse = `${co.name}'s latest quarterly performance shows ARR of ${formatCurrency(co.mrr * 12, co.currency)} with ${co.arrGrowth}% growth. The team is currently rated ${co.rag} status with ~${co.runway} months runway. Key concerns flagged: ${co.keyConcerns?.[0] ?? 'none'}. The lead partner is ${co.owners[0]}.`;
      mockSources = [
        { type: 'company', label: co.name, detail: 'Company profile', companyId: co.id },
        { type: 'doc', label: 'Q1 founder form', detail: 'Submitted Apr 12, 2026' },
        { type: 'transcript', label: 'Granola call', detail: 'Mar 28, 2026' },
      ];
    } else if (lower.includes('founder') || lower.includes('submit')) {
      mockResponse = `Currently 4 founders have not yet submitted Q1 2026 data: Pulsetrack, Vaultik, Stackpilot, and Gridform. The deadline was last Friday. Anna and Marcus have been following up — automated reminders go out in 3 days.`;
      mockSources = [{ type: 'doc', label: 'Q1 2026 submission tracker', detail: 'Updated 2 hours ago' }];
    } else {
      mockResponse = `Based on the most recent quarterly data across ${activeCore.length} active companies in the portfolio, here is an overview related to your question. Detailed analysis would draw from founder form submissions, Granola call transcripts, Gmail threads, and Notion documents. Try refining your question or click one of the suggested topics below.`;
      mockSources = [];
    }

    setSources(mockSources);
    setStreaming(true);
    let i = 0;
    const stream = setInterval(() => {
      i += 5;
      setResponse(mockResponse.slice(0, i));
      if (i >= mockResponse.length) {
        clearInterval(stream);
        setStreaming(false);
        setHistory(prev => [...prev, { q, a: mockResponse }]);
      }
    }, 18);
  };

  const reset = () => {
    setQuery('');
    setResponse('');
    setSources([]);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-[760px] mx-auto pt-16 pb-16">
      {/* Hero — editorial, restrained. Date · greeting · serif question */}
      {!response && !streaming && (
        <div className="mb-10">
          <p className="text-[12px] font-mono-num uppercase tracking-[0.14em] text-muted-foreground mb-4">
            {today}
          </p>
          <h1 className="font-display text-[44px] leading-[1.05] text-foreground mb-3">
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-[16px] leading-snug text-muted-foreground max-w-md">
            Ask anything about your portfolio — companies, metrics, recent updates, concerns.
          </p>
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <label htmlFor="briefing-query" className="sr-only">Ask the portfolio</label>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <input
          id="briefing-query"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a question, or pick one below"
          className="w-full pl-11 pr-28 py-3.5 text-[15px] border border-border rounded-md bg-card focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
          onKeyDown={e => { if (e.key === 'Enter') submit(query); }}
        />
        <button
          onClick={() => submit(query)}
          disabled={!query.trim() || streaming}
          aria-label="Submit question"
          className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3.5 h-9 rounded-md text-[13px] font-medium transition-colors ${
            !query.trim() || streaming
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-[var(--primary-muted)]'
          }`}
        >
          Ask <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested questions — left-aligned list, not chip soup */}
      {!response && !streaming && (
        <div className="mt-10">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground/80 mb-2">Suggested</p>
          <ul className="divide-y divide-border border-y border-border">
            {SUGGESTED.map(s => (
              <li key={s}>
                <button
                  onClick={() => submit(s)}
                  className="w-full text-left text-[14px] py-3 px-1 text-foreground hover:text-primary transition-colors flex items-center gap-3 group"
                >
                  <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
                  <span>{s}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Response */}
      {(response || streaming) && (
        <div className="mt-6">
          <article className="bg-card rounded-md border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                {streaming ? 'Drafting' : 'Answer'}
              </p>
              {!streaming && (
                <button onClick={reset} className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">New question</button>
              )}
            </div>
            <p className="text-[16px] text-foreground leading-relaxed">
              {response}
              {streaming && <span className="inline-block w-[2px] h-[1.1em] bg-primary ml-1 animate-pulse align-middle" aria-hidden="true" />}
            </p>

            {/* Sources */}
            {!streaming && sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground mb-2">Sources</p>
                <div className="flex flex-wrap gap-1.5">
                  {sources.map((s, i) => {
                    const Icon = s.type === 'company' ? Building2 : s.type === 'doc' ? FileText : Mic;
                    return (
                      <button
                        key={i}
                        onClick={() => s.companyId && navigate(`/company/${s.companyId}`)}
                        className="inline-flex items-center gap-1.5 text-[12px] bg-muted hover:bg-accent border border-border rounded-md px-2.5 py-1 text-foreground transition-colors"
                      >
                        <Icon className="w-3 h-3" aria-hidden="true" />
                        <span className="font-medium">{s.label}</span>
                        <span className="text-muted-foreground">· {s.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </article>

          {/* Recent history */}
          {history.length > 1 && !streaming && (
            <div className="mt-8">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground mb-2">Recent</p>
              <ul className="space-y-0">
                {history.slice(0, -1).reverse().slice(0, 5).map((h, i) => (
                  <li key={i}>
                    <button
                      onClick={() => submit(h.q)}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors text-[13px] text-muted-foreground hover:text-foreground flex items-center gap-2"
                    >
                      <Search className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" aria-hidden="true" />
                      <span className="truncate">{h.q}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
