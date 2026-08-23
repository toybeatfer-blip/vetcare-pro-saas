export type SpeciesType = 'Perro' | 'Gato' | 'Ave' | 'Conejo' | 'Reptil' | 'Otro';
export type GenderType = 'Macho' | 'Hembra';
export type AppointmentStatus = 'Pendiente' | 'Confirmada' | 'En curso' | 'Completada' | 'Cancelada';
export type AppointmentReason = 
  | 'Consulta General'
  | 'Vacunación'
  | 'Desparasitación'
  | 'Cirugía'
  | 'Control Post-quirúrgico'
  | 'Urgencia'
  | 'Estética/Peluquería'
  | 'Exámenes de Laboratorio';

export type VaccineStatus = 'al_dia' | 'vigente' | 'proxima' | 'vencida' | 'programada';
export type VaccineType = 'Vacuna' | 'Desparasitación Interna' | 'Desparasitación Externa' | 'vacuna' | 'desparasitante_interno' | 'desparasitante_externo';

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  documentId: string;
}

export type StudyType = 
  | 'Radiografía Digital'
  | 'Ultrasonido Abdominal'
  | 'Ecocardiograma'
  | 'Tomografía (TAC)'
  | 'Resonancia Magnética'
  | 'Endoscopía'
  | 'Foto Dermatológica'
  | 'Otro Estudio';

export interface DiagnosticImage {
  id: string;
  petId: string;
  type: StudyType;
  title: string;
  region: string;
  date: string;
  fileUrl: string;
  fileName: string;
  fileFormat: 'DCM' | 'DICOM' | 'JPG' | 'PNG' | 'WEBP' | 'PDF' | 'MP4' | 'OTRO';
  fileSize?: string;
  findings: string;
  conclusion?: string;
  veterinarianName: string;
  uploadedAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: SpeciesType;
  breed: string;
  birthDate: string; // YYYY-MM-DD
  ageDisplay: string;
  gender: GenderType;
  isNeutered: boolean;
  weightKg: number;
  microchipNumber?: string;
  photoUrl?: string;
  allergies: string[];
  chronicConditions: string[];
  bloodType?: string;
  owner: Owner;
  registeredAt: string;
  notes?: string;
  color?: string;
  diagnosticImages?: DiagnosticImage[];
}

export interface VitalSigns {
  temperatureC: number;
  heartRateBpm: number;
  respRateBpm: number;
  weightKg: number;
  bodyConditionScore: 1 | 2 | 3 | 4 | 5; // 1: Muy delgado, 3: Ideal, 5: Obeso
  capillaryRefillTimeSec: number;
  mucosaColor: 'Rosa' | 'Pálida' | 'Cianótica' | 'Ictérica' | 'Congestiva';
}

export interface Prescription {
  id: string;
  medication: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface LabTest {
  id: string;
  name: string;
  date: string;
  status: 'Pendiente' | 'Completado' | 'En proceso';
  resultsSummary?: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  time: string;
  reason: string;
  anamnesis: string;
  vitalSigns: VitalSigns;
  diagnosis: string;
  treatmentPlan: string;
  prescriptions: Prescription[];
  labTests: LabTest[];
  veterinarianName: string;
  notes?: string;
  nextFollowUpDate?: string;
  printableSummary?: string;
}

export interface VaccineRecord {
  id: string;
  petId: string;
  vaccineName: string;
  type: VaccineType;
  brand: string;
  lotNumber: string;
  applicationDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: VaccineStatus;
  veterinarianName: string;
  notes?: string;
  isBoosterRequired?: boolean;
}

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  species: SpeciesType;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason: AppointmentReason;
  status: AppointmentStatus;
  veterinarianName: string;
  notes?: string;
  createdAt: string;
}

export type DischargeType =
  | 'Alta Médica Definitiva'
  | 'Alta Ambulatoria con Tratamiento'
  | 'Alta Post-Quirúrgica'
  | 'Alta por Mejoría Clínica';

export interface MedicalDischargeSummary {
  id: string;
  petId: string;
  petName: string;
  species: SpeciesType;
  breed?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  dischargeDate: string; // YYYY-MM-DD
  dischargeTime: string; // HH:mm
  diagnosis: string;
  procedurePerformed?: string;
  dischargeStatus: DischargeType;
  homeCareInstructions: string;
  alarmSigns?: string;
  prescriptions: Prescription[];
  nextFollowUpDate?: string;
  veterinarianName: string;
  veterinarianLicense?: string;
  notes?: string;
  createdAt: string;
}

