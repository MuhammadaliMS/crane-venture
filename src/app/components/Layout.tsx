import { useState, createContext, useContext } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Building2, Grid3X3, FileText, ClipboardList,
  Search, Bell, Settings, TrendingUp, Globe, ChevronLeft, ChevronRight,
  Command, AlertTriangle, X
} from 'lucide-react';
import { currentUser, companies, flags, todos, type Fund } from './mock-data';

export const FundFilterContext = createContext<{ fundFilter: Fund | 'all'; setFundFilter: (f: Fund | 'all') => void }>({ fundFilter: 'all', setFundFilter: () => {} });
export const useFundFilter = () => useContext(FundFilterContext);

const navSections = [
  {
    label: 'Workspace',
    items: [
      { path: '/', label: 'My Dashboard', icon: LayoutDashboard },
      { path: '/portfolio', label: 'Command Center', icon: Building2 },
      { path: '/matrix', label: 'Action Matrix', icon: Grid3X3 },
    ],
  },
  {
    label: 'Workflows',
    items: [
      { path: '/review', label: 'Portfolio Review', icon: ClipboardList },
      { path: '/board-prep', label: 'Board Prep', icon: FileText },
    ],
  },
  {
    label: 'Research',
    items: [
      { path: '/search', label: 'Search & Discovery', icon: Search },
      { path: '/intelligence', label: 'Intelligence Hub', icon: Globe },
    ],
  },
  {
    label: '',
    items: [
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const screenTitles: Record<string, string> = {
  '/': 'My Dashboard',
  '/portfolio': 'Portfolio Command Center',
  '/matrix': 'Action Matrix',
  '/review': 'Portfolio Review',
  '/board-prep': 'Board Prep',
  '/search': 'Search & Discovery',
  '/intelligence': 'Intelligence Hub',
  '/settings': 'Settings & Configuration',
};

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [fundFilter, setFundFilter] = useState<Fund | 'all'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const myCompanies = companies.filter(c => c.owner === currentUser.name && c.lifecycle === 'Active — Core').slice(0, 5);
  const isCompanyDetail = location.pathname.startsWith('/company/');
  const currentTitle = isCompanyDetail
    ? companies.find(c => c.id === location.pathname.split('/')[2])?.name || 'Company Detail'
    : screenTitles[location.pathname] || '';

  const urgentFlags = flags.filter(f => f.urgency === 'high');
  const overdueTodos = todos.filter(t => !t.completed && new Date(t.dueDate) < new Date());
  const notificationCount = urgentFlags.length + overdueTodos.length;

  // Breadcrumb for company detail
  const companyForDetail = isCompanyDetail
    ? companies.find(c => c.id === location.pathname.split('/')[2])
    : null;

  return (
    <FundFilterContext.Provider value={{ fundFilter, setFundFilter }}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside className={`${collapsed ? 'w-16' : 'w-60'} border-r border-border bg-sidebar flex flex-col transition-all duration-200 shrink-0`}>
          {/* Logo */}
          <div className="h-14 flex items-center px-4 border-b border-border gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && <span className="text-[15px] font-semibold tracking-tight">CRANE</span>}
          </div>

          {/* Nav — grouped by sections */}
          <nav className="flex-1 py-2 overflow-y-auto">
            {navSections.map((section, sIdx) => (
              <div key={sIdx}>
                {!collapsed && section.label && (
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest px-4 pt-4 pb-1">
                    {section.label}
                  </p>
                )}
                {collapsed && sIdx > 0 && section.label && (
                  <div className="mx-3 my-1 border-t border-border/50" />
                )}
                {section.items.map(item => {
                  const active = location.pathname === item.path;
                  // Show badge for items with pending work
                  const badge = item.path === '/board-prep'
                    ? myCompanies.filter(c => c.nextBoard).length
                    : item.path === '/matrix'
                    ? urgentFlags.length
                    : 0;

                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] transition-all relative ${
                        active
                          ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                      )}
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span>{item.label}</span>
                          {badge > 0 && (
                            <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
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

            {/* My Companies quick access */}
            {!collapsed && (
              <div className="mt-4 px-4">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-2">My Companies</p>
                {myCompanies.map(c => {
                  const isActive = location.pathname === `/company/${c.id}`;
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/company/${c.id}`)}
                      className={`w-full flex items-center gap-2 py-1.5 text-[13px] transition-colors rounded-md px-1.5 -mx-1.5 ${
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/30'
                      }`}
                    >
                      <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] shrink-0" style={{ background: c.logoColor }}>
                        {c.name[0]}
                      </div>
                      <span className="truncate">{c.name}</span>
                      {c.flagCount > 0 && (
                        <span className="ml-auto text-[10px] bg-red-100 text-red-600 rounded-full w-[18px] h-[18px] flex items-center justify-center font-medium">
                          {c.flagCount}
                        </span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => navigate('/portfolio')}
                  className="text-[12px] text-muted-foreground hover:text-foreground mt-1 px-1.5"
                >
                  See all →
                </button>
              </div>
            )}
          </nav>

          {/* User + Collapse */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[13px] shrink-0 font-medium">
                {currentUser.avatar}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate font-medium">{currentUser.name}</p>
                  <p className="text-[11px] text-muted-foreground">{currentUser.role}</p>
                </div>
              )}
              <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-14 border-b border-border flex items-center px-6 gap-4 shrink-0 bg-background">
            <div className="flex-1 min-w-0">
              {location.pathname === '/' ? (
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium">Good morning, {currentUser.name}</span>
                  <span className="text-[13px] text-muted-foreground">
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              ) : isCompanyDetail && companyForDetail ? (
                <div className="flex items-center gap-2 text-[14px]">
                  <button onClick={() => navigate('/portfolio')} className="text-muted-foreground hover:text-foreground transition-colors">
                    Portfolio
                  </button>
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px]" style={{ background: companyForDetail.logoColor }}>
                      {companyForDetail.name[0]}
                    </div>
                    <span className="font-medium">{companyForDetail.name}</span>
                  </div>
                </div>
              ) : (
                <h1 className="text-[15px] font-medium">{currentTitle}</h1>
              )}
            </div>
            {/* Global Fund Filter */}
            <select
              value={fundFilter}
              onChange={e => setFundFilter(e.target.value as Fund | 'all')}
              className="text-[12px] border border-border rounded-lg px-2.5 py-1.5 bg-card cursor-pointer hover:border-primary/30 transition-colors"
            >
              <option value="all">All Funds</option>
              <option value="Fund I">Fund I</option>
              <option value="Fund II">Fund II</option>
              <option value="Fund III">Fund III</option>
            </select>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-muted-foreground bg-muted rounded-lg hover:bg-accent transition-colors"
              aria-label="Search companies, documents, metrics"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="ml-2 text-[11px] bg-background px-1.5 py-0.5 rounded border border-border flex items-center gap-0.5">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>
            {/* Notification bell with dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
                aria-expanded={showNotifications}
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium" aria-label={`${notificationCount} notifications`}>
                    {notificationCount}
                  </span>
                )}
              </button>
              {/* Notification dropdown */}
              {showNotifications && (
                <div
                  className="absolute right-0 top-full mt-2 w-[360px] bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                  role="dialog"
                  aria-label="Notifications"
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowNotifications(false); }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                    <h3 className="text-[13px] font-medium">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
                    {urgentFlags.length > 0 && (
                      <div className="px-4 py-2 bg-red-50/50">
                        <p className="text-[10px] text-red-600 uppercase tracking-wider font-medium mb-1">Urgent Alerts</p>
                        {urgentFlags.slice(0, 3).map(flag => (
                          <button
                            key={flag.id}
                            onClick={() => { navigate(`/company/${flag.companyId}`); setShowNotifications(false); }}
                            className="w-full text-left py-2 flex items-start gap-2 hover:bg-red-50 rounded transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[12px]">{flag.headline}</p>
                              <p className="text-[11px] text-muted-foreground">{flag.companyName}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {overdueTodos.length > 0 && (
                      <div className="px-4 py-2">
                        <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium mb-1">Overdue Actions</p>
                        {overdueTodos.slice(0, 3).map(todo => (
                          <div key={todo.id} className="py-2 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="text-[12px]">{todo.title}</p>
                              <p className="text-[11px] text-muted-foreground">{todo.companyName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {urgentFlags.length === 0 && overdueTodos.length === 0 && (
                      <div className="p-6 text-center text-[13px] text-muted-foreground">
                        All clear — no urgent items
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-border">
                    <button
                      onClick={() => { navigate('/'); setShowNotifications(false); }}
                      className="text-[12px] text-primary hover:underline"
                    >
                      View all on dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[13px] font-medium">
              {currentUser.avatar}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </FundFilterContext.Provider>
  );
}
