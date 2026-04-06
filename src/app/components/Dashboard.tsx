import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Check,
  CheckSquare,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Flame,
  Globe,
  ListTodo,
  MessageSquare,
  Phone,
  RotateCcw,
  StickyNote,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { SparklineChart } from './SparklineChart';
import {
  companies,
  currentUser,
  formatCurrency,
  getHealthColor,
  getRAGColor,
  type Flag,
  type Fund,
} from './mock-data';
import { useWorkflow } from './WorkflowContext';
import { FlagActionDropdown } from './FlagActionDropdown';
import { LogNoteModal, NewTodoModal, ScheduleCheckInModal } from './ActionModals';
import { useFundFilter } from './Layout';

const activityIcons: Record<string, typeof TrendingUp> = {
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
  'Note Logged': FileText,
  'Action Created': CheckSquare,
  'Action Completed': CheckSquare,
  'Flag Resolved': CheckSquare,
  'Flag Converted': ListTodo,
  'Check-in Scheduled': Calendar,
};

type MaterialMoment =
  | {
      id: string;
      kind: 'flag';
      companyId: string;
      companyName: string;
      title: string;
      detail: string;
      meta: string;
      emphasis: 'high' | 'medium';
      flag: Flag;
    }
  | {
      id: string;
      kind: 'board';
      companyId: string;
      companyName: string;
      title: string;
      detail: string;
      meta: string;
      emphasis: 'medium';
    }
  | {
      id: string;
      kind: 'activity';
      companyId: string;
      companyName: string;
      title: string;
      detail: string;
      meta: string;
      emphasis: 'medium' | 'low';
      activityType: string;
    };

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getDaysUntilLabel(targetDate: string, today: Date) {
  const daysUntil = Math.ceil((new Date(targetDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil <= 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  return `${daysUntil}d away`;
}

function getCompanyPriorityScore(companyId: string, flagsByCompany: Record<string, Flag[]>, today: Date, lastUpdate: string, runway: number, nextBoard: string | null) {
  const companyFlags = flagsByCompany[companyId] || [];
  const highFlags = companyFlags.filter((flag) => flag.urgency === 'high').length;
  const mediumFlags = companyFlags.filter((flag) => flag.urgency === 'medium').length;
  const staleDays = Math.floor((today.getTime() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
  const boardDays = nextBoard ? Math.ceil((new Date(nextBoard).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  let score = highFlags * 6 + mediumFlags * 3;
  if (runway <= 6) score += 5;
  if (runway <= 12) score += 2;
  if (staleDays >= 30) score += 3;
  if (boardDays !== null && boardDays <= 14) score += 4;
  return score;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { fundFilter, setFundFilter } = useFundFilter();
  const { todos, flags, activityFeed, toggleTodo } = useWorkflow();
  const [showNewTodo, setShowNewTodo] = useState(false);
  const [showLogNote, setShowLogNote] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState<{ open: boolean; companyName?: string }>({ open: false });

  const today = new Date();
  const pageDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const myCompanies = companies.filter((company) => (
    company.owners.includes(currentUser.name) && company.lifecycle === 'Active — Core'
  ));
  const filteredCompanies = fundFilter === 'all'
    ? myCompanies
    : myCompanies.filter((company) => company.fund === fundFilter);
  const companyIds = new Set(filteredCompanies.map((company) => company.id));
  const companyNames = new Set(filteredCompanies.map((company) => company.name));

  const filteredFlags = flags.filter((flag) => companyIds.has(flag.companyId));
  const flagsByCompany = filteredFlags.reduce<Record<string, Flag[]>>((acc, flag) => {
    if (!acc[flag.companyId]) acc[flag.companyId] = [];
    acc[flag.companyId].push(flag);
    return acc;
  }, {});

  const filteredTodos = todos.filter((todo) => companyNames.has(todo.companyName));
  const filteredActivity = activityFeed.filter((event) => companyNames.has(event.companyName));

  const overdueTodos = filteredTodos.filter((todo) => !todo.completed && new Date(todo.dueDate) < today);
  const urgentFlags = filteredFlags.filter((flag) => flag.urgency === 'high');
  const boardsSoon = filteredCompanies.filter((company) => {
    if (!company.nextBoard) return false;
    const daysUntil = Math.ceil((new Date(company.nextBoard).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 14;
  });
  const staleCompanies = filteredCompanies.filter((company) => {
    const daysSinceUpdate = Math.floor((today.getTime() - new Date(company.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate >= 30;
  });

  const averageRunway = filteredCompanies.length > 0
    ? Math.round(filteredCompanies.reduce((sum, company) => sum + company.runway, 0) / filteredCompanies.length)
    : 0;
  const onTrackCount = filteredCompanies.filter((company) => company.health === 'On Track').length;
  const atRiskCount = filteredCompanies.filter((company) => company.health === 'At Risk').length;
  const underperformingCount = filteredCompanies.filter((company) => company.health === 'Underperforming').length;
  const materialSignalCount = filteredActivity.filter((event) => (
    event.severity === 'high' || event.severity === 'medium'
  )).length;

  const materialMomentCandidates: MaterialMoment[] = [
    ...urgentFlags.slice(0, 2).map((flag) => ({
      id: `flag-${flag.id}`,
      kind: 'flag' as const,
      companyId: flag.companyId,
      companyName: flag.companyName,
      title: `${flag.companyName} needs intervention`,
      detail: flag.headline,
      meta: flag.suggestedAction,
      emphasis: flag.urgency === 'high' ? 'high' : 'medium',
      flag,
    })),
    ...boardsSoon
      .sort((a, b) => new Date(a.nextBoard!).getTime() - new Date(b.nextBoard!).getTime())
      .slice(0, 2)
      .map((company) => ({
        id: `board-${company.id}`,
        kind: 'board' as const,
        companyId: company.id,
        companyName: company.name,
        title: `${company.name} board meeting is approaching`,
        detail: `${getDaysUntilLabel(company.nextBoard!, today)} · board on ${formatShortDate(company.nextBoard!)}`,
        meta: 'Prep the board brief and talking points',
        emphasis: 'medium' as const,
      })),
    ...filteredActivity
      .filter((event) => event.severity === 'high' || event.severity === 'medium')
      .slice(0, 2)
      .map((event) => ({
        id: `activity-${event.id}`,
        kind: 'activity' as const,
        companyId: companies.find((company) => company.name === event.companyName)?.id || '',
        companyName: event.companyName,
        title: `${event.companyName} generated a fresh signal`,
        detail: event.description,
        meta: `${event.type} · ${formatShortDate(event.timestamp)}`,
        emphasis: event.severity === 'high' ? 'medium' : 'low',
        activityType: event.type,
      })),
  ];
  const seenMaterialCompanies = new Set<string>();
  const materialMoments: MaterialMoment[] = [];
  for (const moment of materialMomentCandidates) {
    if (seenMaterialCompanies.has(moment.companyId)) continue;
    seenMaterialCompanies.add(moment.companyId);
    materialMoments.push(moment);
    if (materialMoments.length === 5) break;
  }

  const focusCompanies = [...filteredCompanies]
    .sort((a, b) => (
      getCompanyPriorityScore(b.id, flagsByCompany, today, b.lastUpdate, b.runway, b.nextBoard) -
      getCompanyPriorityScore(a.id, flagsByCompany, today, a.lastUpdate, a.runway, a.nextBoard)
    ))
    .slice(0, 6);

  const recentTimeline = [
    ...filteredFlags
      .filter((flag) => flag.urgency !== 'high')
      .map((flag) => ({
        id: `flag-${flag.id}`,
        kind: 'flag' as const,
        companyId: flag.companyId,
        companyName: flag.companyName,
        title: flag.type,
        detail: flag.headline,
        sortDate: new Date(flag.createdAt).getTime(),
        tone: flag.urgency === 'medium' ? 'text-amber-600 bg-amber-400' : 'text-slate-600 bg-slate-400',
      })),
    ...filteredActivity.map((event) => ({
      id: `activity-${event.id}`,
      kind: 'activity' as const,
      companyId: companies.find((company) => company.name === event.companyName)?.id || '',
      companyName: event.companyName,
      title: event.type,
      detail: event.description,
      sortDate: new Date(event.timestamp).getTime(),
      tone: event.severity === 'high'
        ? 'text-red-600 bg-red-500'
        : event.severity === 'medium'
        ? 'text-amber-600 bg-amber-500'
        : event.severity === 'low'
        ? 'text-blue-600 bg-blue-500'
        : 'text-slate-600 bg-slate-400',
      icon: activityIcons[event.type] || Globe,
    })),
  ]
    .sort((a, b) => b.sortDate - a.sortDate)
    .slice(0, 6);

  const attentionQueue = [
    ...overdueTodos.slice(0, 2).map((todo) => ({
      id: `todo-${todo.id}`,
      kind: 'todo' as const,
      companyName: todo.companyName,
      title: todo.title,
      meta: `Overdue · ${todo.priority} priority`,
      companyId: companies.find((company) => company.name === todo.companyName)?.id || '',
    })),
    ...urgentFlags.slice(0, 2).map((flag) => ({
      id: `flag-${flag.id}`,
      kind: 'flag' as const,
      companyName: flag.companyName,
      title: flag.headline,
      meta: flag.suggestedAction,
      companyId: flag.companyId,
      flag,
    })),
  ].slice(0, 4);

  const briefLine = filteredCompanies.length === 0
    ? 'No active companies match the current fund filter.'
    : `${urgentFlags.length} critical flag${urgentFlags.length === 1 ? '' : 's'}, ${boardsSoon.length} board moment${boardsSoon.length === 1 ? '' : 's'}, and ${materialSignalCount} fresh signal${materialSignalCount === 1 ? '' : 's'} across ${filteredCompanies.length} active companies.`;

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      {/* Portfolio Brief */}
      <section className="rounded-xl border border-slate-200/60 bg-white px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-indigo-200/60 bg-indigo-50/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Portfolio Brief
              </span>
              <span className="text-[12px] text-slate-400">{pageDate}</span>
            </div>
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight text-slate-800">
                {currentUser.name}, here&apos;s what changed since your last review.
              </h1>
              <p className="mt-1.5 max-w-[860px] text-[13px] leading-relaxed text-slate-500">
                {briefLine}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={fundFilter}
              onChange={(event) => setFundFilter(event.target.value as Fund | 'all')}
              className="min-w-[132px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:border-indigo-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
            >
              <option value="all">All Funds</option>
              <option value="Fund I">Fund I</option>
              <option value="Fund II">Fund II</option>
              <option value="Fund III">Fund III</option>
            </select>
            <button
              onClick={() => setShowLogNote(true)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              title="Log note"
            >
              <StickyNote className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowNewTodo(true)}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              title="New to-do"
            >
              <ListTodo className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowCheckIn({ open: true })}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
              title="Schedule check-in"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
            >
              Open Command Center
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Material Changes */}
      <section className="rounded-xl border border-slate-200/60 bg-white px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Material Changes</p>
            <h2 className="mt-1.5 text-[16px] font-semibold tracking-tight text-slate-700">The handful of things worth acting on.</h2>
          </div>
          <button
            onClick={() => navigate('/matrix')}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Open action matrix
          </button>
        </div>

        {materialMoments.length > 0 ? (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1 stagger-scale">
            {materialMoments.map((moment) => {
              const isHigh = moment.emphasis === 'high';
              return (
                <div
                  key={moment.id}
                  className={`flex-none w-[300px] rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isHigh
                      ? 'border-red-200/70 bg-red-50/40'
                      : 'border-slate-200/70 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${isHigh ? 'bg-red-400' : 'bg-indigo-400'}`} />
                      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                        {moment.companyName}
                      </span>
                    </div>
                    {moment.kind === 'flag' ? (
                      <FlagActionDropdown flag={moment.flag} variant="button" />
                    ) : (
                      <button
                        onClick={() => navigate(moment.kind === 'board' ? '/board-prep' : `/company/${moment.companyId}`)}
                        className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        {moment.kind === 'board' ? 'Prep board' : 'Open company'}
                      </button>
                    )}
                  </div>
                  <h3 className="mt-2 text-[13px] font-semibold text-slate-700 line-clamp-1">{moment.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-500 line-clamp-2">{moment.detail}</p>
                  <p className="mt-2 text-[11px] text-slate-400 line-clamp-1">{moment.meta}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 text-[13px] text-slate-500">
            No material changes in the current slice. Use the command center for a deeper inspection pass.
          </div>
        )}
      </section>

      {/* KPI Strip */}
      <section className="grid gap-3 lg:grid-cols-5 stagger-children">
        {[
          {
            label: 'Active companies',
            value: filteredCompanies.length,
            detail: fundFilter === 'all' ? 'Across your coverage' : `Within ${fundFilter}`,
          },
          {
            label: 'Portfolio health',
            value: `${onTrackCount}/${atRiskCount}/${underperformingCount}`,
            detail: 'Green · Amber · Red',
          },
          {
            label: 'Average runway',
            value: `${averageRunway}mo`,
            detail: 'Cash planning horizon',
          },
          {
            label: 'Boards inside 14d',
            value: boardsSoon.length,
            detail: 'Preparation needed soon',
          },
          {
            label: 'Stale updates',
            value: staleCompanies.length,
            detail: '30+ days since last touch',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200/60 bg-white px-4 py-3.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
            <p className="mt-1.5 font-mono-num text-[22px] font-bold tracking-tight text-slate-700">{stat.value}</p>
            <p className="mt-1 text-[11px] text-slate-400">{stat.detail}</p>
          </div>
        ))}
      </section>

      {/* Focus Companies + Sidebar — single page scroll, no inner overflow */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Focus Companies</p>
                <h2 className="mt-1.5 text-[16px] font-semibold tracking-tight text-slate-700">The portfolio names most likely to shape this week.</h2>
              </div>
              <button
                onClick={() => navigate('/portfolio')}
                className="text-[13px] font-medium text-indigo-600 transition-colors hover:text-indigo-700"
              >
                See full portfolio
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 stagger-scale">
              {focusCompanies.map((company) => {
                const companyFlags = flagsByCompany[company.id] || [];
                const primaryFlag = companyFlags.sort((a, b) => (
                  (b.urgency === 'high' ? 2 : b.urgency === 'medium' ? 1 : 0) -
                  (a.urgency === 'high' ? 2 : a.urgency === 'medium' ? 1 : 0)
                ))[0];
                const daysSinceUpdate = Math.floor((today.getTime() - new Date(company.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
                const whyItMatters = primaryFlag?.headline || company.recentProgress || company.summary;

                return (
                  <button
                    key={company.id}
                    onClick={() => navigate(`/company/${company.id}`)}
                    className="group overflow-hidden rounded-xl border border-slate-200/60 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-semibold text-white shadow-sm"
                            style={{ background: company.logoColor }}
                          >
                            {company.name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-[15px] font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                                {company.name}
                              </h3>
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: getRAGColor(company.rag) }}
                                title={company.rag}
                              />
                            </div>
                            <p className="text-[12px] text-slate-500">
                              {company.stage} · {company.sector} · {company.fund}
                            </p>
                          </div>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          style={{ backgroundColor: `${getHealthColor(company.health)}16`, color: getHealthColor(company.health) }}
                        >
                          {company.health}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-[12px] leading-5 text-slate-500">{company.summary}</p>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">MRR</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="font-mono-num text-[15px] font-bold text-slate-700">
                              {formatCurrency(company.mrr, company.currency)}
                            </span>
                            <span className={`flex items-center text-[11px] font-semibold ${
                              company.arrGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {company.arrGrowth >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {Math.abs(company.arrGrowth)}%
                            </span>
                          </div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Runway</p>
                          <p className="mt-1 font-mono-num text-[15px] font-bold text-slate-700">{company.runway}mo</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Updated</p>
                          <p className="mt-1 text-[14px] font-semibold text-slate-950">{daysSinceUpdate}d ago</p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Why it matters</p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-600">{whyItMatters}</p>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {companyFlags.length > 0 && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                              {companyFlags.length} active flag{companyFlags.length === 1 ? '' : 's'}
                            </span>
                          )}
                          {company.nextBoard && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                              Board {getDaysUntilLabel(company.nextBoard, today).toLowerCase()}
                            </span>
                          )}
                        </div>
                        <div className="w-24 opacity-70 transition-opacity group-hover:opacity-100">
                          <SparklineChart data={company.mrrTrend} color={getHealthColor(company.health)} height={32} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div>
            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Up Next</p>
                <p className="mt-1 text-[14px] font-semibold tracking-tight text-slate-700">Boards and overdue tasks.</p>
              </div>
              <button
                onClick={() => navigate('/board-prep')}
                className="text-[12px] font-medium text-indigo-600 hover:text-indigo-700"
              >
                Board prep
              </button>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white overflow-hidden">
              {boardsSoon.length > 0 ? boardsSoon
                .sort((a, b) => new Date(a.nextBoard!).getTime() - new Date(b.nextBoard!).getTime())
                .slice(0, 4)
                .map((company, idx, arr) => (
                  <button
                    key={company.id}
                    onClick={() => navigate('/board-prep')}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-slate-50 ${idx < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-slate-700">{company.name}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {company.nextBoard ? formatShortDate(company.nextBoard) : 'No board scheduled'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50/70 px-2.5 py-1 text-[11px] font-medium text-amber-600">
                      {company.nextBoard ? getDaysUntilLabel(company.nextBoard, today) : 'TBD'}
                    </span>
                  </button>
                )) : (
                  <div className="px-3 py-2 text-[13px] text-slate-500">
                    No board meetings inside the next two weeks.
                  </div>
                )}

              {overdueTodos.length > 0 && (
                <>
                  <div className="border-t border-slate-200 my-1" />
                  {overdueTodos.slice(0, 3).map((todo, idx, arr) => (
                    <button
                      key={todo.id}
                      onClick={() => {
                        const companyId = companies.find((c) => c.name === todo.companyName)?.id;
                        if (companyId) navigate(`/company/${companyId}`);
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-slate-50 ${idx < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                    >
                      <div>
                        <p className="text-[13px] font-medium text-slate-700">{todo.title}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">{todo.companyName}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-red-50/70 px-2.5 py-1 text-[11px] font-medium text-red-500">
                        Overdue
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Activity Log</p>
                <p className="mt-1 text-[14px] font-semibold tracking-tight text-slate-700">Recent signals and updates.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                {recentTimeline.length}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white overflow-hidden divide-y divide-slate-100 stagger-children">
              {recentTimeline.length > 0 ? recentTimeline.map((item) => {
                const ActivityIcon = item.kind === 'activity' ? item.icon : AlertTriangle;
                const dotClass = item.tone.split(' ')[1];
                return (
                  <button
                    key={item.id}
                    onClick={() => item.companyId && navigate(`/company/${item.companyId}`)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <ActivityIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-medium text-slate-700">{item.companyName}</span>
                        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                      </div>
                      <p className="text-[12px] text-slate-500 line-clamp-1">{item.title}</p>
                    </div>
                  </button>
                );
              }) : (
                <div className="py-2 text-[13px] text-slate-500">
                  No fresh activity right now.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <NewTodoModal open={showNewTodo} onClose={() => setShowNewTodo(false)} />
      <LogNoteModal open={showLogNote} onClose={() => setShowLogNote(false)} />
      <ScheduleCheckInModal
        open={showCheckIn.open}
        onClose={() => setShowCheckIn({ open: false })}
        companyName={showCheckIn.companyName}
      />
    </div>
  );
}
