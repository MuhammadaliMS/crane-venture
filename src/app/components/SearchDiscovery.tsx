import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Building2, FileText, BarChart3, StickyNote, Globe, X } from 'lucide-react';
import { companies, activityFeed, formatCurrency, getHealthColor } from './mock-data';

const savedSearches = [
  'Runway < 6 months',
  'Revenue growth > 15%',
  'No update 30+ days',
  'High Potential + At Risk',
  'DevTools companies',
];

const exampleQueries = [
  'Which companies have less than 6 months runway?',
  'Companies with accelerating revenue growth',
  'Who hired a VP Sales recently?',
  'What did the Arcline founder say about pricing?',
  'Companies in AI/ML sector',
  'Show At Risk companies with High Potential upside',
];

export function SearchDiscovery() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const companyResults = companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      c.health.toLowerCase().includes(q) ||
      c.upside.toLowerCase().includes(q) ||
      c.action.toLowerCase().includes(q)
    );

    // Search for specific conditions
    let conditionResults: typeof companies = [];
    if (q.includes('runway') && q.includes('6')) {
      conditionResults = companies.filter(c => c.runway < 6);
    } else if (q.includes('growth') || q.includes('accelerat')) {
      conditionResults = companies.filter(c => c.arrGrowth > 10);
    } else if (q.includes('no update') || q.includes('30 days') || q.includes('stale')) {
      conditionResults = companies.filter(c => {
        const days = (new Date().getTime() - new Date(c.lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
        return days > 30;
      });
    } else if (q.includes('at risk')) {
      conditionResults = companies.filter(c => c.health === 'At Risk');
    } else if (q.includes('high potential')) {
      conditionResults = companies.filter(c => c.upside === 'High Potential');
    }

    const allCompanies = [...new Map([...companyResults, ...conditionResults].map(c => [c.id, c])).values()];

    const docResults = [
      { name: 'Q4 Board Deck - Arcline', type: 'Board Deck', date: '2026-01-15', snippet: `...${q}... discussion about go-to-market strategy` },
      { name: 'Monthly Update - Nebula Data', type: 'Email', date: '2026-03-10', snippet: `...${q}... revenue growing faster than expected` },
    ].filter(() => q.length > 3);

    const activityResults = activityFeed.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.companyName.toLowerCase().includes(q)
    );

    return { companies: allCompanies, documents: docResults, activities: activityResults };
  }, [query]);

  const handleSavedSearch = (search: string) => {
    setQuery(search);
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search across all portfolio data — companies, documents, metrics, notes..."
          className="w-full text-[14px] border border-border rounded-xl pl-12 pr-10 py-3.5 bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Saved Searches */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-muted-foreground">Quick:</span>
        {savedSearches.map(search => (
          <button
            key={search}
            onClick={() => handleSavedSearch(search)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
              query === search ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'
            }`}
          >
            {search}
          </button>
        ))}
      </div>

      {/* Empty state with examples */}
      {!results && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-[14px] text-muted-foreground mb-4">Try a natural language query</p>
          <div className="grid grid-cols-2 gap-2 max-w-[600px] mx-auto">
            {exampleQueries.map(eq => (
              <button
                key={eq}
                onClick={() => setQuery(eq)}
                className="text-[12px] text-left p-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground"
              >
                "{eq}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          <p className="text-[12px] text-muted-foreground">
            {results.companies.length + results.documents.length + results.activities.length} results found
          </p>

          {/* Company Results */}
          {results.companies.length > 0 && (
            <div>
              <h3 className="text-[13px] flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Companies ({results.companies.length})
              </h3>
              <div className="space-y-1">
                {results.companies.map(c => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/company/${c.id}`)}
                    className="w-full bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-muted/20 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-[12px]" style={{ background: c.logoColor }}>
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px]">{c.name}</span>
                        <div className="w-2 h-2 rounded-full" style={{ background: getHealthColor(c.health) }} />
                        <span className="text-[11px] text-muted-foreground">{c.stage} · {c.sector}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{c.description}</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <p>MRR: {formatCurrency(c.mrr)}</p>
                      <p className="text-muted-foreground">Runway: {c.runway}mo</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Document Results */}
          {results.documents.length > 0 && (
            <div>
              <h3 className="text-[13px] flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Documents ({results.documents.length})
              </h3>
              <div className="space-y-1">
                {results.documents.map((doc, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-3 hover:bg-muted/20 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px]">{doc.name}</span>
                      <span className="text-[11px] px-1.5 py-0.5 bg-muted rounded">{doc.type}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{doc.snippet}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{doc.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Results */}
          {results.activities.length > 0 && (
            <div>
              <h3 className="text-[13px] flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Signals & Activity ({results.activities.length})
              </h3>
              <div className="space-y-1">
                {results.activities.map(event => (
                  <div key={event.id} className="bg-card border border-border rounded-lg p-3 hover:bg-muted/20 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] px-1.5 py-0.5 bg-muted rounded">{event.type}</span>
                      <span className="text-[13px]">{event.companyName}</span>
                    </div>
                    <p className="text-[12px]">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.companies.length === 0 && results.documents.length === 0 && results.activities.length === 0 && (
            <p className="text-center text-[13px] text-muted-foreground py-8">No results found for "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
}