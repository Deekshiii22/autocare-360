import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { Modal } from '../components/Modal';
import { useApp } from '../context/AppContext';
import { IMAGE_ASSETS } from '../data/sampleData';

export function AuthPage() {
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('aarav.sharma@autocare-demo.in');
  const [password, setPassword] = useState('autocare360');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('aarav.sharma@autocare-demo.in');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const validate = () => {
    const next: Record<string, string> = {};
    if (mode === 'signup' && name.trim().length < 2) {
      next.name = 'Enter your full name (at least 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    if (mode === 'signup' && password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    login(email.trim(), mode === 'signup' ? name.trim() : undefined);
    navigate('/');
  };

  const handleDemoQuickAccess = () => {
    login('aarav.sharma@autocare-demo.in', 'Aarav Sharma');
    navigate('/');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotError('');
    setForgotSent(true);
    showToast(
      'Reset link simulated',
      'info',
      `Demonstration reset instructions shown for ${forgotEmail.trim()}.`
    );
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F5F7FA] dark:bg-[#0B1120]">
      {/* Left Visual Showcase */}
      <div className="relative hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between overflow-hidden bg-[#101828] p-10 text-white">
        <img
          src={IMAGE_ASSETS.loginHero}
          alt="Modern private automotive garage"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101828] via-[#101828]/55 to-[#101828]/70" />

        <div className="relative z-10">
          <BrandLogo inverted />
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="text-sm font-medium text-blue-300 mb-3">
            Personal Vehicle Operations
          </p>
          <h1
            className="font-display text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.12]"
            style={{ textWrap: 'balance' }}
          >
            Every car, service log, and renewal in one calm workspace.
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed max-w-lg">
            Track odometer milestones, monthly fuel and maintenance spend, digital RC
            and insurance documents, and upcoming inspections without spreadsheets.
          </p>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-6">
            <div>
              <p className="font-display text-2xl font-bold tabular-nums">360°</p>
              <p className="mt-1 text-xs text-slate-300">Lifecycle Tracking</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold tabular-nums">4 Docs</p>
              <p className="mt-1 text-xs text-slate-300">Digital Wallet Ready</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold tabular-nums">Local</p>
              <p className="mt-1 text-xs text-slate-300">Demo Sample Data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Auth Card */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-5 py-10 sm:px-10 md:px-16">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden mb-8">
            <BrandLogo />
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 sm:p-8 shadow-sm">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#F5F7FA] dark:bg-slate-800 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrors({});
                }}
                className={`py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-[#101828] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#101828] dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrors({});
                }}
                className={`py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-[#101828] dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#101828] dark:hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-[#101828] dark:text-white">
                {mode === 'login' ? 'Welcome back' : 'Create your garage'}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {mode === 'login'
                  ? 'Sign in with the pre-filled demo credentials or your own email.'
                  : 'Set up your demonstration owner profile in seconds.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full h-11 px-3.5 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSent(false);
                        setForgotError('');
                        setForgotOpen(true);
                      }}
                      className="text-xs font-medium text-[#2563EB] hover:text-blue-700 dark:text-blue-400"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full h-11 pl-3.5 pr-11 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-confirm-password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full h-11 px-3.5 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {mode === 'login' && (
                <label className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  <span>Keep demonstration session active</span>
                </label>
              )}

              <button
                type="submit"
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDemoQuickAccess}
                className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-[#101828] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Continue as Demo Owner (Hyundai Creta & Tata Nexon)
              </button>
              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                Frontend prototype only. All records use local sample data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset Password"
        subtitle="Demonstration password recovery flow"
        maxWidthClass="max-w-md"
      >
        {forgotSent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm text-emerald-900 dark:text-emerald-200">
                <p className="font-medium">Recovery instructions simulated</p>
                <p className="mt-1 text-emerald-700 dark:text-emerald-300">
                  In a production deployment, a reset link would be sent to{' '}
                  <span className="font-medium">{forgotEmail}</span>.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Enter your registered email address to preview the password recovery
              confirmation state.
            </p>
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full h-11 pl-9 pr-3.5 text-sm rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[#101828] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]"
                />
              </div>
              {forgotError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {forgotError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#2563EB] text-white hover:bg-blue-700"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
