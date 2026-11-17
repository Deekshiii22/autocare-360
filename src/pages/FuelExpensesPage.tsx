import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Edit3,
  Fuel,
  IndianRupee,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { ExpenseRecord, ExpenseType } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getTodayISO,
} from '../utils/formatters';

const EXPENSE_TYPES: ExpenseType[] = [
  'Fuel',
  'Maintenance',
  'Insurance',
  'Accessories',
  'Toll & Parking',
];

interface ExpenseFormState {
  vehicleId: string;
  expenseType: ExpenseType;
  amount: string;
  date: string;
  fuelQuantity: string;
  odometer: string;
  description: string;
}

export function FuelExpensesPage() {
  const {
    vehicles,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    theme,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseRecord | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ExpenseFormState>({
    vehicleId: vehicles[0]?.id ?? '',
    expenseType: 'Fuel',
    amount: '',
    date: getTodayISO(),
    fuelQuantity: '',
    odometer: vehicles[0] ? String(vehicles[0].odometer) : '',
    description: '',
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openAddModal();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const stats = useMemo(() => {
    const monthlyTotal = expenses
      .filter((e) => e.date.startsWith(currentMonthKey))
      .reduce((sum, e) => sum + e.amount, 0);

    const fuelEntries = expenses.filter((e) => e.expenseType === 'Fuel');
    const totalFuel = fuelEntries.reduce((sum, e) => sum + e.amount, 0);
    const totalLitres = fuelEntries.reduce(
      (sum, e) => sum + (e.fuelQuantity ?? 0),
      0
    );
    const avgFuelPerLitre = totalLitres > 0 ? totalFuel / totalLitres : 0;

    const totalMaintenance = expenses
      .filter((e) => e.expenseType === 'Maintenance')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      monthlyTotal,
      totalFuel,
      totalMaintenance,
      avgFuelPerLitre,
      totalLitres,
    };
  }, [expenses, currentMonthKey]);

  const chartData = useMemo(() => {
    const now = new Date();
    const months: Array<{
      key: string;
      month: string;
      Total: number;
      Fuel: number;
      Maintenance: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(d);
      months.push({ key, month: label, Total: 0, Fuel: 0, Maintenance: 0 });
    }

    expenses.forEach((exp) => {
      const bucket = months.find((m) => exp.date.startsWith(m.key));
      if (!bucket) return;
      bucket.Total += exp.amount;
      if (exp.expenseType === 'Fuel') bucket.Fuel += exp.amount;
      if (exp.expenseType === 'Maintenance') bucket.Maintenance += exp.amount;
    });

    return months;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...expenses]
      .filter((e) => {
        if (vehicleFilter !== 'all' && e.vehicleId !== vehicleFilter) return false;
        if (typeFilter !== 'all' && e.expenseType !== typeFilter) return false;
        if (q) {
          const vehicle = vehicles.find((v) => v.id === e.vehicleId);
          const hay = `${e.description} ${e.expenseType} ${
            vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.registrationNumber}` : ''
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, vehicles, searchQuery, vehicleFilter, typeFilter]);

  function openAddModal() {
    const first = vehicles[0];
    setEditingExpense(null);
    setForm({
      vehicleId: first?.id ?? '',
      expenseType: 'Fuel',
      amount: '',
      date: getTodayISO(),
      fuelQuantity: '',
      odometer: first ? String(first.odometer) : '',
      description: '',
    });
    setErrors({});
    setFormOpen(true);
  }

  const openEditModal = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setForm({
      vehicleId: exp.vehicleId,
      expenseType: exp.expenseType,
      amount: String(exp.amount),
      date: exp.date,
      fuelQuantity: exp.fuelQuantity ? String(exp.fuelQuantity) : '',
      odometer: String(exp.odometer),
      description: exp.description,
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.vehicleId) next.vehicleId = 'Select a vehicle.';
    const amt = Number(form.amount);
    if (form.amount.trim() === '' || Number.isNaN(amt) || amt <= 0) {
      next.amount = 'Enter a valid amount greater than 0.';
    }
    if (!form.date) next.date = 'Select a date.';
    if (form.expenseType === 'Fuel') {
      const qty = Number(form.fuelQuantity);
      if (form.fuelQuantity.trim() === '' || Number.isNaN(qty) || qty <= 0) {
        next.fuelQuantity = 'Enter fuel quantity in litres.';
      }
    }
    const odo = Number(form.odometer);
    if (form.odometer.trim() === '' || Number.isNaN(odo) || odo < 0) {
      next.odometer = 'Enter a valid odometer reading.';
    }
    if (form.description.trim().length < 3) {
      next.description = 'Enter a short description.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Omit<ExpenseRecord, 'id'> = {
      vehicleId: form.vehicleId,
      expenseType: form.expenseType,
      amount: Number(form.amount),
      date: form.date,
      fuelQuantity:
        form.expenseType === 'Fuel' && form.fuelQuantity
          ? Number(form.fuelQuantity)
          : undefined,
      odometer: Number(form.odometer),
      description: form.description.trim(),
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }
    setFormOpen(false);
  };

  const getVehicleName = (vehicleId: string) => {
    const v = vehicles.find((item) => item.id === vehicleId);
    return v ? `${v.brand} ${v.model}` : 'Vehicle';
  };

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Monthly Expenditure
            </span>
            <IndianRupee className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {formatCurrency(stats.monthlyTotal)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Current calendar month total
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Fuel Spend
            </span>
            <Fuel className="h-4 w-4 text-[#2563EB] dark:text-blue-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {formatCurrency(stats.totalFuel)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.totalLitres.toFixed(1)} L logged across fleet
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Maintenance Spend
            </span>
            <Wrench className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {formatCurrency(stats.totalMaintenance)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Workshop servicing & parts
          </p>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Average Fuel Cost
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-[#101828] dark:text-white tabular-nums">
            {stats.avgFuelPerLitre > 0 ? `₹${stats.avgFuelPerLitre.toFixed(2)}/L` : '—'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Weighted across petrol & diesel logs
          </p>
        </div>
      </section>

      {/* Monthly Spending Chart */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
              Monthly Spending Trend
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total vehicle expenditure vs fuel expenditure over the past 6 months
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            disabled={vehicles.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="Total"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#totalGrad)"
              />
              <Area
                type="monotone"
                dataKey="Fuel"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Filters + Expense History Table */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fuel stations, descriptions..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              aria-label="Filter by vehicle"
              className="w-full h-10 px-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by expense type"
              className="w-full h-10 px-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            >
              <option value="all">All Expense Categories</option>
              {EXPENSE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 bg-[#F5F7FA]/60 dark:bg-slate-800/40">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Qty / Odometer</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-5 text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-3 font-medium text-[#101828] dark:text-white whitespace-nowrap">
                      {getVehicleName(exp.vehicleId)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {exp.expenseType}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[260px] truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {exp.fuelQuantity ? `${exp.fuelQuantity} L · ` : ''}
                      {formatNumber(exp.odometer)} km
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-[#101828] dark:text-white tabular-nums whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-[#101828] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label="Edit expense"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingExpense(exp)}
                          className="p-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                          aria-label="Delete expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Fuel className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="font-display text-base font-semibold text-[#101828] dark:text-white">
              No matching expenses
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Log a fuel refill or maintenance bill to track your spending.
            </p>
          </div>
        )}
      </section>

      {/* Add / Edit Expense Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        subtitle="Record fuel, maintenance, insurance, or trip expenditure"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle *
              </label>
              <select
                value={form.vehicleId}
                onChange={(e) => {
                  const selected = vehicles.find((v) => v.id === e.target.value);
                  setForm({
                    ...form,
                    vehicleId: e.target.value,
                    odometer: selected ? String(selected.odometer) : form.odometer,
                  });
                }}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.registrationNumber})
                  </option>
                ))}
              </select>
              {errors.vehicleId && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.vehicleId}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Expense Type *
              </label>
              <select
                value={form.expenseType}
                onChange={(e) =>
                  setForm({ ...form, expenseType: e.target.value as ExpenseType })
                }
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              >
                {EXPENSE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Amount (INR) *
              </label>
              <input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 3850"
                className="w-full h-10 px-3 text-sm tabular-nums rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.amount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.date}
                </p>
              )}
            </div>

            {form.expenseType === 'Fuel' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Fuel Quantity (Litres) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  value={form.fuelQuantity}
                  onChange={(e) => setForm({ ...form, fuelQuantity: e.target.value })}
                  placeholder="e.g. 38.5"
                  className="w-full h-10 px-3 text-sm tabular-nums rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.fuelQuantity && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.fuelQuantity}
                  </p>
                )}
              </div>
            )}

            <div className={form.expenseType === 'Fuel' ? '' : 'sm:col-span-2'}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Odometer Reading (km) *
              </label>
              <input
                type="number"
                min={0}
                value={form.odometer}
                onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                placeholder="e.g. 28500"
                className="w-full h-10 px-3 text-sm tabular-nums rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.odometer && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.odometer}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description *
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Shell Unleaded full tank refill"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white"
            >
              {editingExpense ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={() => {
          if (deletingExpense) deleteExpense(deletingExpense.id);
        }}
        title="Delete Expense"
        message={
          deletingExpense
            ? `Delete "${deletingExpense.description}" (${formatCurrency(
                deletingExpense.amount
              )})?`
            : ''
        }
      />
    </div>
  );
}
