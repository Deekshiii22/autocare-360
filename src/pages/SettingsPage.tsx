import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from '../components/ConfirmDialog';

const FAQS = [
  {
    q: 'How is document expiry status calculated?',
    a: 'Documents past their expiry date are marked Expired. Documents expiring within the next 30 days are marked Expiring Soon, and all others appear as Valid.',
  },
  {
    q: 'Where is my demonstration data stored?',
    a: 'AutoCare 360 is a frontend-only prototype. All vehicles, service logs, expenses, documents, and reminders are stored locally in your browser via localStorage.',
  },
  {
    q: 'Can I restore the original Hyundai Creta and Tata Nexon sample data?',
    a: 'Yes. Use the "Reset Demo Data" button in the Help & Support section below to restore the initial demonstration vehicles and records at any time.',
  },
];

export function SettingsPage() {
  const {
    user,
    theme,
    notifications,
    updateUser,
    setTheme,
    updateNotifications,
    resetDemoData,
    logout,
  } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (phone.trim().length < 6) next.phone = 'Enter a valid phone number.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    updateUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* User Profile & Personal Information */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <img
            src={user.avatarUrl}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <h2 className="font-display text-lg font-bold text-[#101828] dark:text-white">
              {user.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user.email} · {user.city}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} noValidate className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#101828] dark:text-white">
            <User className="h-4 w-4 text-[#2563EB]" />
            <span>Personal Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </section>

      {/* Theme Preference */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
          Theme Preference
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Switch between light daylight mode and high-contrast dark cockpit mode.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
              theme === 'light'
                ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Sun className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#101828] dark:text-white">
                Light Theme
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crisp #F5F7FA canvas with white surfaces
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
              theme === 'dark'
                ? 'border-[#2563EB] bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Moon className="h-5 w-5 text-[#2563EB] dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#101828] dark:text-white">
                Dark Theme
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deep slate surfaces for low-light viewing
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-[#2563EB]" />
          <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
            Notification Preferences
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(
            [
              {
                key: 'serviceAlerts',
                title: 'Upcoming Service Reminders',
                desc: 'Notify when a scheduled service date or odometer milestone approaches.',
              },
              {
                key: 'documentExpiryAlerts',
                title: 'Document Expiry Warnings',
                desc: 'Highlight RC, Insurance, and PUC certificates expiring within 30 days.',
              },
              {
                key: 'overdueReminderAlerts',
                title: 'Overdue Maintenance Alerts',
                desc: 'Keep overdue tasks pinned in the header alerts dropdown.',
              },
              {
                key: 'monthlyExpenseDigest',
                title: 'Monthly Expenditure Summary',
                desc: 'Include monthly fuel and servicing cost breakdown notifications.',
              },
            ] as const
          ).map((item) => {
            const enabled = notifications[item.key];
            return (
              <div
                key={item.key}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-medium text-[#101828] dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => updateNotifications({ [item.key]: !enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    enabled ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Help & Support + Demo Controls */}
      <section className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-[#2563EB]" />
          <h2 className="font-display text-base font-semibold text-[#101828] dark:text-white">
            Help & Support
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[#101828] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-3.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-[#101828] dark:text-white">
              Demonstration Data & Session
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restore the default Creta & Nexon sample dataset or sign out to the login
              screen.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Demo Data</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={resetDemoData}
        title="Reset Demonstration Data"
        message="This will restore the initial Hyundai Creta and Tata Nexon sample vehicles, service logs, expenses, documents, and reminders."
        confirmLabel="Restore Defaults"
        danger={false}
      />
    </div>
  );
}
