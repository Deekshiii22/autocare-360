import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Car,
  Edit3,
  Eye,
  Fuel,
  Gauge,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FuelType, Vehicle } from '../types';
import { IMAGE_ASSETS } from '../data/sampleData';
import { VehicleImage } from '../components/VehicleImage';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  computeDocumentStatus,
  formatCurrency,
  formatDate,
  formatNumber,
} from '../utils/formatters';

const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];

const PRESET_IMAGES = [
  { label: 'Compact SUV (White)', url: IMAGE_ASSETS.creta },
  { label: 'Compact SUV (Slate)', url: IMAGE_ASSETS.nexon },
  { label: 'Modern Sedan (Silver)', url: IMAGE_ASSETS.sedan },
];

interface VehicleFormState {
  brand: string;
  model: string;
  variant: string;
  registrationNumber: string;
  year: string;
  fuelType: FuelType;
  odometer: string;
  color: string;
  imageUrl: string;
}

const emptyForm: VehicleFormState = {
  brand: '',
  model: '',
  variant: '',
  registrationNumber: '',
  year: String(new Date().getFullYear()),
  fuelType: 'Petrol',
  odometer: '',
  color: '',
  imageUrl: IMAGE_ASSETS.sedan,
};

export function GaragePage() {
  const {
    vehicles,
    services,
    expenses,
    documents,
    reminders,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  } = useApp();

  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      const found = vehicles.find((v) => v.id === viewId);
      if (found) setViewingVehicle(found);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, vehicles, setSearchParams]);

  const openAddModal = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      brand: vehicle.brand,
      model: vehicle.model,
      variant: vehicle.variant ?? '',
      registrationNumber: vehicle.registrationNumber,
      year: String(vehicle.year),
      fuelType: vehicle.fuelType,
      odometer: String(vehicle.odometer),
      color: vehicle.color ?? '',
      imageUrl: vehicle.imageUrl,
    });
    setErrors({});
    setFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imageUrl: objectUrl }));
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (form.brand.trim().length < 2) next.brand = 'Enter vehicle brand.';
    if (form.model.trim().length < 1) next.model = 'Enter vehicle model.';
    if (form.registrationNumber.trim().length < 4) {
      next.registrationNumber = 'Enter a valid registration number.';
    }
    const yr = Number(form.year);
    const maxYr = new Date().getFullYear() + 1;
    if (!Number.isInteger(yr) || yr < 1980 || yr > maxYr) {
      next.year = `Enter a valid year between 1980 and ${maxYr}.`;
    }
    const odo = Number(form.odometer);
    if (form.odometer.trim() === '' || Number.isNaN(odo) || odo < 0 || odo > 999999) {
      next.odometer = 'Enter a valid odometer reading (0–999,999 km).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload: Omit<Vehicle, 'id'> = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      variant: form.variant.trim() || undefined,
      registrationNumber: form.registrationNumber.trim().toUpperCase(),
      year: Number(form.year),
      fuelType: form.fuelType,
      odometer: Number(form.odometer),
      color: form.color.trim() || undefined,
      imageUrl: form.imageUrl || IMAGE_ASSETS.sedan,
      lastServicedDate: editingVehicle?.lastServicedDate,
    };

    if (editingVehicle) {
      updateVehicle(editingVehicle.id, payload);
    } else {
      addVehicle(payload);
    }
    setFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage registered vehicles, odometer logs, and linked maintenance records.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicle Cards Grid */}
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const vehicleServicesCount = services.filter(
              (s) => s.vehicleId === vehicle.id
            ).length;
            const vehicleRemindersCount = reminders.filter(
              (r) => r.vehicleId === vehicle.id && !r.completed
            ).length;

            return (
              <article
                key={vehicle.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <VehicleImage
                    src={vehicle.imageUrl}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="h-full w-full hover:scale-[1.02] transition-transform duration-200"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-display text-lg font-bold text-[#101828] dark:text-white">
                          {vehicle.brand} {vehicle.model}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {vehicle.year} · {vehicle.fuelType}
                          {vehicle.color ? ` · ${vehicle.color}` : ''}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#101828] dark:text-slate-200 bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md whitespace-nowrap tabular-nums">
                        {vehicle.registrationNumber}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Gauge className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="font-mono font-medium tabular-nums">
                          {formatNumber(vehicle.odometer)} km
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Fuel className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{vehicle.fuelType}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {vehicleServicesCount} service records · {vehicleRemindersCount}{' '}
                      active reminders
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingVehicle(vehicle)}
                      className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#101828] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-medium transition-colors whitespace-nowrap"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(vehicle)}
                      className="h-9 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingVehicle(vehicle)}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                      aria-label={`Delete ${vehicle.brand} ${vehicle.model}`}
                      title="Delete vehicle"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Car className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold text-[#101828] dark:text-white">
            Your garage is empty
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add a vehicle to start logging maintenance history, fuel expenses, and
            document renewals.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add First Vehicle</span>
          </button>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        subtitle="Enter vehicle specifications and current odometer reading"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Vehicle Brand *
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Hyundai, Tata, Honda"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.brand && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Model *
              </label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g. Creta, Nexon, City"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.model && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.model}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Registration Number *
              </label>
              <input
                type="text"
                value={form.registrationNumber}
                onChange={(e) =>
                  setForm({ ...form, registrationNumber: e.target.value })
                }
                placeholder="e.g. KA 03 AB 1234"
                className="w-full h-10 px-3 text-sm font-mono uppercase rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.registrationNumber && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.registrationNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Manufacturing Year *
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2023"
                className="w-full h-10 px-3 text-sm tabular-nums rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
              {errors.year && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.year}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Fuel Type *
              </label>
              <select
                value={form.fuelType}
                onChange={(e) =>
                  setForm({ ...form, fuelType: e.target.value as FuelType })
                }
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              >
                {FUEL_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Current Odometer (km) *
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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Variant (Optional)
              </label>
              <input
                type="text"
                value={form.variant}
                onChange={(e) => setForm({ ...form, variant: e.target.value })}
                placeholder="e.g. SX 1.5 IVT"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Exterior Color (Optional)
              </label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="e.g. Pearl White"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Vehicle Image Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Vehicle Photo
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-2.5">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: preset.url })}
                  className={`rounded-lg overflow-hidden border-2 transition-colors text-left ${
                    form.imageUrl === preset.url
                      ? 'border-[#2563EB]'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="h-16 w-full object-cover"
                  />
                  <span className="block px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload custom vehicle image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
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
              {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Vehicle Detail Modal */}
      <Modal
        open={Boolean(viewingVehicle)}
        onClose={() => setViewingVehicle(null)}
        title={
          viewingVehicle ? `${viewingVehicle.brand} ${viewingVehicle.model}` : 'Vehicle'
        }
        subtitle={
          viewingVehicle
            ? `${viewingVehicle.registrationNumber} · ${viewingVehicle.year} · ${viewingVehicle.fuelType}`
            : undefined
        }
        maxWidthClass="max-w-2xl"
      >
        {viewingVehicle && (
          <div className="space-y-5">
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <VehicleImage
                src={viewingVehicle.imageUrl}
                alt={`${viewingVehicle.brand} ${viewingVehicle.model}`}
                className="h-full w-full"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Odometer</p>
                <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
                  {formatNumber(viewingVehicle.odometer)} km
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Fuel</p>
                <p className="mt-0.5 text-sm font-medium">{viewingVehicle.fuelType}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Spent
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
                  {formatCurrency(
                    expenses
                      .filter((e) => e.vehicleId === viewingVehicle.id)
                      .reduce((s, e) => s + e.amount, 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Last Serviced
                </p>
                <p className="mt-0.5 text-sm font-medium tabular-nums">
                  {viewingVehicle.lastServicedDate
                    ? formatDate(viewingVehicle.lastServicedDate)
                    : '—'}
                </p>
              </div>
            </div>

            {/* Linked Documents Summary */}
            <div>
              <h3 className="text-sm font-semibold text-[#101828] dark:text-white mb-2">
                Compliance Documents
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
                {documents
                  .filter((d) => d.vehicleId === viewingVehicle.id)
                  .map((doc) => {
                    const st = computeDocumentStatus(doc.expiryDate);
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                      >
                        <span>{doc.documentType}</span>
                        <span
                          className={`text-xs font-semibold ${
                            st === 'Expired'
                              ? 'text-red-600 dark:text-red-400'
                              : st === 'Expiring Soon'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {st} · {formatDate(doc.expiryDate)}
                        </span>
                      </div>
                    );
                  })}
                {documents.filter((d) => d.vehicleId === viewingVehicle.id).length ===
                  0 && (
                  <p className="px-3.5 py-3 text-xs text-slate-500">
                    No documents linked to this vehicle.
                  </p>
                )}
              </div>
            </div>

            {/* Linked Recent Services */}
            <div>
              <h3 className="text-sm font-semibold text-[#101828] dark:text-white mb-2">
                Recent Services
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
                {services
                  .filter((s) => s.vehicleId === viewingVehicle.id)
                  .slice(0, 3)
                  .map((srv) => (
                    <div
                      key={srv.id}
                      className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                    >
                      <div>
                        <p className="font-medium">{srv.serviceType}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(srv.date)} · {formatNumber(srv.odometer)} km
                        </p>
                      </div>
                      <span className="font-mono font-semibold tabular-nums">
                        {formatCurrency(srv.amount)}
                      </span>
                    </div>
                  ))}
                {services.filter((s) => s.vehicleId === viewingVehicle.id).length ===
                  0 && (
                  <p className="px-3.5 py-3 text-xs text-slate-500">
                    No service records for this vehicle yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingVehicle)}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={() => {
          if (deletingVehicle) deleteVehicle(deletingVehicle.id);
        }}
        title="Remove Vehicle"
        message={
          deletingVehicle
            ? `Remove ${deletingVehicle.brand} ${deletingVehicle.model} (${deletingVehicle.registrationNumber}) from My Garage? All linked service logs, expenses, documents, and reminders for this vehicle will also be removed.`
            : ''
        }
      />
    </div>
  );
}