export interface SupplierInfo {
  name: string;
  phone: string;
  email?: string;
  contactPerson?: string;
  address?: string;
}

export type MedicationCategory =
  | 'Antibiótico'
  | 'Antiinflamatorio/Analgésico'
  | 'Antiparasitario'
  | 'Dermatológico'
  | 'Anestesia/Sedación'
  | 'Sueros/Fluidos'
  | 'Biológico/Vacuna'
  | 'Gastrointestinal'
  | 'Cardiológico'
  | 'Nutricional/Suplemento'
  | 'Otro';

export type UnitType =
  | 'comprimidos'
  | 'frascos'
  | 'viales'
  | 'ampollas'
  | 'pipetas'
  | 'bolsas'
  | 'cajas'
  | 'ml'
  | 'tubos';

export interface MedicationItem {
  id: string;
  name: string; // e.g., "Amoxicilina + Ác. Clavulánico 500mg"
  genericName: string; // e.g., "Amoxicilina / Clavulanato"
  category: MedicationCategory;
  presentation: string; // e.g., "Caja x 20 comprimidos"
  quantity: number; // Current available stock
  unit: UnitType;
  minStockThreshold: number; // Alert threshold when stock <= this number
  expirationDate: string; // YYYY-MM-DD
  batchNumber: string; // Lote
  supplier: SupplierInfo;
  costPrice: number; // Purchase cost per unit in MXN
  salePrice: number; // Sale price to client in MXN
  location: string; // e.g., "Estante A-2", "Refrigerador 4°C", "Armario Controlados"
  requiresPrescription: boolean;
  notes?: string;
  lastRestockedAt?: string; // YYYY-MM-DD
}

export type StockMovementType = 'in' | 'out' | 'adjustment' | 'expired_waste';

export interface StockMovement {
  id: string;
  medicationId: string;
  medicationName: string;
  type: StockMovementType;
  quantityChange: number; // positive for 'in', negative for 'out'
  previousStock: number;
  newStock: number;
  reason: string;
  referencePatient?: string;
  performedBy: string;
  date: string; // YYYY-MM-DD HH:mm
}

export type ProductCategory =
  | 'Alimento Seco / Croquetas'
  | 'Alimento Húmedo / Latas'
  | 'Dietas de Prescripción'
  | 'Premios & Snacks'
  | 'Collares, Correas & Pecheras'
  | 'Juguetes & Rascadores'
  | 'Camas, Casas & Transportadoras'
  | 'Higiene, Champú & Estética'
  | 'Arenas & Bandejas Sanitarias'
  | 'Farmacia & Medicamentos'
  | 'Suplementos & Vitaminas'
  | 'Otro Accesorio';

export type ProductPresentation =
  | 'Bolsa 20 kg'
  | 'Bolsa 15 kg'
  | 'Bolsa 7.5 kg'
  | 'Bolsa 2 kg'
  | 'Bolsa 1 kg'
  | 'Lata 370 g'
  | 'Pouch / Sobre 85 g'
  | 'Pieza / Unidad'
  | 'Talla CH (Chica)'
  | 'Talla M (Mediana)'
  | 'Talla G (Grande)'
  | 'Talla XG (Extra Grande)'
  | 'Frasco'
  | 'Caja'
  | 'Blíster'
  | 'Litro / Mililitros'
  | 'A granel / Kilo'
  | 'Otro Formato';

export type WarehouseLocation =
  | 'Tienda / Mostrador Pet Shop'
  | 'Bodega Central / Almacén General'
  | 'Farmacia / Consultorio 1'
  | 'Hospitalización / Quirófano'
  | 'Área de Estética & Baño';

export interface PetShopProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  presentation: ProductPresentation | string;
  warehouse: WarehouseLocation | string;
  costPrice: number; // Precio de compra al proveedor ($ MXN)
  salePrice: number; // Precio de venta al público ($ MXN)
  stockQuantity: number;
  minStockAlert: number;
  supplierName?: string;
  supplierPhone?: string;
  expirationDate?: string;
  notes?: string;
  lastUpdated?: string;
}

