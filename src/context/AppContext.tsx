import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ExpenseRecord,
  MaintenanceReminder,
  NotificationSettings,
  ServiceRecord,
  ThemeMode,
  ToastMessage,
  UserProfile,
  Vehicle,
  VehicleDocument,
} from '../types';
import {
  INITIAL_DOCUMENTS,
  INITIAL_EXPENSES,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_REMINDERS,
  INITIAL_SERVICES,
  INITIAL_USER,
  INITIAL_VEHICLES,
} from '../data/sampleData';
import { getTodayISO } from '../utils/formatters';

interface AppState {
  isAuthenticated: boolean;
  user: UserProfile;
  theme: ThemeMode;
  notifications: NotificationSettings;
  vehicles: Vehicle[];
  services: ServiceRecord[];
  expenses: ExpenseRecord[];
  documents: VehicleDocument[];
  reminders: MaintenanceReminder[];
}

interface AppContextValue extends AppState {
  toasts: ToastMessage[];
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  showToast: (
    title: string,
    variant?: ToastMessage['variant'],
    description?: string
  ) => void;
  dismissToast: (id: string) => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setTheme: (theme: ThemeMode) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  addService: (service: Omit<ServiceRecord, 'id'>) => void;
  updateService: (id: string, updates: Partial<ServiceRecord>) => void;
  deleteService: (id: string) => void;
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;
  addDocument: (doc: Omit<VehicleDocument, 'id'>) => void;
  updateDocument: (id: string, updates: Partial<VehicleDocument>) => void;
  deleteDocument: (id: string) => void;
  addReminder: (reminder: Omit<MaintenanceReminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<MaintenanceReminder>) => void;
  toggleReminderComplete: (id: string) => void;
  deleteReminder: (id: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'autocare360_demo_state_v1';

const defaultState: AppState = {
  isAuthenticated: false,
  user: INITIAL_USER,
  theme: 'light',
  notifications: INITIAL_NOTIFICATION_SETTINGS,
  vehicles: INITIAL_VEHICLES,
  services: INITIAL_SERVICES,
  expenses: INITIAL_EXPENSES,
  documents: INITIAL_DOCUMENTS,
  reminders: INITIAL_REMINDERS,
};

function loadInitialState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      user: parsed.user ?? INITIAL_USER,
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      notifications: parsed.notifications ?? INITIAL_NOTIFICATION_SETTINGS,
      vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : INITIAL_VEHICLES,
      services: Array.isArray(parsed.services) ? parsed.services : INITIAL_SERVICES,
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : INITIAL_EXPENSES,
      documents: Array.isArray(parsed.documents) ? parsed.documents : INITIAL_DOCUMENTS,
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : INITIAL_REMINDERS,
    };
  } catch {
    return defaultState;
  }
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadInitialState);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in demo mode
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.theme]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (
    title: string,
    variant: ToastMessage['variant'] = 'success',
    description?: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, variant, description }]);
    window.setTimeout(() => {
      dismissToast(id);
    }, 3600);
  };

  const login = (email: string, name?: string) => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user: {
        ...prev.user,
        email: email || prev.user.email,
        name: name?.trim() ? name.trim() : prev.user.name,
      },
    }));
    showToast('Signed in to AutoCare 360', 'success', 'Welcome to your garage workspace.');
  };

  const logout = () => {
    setState((prev) => ({ ...prev, isAuthenticated: false }));
    showToast('Signed out', 'info', 'Your demonstration data remains saved locally.');
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setState((prev) => ({ ...prev, user: { ...prev.user, ...updates } }));
    showToast('Profile updated', 'success');
  };

  const setTheme = (theme: ThemeMode) => {
    setState((prev) => ({ ...prev, theme }));
    showToast(
      theme === 'dark' ? 'Dark appearance enabled' : 'Light appearance enabled',
      'info'
    );
  };

  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    setState((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates },
    }));
    showToast('Notification preferences saved', 'success');
  };

  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const id = `veh-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      vehicles: [{ ...vehicle, id }, ...prev.vehicles],
    }));
    showToast('Vehicle added to My Garage', 'success', `${vehicle.brand} ${vehicle.model}`);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
    showToast('Vehicle details updated', 'success');
  };

  const deleteVehicle = (id: string) => {
    const target = state.vehicles.find((v) => v.id === id);
    setState((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
      services: prev.services.filter((s) => s.vehicleId !== id),
      expenses: prev.expenses.filter((e) => e.vehicleId !== id),
      documents: prev.documents.filter((d) => d.vehicleId !== id),
      reminders: prev.reminders.filter((r) => r.vehicleId !== id),
    }));
    showToast(
      'Vehicle removed',
      'info',
      target ? `${target.brand} ${target.model} and linked records deleted.` : undefined
    );
  };

  const addService = (service: Omit<ServiceRecord, 'id'>) => {
    const id = `srv-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      services: [{ ...service, id }, ...prev.services],
      vehicles: prev.vehicles.map((v) =>
        v.id === service.vehicleId
          ? {
              ...v,
              odometer: Math.max(v.odometer, service.odometer),
              lastServicedDate: service.date,
            }
          : v
      ),
    }));
    showToast('Service record logged', 'success', `${service.serviceType}`);
  };

  const updateService = (id: string, updates: Partial<ServiceRecord>) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    showToast('Service record updated', 'success');
  };

  const deleteService = (id: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
    showToast('Service record deleted', 'info');
  };

  const addExpense = (expense: Omit<ExpenseRecord, 'id'>) => {
    const id = `exp-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      expenses: [{ ...expense, id }, ...prev.expenses],
      vehicles: prev.vehicles.map((v) =>
        v.id === expense.vehicleId
          ? { ...v, odometer: Math.max(v.odometer, expense.odometer) }
          : v
      ),
    }));
    showToast('Expense recorded', 'success', `${expense.expenseType}`);
  };

  const updateExpense = (id: string, updates: Partial<ExpenseRecord>) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    showToast('Expense updated', 'success');
  };

  const deleteExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
    showToast('Expense deleted', 'info');
  };

  const addDocument = (doc: Omit<VehicleDocument, 'id'>) => {
    const id = `doc-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      documents: [{ ...doc, id }, ...prev.documents],
    }));
    showToast('Document saved to wallet', 'success', doc.documentType);
  };

  const updateDocument = (id: string, updates: Partial<VehicleDocument>) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
    showToast('Document updated', 'success');
  };

  const deleteDocument = (id: string) => {
    setState((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== id),
    }));
    showToast('Document removed', 'info');
  };

  const addReminder = (reminder: Omit<MaintenanceReminder, 'id'>) => {
    const id = `rem-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      reminders: [{ ...reminder, id }, ...prev.reminders],
    }));
    showToast('Reminder scheduled', 'success', reminder.title);
  };

  const updateReminder = (id: string, updates: Partial<MaintenanceReminder>) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
    showToast('Reminder updated', 'success');
  };

  const toggleReminderComplete = (id: string) => {
    const target = state.reminders.find((r) => r.id === id);
    const nextCompleted = target ? !target.completed : true;
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              completed: !r.completed,
              completedDate: !r.completed ? getTodayISO() : undefined,
            }
          : r
      ),
    }));
    showToast(
      nextCompleted ? 'Reminder marked completed' : 'Reminder reopened',
      nextCompleted ? 'success' : 'info'
    );
  };

  const deleteReminder = (id: string) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
    showToast('Reminder deleted', 'info');
  };

  const resetDemoData = () => {
    setState((prev) => ({
      ...defaultState,
      isAuthenticated: prev.isAuthenticated,
      theme: prev.theme,
    }));
    showToast('Demo data restored', 'success', 'Reset to Hyundai Creta & Tata Nexon defaults.');
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        toasts,
        globalSearch,
        setGlobalSearch,
        showToast,
        dismissToast,
        login,
        logout,
        updateUser,
        setTheme,
        updateNotifications,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addService,
        updateService,
        deleteService,
        addExpense,
        updateExpense,
        deleteExpense,
        addDocument,
        updateDocument,
        deleteDocument,
        addReminder,
        updateReminder,
        toggleReminderComplete,
        deleteReminder,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
