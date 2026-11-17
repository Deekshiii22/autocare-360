import React, { useMemo, useRef, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Car,
  FileText,
  Fuel,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Wrench,
  CalendarClock,
  X,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import {
  computeDocumentStatus,
  computeReminderStatus,
  formatDate,
  formatRelativeDays,
} from '../utils/formatters';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/garage', label: 'My Garage', icon: Car },
  { to: '/services', label: 'Service History', icon: Wrench },
  { to: '/expenses', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/reminders', label: 'Reminders', icon: CalendarClock },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/garage': 'My Garage',
  '/services': 'Service History',
  '/expenses': 'Fuel & Expenses',
  '/documents': 'Document Manager',
  '/reminders': 'Maintenance Reminders',
  '/settings': 'Settings',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    user,
    logout,
    vehicles,
    services,
    documents,
    reminders,
    globalSearch,
    setGlobalSearch,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setSearchFocused(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alerts = useMemo(() => {
    const docAlerts = documents
      .filter((d) => {
        const st = computeDocumentStatus(d.expiryDate);
        return st === 'Expired' || st === 'Expiring Soon';
      })
      .map((d) => {
        const vehicle = vehicles.find((v) => v.id === d.vehicleId);
        const status = computeDocumentStatus(d.expiryDate);
        return {
          id: d.id,
          type: 'document' as const,
          title: `${d.documentType} ${status}`,
          subtitle: `${vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Owner'} · Expires ${formatDate(d.expiryDate)}`,
          urgent: status === 'Expired',
          to: '/documents',
        };
      });

    const remAlerts = reminders
      .filter((r) => !r.completed)
      .map((r) => {
        const vehicle = vehicles.find((v) => v.id === r.vehicleId);
        const status = computeReminderStatus(r.dueDate, r.completed);
        return {
          id: r.id,
          type: 'reminder' as const,
          title: r.title,
          subtitle: `${vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle'} · ${formatRelativeDays(r.dueDate)}`,
          urgent: status === 'Overdue',
          to: '/reminders',
        };
      })
      .slice(0, 4);

    return [...docAlerts, ...remAlerts];
  }, [documents, reminders, vehicles]);

  const searchResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{ id: string; title: string; meta: string; to: string }> = [];

    vehicles.forEach((v) => {
      if (
        `${v.brand} ${v.model} ${v.registrationNumber} ${v.year}`.toLowerCase().includes(q)
      ) {
        results.push({
          id: v.id,
          title: `${v.brand} ${v.model}`,
          meta: `Vehicle · ${v.registrationNumber}`,
          to: '/garage',
        });
      }
    });

    services.forEach((s) => {
      if (
        `${s.serviceType} ${s.serviceCentre} ${s.description}`.toLowerCase().includes(q)
      ) {
        results.push({
          id: s.id,
          title: s.serviceType,
          meta: `Service · ${formatDate(s.date)}`,
          to: '/services',
        });
      }
    });

    documents.forEach((d) => {
      if (`${d.documentType} ${d.documentNumber} ${d.issuer}`.toLowerCase().includes(q)) {
        results.push({
          id: d.id,
          title: d.documentType,
          meta: `Document · ${d.documentNumber}`,
          to: '/documents',
        });
      }
    });

    reminders.forEach((r) => {
      if (`${r.title} ${r.category}`.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          title: r.title,
          meta: `Reminder · ${formatDate(r.dueDate)}`,
          to: '/reminders',
        });
      }
    });

    return results.slice(0, 6);
  }, [globalSearch, vehicles, services, documents, reminders]);

  const firstName = user.name.split(' ')[0] || 'Driver';
  const currentTitle =
    location.pathname === '/'
      ? `Welcome back, ${firstName}`
      : ROUTE_TITLES[location.pathname] ?? 'AutoCare 360';

  const SidebarContent = (
    <div className="flex h-full flex-col bg-[#101828] text-slate-200 border-r border-slate-800">
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
        <BrandLogo inverted />
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2563EB] text-white'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-slate-800/80">
        <p className="text-[11px] text-slate-400 mb-3">
          Demonstration Workspace · Sample Local Data
        </p>
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="h-9 w-9 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] dark:bg-[#0B1120] text-[#101828] dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{SidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-semibold text-[#101828] dark:text-white truncate">
                {currentTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Global Search */}
            <div ref={searchRef} className="relative hidden md:block w-64 lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search vehicles, services, docs..."
                aria-label="Global search"
                className="w-full h-9 pl-9 pr-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {searchFocused && globalSearch.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden z-40">
                  {searchResults.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {searchResults.map((item) => (
                        <li key={`${item.to}-${item.id}`}>
                          <button
                            type="button"
                            onClick={() => {
                              navigate(item.to);
                              setSearchFocused(false);
                              setGlobalSearch('');
                            }}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#101828] dark:text-white truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {item.meta}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      No matching vehicles, services, or documents found.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label={`Notifications (${alerts.length} active alerts)`}
              >
                <Bell className="h-4 w-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                    {alerts.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-40">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-semibold text-[#101828] dark:text-white">
                      Active Alerts
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {alerts.length} items
                    </span>
                  </div>
                  {alerts.length > 0 ? (
                    <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {alerts.map((alert) => (
                        <li key={alert.id}>
                          <button
                            type="button"
                            onClick={() => {
                              navigate(alert.to);
                              setNotificationsOpen(false);
                            }}
                            className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                          >
                            <AlertTriangle
                              className={`h-4 w-4 mt-0.5 shrink-0 ${
                                alert.urgent
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#101828] dark:text-white truncate">
                                {alert.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {alert.subtitle}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      All documents and reminders are up to date.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Button */}
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open profile settings"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <span className="hidden sm:inline text-sm font-medium text-[#101828] dark:text-slate-200 whitespace-nowrap">
                {firstName}
              </span>
            </button>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (5 primary items, <= 15% height) */}
      <nav
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-5"
        aria-label="Mobile bottom navigation"
      >
        {[
          { to: '/', label: 'Home', icon: LayoutDashboard },
          { to: '/garage', label: 'Garage', icon: Car },
          { to: '/services', label: 'Service', icon: Wrench },
          { to: '/expenses', label: 'Expenses', icon: Fuel },
          { to: '/reminders', label: 'Alerts', icon: CalendarClock },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-[#2563EB] dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
