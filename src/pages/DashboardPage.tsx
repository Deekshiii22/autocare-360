import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  Car,
  Check,
  FileWarning,
  Fuel,
  Plus,
  Wrench,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { VehicleImage } from '../components/VehicleImage';
import {
  computeDocumentStatus,
  computeReminderStatus,
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeDays,
} from '../utils/formatters';

export function DashboardPage() {
  const {
    vehicles,
    services,
    expenses,
    documents,
    reminders,
    toggleReminderComplete,
    theme,
  } = useApp();
  const navigate = useNavigate();

  const [activeVehicleIdx, setActiveVehicleIdx] = useState(0);

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthlyExpensesTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(currentMonthKey))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonthKey]);

  const activeReminders = useMemo(() => {
    return reminders
      .filter((r) => !r.completed)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [reminders]);

  const expiringDocs = useMemo(() => {
    return documents.filter((d) => {
      const status = computeDocumentStatus(d.expiryDate);
      return status === 'Expired' || status === 'Expiring Soon';
    });
  }, [documents]);

  const monthlyChartData = useMemo(() => {
    const now = new Date();
    const buckets: Array<{
      key: string;
      month: string;
      Fuel: number;
      Maintenance: number;
      Other: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(d);
      buckets.push({ key, month: label, Fuel: 0, Maintenance: 0, Other: 0 });
    }

    expenses.forEach((exp) => {
      const bucket = buckets.find((b) => exp.date.startsWith(b.key));
      if (!bucket) return;
      if (exp.expenseType === 'Fuel') bucket.Fuel += exp.amount;
      else if (exp.expenseType === 'Maintenance') bucket.Maintenance += exp.amount;
      else bucket.Other += exp.amount;
    });

    return buckets;
  }, [expenses]);

  const latestServices = useMemo(() => {
    return [...services].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [services]);

  const recentExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [expenses]);

  const featuredVehicle = vehicles[activeVehicleIdx] ?? vehicles[0];

  const getVehicleName = (vehicleId: string) => {
    const v = vehicles.find((item) => item.id === vehicleId);
    return v ? `${v.brand} ${v.model}` : 'Owner';
  };

  return (
    <div className="space-y-6">
      {/* Top 4 Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Link
          to="/garage"
          className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              My Vehicles
            </span>
            <Car className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {vehicles.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {formatNumber(vehicles.reduce((s, v) => s + v.odometer, 0))} km combined mileage
          </p>
        </Link>

        <Link
          to="/expenses"
          className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Monthly Expenses
            </span>
            <Fuel className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {formatCurrency(monthlyExpensesTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current month fuel, service & tolls
          </p>
        </Link>

        <Link
          to="/reminders"
          className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Upcoming Services
            </span>
            <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {activeReminders.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {
              activeReminders.filter(
                (r) => computeReminderStatus(r.dueDate, r.completed) === 'Overdue'
              ).length
            }{' '}
            overdue attention needed
          </p>
        </Link>

        <Link
          to="/documents"
          className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Documents Expiring
            </span>
            <FileWarning className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {expiringDocs.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Expired or due within 30 days
          </p>
        </Link>
      </section>

      {/* Main Section: Vehicle Overview + Monthly Expense Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Vehicle Overview Card */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
              Vehicle Overview
            </h2>
            {vehicles.length > 1 && (
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F5F7FA] dark:bg-slate-800">
                {vehicles.map((v, idx) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setActiveVehicleIdx(idx)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      activeVehicleIdx === idx
                        ? 'bg-white dark:bg-slate-900 text-[#101828] dark:text-white shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-[#101828] dark:hover:text-white'
                    }`}
                  >
                    {v.model}
                  </button>
                ))}
              </div>
            )}
          </div>

          {featuredVehicle ? (
            <div className="flex-1 flex flex-col">
              <div className="aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <VehicleImage
                  src={featuredVehicle.imageUrl}
                  alt={`${featuredVehicle.brand} ${featuredVehicle.model}`}
                  className="h-full w-full"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-[#101828] dark:text-white">
                      {featuredVehicle.brand} {featuredVehicle.model}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                      {featuredVehicle.registrationNumber}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {featuredVehicle.year} · {featuredVehicle.fuelType}
                    {featuredVehicle.variant ? ` · ${featuredVehicle.variant}` : ''}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Current Odometer
                    </p>
                    <p className="mt-0.5 font-mono text-base font-semibold text-[#101828] dark:text-white tabular-nums">
                      {formatNumber(featuredVehicle.odometer)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Last Serviced
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#101828] dark:text-white tabular-nums">
                      {featuredVehicle.lastServicedDate
                        ? formatDate(featuredVehicle.lastServicedDate)
                        : 'Not logged'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate(`/garage?view=${featuredVehicle.id}`)}
                    className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg bg-[#101828] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/garage')}
                    className="h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    All Cars
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
              <Car className="h-10 w-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-[#101828] dark:text-white">
                No vehicles in your garage yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                Add your first car to start tracking mileage and servicing.
              </p>
              <button
                type="button"
                onClick={() => navigate('/garage')}
                className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700"
              >
                Add Vehicle
              </button>
            </div>
          )}
        </div>

        {/* Monthly Expense Chart */}
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
                Monthly Expense Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                6-month spending across Fuel, Maintenance, and Insurance/Other
              </p>
            </div>
            <Link
              to="/expenses"
              className="text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              Open Expense Ledger
            </Link>
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-600 dark:text-slate-300 mb-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#2563EB]" />
              Fuel
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-[#101828] dark:bg-slate-400" />
              Maintenance
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-amber-500" />
              Insurance & Other
            </span>
          </div>

          <div className="flex-1 min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={theme === 'dark' ? '#1E293B' : '#E2E8F0'}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                  tick={{ fill: theme === 'dark' ? '#94A3B8' : '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                    borderColor: theme === 'dark' ? '#1E293B' : '#E2E8F0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Fuel" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
                <Bar
                  dataKey="Maintenance"
                  stackId="a"
                  fill={theme === 'dark' ? '#94A3B8' : '#101828'}
                />
                <Bar dataKey="Other" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Secondary Row: Recent Service Activity + Upcoming Document Expiry */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
              Recent Service Activity
            </h2>
            <Link
              to="/services"
              className="text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              View All Services
            </Link>
          </div>

          {latestServices.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {latestServices.map((srv) => (
                <li
                  key={srv.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F7FA] dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#101828] dark:text-white truncate">
                        {srv.serviceType}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {getVehicleName(srv.vehicleId)} · {srv.serviceCentre}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-sm font-semibold text-[#101828] dark:text-white tabular-nums">
                      {formatCurrency(srv.amount)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {formatDate(srv.date)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No service records logged yet.
            </div>
          )}
        </div>

        {/* Upcoming Document Expiry */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
              Document Expiry Watch
            </h2>
            <Link
              to="/documents"
              className="text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              Document Wallet
            </Link>
          </div>

          {expiringDocs.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {expiringDocs.map((doc) => {
                const status = computeDocumentStatus(doc.expiryDate);
                const isExpired = status === 'Expired';
                return (
                  <li
                    key={doc.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#101828] dark:text-white truncate">
                        {doc.documentType}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {getVehicleName(doc.vehicleId)} · {doc.documentNumber}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          isExpired
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {status}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                        {formatDate(doc.expiryDate)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              All vehicle documents are valid for more than 30 days.
            </div>
          )}
        </div>
      </section>

      {/* Bottom Section: Upcoming Reminders + Recent Transactions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
              Upcoming Reminders
            </h2>
            <Link
              to="/reminders"
              className="text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              Manage All
            </Link>
          </div>

          {activeReminders.length > 0 ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeReminders.slice(0, 4).map((rem) => {
                const status = computeReminderStatus(rem.dueDate, rem.completed);
                const isOverdue = status === 'Overdue';
                return (
                  <li
                    key={rem.id}
                    className="px-5 py-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleReminderComplete(rem.id)}
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 dark:border-slate-600 text-transparent hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                        aria-label={`Mark "${rem.title}" completed`}
                        title="Mark completed"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#101828] dark:text-white truncate">
                          {rem.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {getVehicleName(rem.vehicleId)} · {rem.category}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap tabular-nums ${
                        isOverdue
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {formatRelativeDays(rem.dueDate)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No pending reminders.
            </div>
          )}
        </div>

        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
              Recent Transactions
            </h2>
            <button
              type="button"
              onClick={() => navigate('/expenses?new=1')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Expense</span>
            </button>
          </div>

          {recentExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-5">Description</th>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {recentExpenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-5 font-medium text-[#101828] dark:text-white max-w-[220px] truncate">
                        {exp.description}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {getVehicleName(exp.vehicleId)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {exp.expenseType}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>
                      <td className="py-2.5 px-5 text-right font-mono font-semibold text-[#101828] dark:text-white tabular-nums whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No transactions recorded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
