export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  registrationNumber: string;
  fuelType: FuelType;
  odometer: number;
  color?: string;
  imageUrl: string;
  insuranceProvider?: string;
  lastServicedDate?: string;
}

export type ServiceType =
  | 'General Servicing'
  | 'Engine Oil Change'
  | 'Brake Inspection & Pad Replacement'
  | 'Wheel Alignment & Balancing'
  | 'AC & Cabin Filter Service'
  | 'Battery & Electrical Check'
  | 'Tyre Replacement';

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  serviceType: ServiceType;
  serviceCentre: string;
  amount: number;
  odometer: number;
  description: string;
}

export type ExpenseType =
  | 'Fuel'
  | 'Maintenance'
  | 'Insurance'
  | 'Accessories'
  | 'Toll & Parking';

export interface ExpenseRecord {
  id: string;
  vehicleId: string;
  expenseType: ExpenseType;
  amount: number;
  date: string; // YYYY-MM-DD
  fuelQuantity?: number; // Litres or kWh
  odometer: number;
  description: string;
}

export type DocumentType =
  | 'Registration Certificate (RC)'
  | 'Insurance'
  | 'Pollution Under Control (PUC)'
  | 'Driving Licence';

export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface VehicleDocument {
  id: string;
  vehicleId: string | 'owner';
  documentType: DocumentType;
  documentNumber: string;
  issuer: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  filePreviewUrl?: string;
  notes?: string;
}

export type ReminderCategory =
  | 'General servicing'
  | 'Engine oil change'
  | 'Insurance renewal'
  | 'PUC renewal'
  | 'Tyre inspection'
  | 'Battery replacement';

export type ReminderStatus = 'Upcoming' | 'Overdue' | 'Completed';

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  category: ReminderCategory;
  title: string;
  dueDate: string; // YYYY-MM-DD
  targetOdometer?: number;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  avatarUrl: string;
}

export interface NotificationSettings {
  serviceAlerts: boolean;
  documentExpiryAlerts: boolean;
  monthlyExpenseDigest: boolean;
  overdueReminderAlerts: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}
