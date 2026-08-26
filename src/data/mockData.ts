import {
  Pet,
  MedicalRecord,
  VaccineRecord,
  Appointment,
  MedicationItem,
  StockMovement,
  UserAccount,
  SystemLicense,
  TenantClinic,
  MasterBillingSettings,
  PetShopProduct,
  PetShopSaleReceipt,
  ClinicSettings,
} from '../types';

export const INITIAL_PETS: Pet[] = [];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [];

export const INITIAL_VACCINES: VaccineRecord[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_MEDICATIONS: MedicationItem[] = [];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export const INITIAL_CLINIC_SETTINGS: ClinicSettings = {
  name: 'Mi Clínica Veterinaria',
  slogan: 'Control Clínico, Citas, Farmacia & App Android',
  logoUrl: '',
  logoText: 'VET',
  logoEmoji: '🐾',
  brandColor: 'indigo',
  address: '',
  phone: '',
  emergencyPhone: '',
  email: '',
  website: '',
  directorName: '',
  directorLicense: '',
  directorSpecialty: '',
  taxId: '',
  openingHoursWeekday: 'Lunes a Viernes: 09:00 - 19:00 hrs',
  openingHoursWeekend: 'Sábados: 09:00 - 14:00 hrs',
  currency: 'MXN ($)',
  vatRate: 16,
  prescriptionFooter: 'En caso de dudas o urgencias médicas, comuníquese de inmediato a los teléfonos de la clínica.'
};

export const INITIAL_SUPERUSER_ACCOUNT: (UserAccount & { passwordHash: string }) = {
  id: 'user-super-creator-master',
  username: 'Fernando01',
  passwordHash: 'Bazzoka1313AS.',
  name: 'Fernando (Super Admin Master)',
  role: 'superuser',
  roleTitle: 'Creador & Administrador Global del Software',
  email: 'toybeatfer@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  canAccessSettings: true,
  isPermanent: true,
  isSuperUser: true,
};

export const INITIAL_USER_ACCOUNTS: (UserAccount & { passwordHash: string })[] = [
  {
    id: 'user-admin-1',
    username: 'admin',
    passwordHash: 'admin123',
    name: 'Médico Administrador',
    role: 'admin',
    roleTitle: 'Administrador General',
    email: 'admin@clinica.com',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    canAccessSettings: true,
    isPermanent: true,
  },
  {
    id: 'user-encargado-1',
    username: 'encargado',
    passwordHash: 'encargado123',
    name: 'Encargado de Recepción',
    role: 'encargado',
    roleTitle: 'Recepción y Caja',
    email: 'recepcion@clinica.com',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
    canAccessSettings: false,
    isPermanent: false,
  },
];

export const INITIAL_SYSTEM_LICENSE: SystemLicense = {
  plan: 'mensual',
  status: 'active',
  licenseKey: 'VET-MENS-8942-7719-2026',
  serialNumber: 'LIC-VET-980415-PRO-2026',
  issuedTo: 'Clínica Veterinaria',
  startDate: '2026-08-01',
  expirationDate: '2026-12-31',
  lastPaymentDate: '2026-08-01',
  priceAmount: 599,
  currency: 'MXN',
  autoRenew: true,
  isLocked: false,
  graceDaysAllowed: 5,
};

export const INITIAL_TENANTS: TenantClinic[] = [];

export const INITIAL_MASTER_BILLING_SETTINGS: MasterBillingSettings = {
  bankName: 'BBVA México',
  clabe: '012180001234567890',
  accountHolder: 'VetCare Pro SaaS (Fernando)',
  oxxoReference: '4152 3138 9012 3456',
  ownerEmail: 'super.admin@vetcare.master.com',
  supportPhone: '+52 81 8300 0000',
  monthlyPrice: 599,
  annualPrice: 5990,
  currency: 'MXN',
  instructionsNotes: 'Realiza tu transferencia SPEI con tu número de folio como concepto de pago. Tu activación se completará en menos de 24 horas.',
  updatedAt: '2026-08-25',
};

export const INITIAL_PETSHOP_PRODUCTS: PetShopProduct[] = [];

export const INITIAL_PETSHOP_SALES: PetShopSaleReceipt[] = [];
