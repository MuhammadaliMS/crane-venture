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

  return (
    <div className="max-w-[820px] mx-auto pt-12 pb-16">
      {/* Hero — only when no response */}
      {!response && !streaming && (
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-[15px] text-slate-500 mt-2">
            Ask anything about your portfolio — companies, metrics, recent updates, concerns.
          </p>
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="What do you want to know about the portfolio?"
          className="w-full pl-12 pr-32 py-4 text-[15px] border border-slate-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 focus:shadow-md transition-all"
          onKeyDown={e => { if (e.key === 'Enter') submit(query); }}
        />
        <button
          onClick={() => submit(query)}
          disabled={!query.trim() || streaming}
          className={`absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
            !query.trim() || streaming
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm'
          }`}
        >
          Ask <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested questions chips */}
      {!response && !streaming && (
        <div className="mt-8">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-3 text-center">Try asking</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="text-[13px] px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-slate-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Response */}
      {(response || streaming) && (
        <div className="mt-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {streaming ? 'Generating answer…' : 'Answer'}
              </p>
              {!streaming && (
                <button onClick={reset} className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">New question</button>
              )}
            </div>
            <p className="text-[15px] text-slate-800 leading-relaxed">
              {response}
              {streaming && <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-1 animate-pulse align-middle" />}
            </p>

            {/* Sources */}
            {!streaming && sources.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">Sources</p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s, i) => {
                    const Icon = s.type === 'company' ? Building2 : s.type === 'doc' ? FileText : Mic;
                    return (
                      <button
                        key={i}
                        onClick={() => s.companyId && navigate(`/company/${s.companyId}`)}
                        className="inline-flex items-center gap-1.5 text-[12px] bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-full px-3 py-1 text-slate-700 hover:text-indigo-700 transition-colors"
                      >
                        <Icon className="w-3 h-3" />
                        <span className="font-medium">{s.label}</span>
                        <span className="text-slate-400">· {s.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Recent history */}
          {history.length > 1 && !streaming && (
            <div className="mt-8">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2">Recent</p>
              <div className="space-y-1">
                {history.slice(0, -1).reverse().slice(0, 5).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => submit(h.q)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[13px] text-slate-600 hover:text-slate-900 flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    <span className="truncate">{h.q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
