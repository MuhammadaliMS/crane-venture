import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle, TrendingUp, FileText, Globe, Users, DollarSign,
  Calendar, MessageSquare, Flame, RotateCcw, Target, Filter
} from 'lucide-react';
import { activityFeed, type ActivityEvent } from './mock-data';

const typeIcons: Record<string, any> = {
  'Status Change': RotateCcw,
  'Metric Update': TrendingUp,
  'Burn Acceleration': Flame,
  'Document Ingested': FileText,
  'External Signal': Globe,
  'Key Hire / Departure': Users,
  'Fundraising Signal': DollarSign,
  'Board Upcoming': Calendar,
  'Engagement Gap': MessageSquare,
  'Runway Alert': AlertTriangle,
  'Pivot Signal': RotateCcw,
  'Customer Signal': Target,
};

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  info: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

export function AlertsFeed() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const types = [...new Set(activityFeed.map(e => e.type))];

  const filtered = activityFeed
    .filter(e => typeFilter === 'all' || e.type === typeFilter)
    .filter(e => severityFilter === 'all' || e.severity === severityFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Group by date
  const grouped = filtered.reduce<Record<string, ActivityEvent[]>>((acc, event) => {
    const date = new Date(event.timestamp).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}
          className="text-[12px] border border-border rounded-lg px-2 py-1.5 bg-card">
          <option value="all">All Severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        {(typeFilter !== 'all' || severityFilter !== 'all') && (
          <button onClick={() => { setTypeFilter('all'); setSeverityFilter('all'); }}
            className="text-[12px] text-muted-foreground hover:text-foreground underline">
            Clear
          </button>
        )}
        <span className="ml-auto text-[12px] text-muted-foreground">{filtered.length} events</span>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, events]) => (
          <div key={date}>
            <h3 className="text-[12px] text-muted-foreground mb-2 sticky top-0 bg-background py-1">{date}</h3>
            <div className="space-y-2 relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
              {events.map(event => {
                const Icon = typeIcons[event.type] || Globe;
                const colors = severityColors[event.severity];
                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 ${colors.bg} border ${colors.border} rounded-xl p-3 relative ml-5 cursor-pointer hover:shadow-sm transition-shadow`}
                    onClick={() => {
                      const company = activityFeed.find(a => a.companyName === event.companyName);
                      // navigate to company
                    }}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.bg} shrink-0 -ml-[30px]`}>
                      <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[12px] px-1.5 py-0.5 bg-white/60 rounded">{event.companyName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.text}`}>{event.type}</span>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {new Date(event.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[13px]">{event.title}</p>
                      <p className="text-[11px] text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
