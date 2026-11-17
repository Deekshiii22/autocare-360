import { DocumentStatus, ReminderStatus } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysDifference(targetDateISO: string): number {
  const today = new Date(`${getTodayISO()}T00:00:00`);
  const target = new Date(`${targetDateISO}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeDocumentStatus(expiryDateISO: string): DocumentStatus {
  const days = getDaysDifference(expiryDateISO);
  if (days < 0) return 'Expired';
  if (days <= 30) return 'Expiring Soon';
  return 'Valid';
}

export function computeReminderStatus(
  dueDateISO: string,
  completed: boolean
): ReminderStatus {
  if (completed) return 'Completed';
  const days = getDaysDifference(dueDateISO);
  if (days < 0) return 'Overdue';
  return 'Upcoming';
}

export function formatRelativeDays(dateISO: string): string {
  const days = getDaysDifference(dateISO);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days === -1) return '1 day overdue';
  if (days < -1) return `${Math.abs(days)} days overdue`;
  return `In ${days} days`;
}
