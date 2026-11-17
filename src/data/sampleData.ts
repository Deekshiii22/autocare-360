import {
  ExpenseRecord,
  MaintenanceReminder,
  NotificationSettings,
  ServiceRecord,
  UserProfile,
  Vehicle,
  VehicleDocument,
} from '../types';

export const IMAGE_ASSETS = {
  creta: '/src/assets/images/car_hyundai_creta_1794910640748.jpg',
  nexon: '/src/assets/images/car_tata_nexon_1794910640827.jpg',
  sedan: '/src/assets/images/car_default_sedan_1794910642038.jpg',
  loginHero: '/src/assets/images/login_garage_hero_1794910642207.jpg',
  avatar: '/src/assets/images/avatar_car_owner_1794910643303.jpg',
};

function offsetDateISO(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function monthOffsetDateISO(monthsAgo: number, dayOfMonth: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(dayOfMonth, maxDay));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const INITIAL_USER: UserProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@autocare-demo.in',
  phone: '+91 98450 23190',
  city: 'Bengaluru, Karnataka',
  avatarUrl: IMAGE_ASSETS.avatar,
};

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSettings = {
  serviceAlerts: true,
  documentExpiryAlerts: true,
  monthlyExpenseDigest: false,
  overdueReminderAlerts: true,
};

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-creta-2022',
    brand: 'Hyundai',
    model: 'Creta',
    variant: 'SX 1.5 Petrol IVT',
    year: 2022,
    registrationNumber: 'KA 03 AB 1234',
    fuelType: 'Petrol',
    odometer: 28500,
    color: 'Pearl White',
    imageUrl: IMAGE_ASSETS.creta,
    insuranceProvider: 'HDFC ERGO General Insurance',
    lastServicedDate: monthOffsetDateISO(1, 14),
  },
  {
    id: 'veh-nexon-2023',
    brand: 'Tata',
    model: 'Nexon',
    variant: 'XZ+ (S) 1.5 Diesel',
    year: 2023,
    registrationNumber: 'KA 05 CD 5678',
    fuelType: 'Diesel',
    odometer: 19200,
    color: 'Daytona Slate',
    imageUrl: IMAGE_ASSETS.nexon,
    insuranceProvider: 'ICICI Lombard Motor Shield',
    lastServicedDate: monthOffsetDateISO(0, 6),
  },
];

