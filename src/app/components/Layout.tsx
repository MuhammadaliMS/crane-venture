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
        <div className="flex h-screen overflow-hidden bg-background">

          {/* ─── Sidebar ─── light, warm, editorial ─── */}
          <aside
            aria-label="Primary"
            className={`${collapsed ? 'w-[60px]' : 'w-60'} bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-[width] duration-[280ms] shrink-0 select-none`}
            style={{ transitionTimingFunction: 'var(--ease-out-expo)' }}
          >
            {/* Logo — wordmark stays as-is on warm cream */}
            <div className="h-14 flex items-center px-4 gap-2.5 shrink-0">
              <img
                src="/crane-logo.png"
                alt="Crane Venture Partners"
                className={`object-contain ${collapsed ? 'h-7 w-7' : 'h-7'}`}
              />
            </div>

            {/* Milestone toggle — quiet, ink hairline */}
            {!collapsed && (
              <div className="mx-3 mb-2">
                <button
                  onClick={() => setMilestone(isM1 ? 'full' : 'm1')}
                  aria-label={isM1 ? 'Switch to Full MVP' : 'Switch to Milestone 1'}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                    isM1
                      ? 'bg-foreground/[0.05] text-foreground border border-foreground/10'
                      : 'text-muted-foreground border border-transparent hover:bg-foreground/[0.04]'
                  }`}
                >
                  {isM1 ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  <span>{isM1 ? 'Milestone 1' : 'Full MVP'}</span>
                  {isM1 && <span className="ml-auto font-display-italic text-[12px] text-muted-foreground">v1</span>}
                </button>
              </div>
            )}
            {collapsed && (
              <div className="mx-2 mb-1">
                <button
                  onClick={() => setMilestone(isM1 ? 'full' : 'm1')}
                  aria-label={isM1 ? 'Switch to Full MVP' : 'Switch to Milestone 1'}
                  className={`w-full flex items-center justify-center p-2 rounded-md transition-colors ${
                    isM1 ? 'bg-foreground/[0.06] text-foreground' : 'text-muted-foreground hover:bg-foreground/[0.04]'
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
                  {/* Section label — sentence case, tiny, quiet */}
                  {!collapsed && section.label && (
                    <p className="text-[11px] font-medium text-muted-foreground/70 px-4 pt-4 pb-1.5">
                      {section.label}
                    </p>
                  )}

                  {/* Collapsed divider */}
                  {collapsed && sIdx > 0 && section.label && (
                    <div className="mx-3 my-2 border-t border-sidebar-border" />
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
                        aria-current={active ? 'page' : undefined}
                        className={`w-full flex items-center gap-3 px-4 py-1.5 text-[13px] transition-colors relative group
                          ${comingSoon
                            ? 'text-muted-foreground/60 cursor-default'
                            : active
                            ? 'text-foreground bg-foreground/[0.06] font-medium'
                            : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground'
                          }`}
                        title={collapsed ? item.label : undefined}
                      >
                        {/* Active rule — thin ink mark on the left */}
                        {active && !collapsed && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-primary rounded-r" />
                        )}
                        <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.6} />
                        {!collapsed && (
                          <>
                            <span className="truncate">{item.label}</span>
                            {comingSoon && (
                              <span className="ml-auto font-display-italic text-[12px] text-muted-foreground/70">
                                soon
                              </span>
                            )}
                            {!comingSoon && badge > 0 && (
                              <span className="ml-auto text-[11px] font-mono-num text-foreground/70 min-w-[18px] text-right">
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

              {/* ─── Active deals quick list ─── header + items share the same indent so the box lines up cleanly */}
              {!collapsed && (
                <div className="mt-4 px-2.5">
                  <p className="text-[11px] font-medium text-muted-foreground/70 mb-1.5 px-1.5">
                    My Companies
                  </p>
                  {myCompanies.map(c => {
                    const isActive = location.pathname === `/company/${c.id}`;
                    return (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/company/${c.id}`)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center gap-2.5 py-1 text-[13px] transition-colors rounded-md px-1.5 ${
                          isActive
                            ? 'bg-foreground/[0.06] text-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]'
                        }`}
                      >
                        <span className="text-muted-foreground/60 text-[11px] font-mono w-3 shrink-0" aria-hidden="true">{c.name[0]}</span>
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => navigate('/portfolio')}
                    className="text-[12px] text-muted-foreground/80 hover:text-foreground mt-1.5 px-1.5 transition-colors"
                  >
                    See all &rarr;
                  </button>
                </div>
              )}
            </nav>

            {/* ─── User + Sign out + Collapse toggle ─── */}
            <div className="border-t border-sidebar-border px-4 py-3">
              {/* User info */}
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[12px] shrink-0 font-medium"
                  aria-hidden="true"
                >
                  {currentUser.avatar}
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] truncate font-medium text-foreground">{currentUser.name}</p>
                    <p className="text-[11px] text-muted-foreground">{currentUser.role}</p>
                  </div>
                )}
              </div>

              {/* Sign out */}
              <button
                onClick={() => {
                  try { localStorage.removeItem('crane.signedIn'); } catch {}
                  navigate('/signin');
                }}
                aria-label="Sign out"
                className={`w-full flex items-center gap-2 text-muted-foreground hover:text-foreground py-1.5 px-2 rounded-md hover:bg-foreground/[0.04] transition-colors text-[12px] mb-1 ${collapsed ? 'justify-center' : ''}`}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                {!collapsed && <span>Sign out</span>}
              </button>

              {/* Collapse button */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground py-1.5 rounded-md hover:bg-foreground/[0.04] transition-colors text-[12px]"
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
          <main className="flex-1 min-w-0 overflow-y-auto bg-background" id="main">
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
