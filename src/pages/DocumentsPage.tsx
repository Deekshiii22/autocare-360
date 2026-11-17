import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentType, VehicleDocument } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  computeDocumentStatus,
  formatDate,
  getTodayISO,
} from '../utils/formatters';

const DOCUMENT_TYPES: DocumentType[] = [
  'Registration Certificate (RC)',
  'Insurance',
  'Pollution Under Control (PUC)',
  'Driving Licence',
];

export function DocumentsPage() {
  const {
    vehicles,
    documents,
    user,
    addDocument,
    updateDocument,
    deleteDocument,
    showToast,
  } = useApp();

  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [viewingDoc, setViewingDoc] = useState<VehicleDocument | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<VehicleDocument | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<VehicleDocument | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Upload modal state
  const [uploadExpiry, setUploadExpiry] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    previewUrl?: string;
  } | null>(null);

  // Add document modal state
  const [newForm, setNewForm] = useState({
    vehicleId: vehicles[0]?.id ?? 'owner',
    documentType: 'Insurance' as DocumentType,
    documentNumber: '',
    issuer: '',
    issueDate: getTodayISO(),
    expiryDate: '',
    notes: '',
  });
  const [newErrors, setNewErrors] = useState<Record<string, string>>({});

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      if (vehicleFilter !== 'all' && d.vehicleId !== vehicleFilter) return false;
      if (typeFilter !== 'all' && d.documentType !== typeFilter) return false;
      return true;
    });
  }, [documents, vehicleFilter, typeFilter]);

  const statusCounts = useMemo(() => {
    let valid = 0;
    let expiring = 0;
    let expired = 0;
    documents.forEach((d) => {
      const st = computeDocumentStatus(d.expiryDate);
      if (st === 'Valid') valid++;
      else if (st === 'Expiring Soon') expiring++;
      else expired++;
    });
    return { valid, expiring, expired };
  }, [documents]);

  const getAssociatedLabel = (vehicleId: string) => {
    if (vehicleId === 'owner') return `Owner · ${user.name}`;
    const v = vehicles.find((item) => item.id === vehicleId);
    return v ? `${v.brand} ${v.model} (${v.registrationNumber})` : 'Vehicle';
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKB = Math.max(1, Math.round(file.size / 1024));
    const sizeLabel =
      sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile({
      name: file.name,
      size: sizeLabel,
      type: file.type || 'application/octet-stream',
      previewUrl,
    });
  };

  const openUploadModal = (doc: VehicleDocument) => {
    setUploadingTarget(doc);
    setUploadExpiry(doc.expiryDate);
    setSelectedFile(
      doc.fileName
        ? {
            name: doc.fileName,
            size: doc.fileSize ?? '—',
            type: doc.fileType ?? 'application/pdf',
            previewUrl: doc.filePreviewUrl,
          }
        : null
    );
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingTarget) return;
    if (!uploadExpiry) {
      showToast('Select a valid expiry date', 'warning');
      return;
    }
    updateDocument(uploadingTarget.id, {
      expiryDate: uploadExpiry,
      fileName: selectedFile?.name ?? uploadingTarget.fileName,
      fileSize: selectedFile?.size ?? uploadingTarget.fileSize,
      fileType: selectedFile?.type ?? uploadingTarget.fileType,
      filePreviewUrl: selectedFile?.previewUrl ?? uploadingTarget.filePreviewUrl,
    });
    setUploadingTarget(null);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (newForm.documentNumber.trim().length < 3) {
      errs.documentNumber = 'Enter document or policy number.';
    }
    if (newForm.issuer.trim().length < 2) {
      errs.issuer = 'Enter issuing authority or insurer.';
    }
    if (!newForm.expiryDate) {
      errs.expiryDate = 'Select expiry date.';
    }
    setNewErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addDocument({
      vehicleId:
        newForm.documentType === 'Driving Licence' ? 'owner' : newForm.vehicleId,
      documentType: newForm.documentType,
      documentNumber: newForm.documentNumber.trim(),
      issuer: newForm.issuer.trim(),
      issueDate: newForm.issueDate || getTodayISO(),
      expiryDate: newForm.expiryDate,
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      fileType: selectedFile?.type,
      filePreviewUrl: selectedFile?.previewUrl,
      notes: newForm.notes.trim() || undefined,
    });
    setAddOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Status Overview & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
            <CheckCircle2 className="h-4 w-4" />
            {statusCounts.valid} Valid
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium tabular-nums">
            <AlertTriangle className="h-4 w-4" />
            {statusCounts.expiring} Expiring Soon
          </span>
          <span className="inline-flex items-center gap-1.5 text-red-700 dark:text-red-400 font-medium tabular-nums">
            <ShieldAlert className="h-4 w-4" />
            {statusCounts.expired} Expired
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedFile(null);
            setNewErrors({});
            setNewForm({
              vehicleId: vehicles[0]?.id ?? 'owner',
              documentType: 'Insurance',
              documentNumber: '',
              issuer: '',
              issueDate: getTodayISO(),
              expiryDate: '',
              notes: '',
            });
            setAddOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          aria-label="Filter documents by vehicle"
          className="w-full h-10 px-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
        >
          <option value="all">All Vehicles & Owner</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} ({v.registrationNumber})
            </option>
          ))}
          <option value="owner">Owner ({user.name})</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter documents by type"
          className="w-full h-10 px-3 text-sm rounded-lg bg-[#F5F7FA] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
        >
          <option value="all">All Document Types</option>
          {DOCUMENT_TYPES.map((dt) => (
            <option key={dt} value={dt}>
              {dt}
            </option>
          ))}
        </select>
      </div>

      {/* Document Cards Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => {
            const status = computeDocumentStatus(doc.expiryDate);
            const StatusIcon =
              status === 'Valid'
                ? CheckCircle2
                : status === 'Expiring Soon'
                ? AlertTriangle
                : ShieldAlert;

            const statusColorClass =
              status === 'Valid'
                ? 'text-emerald-700 dark:text-emerald-400'
                : status === 'Expiring Soon'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-red-700 dark:text-red-400';

            return (
              <article
                key={doc.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F7FA] dark:bg-slate-800 text-[#2563EB] dark:text-blue-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display text-sm font-semibold text-[#101828] dark:text-white truncate">
                          {doc.documentType}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {getAssociatedLabel(doc.vehicleId)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap shrink-0 ${statusColorClass}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 dark:text-slate-400">
                        Document No.
                      </span>
                      <span className="font-mono font-medium text-[#101828] dark:text-slate-200 truncate">
                        {doc.documentNumber}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 dark:text-slate-400">
                        Expiry Date
                      </span>
                      <span className="font-medium text-[#101828] dark:text-slate-200 tabular-nums">
                        {formatDate(doc.expiryDate)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500 dark:text-slate-400">
                        Attached File
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {doc.fileName ? `${doc.fileName} (${doc.fileSize ?? ''})` : 'None uploaded'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingDoc(doc)}
                    className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#101828] dark:bg-[#2563EB] hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openUploadModal(doc)}
                    className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingDoc(doc)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center">
          <FileText className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h2 className="font-display text-lg font-semibold text-[#101828] dark:text-white">
            No documents match your filter
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add your RC, insurance policy, PUC certificate, or driving licence.
          </p>
        </div>
      )}

      {/* View Document Modal */}
      <Modal
        open={Boolean(viewingDoc)}
        onClose={() => setViewingDoc(null)}
        title={viewingDoc?.documentType ?? 'Document Preview'}
        subtitle={
          viewingDoc ? getAssociatedLabel(viewingDoc.vehicleId) : undefined
        }
        maxWidthClass="max-w-lg"
      >
        {viewingDoc && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#F5F7FA] dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Document Number
                </span>
                <span className="font-mono text-sm font-semibold text-[#101828] dark:text-white">
                  {viewingDoc.documentNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Issuing Authority
                </span>
                <span className="text-sm text-[#101828] dark:text-slate-200 text-right">
                  {viewingDoc.issuer}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Issue / Expiry
                </span>
                <span className="text-sm text-[#101828] dark:text-slate-200 tabular-nums">
                  {formatDate(viewingDoc.issueDate)} —{' '}
                  {formatDate(viewingDoc.expiryDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Status
                </span>
                <span className="text-sm font-semibold">
                  {computeDocumentStatus(viewingDoc.expiryDate)}
                </span>
              </div>
              {viewingDoc.notes && (
                <p className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  {viewingDoc.notes}
                </p>
              )}
            </div>

            {viewingDoc.filePreviewUrl &&
            viewingDoc.fileType?.startsWith('image/') ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={viewingDoc.filePreviewUrl}
                  alt={viewingDoc.fileName ?? viewingDoc.documentType}
                  className="w-full max-h-80 object-contain bg-slate-50 dark:bg-slate-950"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-5 text-center">
                <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-[#101828] dark:text-white">
                  {viewingDoc.fileName ?? 'Digital Record Verified'}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {viewingDoc.fileName
                    ? `${viewingDoc.fileSize ?? ''} · Local file preview ready for images, metadata stored for PDFs.`
                    : 'No local file attached yet. Use Upload to attach a copy.'}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const target = viewingDoc;
                  setViewingDoc(null);
                  openUploadModal(target);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Replace / Upload File
              </button>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload / Renew Document Modal */}
      <Modal
        open={Boolean(uploadingTarget)}
        onClose={() => setUploadingTarget(null)}
        title="Upload & Update Document"
        subtitle={uploadingTarget?.documentType}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Select Local File (Image or PDF)
            </label>
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center cursor-pointer hover:border-[#2563EB] transition-colors">
              <Upload className="h-6 w-6 text-[#2563EB] mb-2" />
              <span className="text-sm font-medium text-[#101828] dark:text-white">
                {selectedFile ? selectedFile.name : 'Choose a file from your device'}
              </span>
              <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {selectedFile
                  ? `${selectedFile.size} · Ready to attach`
                  : 'PNG, JPG, or PDF supported locally'}
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFilePicked}
                className="hidden"
              />
            </label>
          </div>

          {selectedFile?.previewUrl &&
            selectedFile.type.startsWith('image/') && (
              <img
                src={selectedFile.previewUrl}
                alt="Selected preview"
                className="h-36 w-full object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              />
            )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Updated Expiry Date *
            </label>
            <input
              type="date"
              value={uploadExpiry}
              onChange={(e) => setUploadExpiry(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setUploadingTarget(null)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
            >
              Save Document
            </button>
          </div>
        </form>
      </Modal>

      {/* Add New Document Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Vehicle Document"
        subtitle="Store RC, Insurance, PUC, or Driving Licence details"
      >
        <form onSubmit={handleCreateDocument} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Document Type *
              </label>
              <select
                value={newForm.documentType}
                onChange={(e) =>
                  setNewForm({
                    ...newForm,
                    documentType: e.target.value as DocumentType,
                  })
                }
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>

            {newForm.documentType !== 'Driving Licence' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Associated Vehicle *
                </label>
                <select
                  value={newForm.vehicleId}
                  onChange={(e) =>
                    setNewForm({ ...newForm, vehicleId: e.target.value })
                  }
                  className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Document / Policy Number *
              </label>
              <input
                type="text"
                value={newForm.documentNumber}
                onChange={(e) =>
                  setNewForm({ ...newForm, documentNumber: e.target.value })
                }
                placeholder="e.g. KA03-2026-9910"
                className="w-full h-10 px-3 text-sm font-mono rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {newErrors.documentNumber && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {newErrors.documentNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Issuing Authority / Insurer *
              </label>
              <input
                type="text"
                value={newForm.issuer}
                onChange={(e) =>
                  setNewForm({ ...newForm, issuer: e.target.value })
                }
                placeholder="e.g. HDFC ERGO"
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {newErrors.issuer && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {newErrors.issuer}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                value={newForm.issueDate}
                onChange={(e) =>
                  setNewForm({ ...newForm, issueDate: e.target.value })
                }
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Expiry Date *
              </label>
              <input
                type="date"
                value={newForm.expiryDate}
                onChange={(e) =>
                  setNewForm({ ...newForm, expiryDate: e.target.value })
                }
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {newErrors.expiryDate && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {newErrors.expiryDate}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <Upload className="h-3.5 w-3.5" />
              <span>
                {selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : 'Attach document file (optional)'}
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFilePicked}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
            >
              Save Document
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingDoc)}
        onClose={() => setDeletingDoc(null)}
        onConfirm={() => {
          if (deletingDoc) deleteDocument(deletingDoc.id);
        }}
        title="Delete Document"
        message={
          deletingDoc
            ? `Remove ${deletingDoc.documentType} (${deletingDoc.documentNumber}) from your document wallet?`
            : ''
        }
      />
    </div>
  );
}
