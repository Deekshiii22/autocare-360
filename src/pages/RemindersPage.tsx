import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MaintenanceReminder, ReminderCategory } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  computeReminderStatus,
  formatDate,
  formatNumber,
  formatRelativeDays,
  getTodayISO,
} from '../utils/formatters';

const REMINDER_CATEGORIES: ReminderCategory[] = [
  'General servicing',
  'Engine oil change',
  'Insurance renewal',
  'PUC renewal',
  'Tyre inspection',
  'Battery replacement',
];

type TabKey = 'all' | 'upcoming' | 'overdue' | 'completed';

interface ReminderFormState {
  vehicleId: string;
  category: ReminderCategory;
  title: string;
  dueDate: string;
  targetOdometer: string;
  notes: string;
}

export function RemindersPage() {
  const {
    vehicles,
    reminders,
    addReminder,
    updateReminder,
    toggleReminderComplete,
    deleteReminder,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MaintenanceReminder | null>(
    null
  );
  const [deletingReminder, setDeletingReminder] = useState<MaintenanceReminder | null>(
    null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ReminderFormState>({
    vehicleId: vehicles[0]?.id ?? '',
    category: 'General servicing',
    title: '',
    dueDate: getTodayISO(),
    targetOdometer: '',
    notes: '',
  });

  const counts = useMemo(() => {
    let upcoming = 0;
    let overdue = 0;
    let completed = 0;
    reminders.forEach((r) => {
      const st = computeReminderStatus(r.dueDate, r.completed);
      if (st === 'Upcoming') upcoming++;
      else if (st === 'Overdue') overdue++;
      else completed++;
    });
    return { all: reminders.length, upcoming, overdue, completed };
  }, [reminders]);

  const filteredReminders = useMemo(() => {
    return [...reminders]
      .filter((r) => {
        const st = computeReminderStatus(r.dueDate, r.completed);
        if (activeTab === 'upcoming' && st !== 'Upcoming') return false;
        if (activeTab === 'overdue' && st !== 'Overdue') return false;
        if (activeTab === 'completed' && st !== 'Completed') return false;
        if (vehicleFilter !== 'all' && r.vehicleId !== vehicleFilter) return false;
        if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [reminders, activeTab, vehicleFilter, categoryFilter]);

  const openAddModal = () => {
    setEditingReminder(null);
    setForm({
      vehicleId: vehicles[0]?.id ?? '',
      category: 'General servicing',
      title: '',
      dueDate: getTodayISO(),
      targetOdometer: '',
      notes: '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (rem: MaintenanceReminder) => {
    setEditingReminder(rem);
    setForm({
      vehicleId: rem.vehicleId,
      category: rem.category,
      title: rem.title,
      dueDate: rem.dueDate,
      targetOdometer: rem.targetOdometer ? String(rem.targetOdometer) : '',
      notes: rem.notes ?? '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.vehicleId) next.vehicleId = 'Select a vehicle.';
    if (form.title.trim().length < 3) next.title = 'Enter a reminder title.';
    if (!form.dueDate) next.dueDate = 'Select a due date.';
    if (form.targetOdometer.trim() !== '') {
      const odo = Number(form.targetOdometer);
      if (Number.isNaN(odo) || odo < 0) {
        next.targetOdometer = 'Enter a valid target odometer.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Omit<MaintenanceReminder, 'id'> = {
      vehicleId: form.vehicleId,
      category: form.category,
      title: form.title.trim(),
      dueDate: form.dueDate,
      targetOdometer: form.targetOdometer ? Number(form.targetOdometer) : undefined,
      notes: form.notes.trim() || undefined,
      completed: editingReminder ? editingReminder.completed : false,
      completedDate: editingReminder?.completedDate,
    };

    if (editingReminder) {
      updateReminder(editingReminder.id, payload);
    } else {
      addReminder(payload);
    }
    setFormOpen(false);
  };

  const getVehicleName = (vehicleId: string) => {
    const v = vehicles.find((item) => item.id === vehicleId);
    return v ? `${v.brand} ${v.model} (${v.registrationNumber})` : 'Vehicle';
  };

  return (
    <div className="space-y-6">
      {/* Segmented Tabs + Add CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {(
            [
              { key: 'all', label: `All (${counts.all})` },
              { key: 'overdue', label: `Overdue (${counts.overdue})` },
              { key: 'upcoming', label: `Upcoming (${counts.upcoming})` },
              { key: 'completed', label: `Completed (${counts.completed})` },
            ] as Array<{ key: TabKey; label: string }>
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap tabular-nums ${
                activeTab === tab.key
                  ? 'bg-[#101828] dark:bg-[#2563EB] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#101828] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={vehicles.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          aria-label="Filter reminders by vehicle"
          className="w-full h-10 px-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
        >
          <option value="all">All Vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} ({v.registrationNumber})
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter reminders by category"
          className="w-full h-10 px-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
        >
          <option value="all">All Categories</option>
          {REMINDER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Reminders List */}
      {filteredReminders.length > 0 ? (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredReminders.map((rem) => {
            const status = computeReminderStatus(rem.dueDate, rem.completed);
            const StatusIcon =
              status === 'Completed'
                ? CheckCircle2
                : status === 'Overdue'
                ? AlertCircle
                : Clock;

            const statusColor =
              status === 'Completed'
                ? 'text-emerald-700 dark:text-emerald-400'
                : status === 'Overdue'
                ? 'text-red-600 dark:text-red-400'
                : 'text-amber-600 dark:text-amber-400';

            return (
              <div
                key={rem.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleReminderComplete(rem.id)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      rem.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-[#2563EB] hover:text-[#2563EB]'
                    }`}
                    aria-label={
                      rem.completed ? 'Reopen reminder' : 'Mark reminder as completed'
                    }
                    title={rem.completed ? 'Reopen' : 'Mark completed'}
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-[#2563EB] dark:text-blue-400">
                        {rem.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{getVehicleName(rem.vehicleId)}</span>
                    </div>
                    <h2
                      className={`mt-1 font-display text-base font-semibold ${
                        rem.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-[#101828] dark:text-white'
                      }`}
                    >
                      {rem.title}
                    </h2>
                    {rem.notes && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {rem.notes}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>Due {formatDate(rem.dueDate)}</span>
                      {rem.targetOdometer && (
                        <span className="font-mono">
                          Target {formatNumber(rem.targetOdometer)} km
                        </span>
                      )}
                      {rem.completed && rem.completedDate && (
                        <span>Completed {formatDate(rem.completedDate)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-9 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${statusColor}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status}
                    </span>
                    {!rem.completed && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                        {formatRelativeDays(rem.dueDate)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleReminderComplete(rem.id)}
                      className="h-8 px-2.5 inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                      {rem.completed ? (
                        <>
                          <RotateCcw className="h-3 w-3" />
                          <span>Reopen</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Complete</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(rem)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      aria-label="Edit reminder"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingReminder(rem)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      aria-label="Delete reminder"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <CalendarClock className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold text-[#101828] dark:text-white">
            No reminders in this view
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Schedule upcoming servicing, oil changes, tyre inspections, or renewals.
          </p>
        </div>
      )}

      {/* Add / Edit Reminder Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingReminder ? 'Edit Reminder' : 'Add Maintenance Reminder'}
        subtitle="Set a date or odometer target for your next car checkup"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle *
              </label>
              <select
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
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
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as ReminderCategory,
                  })
                }
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              >
                {REMINDER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Reminder Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 30,000 km Periodic Service"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.dueDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Target Odometer (km, optional)
              </label>
              <input
                type="number"
                min={0}
                value={form.targetOdometer}
                onChange={(e) =>
                  setForm({ ...form, targetOdometer: e.target.value })
                }
                placeholder="e.g. 30000"
                className="w-full h-10 px-3 text-sm tabular-nums rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {errors.targetOdometer && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.targetOdometer}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Workshop preference, parts to inspect..."
                className="w-full p-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
            >
              {editingReminder ? 'Save Changes' : 'Save Reminder'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingReminder)}
        onClose={() => setDeletingReminder(null)}
        onConfirm={() => {
          if (deletingReminder) deleteReminder(deletingReminder.id);
        }}
        title="Delete Reminder"
        message={
          deletingReminder
            ? `Delete the reminder "${deletingReminder.title}"?`
            : ''
        }
      />
    </div>
  );
}
