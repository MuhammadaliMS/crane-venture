import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Building2, AlertTriangle, Calendar, CheckSquare, Clock,
  ChevronRight, Check, Plus, ArrowUpRight, ArrowDownRight, FileText,
  Bell, Flame, Phone, Mail, Zap
} from 'lucide-react';
import { SparklineChart } from './SparklineChart';
import {
  currentUser, companies, flags, todos, formatCurrency,
  getHealthColor, getFlagIcon, type Todo
} from './mock-data';

export function Dashboard() {
  const navigate = useNavigate();
  const myCompanies = companies.filter(c => c.owner === currentUser.name && c.lifecycle === 'Active — Core');
  const myFlags = flags.filter(f => myCompanies.some(c => c.id === f.companyId));
  const [myTodos, setMyTodos] = useState<Todo[]>(todos);
  const needsAttention = myCompanies.filter(c => c.flagCount > 0).length;
  const upcomingBoards = myCompanies.filter(c => c.nextBoard).length;
  const overdueTodos = myTodos.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;

  const toggleTodo = (id: string) => {
    setMyTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Separate urgent vs informational stats
  const urgentCards = [
    { label: 'Needs Attention', value: needsAttention, icon: AlertTriangle, color: '#F59E0B', urgent: needsAttention > 0, onClick: () => navigate('/matrix') },
    { label: 'Overdue Actions', value: overdueTodos, icon: CheckSquare, color: overdueTodos > 0 ? '#EF4444' : '#10B981', urgent: overdueTodos > 0 },
  ];
  const infoCards = [
    { label: 'My Companies', value: myCompanies.length, icon: Building2, color: '#3B82F6', onClick: () => navigate('/portfolio') },
    { label: 'Upcoming Boards', value: upcomingBoards, icon: Calendar, color: '#8B5CF6', onClick: () => navigate('/board-prep') },
    { label: 'Next Review', value: '3 days', icon: Clock, color: '#6B7280', onClick: () => navigate('/review') },
  ];

  const urgentAlerts = myFlags.filter(f => f.urgency === 'high').slice(0, 3);
  const otherAlerts = myFlags.filter(f => f.urgency !== 'high');

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Urgent Items Strip — visually elevated */}
      {(overdueTodos > 0 || needsAttention > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {urgentCards.filter(c => c.urgent).map(card => (
            <button
              key={card.label}
              onClick={card.onClick}
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:border-red-300 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 group-hover:bg-red-200 transition-colors">
                <card.icon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-[28px] font-bold text-red-700">{card.value}</p>
                <p className="text-[13px] text-red-600 font-medium">{card.label}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      )}

      {/* Summary Strip — info cards */}
      <div className="grid grid-cols-3 gap-3">
        {infoCards.map(card => (
          <button
            key={card.label}
            onClick={card.onClick}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm hover:border-primary/20 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: card.color + '12' }}>
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-[22px] font-semibold">{card.value}</p>
              <p className="text-[12px] text-muted-foreground">{card.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Critical Alerts Banner — high urgency only */}
      {urgentAlerts.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-red-100/60 border-b border-red-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            <span className="text-[12px] font-semibold text-red-700 uppercase tracking-wider">Critical Alerts</span>
            <span className="text-[11px] text-red-500 ml-1">Requires immediate action</span>
          </div>
          <div className="divide-y divide-red-100">
            {urgentAlerts.map(flag => (
              <div key={flag.id} className="p-4 flex items-center gap-3">
                <span className="text-lg shrink-0">{getFlagIcon(flag.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <button
                      onClick={() => navigate(`/company/${flag.companyId}`)}
                      className="text-[12px] px-2 py-0.5 bg-white rounded-md hover:bg-red-50 transition-colors font-medium border border-red-200"
                    >
                      {flag.companyName}
                    </button>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-200/60 text-red-700 font-medium">{flag.type}</span>
                  </div>
                  <p className="text-[13px] text-red-900">{flag.headline}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/company/${flag.companyId}`)}
                    className="text-[11px] px-3 py-1.5 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3" /> Schedule Call
                  </button>
                  <button
                    onClick={() => navigate(`/company/${flag.companyId}`)}
                    className="text-[11px] px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3 h-3" /> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-6">
        {/* My To-Dos — Central Element */}
        <div className="col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold flex items-center gap-2">
              My To-Dos
              {overdueTodos > 0 && (
                <span className="text-[11px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                  {overdueTodos} overdue
                </span>
              )}
            </h2>
            <button className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors">
              <Plus className="w-3 h-3" /> New To-Do
            </button>
          </div>

          {/* System-generated (from alerts) separated from manual */}
          <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
            {myTodos.filter(t => !t.completed).sort((a, b) => {
              // Overdue first, then by priority, then by date
              const aOverdue = new Date(a.dueDate) < new Date() ? 0 : 1;
              const bOverdue = new Date(b.dueDate) < new Date() ? 0 : 1;
              if (aOverdue !== bOverdue) return aOverdue - bOverdue;
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }).map(todo => {
              const isOverdue = new Date(todo.dueDate) < new Date();
              return (
                <div key={todo.id} className={`p-3.5 flex items-start gap-3 transition-colors ${isOverdue ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-muted/30'}`}>
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-[18px] h-[18px] mt-0.5 rounded border-2 shrink-0 flex items-center justify-center transition-all hover:scale-110 ${
                      isOverdue ? 'border-red-400 hover:border-red-500 hover:bg-red-100' : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {todo.completed && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] ${isOverdue ? 'font-medium' : ''}`}>{todo.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/company/${companies.find(c => c.name === todo.companyName)?.id || ''}`); }}
                        className="text-[11px] px-1.5 py-0.5 bg-muted rounded-md hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        {todo.companyName}
                      </button>
                      <span className={`text-[11px] font-medium ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {isOverdue ? 'Overdue' : new Date(todo.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      {todo.source === 'flag' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-md border border-amber-200/50 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> from alert
                        </span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                        todo.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-200/50' :
                        todo.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' :
                        'bg-gray-50 text-gray-500 border border-gray-200/50'
                      }`}>{todo.priority}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Completed */}
          <details className="text-[12px]">
            <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
              Completed ({myTodos.filter(t => t.completed).length})
            </summary>
            <div className="bg-card border border-border rounded-xl mt-2 divide-y divide-border opacity-50">
              {myTodos.filter(t => t.completed).map(todo => (
                <div key={todo.id} className="p-3 flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-[13px] line-through text-muted-foreground">{todo.title}</span>
                </div>
              ))}
            </div>
          </details>
        </div>

        {/* Board Prep + Alerts — Right Column */}
        <div className="col-span-2 space-y-4">
          {/* Board Prep Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[15px] font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                Board Prep
              </h2>
              <button
                onClick={() => navigate('/board-prep')}
                className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                All boards <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {myCompanies.filter(c => c.nextBoard).sort((a, b) => new Date(a.nextBoard!).getTime() - new Date(b.nextBoard!).getTime()).map(company => {
                const boardDate = new Date(company.nextBoard!);
                const daysUntil = Math.ceil((boardDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysUntil <= 7;
                return (
                  <div key={company.id} className={`p-3.5 transition-colors ${isUrgent ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-muted/30'}`}>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-medium shadow-sm" style={{ background: company.logoColor }}>
                        {company.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{company.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Board — {boardDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          <span className={`ml-2 font-medium ${isUrgent ? 'text-amber-600' : ''}`}>
                            ({daysUntil <= 0 ? 'Today!' : `${daysUntil}d away`})
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/board-prep')}
                        className="text-[11px] px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 font-medium"
                      >
                        <FileText className="w-3 h-3" /> Start Prep
                      </button>
                      <button
                        onClick={() => navigate(`/company/${company.id}`)}
                        className="text-[11px] px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        View Company
                      </button>
                      {company.flagCount > 0 && (
                        <span className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded-md border border-red-200/50 ml-auto font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {company.flagCount} alerts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {myCompanies.filter(c => c.nextBoard).length === 0 && (
                <div className="p-6 text-center text-[13px] text-muted-foreground">No upcoming boards</div>
              )}
            </div>
          </div>

          {/* Recent Alerts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[15px] font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Recent Alerts
              </h2>
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{myFlags.length} active</span>
            </div>
            <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
              {otherAlerts.slice(0, 4).map(flag => (
                <button
                  key={flag.id}
                  onClick={() => navigate(`/company/${flag.companyId}`)}
                  className="w-full p-3 flex items-start gap-2.5 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm mt-0.5">{getFlagIcon(flag.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[12px] font-medium">{flag.companyName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        flag.urgency === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' : 'bg-gray-50 text-gray-500 border border-gray-200/50'
                      }`}>{flag.type}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground truncate">{flag.headline}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* My Companies Quick Cards — with clearer scroll hint */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold">My Companies</h2>
          <button onClick={() => navigate('/portfolio')} className="text-[12px] text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
          {myCompanies.sort((a, b) => {
            const actionOrder: Record<string, number> = { 'Lean In': 0, 'Lean In / Anticipate': 1, 'Watch': 2, 'De-prioritise': 3 };
            return (actionOrder[a.action] || 0) - (actionOrder[b.action] || 0);
          }).map(company => {
            const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(company.lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
            const isStale = daysSinceUpdate > 30;
            return (
              <button
                key={company.id}
                onClick={() => navigate(`/company/${company.id}`)}
                className={`bg-card border rounded-xl p-4 min-w-[220px] hover:shadow-md transition-all text-left group ${
                  isStale ? 'border-amber-200 bg-amber-50/20' : 'border-border hover:border-primary/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-medium shadow-sm" style={{ background: company.logoColor }}>
                    {company.name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium group-hover:text-primary transition-colors">{company.name}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: getHealthColor(company.health), background: getHealthColor(company.health) + '30' }} />
                      <span className="text-[11px] text-muted-foreground">{company.health}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-[11px] text-muted-foreground">MRR</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold">{formatCurrency(company.mrr)}</span>
                    <span className={`text-[11px] flex items-center font-medium ${company.arrGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {company.arrGrowth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(company.arrGrowth)}%
                    </span>
                  </div>
                </div>
                <div className="h-[30px]">
                  <SparklineChart data={company.mrrTrend} color={getHealthColor(company.health)} />
                </div>
                <p className={`text-[11px] mt-2 ${isStale ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                  {isStale ? `Stale — ${daysSinceUpdate}d ago` : `Updated: ${new Date(company.lastUpdate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