export const INITIAL_SERVICES: ServiceRecord[] = [
  {
    id: 'srv-101',
    vehicleId: 'veh-nexon-2023',
    date: monthOffsetDateISO(0, 6),
    serviceType: 'General Servicing',
    serviceCentre: 'Prerana Motors Tata Authorized Centre, Indiranagar',
    amount: 6450,
    odometer: 18950,
    description:
      '20,000 km scheduled inspection, synthetic oil top-up, air filter cleaning, and DEF fluid refill.',
  },
  {
    id: 'srv-102',
    vehicleId: 'veh-creta-2022',
    date: monthOffsetDateISO(1, 14),
    serviceType: 'Brake Inspection & Pad Replacement',
    serviceCentre: 'Advaith Hyundai Service Hub, Whitefield',
    amount: 5200,
    odometer: 27840,
    description:
      'Replaced front disc brake pads, bled brake fluid line, and cleaned rear drum assemblies.',
  },
  {
    id: 'srv-103',
    vehicleId: 'veh-creta-2022',
    date: monthOffsetDateISO(2, 22),
    serviceType: 'Wheel Alignment & Balancing',
    serviceCentre: 'Madhus Tyre Care, Langford Road',
    amount: 1850,
    odometer: 26900,
    description:
      '4-wheel laser alignment, nitrogen top-up across all 5 tyres, and front-to-rear tyre rotation.',
  },
  {
    id: 'srv-104',
    vehicleId: 'veh-nexon-2023',
    date: monthOffsetDateISO(3, 18),
    serviceType: 'AC & Cabin Filter Service',
    serviceCentre: 'Prerana Motors Tata Authorized Centre, Indiranagar',
    amount: 2900,
    odometer: 16400,
    description:
      'Replaced HEPA cabin air filter, disinfected evaporator vents, and checked refrigerant pressure.',
  },
  {
    id: 'srv-105',
    vehicleId: 'veh-creta-2022',
    date: monthOffsetDateISO(4, 10),
    serviceType: 'Engine Oil Change',
    serviceCentre: 'Advaith Hyundai Service Hub, Whitefield',
    amount: 4750,
    odometer: 24500,
    description:
      'Full 5W-30 fully synthetic engine oil replacement, OEM oil filter, and underbody fastener torque check.',
  },
  {
    id: 'srv-106',
    vehicleId: 'veh-nexon-2023',
    date: monthOffsetDateISO(5, 19),
    serviceType: 'Battery & Electrical Check',
    serviceCentre: 'Amaron Pitstop, Koramangala',
    amount: 950,
    odometer: 14100,
    description:
      'Load-tested 12V AGM battery (94% state of health), cleaned terminals, and calibrated headlamp aim.',
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  // Current month (month 0)
  {
    id: 'exp-201',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Fuel',
    amount: 3980,
    date: monthOffsetDateISO(0, 12),
    fuelQuantity: 38.6,
    odometer: 28480,
    description: 'Shell V-Power Unleaded full tank refill, Outer Ring Road',
  },
  {
    id: 'exp-202',
    vehicleId: 'veh-nexon-2023',
    expenseType: 'Maintenance',
    amount: 6450,
    date: monthOffsetDateISO(0, 6),
    odometer: 18950,
    description: '20,000 km scheduled inspection & DEF refill at Prerana Motors',
  },
  {
    id: 'exp-203',
    vehicleId: 'veh-nexon-2023',
    expenseType: 'Fuel',
    amount: 3120,
    date: monthOffsetDateISO(0, 4),
    fuelQuantity: 35.4,
    odometer: 18820,
    description: 'IndianOil XtraGreen Diesel refill, Koramangala',
  },
  {
    id: 'exp-204',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Toll & Parking',
    amount: 850,
    date: monthOffsetDateISO(0, 2),
    odometer: 28190,
    description: 'FASTag highway recharge & airport expressway parking',
  },
  // 1 month ago
  {
    id: 'exp-205',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Maintenance',
    amount: 5200,
    date: monthOffsetDateISO(1, 14),
    odometer: 27840,
    description: 'Front brake pad replacement at Advaith Hyundai',
  },
  {
    id: 'exp-206',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Fuel',
    amount: 4120,
    date: monthOffsetDateISO(1, 20),
    fuelQuantity: 40.0,
    odometer: 28010,
    description: 'BPCL Speed Petrol refill, Indiranagar',
  },
  {
    id: 'exp-207',
    vehicleId: 'veh-nexon-2023',
    expenseType: 'Fuel',
    amount: 2980,
    date: monthOffsetDateISO(1, 9),
    fuelQuantity: 33.8,
    odometer: 18210,
    description: 'HPCL Turbojet Diesel highway refill',
  },
  // 2 months ago
  {
    id: 'exp-208',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Maintenance',
    amount: 1850,
    date: monthOffsetDateISO(2, 22),
    odometer: 26900,
    description: 'Laser wheel alignment & tyre rotation',
  },
  {
    id: 'exp-209',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Fuel',
    amount: 3890,
    date: monthOffsetDateISO(2, 11),
    fuelQuantity: 37.8,
    odometer: 26650,
    description: 'Shell Unleaded city refill',
  },
  {
    id: 'exp-210',
    vehicleId: 'veh-nexon-2023',
    expenseType: 'Accessories',
    amount: 2450,
    date: monthOffsetDateISO(2, 5),
    odometer: 17520,
    description: '70mai dual-channel dashcam hardwire kit & 3D floor mats',
  },
  // 3 months ago
  {
    id: 'exp-211',
    vehicleId: 'veh-nexon-2023',
    expenseType: 'Maintenance',
    amount: 2900,
    date: monthOffsetDateISO(3, 18),
    odometer: 16400,
    description: 'Cabin HEPA filter & AC sanitization',
  },
  {
    id: 'exp-212',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Fuel',
    amount: 4250,
    date: monthOffsetDateISO(3, 14),
    fuelQuantity: 41.2,
    odometer: 25890,
    description: 'Full tank petrol before Mysuru weekend trip',
  },
  // 4 months ago
  {
    id: 'exp-213',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Maintenance',
    amount: 4750,
    date: monthOffsetDateISO(4, 10),
    odometer: 24500,
    description: 'Engine oil & OEM oil filter replacement',
  },
  {
    id: 'exp-214',
    vehicleId: 'veh-nexon-2023',
    expenseType: 'Fuel',
    amount: 3340,
    date: monthOffsetDateISO(4, 16),
    fuelQuantity: 37.9,
    odometer: 15450,
    description: 'Full tank diesel refill, Electronic City',
  },
  // 5 months ago
  {
    id: 'exp-215',
    vehicleId: 'veh-nexon-2023',
    expenseType: 'Insurance',
    amount: 14200,
    date: monthOffsetDateISO(5, 12),
    odometer: 14050,
    description: 'Zero-depreciation comprehensive policy annual renewal',
  },
  {
    id: 'exp-216',
    vehicleId: 'veh-creta-2022',
    expenseType: 'Fuel',
    amount: 3720,
    date: monthOffsetDateISO(5, 21),
    fuelQuantity: 36.1,
    odometer: 23800,
    description: 'IOCL XP95 Petrol refill',
  },
];

export const INITIAL_DOCUMENTS: VehicleDocument[] = [
  {
    id: 'doc-301',
    vehicleId: 'veh-creta-2022',
    documentType: 'Registration Certificate (RC)',
    documentNumber: 'KA03-RC-2022-884910',
    issuer: 'RTO Bengaluru East (Indiranagar)',
    issueDate: '2022-04-18',
    expiryDate: '2037-04-17',
    fileName: 'Creta_SmartCard_RC.pdf',
    fileSize: '412 KB',
    fileType: 'application/pdf',
    notes: 'Hypothecation cleared · Smart card verified via Vahan.',
  },
  {
    id: 'doc-302',
    vehicleId: 'veh-creta-2022',
    documentType: 'Insurance',
    documentNumber: 'HDFC-MOT-99201485',
    issuer: 'HDFC ERGO General Insurance',
    issueDate: offsetDateISO(-345),
    expiryDate: offsetDateISO(18), // Expiring Soon!
    fileName: 'Creta_Comprehensive_Policy.pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    notes: 'Zero Depreciation + Engine Protect + Roadside Assistance.',
  },
  {
    id: 'doc-303',
    vehicleId: 'veh-creta-2022',
    documentType: 'Pollution Under Control (PUC)',
    documentNumber: 'KA-PUC-03-774129',
    issuer: 'Karnataka Emission Testing Centre #14',
    issueDate: offsetDateISO(-195),
    expiryDate: offsetDateISO(-11), // Expired!
    notes: '6-month BS-VI petrol emission certificate. Renewal required.',
  },
  {
    id: 'doc-304',
    vehicleId: 'veh-nexon-2023',
    documentType: 'Registration Certificate (RC)',
    documentNumber: 'KA05-RC-2023-449021',
    issuer: 'RTO Bengaluru South (Jayanagar)',
    issueDate: '2023-06-09',
    expiryDate: '2038-06-08',
    fileName: 'Nexon_RC_Extract.pdf',
    fileSize: '380 KB',
    fileType: 'application/pdf',
    notes: 'Primary owner registration verified.',
  },
  {
    id: 'doc-305',
    vehicleId: 'veh-nexon-2023',
    documentType: 'Insurance',
    documentNumber: 'ICICI-3001-71829304',
    issuer: 'ICICI Lombard Motor Insurance',
    issueDate: monthOffsetDateISO(5, 12),
    expiryDate: offsetDateISO(210),
    fileName: 'Nexon_ZeroDep_Policy.pdf',
    fileSize: '980 KB',
    fileType: 'application/pdf',
    notes: 'IDV ₹11,40,000 · Cashless network coverage.',
  },
  {
    id: 'doc-306',
    vehicleId: 'veh-nexon-2023',
    documentType: 'Pollution Under Control (PUC)',
    documentNumber: 'KA-PUC-05-610943',
    issuer: 'GreenCheck Emission Station, HSR Layout',
    issueDate: offsetDateISO(-60),
    expiryDate: offsetDateISO(120),
    notes: 'Valid BS-VI diesel smoke density within threshold.',
  },
  {
    id: 'doc-307',
    vehicleId: 'owner',
    documentType: 'Driving Licence',
    documentNumber: 'KA03-20160048291',
    issuer: 'Transport Department, Govt. of Karnataka',
    issueDate: '2016-08-22',
    expiryDate: '2036-08-21',
    fileName: 'DL_Aarav_Sharma_LMV.pdf',
    fileSize: '295 KB',
    fileType: 'application/pdf',
    notes: 'LMV-NT & MCWG authorized · Digital DigiLocker copy linked.',
  },
];

export const INITIAL_REMINDERS: MaintenanceReminder[] = [
  {
    id: 'rem-401',
    vehicleId: 'veh-creta-2022',
    category: 'PUC renewal',
    title: 'Renew Creta BS-VI PUC Certificate',
    dueDate: offsetDateISO(-6), // Overdue
    notes: 'Nearest authorized testing station on 100ft Road, Indiranagar.',
    completed: false,
  },
  {
    id: 'rem-402',
    vehicleId: 'veh-creta-2022',
    category: 'Insurance renewal',
    title: 'Renew Comprehensive Motor Insurance',
    dueDate: offsetDateISO(14), // Upcoming
    notes: 'Compare NCB retention quotes from HDFC ERGO & Tata AIG.',
    completed: false,
  },
  {
    id: 'rem-403',
    vehicleId: 'veh-creta-2022',
    category: 'General servicing',
    title: '30,000 km Major Periodic Service',
    dueDate: offsetDateISO(28),
    targetOdometer: 30000,
    notes: 'Include spark plug inspection, coolant flush, and throttle body cleaning.',
    completed: false,
  },
  {
    id: 'rem-404',
    vehicleId: 'veh-nexon-2023',
    category: 'Tyre inspection',
    title: 'Tyre Tread Depth & Rotation Check',
    dueDate: offsetDateISO(9),
    targetOdometer: 20000,
    notes: 'Check spare tyre pressure and rebalance front alloys.',
    completed: false,
  },
  {
    id: 'rem-405',
    vehicleId: 'veh-nexon-2023',
    category: 'Battery replacement',
    title: 'Check Cold-Cranking Battery Voltage',
    dueDate: offsetDateISO(45),
    notes: 'Monitor 12V battery health before winter mornings.',
    completed: false,
  },
  {
    id: 'rem-406',
    vehicleId: 'veh-nexon-2023',
    category: 'Engine oil change',
    title: '20,000 km Synthetic Diesel Oil Top-Up',
    dueDate: monthOffsetDateISO(0, 6),
    targetOdometer: 19000,
    completed: true,
    completedDate: monthOffsetDateISO(0, 6),
    notes: 'Completed at Prerana Motors along with DEF refill.',
  },
  {
    id: 'rem-407',
    vehicleId: 'veh-creta-2022',
    category: 'Tyre inspection',
    title: 'Front Brake Pad & Rotor Thickness Check',
    dueDate: monthOffsetDateISO(1, 14),
    targetOdometer: 27800,
    completed: true,
    completedDate: monthOffsetDateISO(1, 14),
    notes: 'Pads replaced at 27,840 km.',
  },
];
