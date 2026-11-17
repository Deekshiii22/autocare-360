import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Edit3,
  Gauge,
  MapPin,
  Plus,
  Search,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceRecord, ServiceType } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getTodayISO,
} from '../utils/formatters';

const SERVICE_TYPES: ServiceType[] = [
  'General Servicing',
  'Engine Oil Change',
  'Brake Inspection & Pad Replacement',
  'Wheel Alignment & Balancing',
  'AC & Cabin Filter Service',
  'Battery & Electrical Check',
  'Tyre Replacement',
];

interface ServiceFormState {
  vehicleId: string;
  date: string;
  serviceType: ServiceType;
  serviceCentre: string;
  amount: string;
  odometer: string;
  description: string;
}

export function ServiceHistoryPage() {
  const { vehicles, services, addService, updateService, deleteService } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceRecord | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<ServiceFormState>({
    vehicleId: vehicles[0]?.id ?? '',
    date: getTodayISO(),
    serviceType: 'General Servicing',
    serviceCentre: '',
    amount: '',
    odometer: vehicles[0] ? String(vehicles[0].odometer) : '',
    description: '',
  });

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return [...services]
      .filter((s) => {
        if (vehicleFilter !== 'all' && s.vehicleId !== vehicleFilter) return false;
        if (typeFilter !== 'all' && s.serviceType !== typeFilter) return false;
        if (q) {
          const vehicle = vehicles.find((v) => v.id === s.vehicleId);
          const hay = `${s.serviceType} ${s.serviceCentre} ${s.description} ${
            vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.registrationNumber}` : ''
          }`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [services, vehicles, searchQuery, vehicleFilter, typeFilter]);

  const totalSpent = useMemo(
    () => filteredServices.reduce((sum, s) => sum + s.amount, 0),
    [filteredServices]
  );

  const openAddModal = () => {
    const firstVehicle = vehicles[0];
    setEditingService(null);
    setForm({
      vehicleId: firstVehicle?.id ?? '',
      date: getTodayISO(),
      serviceType: 'General Servicing',
      serviceCentre: '',
      amount: '',
      odometer: firstVehicle ? String(firstVehicle.odometer) : '',
      description: '',
    });
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (record: ServiceRecord) => {
    setEditingService(record);
    setForm({
      vehicleId: record.vehicleId,
      date: record.date,
      serviceType: record.serviceType,
      serviceCentre: record.serviceCentre,
      amount: String(record.amount),
      odometer: String(record.odometer),
      description: record.description,
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.vehicleId) next.vehicleId = 'Select a vehicle.';
    if (!form.date) next.date = 'Select service date.';
    if (form.serviceCentre.trim().length < 2) {
      next.serviceCentre = 'Enter the service centre name.';
    }
    const amt = Number(form.amount);
    if (form.amount.trim() === '' || Number.isNaN(amt) || amt <= 0) {
      next.amount = 'Enter a valid amount greater than 0.';
    }
    const odo = Number(form.odometer);
    if (form.odometer.trim() === '' || Number.isNaN(odo) || odo < 0) {
      next.odometer = 'Enter a valid odometer reading.';
    }
    if (form.description.trim().length < 4) {
      next.description = 'Enter a brief summary of work performed.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Omit<ServiceRecord, 'id'> = {
      vehicleId: form.vehicleId,
      date: form.date,
      serviceType: form.serviceType,
      serviceCentre: form.serviceCentre.trim(),
      amount: Number(form.amount),
      odometer: Number(form.odometer),
      description: form.description.trim(),
    };

    if (editingService) {
      updateService(editingService.id, payload);
    } else {
      addService(payload);
    }
    setFormOpen(false);
  };

  const getVehicleLabel = (vehicleId: string) => {
    const v = vehicles.find((item) => item.id === vehicleId);
    return v ? `${v.brand} ${v.model} (${v.registrationNumber})` : 'Vehicle';
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar & Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Filtered Records: </span>
            <span className="font-semibold text-[#101828] dark:text-white tabular-nums">
              {filteredServices.length}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Total Cost: </span>
            <span className="font-mono font-semibold text-[#101828] dark:text-white tabular-nums">
              {formatCurrency(totalSpent)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={vehicles.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service Record</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service centre, work notes, vehicle..."
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
                {v.brand} {v.model} ({v.registrationNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by service type"
            className="w-full h-10 px-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
          >
            <option value="all">All Service Types</option>
            {SERVICE_TYPES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Service History Timeline */}
      {filteredServices.length > 0 ? (
        <div className="relative pl-6 sm:pl-8 space-y-4">
          {/* Vertical Timeline Spine */}
          <div
            className="absolute left-2.5 sm:left-3.5 top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-800"
            aria-hidden="true"
          />

          {filteredServices.map((srv) => (
            <div key={srv.id} className="relative">
              <div
                className="absolute -left-6 sm:-left-8 top-5 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-[#2563EB]"
                aria-hidden="true"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
              </div>

              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 tabular-nums font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(srv.date)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-[#2563EB] dark:text-blue-400">
                        {getVehicleLabel(srv.vehicleId)}
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-display text-base font-semibold text-[#101828] dark:text-white">
                      {srv.serviceType}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-base font-bold text-[#101828] dark:text-white tabular-nums">
                      {formatCurrency(srv.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditModal(srv)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Edit service record"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingService(srv)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      aria-label="Delete service record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {srv.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {srv.serviceCentre}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                    <Gauge className="h-3.5 w-3.5 text-slate-400" />
                    {formatNumber(srv.odometer)} km
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Wrench className="h-11 w-11 text-slate-400 mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold text-[#101828] dark:text-white">
            No matching service records
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {services.length === 0
              ? 'Log your first workshop visit to build a complete maintenance timeline.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {vehicles.length > 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Service Record</span>
            </button>
          )}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingService ? 'Edit Service Record' : 'Add Service Record'}
        subtitle="Log workshop maintenance details and odometer reading"
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
                Service Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.date}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Service Type *
              </label>
              <select
                value={form.serviceType}
                onChange={(e) =>
                  setForm({ ...form, serviceType: e.target.value as ServiceType })
                }
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              >
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Service Centre *
              </label>
              <input
                type="text"
                value={form.serviceCentre}
                onChange={(e) => setForm({ ...form, serviceCentre: e.target.value })}
                placeholder="e.g. Advaith Hyundai Service Hub, Whitefield"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.serviceCentre && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.serviceCentre}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Amount Paid (INR) *
              </label>
              <input
                type="number"
                min={1}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 5200"
                className="w-full h-10 px-3 text-sm tabular-nums rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.amount}</p>
              )}
            </div>

            <div>
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
                Description of Work *
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe parts replaced, fluids topped up, and technician notes..."
                className="w-full p-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
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
              {editingService ? 'Save Changes' : 'Save Service Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingService)}
        onClose={() => setDeletingService(null)}
        onConfirm={() => {
          if (deletingService) deleteService(deletingService.id);
        }}
        title="Delete Service Record"
        message={
          deletingService
            ? `Delete the "${deletingService.serviceType}" record from ${formatDate(
                deletingService.date
              )}?`
            : ''
        }
      />
    </div>
  );
}