export type SaleItemType = 'product' | 'consultation' | 'vaccine' | 'procedure';

export interface SaleItem {
  productId?: string;
  productName: string;
  presentation: string;
  warehouse: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  itemType?: SaleItemType;
  petId?: string;
  petName?: string;
  referenceRecordId?: string;
  referenceVaccineId?: string;
}

export interface PetShopSaleReceipt {
  id: string;
  ticketNumber: string;
  date: string;
  time: string;
  tutorName: string;
  tutorPhone: string;
  tutorEmail?: string;
  petName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Efectivo' | 'Tarjeta de Débito/Crédito' | 'Transferencia SPEI' | 'Mercado Pago / Clip';
  warehouse: string;
  attendantName: string;
  shiftId?: string; // Id del turno de caja activo
  notes?: string;
  createdAt: string;
}

export type CashShiftStatus = 'open' | 'closed';

export interface CashMovement {
  id: string;
  shiftId: string;
  type: 'in' | 'out'; // 'in' = entrada extra / fondo, 'out' = retiro / gasto menor
  amount: number;
  reason: string;
  performedBy: string;
  timestamp: string;
}

export interface CashRegisterShift {
  id: string;
  shiftFolio: string; // e.g. "TURNO-20260822-001"
  status: CashShiftStatus;
  openedAt: string; // YYYY-MM-DD HH:mm:ss
  openedBy: string; // Cajero / Usuario
  initialCashFloat: number; // Fondo inicial de caja
  closedAt?: string;
  closedBy?: string;
  
  // Computed totals during or at closure of shift
  cashSalesTotal: number; // Total ventas en efectivo
  cardSalesTotal: number; // Total ventas con tarjeta
  transferSalesTotal: number; // Total ventas por transferencia SPEI
  otherSalesTotal: number; // Otros métodos (Clip / Mercado Pago)
  
  cashInsTotal: number; // Entradas manuales de efectivo
  cashOutsTotal: number; // Retiros manuales de efectivo
  
  expectedCashInDrawer: number; // initialCashFloat + cashSalesTotal + cashInsTotal - cashOutsTotal
  actualCashInDrawer?: number; // Efectivo real contado en el arqueo
  cashDifference?: number; // actual - expected (0 = exacto, >0 sobrante, <0 faltante)
  
  totalSalesAmount: number; // Total general vendido en el turno
  salesCount: number; // Cantidad de tickets emitidos
  salesReceiptIds: string[]; // Folios o IDs de las ventas de este turno
  
  salesBreakdown: {
    petshopAmount: number; // Alimentos, accesorios e higiene
    consultationsAmount: number; // Consultas médicas
    vaccinesAmount: number; // Vacunas y desparasitaciones
  };

  notes?: string;
  movements: CashMovement[];
}

export interface ReminderNotification {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  type: 'Vacuna' | 'Desparasitante' | 'Cita' | 'Tratamiento';
  title: string;
  message: string;
  channel: 'WhatsApp' | 'Email' | 'SMS';
  dueDate: string;
  sentDate?: string;
  status: 'Pendiente' | 'Enviado';
}

export interface ClinicSettings {
  name: string; // e.g. "Hospital Veterinario San Ángel"
  slogan: string; // e.g. "Clínica & Hospital Veterinario de Especialidades"
  logoUrl?: string; // Custom logo image URL or Base64 data URL
  logoText?: string; // Custom monogram / short initials (e.g. "VET", "PET", "SAN")
  logoEmoji?: string; // Custom emoji / icon (e.g. "🐾", "🐕", "🐱", "🏥", "⚕️", "🩺")
  brandColor?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'blue' | 'rose' | 'teal' | 'cyan'; // Brand color theme
  address: string; // e.g. "Av. Revolución 1420, Col. San Ángel, CDMX"
  phone: string; // e.g. "+52 55 4912 8301"
  emergencyPhone: string; // e.g. "+52 55 4912 8301"
  email: string; // e.g. "contacto@mi-veterinaria.com"
  website: string; // e.g. "www.mi-veterinaria.com"
  directorName: string; // e.g. "Dra. Valeria Hernández M."
  directorLicense: string; // e.g. "8491203-VET"
  directorSpecialty: string; // e.g. "Cirugía y Medicina Interna de Pequeñas Especies"
  taxId: string; // e.g. "VET-980415-MX"
  openingHoursWeekday: string; // e.g. "08:00 - 20:00 hrs"
  openingHoursWeekend: string; // e.g. "09:00 - 18:00 hrs (Urgencias 24/7)"
  currency: string; // e.g. "MXN"
  vatRate: number; // e.g. 16
  consultationPrice?: number; // Precio consulta general en POS (e.g. 450)
  emergencyConsultationPrice?: number; // Precio consulta de urgencia (e.g. 750)
  standardVaccinePrice?: number; // Precio estándar vacuna (e.g. 380)
  dewormingPrice?: number; // Precio desparasitación (e.g. 220)
  prescriptionFooter?: string;
}

