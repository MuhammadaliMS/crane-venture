import { useState, createContext, useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Building2, Grid3X3, FileText, ClipboardList, CalendarCheck,
  Search, Settings, TrendingUp, Globe, Sparkles, LogOut,
  PanelLeftClose, PanelLeft,
  Bell, SendHorizonal, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { currentUser, companies, type Fund } from './mock-data';
import { useWorkflow } from './WorkflowContext';

// ── Milestone context ─────────────────────────────────────────────────
export const MilestoneContext = createContext<{
  milestone: 'full' | 'm1';
  setMilestone: (m: 'full' | 'm1') => void;
}>({ milestone: 'full', setMilestone: () => {} });

export const useMilestone = () => useContext(MilestoneContext);

// ── Context ────────────────────────────────────────────────────────────
export const FundFilterContext = createContext<{
  fundFilter: Fund | 'all';
  setFundFilter: (f: Fund | 'all') => void;
}>({ fundFilter: 'all', setFundFilter: () => {} });

export const useFundFilter = () => useContext(FundFilterContext);

// Notification data — exposed so pages can consume if needed
export const NotificationContext = createContext<{
  urgentFlags: typeof flags;
  overdueTodos: typeof todos;
  notificationCount: number;
}>({ urgentFlags: [], overdueTodos: [], notificationCount: 0 });

export const useNotifications = () => useContext(NotificationContext);

// ── Nav definition ─────────────────────────────────────────────────────
// m1 = appears in milestone 1, full = only in full MVP
type NavItem = { path: string; label: string; icon: any; soon?: boolean; m1?: boolean };
type NavSection = { label: string; items: NavItem[]; m1?: boolean };

const navSections: NavSection[] = [
  {
    label: 'Workspace',
    m1: true,
    items: [
      // In M1: Command Center is the landing (no Intelligence Hub yet, no Action Matrix)
      { path: '/', label: 'Intelligence Hub', icon: Sparkles },
      { path: '/portfolio', label: 'Command Center', icon: Building2, m1: true },
      { path: '/matrix', label: 'Action Matrix', icon: Grid3X3 },
    ],
  },
  {
    label: 'Workflows',
    m1: true,
    items: [
      { path: '/review/quarterly', label: 'Quarterly Review', icon: CalendarCheck, m1: true },
      { path: '/founder-data', label: 'Founder Data', icon: SendHorizonal, m1: true },
    ],
  },
  {
    label: '',
    m1: true,
    items: [
      { path: '/settings', label: 'Settings', icon: Settings, m1: true },
    ],
  },
];

// ── Layout ─────────────────────────────────────────────────────────────
export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [fundFilter, setFundFilter] = useState<Fund | 'all'>('all');
  const [milestone, setMilestone] = useState<'full' | 'm1'>('full');
  const location = useLocation();
  const navigate = useNavigate();
  const { flags, todos } = useWorkflow();

  const isM1 = milestone === 'm1';

  const myCompanies = companies
    .filter(c => c.owners.includes(currentUser.name) && c.lifecycle === 'Active — Core')
    .slice(0, 5);

  const urgentFlags = flags.filter(f => f.urgency === 'high');
  const overdueTodos = todos.filter(t => !t.completed && new Date(t.dueDate) < new Date());
  const notificationCount = urgentFlags.length + overdueTodos.length;

  // Filter nav for milestone
  const filteredNavSections = isM1
    ? navSections
        .map(section => ({
          ...section,
          items: section.items.filter(item => item.m1),
        }))
        .filter(section => section.items.length > 0 || section.m1)
    : navSections;

  return (
    <MilestoneContext.Provider value={{ milestone, setMilestone }}>
    <FundFilterContext.Provider value={{ fundFilter, setFundFilter }}>
      <NotificationContext.Provider value={{ urgentFlags, overdueTodos, notificationCount }}>
        <div className="flex h-screen overflow-hidden bg-[#f8fafc]" style={{ fontFamily: "'Inter', sans-serif" }}>

          {/* ─── Sidebar ─── always dark ─── */}
          <aside
            className={`${collapsed ? 'w-[60px]' : 'w-60'} bg-[#0f0f12] flex flex-col transition-all duration-[280ms] shrink-0 select-none`}
          >
            {/* Logo */}
            <div className="h-14 flex items-center px-4 gap-2.5 shrink-0">
              {/* Crane Venture wordmark — invert to show white on dark sidebar */}
              <img
                src="/crane-logo.png"
                alt="Crane Venture Partners"
                className={`object-contain ${collapsed ? 'h-7 w-7' : 'h-7'}`}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            {/* Milestone toggle */}
            {!collapsed && (
              <div className="mx-3 mb-1">
                <button
                  onClick={() => setMilestone(isM1 ? 'full' : 'm1')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all ${
                    isM1
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/[0.04] text-slate-500 border border-white/[0.06] hover:bg-white/[0.07]'
                  }`}
                >
                  {isM1 ? <ToggleRight className="w-4 h-4 text-indigo-400" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{isM1 ? 'Milestone 1' : 'Full MVP'}</span>
                  {isM1 && <span className="ml-auto text-[9px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full">V1</span>}
                </button>
              </div>
            )}
            {collapsed && (
              <div className="mx-2 mb-1">
                <button
                  onClick={() => setMilestone(isM1 ? 'full' : 'm1')}
                  className={`w-full flex items-center justify-center p-2 rounded-lg transition-all ${
                    isM1 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/[0.04] text-slate-500 hover:bg-white/[0.07]'
                  }`}
                  title={isM1 ? 'Milestone 1 — click for Full MVP' : 'Full MVP — click for Milestone 1'}
                >
                  {isM1 ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-2 overflow-y-auto scrollbar-none">
              {filteredNavSections.map((section, sIdx) => (
                <div key={sIdx}>
                  {/* Section label */}
                  {!collapsed && section.label && (
                    <p className="text-[10px] uppercase tracking-widest font-medium text-slate-500 px-4 pt-4 pb-2">
                      {section.label}
                      {section.label === 'Research' && (
                        <span className="ml-1.5 text-[9px] normal-case tracking-normal text-slate-600">
                          (Phase 2)
                        </span>
                      )}
                    </p>
                  )}

                  {/* Collapsed divider */}
                  {collapsed && sIdx > 0 && section.label && (
                    <div className="mx-3 my-2 border-t border-white/[0.06]" />
                  )}

                  {section.items.map(item => {
                    const active = location.pathname === item.path;
                    const comingSoon = 'soon' in item && item.soon;
                    const badge =
                      item.path === '/board-prep'
                        ? myCompanies.filter(c => c.nextBoard).length
                        : item.path === '/matrix'
                        ? urgentFlags.length
                        : 0;

                    return (
                      <button
                        key={item.path}
                        onClick={() => { if (!comingSoon) navigate(item.path); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-all relative group
                          ${comingSoon
                            ? 'text-slate-600 cursor-default'
                            : active
                            ? 'text-white bg-white/[0.08] border-l-2 border-indigo-400 pl-[14px]'
                            : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 border-l-2 border-transparent'
                          }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {comingSoon && (
                              <span className="ml-auto text-[9px] text-slate-600 font-medium uppercase tracking-wider">
                                Soon
                              </span>
                            )}
                            {!comingSoon && badge > 0 && (
                              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-medium">
                                {badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* ─── My Companies quick list ─── */}
              {!collapsed && (
                <div className="mt-4 px-4">
                  <p className="text-[10px] uppercase tracking-widest font-medium text-slate-500 mb-2">
                    My Companies
                  </p>
                  {myCompanies.map(c => {
                    const isActive = location.pathname === `/company/${c.id}`;
                    return (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/company/${c.id}`)}
                        className={`w-full flex items-center gap-2.5 py-1.5 text-[13px] transition-colors rounded-md px-1.5 -mx-1.5 ${
                          isActive
                            ? 'bg-white/[0.08] text-white font-medium'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: c.logoColor }}
                        />
                        <span className="truncate">{c.name}</span>
                        {c.flagCount > 0 && (
                          <span className="ml-auto text-[10px] text-red-400 font-medium">
                            {c.flagCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="text-[12px] text-slate-500 hover:text-slate-300 mt-1.5 px-1.5 transition-colors"
                  >
                    See all &rarr;
                  </button>
                </div>
              )}
            </nav>

            {/* ─── User + Sign out + Collapse toggle ─── */}
            <div className="border-t border-white/[0.06] px-4 py-3">
              {/* User info */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[13px] shrink-0 font-medium">
                  {currentUser.avatar}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] truncate font-medium text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400">{currentUser.role}</p>
                  </div>
                )}
              </div>

              {/* Sign out */}
              <button
                onClick={() => {
                  try { localStorage.removeItem('crane.signedIn'); } catch {}
                  navigate('/signin');
                }}
                className={`w-full flex items-center gap-2 text-slate-400 hover:text-white py-1.5 px-2 rounded-md hover:bg-white/[0.06] transition-colors text-[12px] mb-1 ${collapsed ? 'justify-center' : ''}`}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                {!collapsed && <span>Sign out</span>}
              </button>

              {/* Collapse button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 py-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-[12px]"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <>
                    <PanelLeftClose className="w-3.5 h-3.5" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* ─── Main content area ─── */}
          <main className="flex-1 min-w-0 overflow-y-auto bg-[#f8fafc]">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </NotificationContext.Provider>
    </FundFilterContext.Provider>
    </MilestoneContext.Provider>
  );
}