export type UserRole = 'admin' | 'encargado' | 'superuser';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  email: string;
  avatarUrl?: string;
  canAccessSettings: boolean;
  isPermanent?: boolean;
  isSuperUser?: boolean;
}

export interface UserAccountWithCredentials extends UserAccount {
  passwordHash: string;
}

export type LicensePlan = 'mensual' | 'anual';
export type LicenseStatus = 'active' | 'grace_period' | 'expired' | 'locked';

export interface SystemLicense {
  plan: LicensePlan;
  status: LicenseStatus;
  licenseKey: string;
  serialNumber: string;
  issuedTo: string;
  startDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  lastPaymentDate: string; // YYYY-MM-DD
  priceAmount: number;
  currency: string;
  autoRenew: boolean;
  isLocked: boolean;
  lockReason?: string;
  graceDaysAllowed: number;
}

export interface TenantCredentials {
  username: string;
  password: string;
  name: string;
  email?: string;
  updatedAt?: string;
}

export interface VerifiedTimeCertificate {
  isOnline: boolean;
  timestampIso: string;
  verifiedDate: string;
  formattedDateLong: string;
  verifiedTime: string;
  formattedTime12h: string;
  timezone: string;
  serverSource: string;
  pingLatencyMs: number;
  driftSeconds: number;
  isTampered: boolean;
  signature: string;
}

export interface TenantClinic {
  id: string;
  clinicName: string;
  slogan?: string;
  directorName: string;
  email: string;
  phone: string;
  city: string;
  plan: LicensePlan;
  priceAmount: number;
  currency: string;
  startDate: string;
  expirationDate: string;
  lastPaymentDate: string;
  status: LicenseStatus;
  isLocked: boolean;
  lockReason?: string;
  licenseKey: string;
  serialNumber: string;
  patientsCount: number;
  notes?: string;
  createdAt: string;
  adminCredentials?: TenantCredentials;
  encargadoCredentials?: TenantCredentials;
}

export type ActiveTab =
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'records'
  | 'vaccines'
  | 'inventory'
  | 'petshop'
  | 'copilot'
  | 'portal'
  | 'master_tenants';
export type ViewMode = 'admin' | 'tutor' | 'android';

export interface RegisterClinicData {
  clinicName: string;
  directorName: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  password: string;
}

export interface PaymentRenewalRequest {
  id: string;
  tenantId?: string;
  clinicName: string;
  directorName: string;
  email: string;
  phone: string;
  plan: LicensePlan;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'spei' | 'oxxo';
  referenceFolio: string;
  paymentDate: string; // YYYY-MM-DD HH:mm:ss
  status: 'pending' | 'approved' | 'rejected';
  notifiedToSuperUser: boolean;
  superUserEmail: string;
  approvedAt?: string;
  notes?: string;
}

export interface MasterBillingSettings {
  bankName: string;
  clabe: string;
  accountHolder: string;
  oxxoReference: string;
  ownerEmail: string;
  supportPhone: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  instructionsNotes?: string;
  updatedAt?: string;
}

export interface SessionSaveAudit {
  id: string;
  savedAt: string;
  savedBy: string;
  userRole: UserRole;
  clinicName: string;
  tenantId?: string;
  counts: {
    patients: number;
    records: number;
    vaccines: number;
    appointments: number;
    inventoryItems: number;
    petshopProducts: number;
    salesReceipts: number;
    discharges: number;
  };
  status: 'synced_local' | 'synced_cloud';
}

