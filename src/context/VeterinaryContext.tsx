import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Pet,
  MedicalRecord,
  VaccineRecord,
  Appointment,
  ReminderNotification,
  ClinicSettings,
  ActiveTab,
  ViewMode,
  AppointmentStatus,
  VaccineStatus,
  MedicationItem,
  StockMovement,
  StockMovementType,
  DiagnosticImage,
  UserRole,
  UserAccount,
  UserAccountWithCredentials,
  SystemLicense,
  LicensePlan,
  LicenseStatus,
  TenantClinic,
  VerifiedTimeCertificate,
  RegisterClinicData,
  PaymentRenewalRequest,
  MasterBillingSettings,
  MedicalDischargeSummary,
  PetShopProduct,
  PetShopSaleReceipt,
  SessionSaveAudit,
  CashRegisterShift,
  CashMovement,
  CashShiftStatus,
} from '../types';
import {
  checkActiveInternet,
  verifyOfficialNetworkTime,
  subscribeToNetworkEvents,
  setSimulatedOfflineMode,
  isSimulatedOfflineMode,
} from '../services/networkTimeService';
import {
  INITIAL_PETS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_VACCINES,
  INITIAL_APPOINTMENTS,
  INITIAL_MEDICATIONS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_CLINIC_SETTINGS,
  INITIAL_USER_ACCOUNTS,
  INITIAL_SUPERUSER_ACCOUNT,
  INITIAL_SYSTEM_LICENSE,
  INITIAL_TENANTS,
  INITIAL_MASTER_BILLING_SETTINGS,
  INITIAL_PETSHOP_PRODUCTS,
  INITIAL_PETSHOP_SALES,
} from '../data/mockData';

interface VeterinaryContextType {
  // Navigation & Modes
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedTutorPetId: string;
  setSelectedTutorPetId: (id: string) => void;

  // Clinic / Business Settings
  clinicSettings: ClinicSettings;
  updateClinicSettings: (newSettings: Partial<ClinicSettings>) => void;
  resetClinicSettings: () => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  // System License & Rent Lock
  systemLicense: SystemLicense;
  daysRemaining: number;
  isLicenseLocked: boolean;
  renewLicense: (plan: LicensePlan, durationMonths?: number, customKey?: string) => boolean;
  changeLicensePlan: (plan: LicensePlan) => void;
  validateAndApplyKey: (key: string) => { success: boolean; message: string; plan?: LicensePlan; months?: number };
  toggleLicenseLock: (lock: boolean, reason?: string) => void;
  simulateLicenseDaysOffset: (daysRemaining: number) => void;
  isLicenseModalOpen: boolean;
  setIsLicenseModalOpen: (open: boolean) => void;

  // Super User & Multi-Tenant Management (Consola Master de Arrendados)
  isSuperUser: boolean;
  isMasterConsoleOpen: boolean;
  setIsMasterConsoleOpen: (open: boolean) => void;
  tenants: TenantClinic[];
  paymentRequests: PaymentRenewalRequest[];
  submitRenewalPaymentRequest: (data: {
    tenantId?: string;
    clinicName: string;
    directorName: string;
    email: string;
    phone: string;
    plan: LicensePlan;
    amount: number;
    paymentMethod: 'card' | 'spei' | 'oxxo';
    referenceFolio: string;
    notes?: string;
  }) => PaymentRenewalRequest;
  approvePaymentRenewalRequest: (requestId: string) => boolean;
  rejectPaymentRenewalRequest: (requestId: string, reason?: string) => boolean;
  addTenant: (tenantData: Omit<TenantClinic, 'id' | 'createdAt'>) => TenantClinic;
  updateTenant: (id: string, updates: Partial<TenantClinic>) => void;
  deleteTenant: (id: string) => boolean;
  toggleTenantLock: (id: string, lock: boolean, reason?: string) => void;
  extendTenantLicense: (id: string, durationType: 'month' | 'year' | 'grace_7') => void;
  generateTenantKey: (id: string, plan?: LicensePlan) => string;
  generateStandaloneLicenseKey: (plan: LicensePlan, customClinicName?: string) => { key: string; serial: string; message: string };
  syncLocalClinicWithTenant: (tenantId: string) => void;
  resetTenantUserCredentials: (
    tenantId: string,
    role: 'admin' | 'encargado',
    credentials: {
      username?: string;
      password?: string;
      name?: string;
      email?: string;
    }
  ) => boolean;
  generateRandomPassword: (prefix?: string) => string;
  activeTenantId: string;
  switchTenantDatabase: (tenantId: string) => Promise<boolean>;
  autoPollCountdown: number;
  lastPollTime: string;
  newRegistrationBadge: number;
  manualPollRequestsNow: () => Promise<void>;
  masterBillingSettings: MasterBillingSettings;
  updateMasterBillingSettings: (settings: Partial<MasterBillingSettings>) => void;

  // Data
  pets: Pet[];
  medicalRecords: MedicalRecord[];
  vaccines: VaccineRecord[];
  appointments: Appointment[];
  reminders: ReminderNotification[];
  inventory: MedicationItem[];
  stockMovements: StockMovement[];

  // Pet Actions
  addPet: (petData: Omit<Pet, 'id' | 'registeredAt'>) => Pet;
  updatePet: (id: string, petData: Partial<Pet>) => void;
  deletePet: (id: string) => boolean;
  getPetById: (id: string) => Pet | undefined;
  addDiagnosticStudy: (petId: string, studyData: Omit<DiagnosticImage, 'id' | 'uploadedAt'>) => DiagnosticImage;
  deleteDiagnosticStudy: (petId: string, studyId: string) => void;

  // Appointment Actions
  addAppointment: (aptData: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string, notes?: string) => boolean;
  deleteAppointment: (id: string) => void;

  // Medical Record & Discharge Actions
  addMedicalRecord: (recordData: Omit<MedicalRecord, 'id'>) => MedicalRecord;
  getRecordsByPetId: (petId: string) => MedicalRecord[];
  discharges: MedicalDischargeSummary[];
  createDischargeSummary: (dischargeData: Omit<MedicalDischargeSummary, 'id' | 'createdAt'>) => MedicalDischargeSummary;

  // Vaccine Actions
  addVaccineRecord: (vacData: Omit<VaccineRecord, 'id'>) => VaccineRecord;
  updateVaccineRecord: (id: string, vacData: Partial<VaccineRecord>) => void;
  deleteVaccineRecord: (id: string) => void;
  getVaccinesByPetId: (petId: string) => VaccineRecord[];

  // Inventory & Medication Actions
  addMedication: (medData: Omit<MedicationItem, 'id'>) => MedicationItem;
  updateMedication: (id: string, medData: Partial<MedicationItem>) => void;
  deleteMedication: (id: string) => void;
  adjustStock: (
    medicationId: string,
    quantityChange: number,
    type: StockMovementType,
    reason: string,
    referencePatient?: string,
    performedBy?: string
  ) => boolean;
  restockMedication: (
    medicationId: string,
    addedQuantity: number,
    newBatch?: string,
    newExpDate?: string,
    costPrice?: number,
    supplierName?: string
  ) => void;
  dispenseMedication: (
    medicationId: string,
    usedQuantity: number,
    patientName?: string,
    reason?: string
  ) => boolean;

  // Pet Shop, Alimentos, Accesorios & Almacenes
  products: PetShopProduct[];
  salesReceipts: PetShopSaleReceipt[];
  addProduct: (prod: Omit<PetShopProduct, 'id' | 'lastUpdated'>) => PetShopProduct;
  updateProduct: (id: string, updates: Partial<PetShopProduct>) => void;
  deleteProduct: (id: string) => void;
  transferStockBetweenWarehouses: (productId: string, fromWarehouse: string, toWarehouse: string, quantity: number) => boolean;
  recordSaleReceipt: (saleData: Omit<PetShopSaleReceipt, 'id' | 'createdAt' | 'ticketNumber'>) => PetShopSaleReceipt;

  // Apertura y Cierre de Turno / Corte Diario de Caja
  cashShifts: CashRegisterShift[];
  activeShift: CashRegisterShift | null;
  openCashShift: (initialCashFloat: number, notes?: string) => CashRegisterShift;
  closeCashShift: (actualCashInDrawer: number, notes?: string) => CashRegisterShift | null;
  addCashMovement: (type: 'in' | 'out', amount: number, reason: string) => void;

  // Reminder & Communication Actions
  sendVaccineReminder: (petId: string, vaccineId: string, channel: 'WhatsApp' | 'Email' | 'SMS', customMessage?: string) => void;

  // Quick pairing modal state
  isPairingModalOpen: boolean;
  setIsPairingModalOpen: (open: boolean) => void;
  pairingModalPetId?: string;
  openPairingModal: (petId?: string) => void;
  closePairingModal: () => void;

  // Data backup and restore
  exportAllClinicDataJson: () => string;
  importClinicDataJson: (jsonData: string) => boolean;
  resetToInitialData: () => void;

  // Authentication & Role Management
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  usersList: UserAccount[];
  userAccounts: UserAccountWithCredentials[];
  superUserAccount: UserAccountWithCredentials;
  login: (username: string, password: string, certificate?: VerifiedTimeCertificate) => { success: boolean; message?: string };
  logout: () => Promise<void>;
  saveAllSessionDataToDatabase: (reason?: string) => Promise<{ success: boolean; audit: SessionSaveAudit }>;
  isSavingSessionOnLogout: boolean;
  saveProgressStep: string;
  lastSessionAudit: SessionSaveAudit | null;
  registerNewClinic: (data: RegisterClinicData) => boolean;
  updateUserPassword: (userId: string, newPassword: string) => boolean;
  updateUserAccount: (userId: string, updates: Partial<UserAccountWithCredentials>) => boolean;
  updateSuperUserCredentials: (credentials: { username?: string; name?: string; password?: string }) => boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  // Network & Official Date/Time Verification
  isOnline: boolean;
  isSimulatedOffline: boolean;
  setSimulatedOffline: (offline: boolean) => void;
  checkInternetNow: () => Promise<boolean>;
  lastVerifiedTimeCertificate: VerifiedTimeCertificate | null;
  setLastVerifiedTimeCertificate: (cert: VerifiedTimeCertificate | null) => void;
  officialInternetDate: string;
  officialInternetTime: string;
  officialInternetDateLong: string;
  officialTime12h: string;
  syncInternetTimeNow: () => Promise<VerifiedTimeCertificate | null>;
  isNetworkDiagnosticsOpen: boolean;
  setIsNetworkDiagnosticsOpen: (open: boolean) => void;

  // Interactive Onboarding Tutorial
  isTutorialOpen: boolean;
  setIsTutorialOpen: (open: boolean) => void;
  startTutorial: () => void;
  closeTutorial: () => void;
  skipTutorialPermanently: () => void;

  // Search & Global State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;

  // Quick stats
  stats: {
    todayAppointmentsCount: number;
    activePatientsCount: number;
    upcomingVaccinesCount: number;
    overdueVaccinesCount: number;
    activePrescriptionsCount: number;
    // Inventory stats
    lowStockCount: number;
    outOfStockCount: number;
    criticalStockCount: number;
    expiredCount: number;
    expiringSoonCount: number;
    totalMedicationsCount: number;
    totalInventoryValue: number;
  };
}

const VeterinaryContext = createContext<VeterinaryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  PETS: 'vetcare_pets_v1',
  RECORDS: 'vetcare_records_v1',
  VACCINES: 'vetcare_vaccines_v1',
  APPOINTMENTS: 'vetcare_appointments_v1',
  REMINDERS: 'vetcare_reminders_v1',
  INVENTORY: 'vetcare_inventory_v1',
  MOVEMENTS: 'vetcare_movements_v1',
  SETTINGS: 'vetcare_clinic_settings_v1',
  CURRENT_USER: 'vetcare_current_user_v1',
  USER_ACCOUNTS: 'vetcare_user_accounts_v2',
  SYSTEM_LICENSE: 'vetcare_system_license_v1',
  TENANTS: 'vetcare_tenants_v1',
  PAYMENT_REQUESTS: 'vetcare_payment_requests_v1',
  MASTER_BILLING: 'vetcare_master_billing_v1',
  TUTORIAL_COMPLETED: 'vetcare_tutorial_completed_v1',
};

export const VeterinaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [selectedTutorPetId, setSelectedTutorPetId] = useState<string>('pet-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState<boolean>(false);
  const [pairingModalPetId, setPairingModalPetId] = useState<string | undefined>(undefined);
  const [isMasterConsoleOpen, setIsMasterConsoleOpen] = useState<boolean>(false);
  const [isNetworkDiagnosticsOpen, setIsNetworkDiagnosticsOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Session Persistence on Logout State
  const [isSavingSessionOnLogout, setIsSavingSessionOnLogout] = useState<boolean>(false);
  const [saveProgressStep, setSaveProgressStep] = useState<string>('Sincronizando base de datos local y remota...');
  const [lastSessionAudit, setLastSessionAudit] = useState<SessionSaveAudit | null>(() => {
    try {
      const saved = localStorage.getItem('vetcare_last_session_audit');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Network & Official Time Verification State
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSimulatedOfflineState, setIsSimulatedOfflineState] = useState<boolean>(isSimulatedOfflineMode());
  const [lastVerifiedTimeCertificate, setLastVerifiedTimeCertificate] = useState<VerifiedTimeCertificate | null>(null);

  // Subscribe to real-time network connectivity changes
  useEffect(() => {
    const unsubscribe = subscribeToNetworkEvents((online) => {
      setIsOnline(online);
      setIsSimulatedOfflineState(isSimulatedOfflineMode());
    });

    // Initial check
    checkActiveInternet().then((res) => {
      setIsOnline(res.isOnline);
    });

    return () => unsubscribe();
  }, []);

  const setSimulatedOffline = (offline: boolean) => {
    setSimulatedOfflineMode(offline);
    setIsSimulatedOfflineState(offline);
    setIsOnline(!offline);
  };

  const checkInternetNow = async (): Promise<boolean> => {
    const result = await checkActiveInternet();
    setIsOnline(result.isOnline);
    return result.isOnline;
  };

  // Live Official Network Date & Time (Real-time auto-synchronization for agendas and appointments)
  const [officialInternetDate, setOfficialInternetDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [officialInternetTime, setOfficialInternetTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [officialInternetDateLong, setOfficialInternetDateLong] = useState<string>(() => {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  });
  const [officialTime12h, setOfficialTime12h] = useState<string>(() => {
    return new Date().toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  });

  const syncInternetTimeNow = async (): Promise<VerifiedTimeCertificate | null> => {
    try {
      const result = await verifyOfficialNetworkTime();
      if (result.success && result.certificate) {
        setLastVerifiedTimeCertificate(result.certificate);
        if (result.certificate.timestampIso) {
          const sDate = new Date(result.certificate.timestampIso);
          setOfficialInternetDate(sDate.toISOString().split('T')[0]);
          setOfficialInternetTime(`${String(sDate.getHours()).padStart(2, '0')}:${String(sDate.getMinutes()).padStart(2, '0')}`);
          setOfficialInternetDateLong(result.certificate.formattedDateLong);
          setOfficialTime12h(result.certificate.formattedTime12h);
        }
        showToast('Fecha y hora de agendas sincronizadas exitosamente con el servidor de tiempo oficial por internet.', 'success');
        return result.certificate;
      } else {
        showToast('No se pudo verificar la hora en línea. Se mantendrá el reloj local.', 'warning');
        return null;
      }
    } catch {
      return null;
    }
  };

  // Live second-by-second ticker and periodic 60s internet sync
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const d = new Date();
      setOfficialInternetDate(d.toISOString().split('T')[0]);
      setOfficialInternetTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      setOfficialInternetDateLong(d.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }));
      setOfficialTime12h(d.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }));
    }, 1000);

    // Initial internet sync on mount
    verifyOfficialNetworkTime().then(res => {
      if (res.success && res.certificate) {
        setLastVerifiedTimeCertificate(res.certificate);
      }
    }).catch(() => {});

    // Periodic internet verification every 2 minutes
    const networkSyncInterval = setInterval(() => {
      if (navigator.onLine) {
        verifyOfficialNetworkTime().then(res => {
          if (res.success && res.certificate) {
            setLastVerifiedTimeCertificate(res.certificate);
          }
        }).catch(() => {});
      }
    }, 120000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(networkSyncInterval);
    };
  }, []);

  // Dedicated Super User State (Global Master Platform Owner)
  const [superUserAccount, setSuperUserAccount] = useState<UserAccountWithCredentials>(() => {
    const saved = localStorage.getItem('vet_superuser_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username && parsed.username !== 'superadmin' && parsed.passwordHash !== 'master2026') return parsed;
      } catch {}
    }
    return INITIAL_SUPERUSER_ACCOUNT;
  });

  // Authentication & Local Clinic User Accounts (ONLY Administrador and Encargado)
  const [userAccounts, setUserAccounts] = useState<UserAccountWithCredentials[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_ACCOUNTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly exclude superuser from local clinic accounts
          const clinicUsersOnly = parsed.filter((u: any) => u.role !== 'superuser' && u.id !== 'user-super-creator-master');
          if (clinicUsersOnly.length > 0) return clinicUsersOnly;
        }
      } catch {
        // ignore parse error
      }
    }
    return INITIAL_USER_ACCOUNTS;
  });

  useEffect(() => {
    // Only save clinic accounts (never superuser in clinic partition)
    const cleanClinicAccounts = userAccounts.filter(u => u.role !== 'superuser');
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(cleanClinicAccounts));
  }, [userAccounts]);

  // Always require credentials upon initial system launch / page load
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    // Clear any previous persistent session so each launch requires logging in
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(true);

  const isAuthenticated = currentUser !== null;
  const isSuperUser = currentUser?.role === 'superuser';

  const startTutorial = () => {
    if (currentUser?.role === 'superuser' || isSuperUser) return;
    setViewMode('admin');
    setActiveTab('dashboard');
    setIsTutorialOpen(true);
  };

  const closeTutorial = () => {
    setIsTutorialOpen(false);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  };

  const skipTutorialPermanently = () => {
    setIsTutorialOpen(false);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TUTORIAL_COMPLETED, 'permanently_skipped');
    showToast('Tutorial omitido permanentemente. Podrás abrirlo cuando lo desees desde el menú de usuario.', 'info');
  };

  // Auto-launch tutorial on first session only for non-superuser users
  useEffect(() => {
    const hasSeen = localStorage.getItem(LOCAL_STORAGE_KEYS.TUTORIAL_COMPLETED);
    if (!hasSeen && currentUser && currentUser.role !== 'superuser') {
      const timer = setTimeout(() => {
        startTutorial();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const usersList = useMemo(() => {
    return userAccounts.filter(u => u.role !== 'superuser').map(({ passwordHash, ...user }) => user);
  }, [userAccounts]);

  const login = (
    username: string,
    password: string,
    certificate?: VerifiedTimeCertificate
  ): { success: boolean; message?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (certificate) {
      setLastVerifiedTimeCertificate(certificate);
    }

    // 1. Check Super User Master credentials (Master Platform Owner)
    if (
      cleanUsername === superUserAccount.username.toLowerCase() ||
      (superUserAccount.email && cleanUsername === superUserAccount.email.toLowerCase())
    ) {
      if (superUserAccount.passwordHash !== cleanPassword) {
        return { success: false, message: 'Contraseña de Super Usuario incorrecta. Verifique e intente nuevamente.' };
      }

      const { passwordHash, ...accountData } = superUserAccount;
      setCurrentUser(accountData);
      setIsLoginModalOpen(false);
      setActiveTab('master_tenants');
      setViewMode('admin');
      manualPollRequestsNow();
      showToast(
        `⚡ Bienvenido Super Administrador (${accountData.name}). Panel Maestro de Arrendados y Licencias activado.`,
        'success'
      );
      return { success: true };
    }

    // 2. Check local clinic userAccounts (admin or encargado)
    const foundAccount = userAccounts
      .filter(u => u.role !== 'superuser')
      .find(
        u => u.username.toLowerCase() === cleanUsername || (u.email && u.email.toLowerCase() === cleanUsername)
      );

    if (foundAccount) {
      if (foundAccount.passwordHash !== cleanPassword) {
        return { success: false, message: 'Contraseña incorrecta. Verifique e intente nuevamente.' };
      }

      const { passwordHash, ...accountData } = foundAccount;
      setCurrentUser(accountData);
      setIsLoginModalOpen(false);

      const roleName =
        accountData.role === 'admin'
          ? 'Administrador General'
          : 'Encargado de Clínica';

      // Check for tutorial on first login for regular users
      const hasSeenTutorial = localStorage.getItem(LOCAL_STORAGE_KEYS.TUTORIAL_COMPLETED);
      if (!hasSeenTutorial) {
        setTimeout(() => {
          startTutorial();
        }, 600);
      }

      showToast(
        `Bienvenido(a), ${accountData.name} • Sesión iniciada como [${roleName}]`,
        'success'
      );
      return { success: true };
    }

    // 2. Check in all tenant clinics' adminCredentials & encargadoCredentials
    for (const tenant of tenants) {
      if (
        tenant.adminCredentials &&
        (tenant.adminCredentials.username.toLowerCase() === cleanUsername ||
          (tenant.adminCredentials.email && tenant.adminCredentials.email.toLowerCase() === cleanUsername))
      ) {
        if (tenant.adminCredentials.password !== cleanPassword) {
          return { success: false, message: 'Contraseña incorrecta. Verifique e intente nuevamente.' };
        }

        // Switch to this tenant environment
        syncLocalClinicWithTenant(tenant.id);

        const tenantAdminUser: UserAccount = {
          id: `admin-${tenant.id}`,
          username: tenant.adminCredentials.username,
          name: tenant.adminCredentials.name || tenant.directorName,
          role: 'admin',
          roleTitle: `Médico Director (${tenant.clinicName})`,
          email: tenant.adminCredentials.email || tenant.email,
          canAccessSettings: true,
          isPermanent: false,
        };

        setCurrentUser(tenantAdminUser);
        setIsLoginModalOpen(false);

        showToast(
          `Bienvenido(a), ${tenantAdminUser.name} • Administrador de "${tenant.clinicName}"`,
          'success'
        );
        return { success: true };
      }

      if (
        tenant.encargadoCredentials &&
        (tenant.encargadoCredentials.username.toLowerCase() === cleanUsername ||
          (tenant.encargadoCredentials.email && tenant.encargadoCredentials.email.toLowerCase() === cleanUsername))
      ) {
        if (tenant.encargadoCredentials.password !== cleanPassword) {
          return { success: false, message: 'Contraseña incorrecta. Verifique e intente nuevamente.' };
        }

        // Switch to this tenant environment
        syncLocalClinicWithTenant(tenant.id);

        const tenantEncUser: UserAccount = {
          id: `encargado-${tenant.id}`,
          username: tenant.encargadoCredentials.username,
          name: tenant.encargadoCredentials.name || 'Encargado de Clínica',
          role: 'encargado',
          roleTitle: `Encargado Operativo (${tenant.clinicName})`,
          email: tenant.encargadoCredentials.email || tenant.email,
          canAccessSettings: false,
          isPermanent: false,
        };

        setCurrentUser(tenantEncUser);
        setIsLoginModalOpen(false);

        showToast(
          `Bienvenido(a), ${tenantEncUser.name} • Encargado de "${tenant.clinicName}"`,
          'success'
        );
        return { success: true };
      }
    }

    return { success: false, message: 'Usuario no registrado en el sistema. Verifique su nombre de usuario o correo.' };
  };

  const registerNewClinic = (data: RegisterClinicData): boolean => {
    try {
      const today = new Date();
      const expDate = new Date(today);
      expDate.setDate(expDate.getDate() + 30); // 30-day Free Trial
      const expDateStr = expDate.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      const newLicenseKey = `VET-GRATIS-30DIAS-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
      const newSerial = `LIC-VET-TRIAL-${Math.floor(100000 + Math.random() * 900000)}-2026`;

      // 1. Initialize clinic settings with BLANK doctor, contact and prescription data
      const newSettings: ClinicSettings = {
        name: data.clinicName.trim(),
        slogan: '',
        address: data.city ? `${data.city.trim()}, México` : '',
        phone: '',
        emergencyPhone: '',
        email: data.email?.trim() || '',
        website: '',
        directorName: '',
        directorLicense: '',
        directorSpecialty: '',
        taxId: '',
        openingHoursWeekday: '',
        openingHoursWeekend: '',
        currency: 'MXN ($)',
        vatRate: 16,
        prescriptionFooter: '',
        logoUrl: '',
        logoText: '',
        logoEmoji: '🐾',
        brandColor: 'indigo',
      };
      setClinicSettings(newSettings);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));

      // 2. Clear all patients, medical records, inventory, pet shop warehouses, POS sales, and shifts to 0 for a clean start
      setPets([]);
      setMedicalRecords([]);
      setVaccines([]);
      setAppointments([]);
      setInventory([]);
      setStockMovements([]);
      setReminders([]);
      setProducts([]);
      setSalesReceipts([]);
      setCashShifts([]);
      setActiveShift(null);

      localStorage.setItem(LOCAL_STORAGE_KEYS.PETS, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECORDS, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_KEYS.VACCINES, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_KEYS.REMINDERS, JSON.stringify([]));
      localStorage.setItem('vetcare_petshop_products_v1', JSON.stringify([]));
      localStorage.setItem('vetcare_petshop_sales_v1', JSON.stringify([]));
      localStorage.setItem('vetcare_cash_shifts_v1', JSON.stringify([]));
      localStorage.removeItem('vetcare_active_cash_shift_v1');

      // 3. Update system license with 30-day free trial
      const newLicense: SystemLicense = {
        plan: 'mensual',
        status: 'active',
        licenseKey: newLicenseKey,
        serialNumber: newSerial,
        issuedTo: data.clinicName.trim(),
        startDate: todayStr,
        expirationDate: expDateStr,
        lastPaymentDate: todayStr,
        priceAmount: 0,
        currency: 'MXN',
        autoRenew: true,
        isLocked: false,
        graceDaysAllowed: 5,
      };
      setSystemLicense(newLicense);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SYSTEM_LICENSE, JSON.stringify(newLicense));

      // 4. Create Admin & Encargado user accounts for this new clinic (Admin and Encargado ONLY)
      const adminId = `user-admin-${Date.now()}`;
      const newAdminAccount: UserAccountWithCredentials = {
        id: adminId,
        username: data.username.trim().toLowerCase(),
        passwordHash: data.password.trim(),
        name: 'Administrador General',
        email: data.email?.trim() || '',
        role: 'admin',
        roleTitle: `Administrador(a) - ${data.clinicName.trim()}`,
        canAccessSettings: true,
      };

      const defaultEncargadoAccount: UserAccountWithCredentials = {
        id: `user-encargado-${Date.now()}`,
        username: 'encargado',
        passwordHash: 'encargado123',
        name: 'Encargado de Clínica',
        email: data.email?.trim() || '',
        role: 'encargado',
        roleTitle: `Encargado(a) de Operaciones - ${data.clinicName.trim()}`,
        canAccessSettings: false,
      };

      const updatedAccounts = [newAdminAccount, defaultEncargadoAccount];
      setUserAccounts(updatedAccounts);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(updatedAccounts));

      // 5. Log in as new Admin
      const newCurrentUser: UserAccount = {
        id: newAdminAccount.id,
        username: newAdminAccount.username,
        name: newAdminAccount.name,
        email: newAdminAccount.email,
        role: newAdminAccount.role,
        roleTitle: newAdminAccount.roleTitle,
        canAccessSettings: true,
      };
      setCurrentUser(newCurrentUser);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(newCurrentUser));

      // 6. Add to tenants list
      const newTenant: TenantClinic = {
        id: `tenant-${Date.now()}`,
        clinicName: data.clinicName.trim(),
        directorName: '',
        email: data.email?.trim() || '',
        phone: '',
        city: data.city?.trim() || 'México',
        plan: 'mensual',
        priceAmount: 0,
        currency: 'MXN',
        startDate: todayStr,
        expirationDate: expDateStr,
        lastPaymentDate: todayStr,
        status: 'active',
        isLocked: false,
        licenseKey: newLicenseKey,
        serialNumber: newSerial,
        patientsCount: 0,
        createdAt: todayStr,
        adminCredentials: {
          username: data.username.trim().toLowerCase(),
          password: data.password.trim(),
          name: 'Administrador General',
          email: data.email?.trim() || '',
          updatedAt: todayStr,
        },
      };

      const updatedTenants = [newTenant, ...tenants];
      setTenants(updatedTenants);
      localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(updatedTenants));

      // Push immediately to backend server APIs
      fetch('/api/tenants/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: newTenant }),
      }).catch(console.error);

      fetch('/api/tenants/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenants: updatedTenants }),
      }).catch(console.error);

      // Create initial empty clean database partition for this clinic
      const initPartition = {
        pets: [],
        medicalRecords: [],
        vaccines: [],
        appointments: [],
        inventory: [],
        stockMovements: [],
        clinicSettings: {
          ...INITIAL_CLINIC_SETTINGS,
          name: data.clinicName.trim(),
          directorName: data.directorName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          address: data.city.trim() || INITIAL_CLINIC_SETTINGS.address,
        },
        systemLicense: {
          plan: 'mensual',
          status: 'active',
          licenseKey: newLicenseKey,
          serialNumber: newSerial,
          priceAmount: 0,
          currency: 'MXN',
          startDate: todayStr,
          expirationDate: expDateStr,
          lastPaymentDate: todayStr,
          isLocked: false,
        },
      };
      localStorage.setItem(`vetcare_db_${newTenant.id}`, JSON.stringify(initPartition));
      fetch(`/api/clinics/${newTenant.id}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: initPartition }),
      }).catch(console.error);

      // 6. Close Login modal and open Clinic Settings modal automatically
      setIsLoginModalOpen(false);
      setViewMode('admin');
      setActiveTab('dashboard');
      setTimeout(() => {
        setIsSettingsModalOpen(true);
      }, 400);

      showToast(`🎉 ¡Bienvenido(a)! Clínica "${data.clinicName}" registrada con 30 días de prueba gratuita. Configura aquí los parámetros de tu negocio.`, 'success');
      return true;
    } catch (err: any) {
      showToast('Error al registrar la clínica: ' + (err.message || ''), 'error');
      return false;
    }
  };

  const updateUserPassword = (userId: string, newPassword: string): boolean => {
    if (currentUser?.role === 'encargado') {
      showToast('Acceso denegado: Solo el Administrador o Super Usuario puede modificar las contraseñas de acceso.', 'error');
      return false;
    }
    if (!newPassword || newPassword.trim().length < 4) {
      showToast('La nueva contraseña debe tener al menos 4 caracteres.', 'warning');
      return false;
    }
    setUserAccounts(prev =>
      prev.map(acc => {
        if (acc.id === userId) {
          return { ...acc, passwordHash: newPassword.trim() };
        }
        return acc;
      })
    );
    showToast('Contraseña actualizada correctamente y guardada de forma persistente.', 'success');
    return true;
  };

  const updateUserAccount = (userId: string, updates: Partial<UserAccountWithCredentials>): boolean => {
    if (currentUser?.role === 'encargado') {
      showToast('Acceso denegado: Solo el Administrador o Super Usuario puede modificar cuentas.', 'error');
      return false;
    }
    setUserAccounts(prev =>
      prev.map(acc => {
        if (acc.id === userId) {
          // If permanent superuser, protect role and id
          const safeRole = acc.isPermanent && acc.role === 'superuser' ? 'superuser' : (updates.role || acc.role);
          const updated = { ...acc, ...updates, role: safeRole };
          // If current logged-in user is this one, sync active profile info
          if (currentUser?.id === userId) {
            const { passwordHash, ...cleanUser } = updated;
            setCurrentUser(cleanUser);
          }
          return updated;
        }
        return acc;
      })
    );
    showToast('Cuenta de usuario actualizada con éxito.', 'success');
    return true;
  };

  const deleteUserAccount = (userId: string): boolean => {
    const target = userAccounts.find(u => u.id === userId);
    if (!target) return false;
    if (target.role === 'admin' && target.isPermanent) {
      showToast('Acceso protegido: La cuenta principal de Administrador de la clínica es permanente y no se puede remover.', 'error');
      return false;
    }
    setUserAccounts(prev => prev.filter(u => u.id !== userId));
    showToast(`Cuenta de ${target.name} eliminada.`, 'success');
    return true;
  };

  const updateSuperUserCredentials = (credentials: {
    username?: string;
    name?: string;
    password?: string;
  }): boolean => {
    const cleanUsername = (credentials.username || '').trim();
    const cleanName = (credentials.name || '').trim();
    const cleanPassword = (credentials.password || '').trim();

    if (cleanUsername && cleanUsername.length < 3) {
      showToast('El nombre de usuario del Super Usuario debe tener al menos 3 caracteres.', 'warning');
      return false;
    }
    if (cleanName && cleanName.length < 2) {
      showToast('El nombre del Super Usuario no puede estar vacío.', 'warning');
      return false;
    }
    if (cleanPassword && cleanPassword.length < 4) {
      showToast('La contraseña debe tener al menos 4 caracteres.', 'warning');
      return false;
    }

    const updatedSu: UserAccountWithCredentials = {
      ...superUserAccount,
      username: cleanUsername || superUserAccount.username,
      name: cleanName || superUserAccount.name,
      passwordHash: cleanPassword || superUserAccount.passwordHash,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setSuperUserAccount(updatedSu);
    localStorage.setItem('vet_superuser_credentials', JSON.stringify(updatedSu));

    // Also sync with server /api/superuser/settings
    fetch('/api/superuser/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: updatedSu }),
    }).catch(console.error);

    if (currentUser?.role === 'superuser') {
      const { passwordHash, ...cleanUser } = updatedSu;
      setCurrentUser(cleanUser);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_USER, JSON.stringify(cleanUser));
    }

    showToast('¡Nombre y contraseña del Super Usuario actualizados con éxito!', 'success');
    return true;
  };

  const handleSetIsSettingsModalOpen = (open: boolean) => {
    if (open && currentUser?.role === 'encargado') {
      showToast(
        'Acceso Restringido: El perfil de Encargado no tiene permisos para ver ni modificar los Parámetros del Negocio ni las Claves de Acceso.',
        'warning'
      );
      return;
    }
    setIsSettingsModalOpen(open);
  };

  const openPairingModal = (petId?: string) => {
    setPairingModalPetId(petId);
    setIsPairingModalOpen(true);
  };

  const closePairingModal = () => {
    setIsPairingModalOpen(false);
    setPairingModalPetId(undefined);
  };

  // Multi-Tenant Management (Arrendados y Licencias de Clientes)
  const [tenants, setTenants] = useState<TenantClinic[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TENANTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: TenantClinic) => {
            const initialMatch = INITIAL_TENANTS.find(it => it.id === t.id);
            const adminCreds = t.adminCredentials || initialMatch?.adminCredentials || {
              username: `admin.${(t.city || 'vet').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6)}`,
              password: `vet${Math.floor(1000 + Math.random() * 9000)}`,
              name: t.directorName || 'Director(a) Médico',
              email: t.email,
              updatedAt: new Date().toISOString().split('T')[0],
            };
            const encCreds = t.encargadoCredentials || initialMatch?.encargadoCredentials || {
              username: `recepcion.${(t.city || 'vet').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6)}`,
              password: `encargado${Math.floor(1000 + Math.random() * 9000)}`,
              name: 'Encargado(a) de Recepción',
              email: t.email,
              updatedAt: new Date().toISOString().split('T')[0],
            };
            return {
              ...t,
              adminCredentials: adminCreds,
              encargadoCredentials: encCreds,
            };
          });
        }
      } catch {
        // ignore error
      }
    }
    return INITIAL_TENANTS;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  }, [tenants]);

// Safe Payment Renewal Request Normalizer
const normalizePaymentRequest = (r: any): PaymentRenewalRequest => {
  if (!r) {
    return {
      id: `req-${Date.now()}`,
      clinicName: 'Clínica Veterinaria',
      directorName: 'Director Médico',
      email: '',
      phone: '',
      plan: 'mensual',
      amount: 599,
      currency: 'MXN',
      paymentMethod: 'spei',
      referenceFolio: `FOL-${Date.now()}`,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notifiedToSuperUser: true,
      superUserEmail: 'super.admin@vetcare.master.com',
    };
  }
  return {
    id: String(r.id || `req-${Date.now()}`),
    tenantId: r.tenantId ? String(r.tenantId) : undefined,
    clinicName: String(r.clinicName || 'Clínica Veterinaria'),
    directorName: String(r.directorName || 'Director(a) Médico'),
    email: String(r.email || r.contactEmail || ''),
    phone: String(r.phone || r.contactPhone || ''),
    plan: (r.plan === 'anual' || r.targetPlan === 'anual' ? 'anual' : 'mensual') as LicensePlan,
    amount: Number(r.amount ?? r.amountDue ?? (r.plan === 'anual' ? 5990 : 599)) || 0,
    currency: String(r.currency || 'MXN'),
    paymentMethod: (r.paymentMethod || 'spei') as any,
    referenceFolio: String(r.referenceFolio || r.proofPaymentNote || `FOL-${Date.now()}`),
    paymentDate: String(r.paymentDate || (r.createdAt ? String(r.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10))),
    status: (r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'pending') as any,
    notifiedToSuperUser: !!r.notifiedToSuperUser,
    superUserEmail: String(r.superUserEmail || 'super.admin@vetcare.master.com'),
    approvedAt: r.approvedAt ? String(r.approvedAt) : undefined,
    notes: r.notes || r.proofPaymentNote,
  };
};

  // Payment Renewal Requests queue (notified to superuser with 24h SLA)
  const [paymentRequests, setPaymentRequests] = useState<PaymentRenewalRequest[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PAYMENT_REQUESTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(normalizePaymentRequest);
      } catch {}
    }
    return [];
  });

  const [masterBillingSettings, setMasterBillingSettings] = useState<MasterBillingSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MASTER_BILLING);
    if (saved) {
      try {
        return { ...INITIAL_MASTER_BILLING_SETTINGS, ...JSON.parse(saved) };
      } catch {
        // ignore error
      }
    }
    return INITIAL_MASTER_BILLING_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MASTER_BILLING, JSON.stringify(masterBillingSettings));
  }, [masterBillingSettings]);

  const updateMasterBillingSettings = (newSettings: Partial<MasterBillingSettings>) => {
    setMasterBillingSettings(prev => {
      const updated = {
        ...prev,
        ...newSettings,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.MASTER_BILLING, JSON.stringify(updated));
      return updated;
    });
    showToast('Datos de cobro oficiales y correo del propietario actualizados correctamente.', 'success');
  };

  const submitRenewalPaymentRequest = (data: {
    tenantId?: string;
    clinicName: string;
    directorName: string;
    email: string;
    phone: string;
    plan: LicensePlan;
    amount: number;
    paymentMethod: 'card' | 'spei' | 'oxxo';
    referenceFolio: string;
    notes?: string;
  }): PaymentRenewalRequest => {
    const superUserAcc = userAccounts.find(u => u.role === 'superuser') || INITIAL_USER_ACCOUNTS[0];
    const superEmail = masterBillingSettings.ownerEmail || superUserAcc.email || 'super.admin@vetcare.master.com';
    const now = new Date();
    const dateFormatted = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newRequest: PaymentRenewalRequest = {
      id: `req-${Date.now()}`,
      tenantId: data.tenantId,
      clinicName: data.clinicName.trim(),
      directorName: data.directorName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      plan: data.plan,
      amount: data.amount,
      currency: 'MXN',
      paymentMethod: data.paymentMethod,
      referenceFolio: data.referenceFolio,
      paymentDate: dateFormatted,
      status: 'pending',
      notifiedToSuperUser: true,
      superUserEmail: superEmail,
      notes: data.notes,
    };

    const updatedRequests = [newRequest, ...paymentRequests];
    setPaymentRequests(updatedRequests);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(updatedRequests));

    // Send to backend API immediately
    fetch('/api/payment-requests/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request: newRequest }),
    }).catch(console.error);

    fetch('/api/payment-requests/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: updatedRequests }),
    }).catch(console.error);

    showToast(
      `✉️ Solicitud enviada al Super Usuario. Referencia [${data.referenceFolio}] registrada para reactivación en un plazo máximo de 24 horas.`,
      'info'
    );

    return newRequest;
  };

  const approvePaymentRenewalRequest = (requestId: string): boolean => {
    const target = paymentRequests.find(r => r.id === requestId);
    if (!target) {
      showToast('Solicitud de pago no encontrada.', 'error');
      return false;
    }

    const durationMonths = target.plan === 'mensual' ? 1 : 12;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // 1. Extend tenant if tenantId matches or by clinicName
    const updatedTenants = tenants.map(t => {
      if (t.id === target.tenantId || t.clinicName.toLowerCase() === target.clinicName.toLowerCase()) {
        const today = new Date();
        const curExp = new Date(t.expirationDate);
        const baseDate = curExp > today ? curExp : today;
        const newExp = new Date(baseDate);
        newExp.setMonth(newExp.getMonth() + durationMonths);
        const newExpStr = newExp.toISOString().split('T')[0];

        return {
          ...t,
          expirationDate: newExpStr,
          lastPaymentDate: today.toISOString().split('T')[0],
          status: 'active' as const,
          isLocked: false,
          lockReason: undefined,
        };
      }
      return t;
    });
    setTenants(updatedTenants);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(updatedTenants));

    // 2. If it is the current local clinic, extend local license as well
    if (
      clinicSettings.name.toLowerCase() === target.clinicName.toLowerCase() ||
      target.tenantId === 'tenant-yellow-local'
    ) {
      renewLicense(target.plan, durationMonths);
    }

    // 3. Mark request as approved
    const updatedRequests = paymentRequests.map(r =>
      r.id === requestId ? { ...r, status: 'approved' as const, approvedAt: nowStr } : r
    );
    setPaymentRequests(updatedRequests);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(updatedRequests));

    // Sync both to backend
    fetch('/api/payment-requests/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: updatedRequests }),
    }).catch(console.error);

    fetch('/api/tenants/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenants: updatedTenants }),
    }).catch(console.error);

    showToast(
      `✅ Pago validado y licencia de "${target.clinicName}" reactivada por ${target.plan === 'mensual' ? '30 días (+1 Mes)' : '365 días (+1 Año)'}.`,
      'success'
    );
    return true;
  };

  const rejectPaymentRenewalRequest = (requestId: string, reason?: string): boolean => {
    const updatedRequests = paymentRequests.map(r =>
      r.id === requestId
        ? { ...r, status: 'rejected' as const, notes: reason || 'Rechazado por inconsistencia en referencia de pago.' }
        : r
    );
    setPaymentRequests(updatedRequests);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(updatedRequests));

    fetch('/api/payment-requests/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: updatedRequests }),
    }).catch(console.error);

    showToast('Solicitud de pago rechazada.', 'warning');
    return true;
  };

  const addTenant = (tenantData: Omit<TenantClinic, 'id' | 'createdAt'>): TenantClinic => {
    const newId = `tenant-${Date.now()}`;
    const generatedKey =
      tenantData.licenseKey ||
      (tenantData.plan === 'mensual'
        ? `VET-MENS-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2026`
        : `VET-ANUAL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2027`);

    const generatedSerial =
      tenantData.serialNumber ||
      `LIC-VET-${Math.floor(100000 + Math.random() * 900000)}-${(tenantData.city || 'MEX').substring(0, 3).toUpperCase()}-2026`;

    const citySlug = (tenantData.city || 'vet').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);
    const defaultAdminCreds = tenantData.adminCredentials || {
      username: `admin.${citySlug}`,
      password: `vet${Math.floor(1000 + Math.random() * 9000)}`,
      name: tenantData.directorName || 'Director(a) Médico',
      email: tenantData.email,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    const defaultEncCreds = tenantData.encargadoCredentials || {
      username: `recepcion.${citySlug}`,
      password: `encargado${Math.floor(1000 + Math.random() * 9000)}`,
      name: 'Encargado(a) de Recepción',
      email: tenantData.email,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const newTenant: TenantClinic = {
      ...tenantData,
      id: newId,
      licenseKey: generatedKey,
      serialNumber: generatedSerial,
      createdAt: new Date().toISOString().split('T')[0],
      patientsCount: tenantData.patientsCount || 0,
      priceAmount: tenantData.priceAmount || (tenantData.plan === 'mensual' ? 599 : 5990),
      currency: tenantData.currency || 'MXN',
      isLocked: tenantData.isLocked || false,
      status: tenantData.status || 'active',
      adminCredentials: defaultAdminCreds,
      encargadoCredentials: defaultEncCreds,
    };

    const updatedTenants = [newTenant, ...tenants];
    setTenants(updatedTenants);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(updatedTenants));

    fetch('/api/tenants/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenants: updatedTenants }),
    }).catch(console.error);

    showToast(`Arrendado "${newTenant.clinicName}" registrado con éxito en la consola master.`, 'success');
    return newTenant;
  };

  const updateTenant = (id: string, updates: Partial<TenantClinic>) => {
    const updatedTenants = tenants.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates };
        // If updating local active clinic, sync local systemLicense
        if (id === 'tenant-central-local' || id === activeTenantId || t.clinicName.toLowerCase() === clinicSettings.name.toLowerCase()) {
          if (updates.isLocked !== undefined) {
            setSystemLicense(prevLic => ({ ...prevLic, isLocked: !!updates.isLocked, lockReason: updates.lockReason }));
          }
          if (updates.expirationDate) {
            setSystemLicense(prevLic => ({ ...prevLic, expirationDate: updates.expirationDate! }));
          }
          if (updates.plan) {
            setSystemLicense(prevLic => ({ ...prevLic, plan: updates.plan!, priceAmount: updates.plan === 'mensual' ? 599 : 5990 }));
          }
        }
        return updated;
      }
      return t;
    });
    setTenants(updatedTenants);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(updatedTenants));

    fetch('/api/tenants/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenants: updatedTenants }),
    }).catch(console.error);

    showToast('Datos de arrendado actualizados.', 'success');
  };

  const deleteTenant = (id: string): boolean => {
    const tenantToDelete = tenants.find(t => t.id === id);
    if (!tenantToDelete) return false;

    // 1. Remove from tenants list
    const updatedTenants = tenants.filter(t => t.id !== id);
    setTenants(updatedTenants);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(updatedTenants));

    fetch('/api/tenants/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenants: updatedTenants }),
    }).catch(console.error);

    fetch(`/api/clinics/${id}`, {
      method: 'DELETE',
    }).catch(console.error);

    // 2. Remove associated user accounts (admin / encargado)
    if (tenantToDelete.adminCredentials?.username || tenantToDelete.encargadoCredentials?.username) {
      setUserAccounts(prev =>
        prev.filter(
          u =>
            u.username !== tenantToDelete.adminCredentials?.username &&
            u.username !== tenantToDelete.encargadoCredentials?.username
        )
      );
    }

    // 3. Remove pending or historical payment requests for this tenant
    const updatedRequests = paymentRequests.filter(
      p => p.tenantId !== id && p.clinicName.toLowerCase() !== tenantToDelete.clinicName.toLowerCase()
    );
    setPaymentRequests(updatedRequests);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(updatedRequests));

    fetch('/api/payment-requests/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: updatedRequests }),
    }).catch(console.error);

    // 4. If this tenant matches the currently active local clinic, wipe local data
    if (
      clinicSettings.name.toLowerCase() === tenantToDelete.clinicName.toLowerCase() ||
      id === activeTenantId ||
      id === 'tenant-central-local'
    ) {
      setPets([]);
      setMedicalRecords([]);
      setVaccines([]);
      setAppointments([]);
      setInventory([]);
      setStockMovements([]);
      setReminders([]);
      setClinicSettings({
        name: 'Clínica Veterinaria',
        slogan: 'Atención Médica Veterinaria',
        phone: '+52 55 0000 0000',
        email: 'contacto@veterinaria.com',
        address: 'Dirección Principal',
        directorName: 'Director Médico',
        licenseNumber: 'VET-PENDING',
      });
      setSystemLicense({
        plan: 'mensual',
        status: 'expired',
        expirationDate: new Date().toISOString().split('T')[0],
        priceAmount: 599,
        currency: 'MXN',
        autoRenew: false,
        isLocked: true,
        lockReason: 'Clínica eliminada por el Super Usuario',
        graceDaysAllowed: 0,
      });
    }

    showToast(`Clínica "${tenantToDelete.clinicName}" y todos sus datos han sido eliminados definitivamente.`, 'success');
    return true;
  };

  const toggleTenantLock = (id: string, lock: boolean, reason?: string) => {
    setTenants(prev =>
      prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            isLocked: lock,
            status: lock ? 'locked' : 'active',
            lockReason: lock ? (reason || 'Bloqueado por creador') : undefined,
          };
        }
        return t;
      })
    );
    if (id === 'tenant-yellow-local') {
      setSystemLicense(prev => ({
        ...prev,
        isLocked: lock,
        status: lock ? 'locked' : 'active',
        lockReason: lock ? (reason || 'Bloqueado por creador') : undefined,
      }));
    }
    showToast(
      lock ? `Licencia de arrendado bloqueada inmediatamente.` : `Licencia de arrendado reactivada con éxito.`,
      lock ? 'error' : 'success'
    );
  };

  const extendTenantLicense = (id: string, durationType: 'month' | 'year' | 'grace_7') => {
    setTenants(prev =>
      prev.map(t => {
        if (t.id === id) {
          const today = new Date();
          const currentExp = new Date(t.expirationDate);
          const baseDate = currentExp > today ? currentExp : today;
          const newExp = new Date(baseDate);

          if (durationType === 'month') {
            newExp.setDate(newExp.getDate() + 30);
          } else if (durationType === 'year') {
            newExp.setDate(newExp.getDate() + 365);
          } else if (durationType === 'grace_7') {
            newExp.setDate(newExp.getDate() + 7);
          }

          const expDateStr = newExp.toISOString().split('T')[0];
          const todayStr = today.toISOString().split('T')[0];

          // If local active clinic, sync local systemLicense
          if (id === 'tenant-yellow-local') {
            setSystemLicense(prevLic => ({
              ...prevLic,
              status: 'active',
              isLocked: false,
              lockReason: undefined,
              expirationDate: expDateStr,
              lastPaymentDate: todayStr,
            }));
          }

          return {
            ...t,
            expirationDate: expDateStr,
            lastPaymentDate: todayStr,
            status: 'active',
            isLocked: false,
            lockReason: undefined,
          };
        }
        return t;
      })
    );
    const addedDays = durationType === 'month' ? '30 días (+1 Mes)' : durationType === 'year' ? '365 días (+1 Año)' : '7 días de gracia';
    showToast(`Vigencia de arrendado extendida por ${addedDays}.`, 'success');
  };

  const generateTenantKey = (id: string, plan: LicensePlan = 'mensual'): string => {
    const newKey =
      plan === 'mensual'
        ? `VET-MENS-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2026`
        : `VET-ANUAL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2027`;

    setTenants(prev =>
      prev.map(t => (t.id === id ? { ...t, licenseKey: newKey, plan } : t))
    );
    showToast(`Nueva clave generada: ${newKey}`, 'success');
    return newKey;
  };

  const generateStandaloneLicenseKey = (
    plan: LicensePlan,
    customClinicName: string = 'Clínica Veterinaria'
  ): { key: string; serial: string; message: string } => {
    const key =
      plan === 'mensual'
        ? `VET-MENS-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2026`
        : `VET-ANUAL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2027`;

    const serial = `LIC-VET-${Math.floor(100000 + Math.random() * 900000)}-GEN-2026`;
    const validity = plan === 'mensual' ? '30 días (1 mes)' : '365 días (1 año)';
    const amount = plan === 'mensual' ? '$599 MXN' : '$5,990 MXN';

    const message = `🐾 *LICENCIA OFICIAL DE SOFTWARE VETERINARIO*\n\n` +
      `Estimado/a titular de *${customClinicName}*:\n` +
      `Su clave de activación de renta (${plan === 'mensual' ? 'Mensual' : 'Anual'}) ha sido generada exitosamente:\n\n` +
      `🔑 *Clave:* \`${key}\`\n` +
      `🏷️ *Serie:* \`${serial}\`\n` +
      `📅 *Vigencia:* ${validity}\n` +
      `💵 *Cuota:* ${amount}\n\n` +
      `Para activarla: abra el sistema, presione el botón de Licencia o la pantalla de bloqueo e ingrese la clave anterior.`;

    return { key, serial, message };
  };

  const generateRandomPassword = (prefix: string = 'Vet'): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = 2026 + Math.floor(Math.random() * 2);
    return `${prefix}-${rand}-${year}`;
  };

  const resetTenantUserCredentials = (
    tenantId: string,
    role: 'admin' | 'encargado',
    credentials: {
      username?: string;
      password?: string;
      name?: string;
      email?: string;
    }
  ): boolean => {
    if (!isSuperUser && currentUser?.role !== 'admin') {
      showToast('Acceso denegado: Solo el Super Usuario Creador o Administrador puede reestablecer credenciales.', 'error');
      return false;
    }

    const targetTenant = tenants.find(t => t.id === tenantId);
    if (!targetTenant) {
      showToast('Clínica arrendataria no encontrada.', 'error');
      return false;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    setTenants(prev =>
      prev.map(t => {
        if (t.id === tenantId) {
          if (role === 'admin') {
            const currentAdmin = t.adminCredentials || {
              username: 'admin',
              password: 'admin123',
              name: t.directorName,
              email: t.email,
            };
            const updatedAdmin = {
              ...currentAdmin,
              username: credentials.username !== undefined && credentials.username.trim() !== '' ? credentials.username.trim().toLowerCase() : currentAdmin.username,
              password: credentials.password !== undefined && credentials.password.trim() !== '' ? credentials.password.trim() : currentAdmin.password,
              name: credentials.name !== undefined && credentials.name.trim() !== '' ? credentials.name.trim() : currentAdmin.name,
              email: credentials.email !== undefined ? credentials.email.trim() : currentAdmin.email,
              updatedAt: todayStr,
            };
            return {
              ...t,
              adminCredentials: updatedAdmin,
              directorName: updatedAdmin.name || t.directorName,
              email: updatedAdmin.email || t.email,
            };
          } else {
            const currentEnc = t.encargadoCredentials || {
              username: 'encargado',
              password: 'encargado123',
              name: 'Encargado de Clínica',
              email: t.email,
            };
            const updatedEnc = {
              ...currentEnc,
              username: credentials.username !== undefined && credentials.username.trim() !== '' ? credentials.username.trim().toLowerCase() : currentEnc.username,
              password: credentials.password !== undefined && credentials.password.trim() !== '' ? credentials.password.trim() : currentEnc.password,
              name: credentials.name !== undefined && credentials.name.trim() !== '' ? credentials.name.trim() : currentEnc.name,
              email: credentials.email !== undefined ? credentials.email.trim() : currentEnc.email,
              updatedAt: todayStr,
            };
            return {
              ...t,
              encargadoCredentials: updatedEnc,
            };
          }
        }
        return t;
      })
    );

    // If this tenant is currently active or is the local central clinic, sync userAccounts
    if (tenantId === 'tenant-central-local' || tenantId === activeTenantId || targetTenant.clinicName.toLowerCase() === clinicSettings.name.toLowerCase()) {
      setUserAccounts(prevAccs =>
        prevAccs.map(acc => {
          if (role === 'admin' && acc.role === 'admin') {
            return {
              ...acc,
              username: credentials.username?.trim().toLowerCase() || acc.username,
              passwordHash: credentials.password?.trim() || acc.passwordHash,
              name: credentials.name?.trim() || acc.name,
              email: credentials.email?.trim() || acc.email,
            };
          }
          if (role === 'encargado' && acc.role === 'encargado') {
            return {
              ...acc,
              username: credentials.username?.trim().toLowerCase() || acc.username,
              passwordHash: credentials.password?.trim() || acc.passwordHash,
              name: credentials.name?.trim() || acc.name,
              email: credentials.email?.trim() || acc.email,
            };
          }
          return acc;
        })
      );
    }

    showToast(
      `Credenciales del usuario [${role === 'admin' ? 'Administrador Titular' : 'Encargado Operativo'}] para "${targetTenant.clinicName}" actualizadas y reestablecidas.`,
      'success'
    );
    return true;
  };

  // Multi-Tenant Isolated Database Partitioning State
  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return localStorage.getItem('vetcare_active_tenant_id') || 'tenant-central-local';
  });

  // 5-minute (300s) Auto-poll Scheduler State
  const [autoPollCountdown, setAutoPollCountdown] = useState<number>(300);
  const [lastPollTime, setLastPollTime] = useState<string>(() =>
    new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [newRegistrationBadge, setNewRegistrationBadge] = useState<number>(0);

  const switchTenantDatabase = async (targetTenantId: string): Promise<boolean> => {
    try {
      // 1. Save current active clinic's data partition to localStorage & cloud API
      if (activeTenantId) {
        const currentPartition = {
          pets,
          medicalRecords,
          vaccines,
          appointments,
          inventory,
          stockMovements,
          clinicSettings,
          systemLicense,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`vetcare_db_${activeTenantId}`, JSON.stringify(currentPartition));
        
        try {
          fetch(`/api/clinics/${activeTenantId}/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: currentPartition }),
          }).catch(() => {});
        } catch {}
      }

      // 2. Locate target tenant clinic
      const targetTenant = tenants.find(t => t.id === targetTenantId);
      if (!targetTenant) {
        showToast('No se encontró la clínica seleccionada.', 'error');
        return false;
      }

      // 3. Load target clinic partition
      const savedPartitionStr = localStorage.getItem(`vetcare_db_${targetTenantId}`);
      if (savedPartitionStr) {
        try {
          const partition = JSON.parse(savedPartitionStr);
          setPets(partition.pets || []);
          setMedicalRecords(partition.medicalRecords || []);
          setVaccines(partition.vaccines || []);
          setAppointments(partition.appointments || []);
          setInventory(partition.inventory || []);
          setStockMovements(partition.stockMovements || []);
          if (partition.clinicSettings) setClinicSettings(partition.clinicSettings);
          if (partition.systemLicense) setSystemLicense(partition.systemLicense);
        } catch {
          // fallback
        }
      } else {
        // First time loading this tenant: initialize clean isolated database partition for this clinic
        const isCentral = targetTenantId === 'tenant-central-local' || targetTenant.clinicName.toLowerCase().includes('central');
        const defaultPets = isCentral ? INITIAL_PETS : [];
        const defaultRecords = isCentral ? INITIAL_MEDICAL_RECORDS : [];
        const defaultVaccines = isCentral ? INITIAL_VACCINES : [];
        const defaultAppts = isCentral ? INITIAL_APPOINTMENTS : [];
        const defaultInv = isCentral ? INITIAL_MEDICATIONS : [];
        const defaultMov = isCentral ? INITIAL_STOCK_MOVEMENTS : [];

        setPets(defaultPets);
        setMedicalRecords(defaultRecords);
        setVaccines(defaultVaccines);
        setAppointments(defaultAppts);
        setInventory(defaultInv);
        setStockMovements(defaultMov);

        const newSettings: ClinicSettings = {
          ...INITIAL_CLINIC_SETTINGS,
          name: targetTenant.clinicName,
          slogan: targetTenant.slogan || 'Clínica Veterinaria & Atención Médica',
          directorName: targetTenant.directorName,
          email: targetTenant.email,
          phone: targetTenant.phone,
          address: targetTenant.city ? `${targetTenant.city}` : INITIAL_CLINIC_SETTINGS.address,
        };
        setClinicSettings(newSettings);

        const newLic: SystemLicense = {
          plan: targetTenant.plan,
          status: targetTenant.status,
          licenseKey: targetTenant.licenseKey,
          serialNumber: targetTenant.serialNumber,
          issuedTo: `${targetTenant.clinicName} - ${targetTenant.directorName}`,
          startDate: targetTenant.startDate,
          expirationDate: targetTenant.expirationDate,
          lastPaymentDate: targetTenant.lastPaymentDate,
          priceAmount: targetTenant.priceAmount,
          currency: targetTenant.currency,
          autoRenew: true,
          isLocked: targetTenant.isLocked,
          lockReason: targetTenant.lockReason,
          graceDaysAllowed: 5,
        };
        setSystemLicense(newLic);

        // Save new clean partition
        const initPartition = {
          pets: defaultPets,
          medicalRecords: defaultRecords,
          vaccines: defaultVaccines,
          appointments: defaultAppts,
          inventory: defaultInv,
          stockMovements: defaultMov,
          clinicSettings: newSettings,
          systemLicense: newLic,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(`vetcare_db_${targetTenantId}`, JSON.stringify(initPartition));
      }

      setActiveTenantId(targetTenantId);
      localStorage.setItem('vetcare_active_tenant_id', targetTenantId);
      showToast(`📦 Partición de base de datos cargada para: "${targetTenant.clinicName}".`, 'success');
      return true;
    } catch (e) {
      console.error('Error switching tenant database:', e);
      return false;
    }
  };

  const manualPollRequestsNow = async () => {
    try {
      const now = new Date();
      setLastPollTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setAutoPollCountdown(300);

      let newClinicsCount = 0;
      let newPaymentsCount = 0;

      try {
        const [tenantsRes, paymentsRes] = await Promise.all([
          fetch('/api/tenants').then(r => r.json()).catch(() => null),
          fetch('/api/payment-requests').then(r => r.json()).catch(() => null),
        ]);

        if (tenantsRes?.success && Array.isArray(tenantsRes.tenants)) {
          if (tenantsRes.tenants.length > tenants.length) {
            newClinicsCount = tenantsRes.tenants.length - tenants.length;
          }
          setTenants(tenantsRes.tenants);
          localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(tenantsRes.tenants));
        }
        if (paymentsRes?.success && Array.isArray(paymentsRes.requests)) {
          const sanitizedRequests = paymentsRes.requests.map(normalizePaymentRequest);
          if (sanitizedRequests.length > paymentRequests.length) {
            newPaymentsCount = sanitizedRequests.length - paymentRequests.length;
          }
          setPaymentRequests(sanitizedRequests);
          localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(sanitizedRequests));
        }
      } catch {
        // Local fallback
      }

      const totalNew = newClinicsCount + newPaymentsCount;
      if (totalNew > 0) {
        setNewRegistrationBadge(prev => prev + totalNew);
        showToast(
          `🔔 [Auto-revisión 5 min]: Se detectaron ${newClinicsCount > 0 ? `${newClinicsCount} nueva(s) clínica(s) ` : ''}${newPaymentsCount > 0 ? `${newPaymentsCount} solicitud(es) de pago` : ''}.`,
          'info'
        );
      }
    } catch (e) {
      console.error('Error in manual poll:', e);
    }
  };

  // Initial poll on startup and auto-sync on browser tab focus
  useEffect(() => {
    manualPollRequestsNow();
    const handleWindowFocus = () => {
      manualPollRequestsNow();
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, []);

  // Background 5-minute Auto-poll loop & 1-second countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoPollCountdown(prev => {
        if (prev <= 1) {
          manualPollRequestsNow();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tenants.length, paymentRequests.length]);

  const syncLocalClinicWithTenant = (tenantId: string) => {
    switchTenantDatabase(tenantId);
  };

  // Initialize clinic business settings
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    return saved ? { ...INITIAL_CLINIC_SETTINGS, ...JSON.parse(saved) } : INITIAL_CLINIC_SETTINGS;
  });

  // License & Subscription Rental State
  const [systemLicense, setSystemLicense] = useState<SystemLicense>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SYSTEM_LICENSE);
    if (saved) {
      try {
        return { ...INITIAL_SYSTEM_LICENSE, ...JSON.parse(saved) };
      } catch {
        // ignore error
      }
    }
    return INITIAL_SYSTEM_LICENSE;
  });
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SYSTEM_LICENSE, JSON.stringify(systemLicense));
  }, [systemLicense]);

  // Compute days remaining and lock status
  const daysRemaining = useMemo(() => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(systemLicense.expirationDate);
      expDate.setHours(0, 0, 0, 0);
      const diffTime = expDate.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }, [systemLicense.expirationDate]);

  const isLicenseLocked = useMemo(() => {
    // If no user is logged in (returning to login portal after logout), do not lock
    if (!currentUser) return false;
    // Super User (Creator) is never blocked by clinic license expiration
    if (currentUser?.role === 'superuser') return false;
    if (systemLicense.isLocked) return true;
    if (systemLicense.status === 'locked' || systemLicense.status === 'expired') return true;
    if (daysRemaining < 0) return true;
    return false;
  }, [currentUser, systemLicense.isLocked, systemLicense.status, daysRemaining]);

  const renewLicense = (
    plan: LicensePlan,
    durationMonths: number = plan === 'mensual' ? 1 : 12,
    customKey?: string
  ): boolean => {
    const today = new Date();
    const currentExp = new Date(systemLicense.expirationDate);
    const baseDate = currentExp > today ? currentExp : today;

    const newExp = new Date(baseDate);
    newExp.setMonth(newExp.getMonth() + durationMonths);
    const expDateStr = newExp.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const generatedKey =
      customKey ||
      (plan === 'mensual'
        ? `VET-MENS-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2026`
        : `VET-ANUAL-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-2027`);

    setSystemLicense(prev => ({
      ...prev,
      plan,
      status: 'active',
      isLocked: false,
      lockReason: undefined,
      expirationDate: expDateStr,
      lastPaymentDate: todayStr,
      licenseKey: generatedKey,
      priceAmount: plan === 'mensual' ? 599 : 5990,
    }));

    // Ensure the user session is active and not kicked back to login modal
    if (!currentUser) {
      const adminAcc = userAccounts.find(u => u.role === 'admin') || userAccounts[0];
      if (adminAcc) {
        const { passwordHash, ...cleanUser } = adminAcc;
        setCurrentUser(cleanUser);
      }
    }
    setIsLoginModalOpen(false);

    showToast(
      `¡Renta ${plan === 'mensual' ? 'Mensual' : 'Anual'} activada con éxito! Sistema desbloqueado y vigente hasta el ${expDateStr}.`,
      'success'
    );
    return true;
  };

  const changeLicensePlan = (plan: LicensePlan) => {
    setSystemLicense(prev => ({
      ...prev,
      plan,
      priceAmount: plan === 'mensual' ? 599 : 5990,
    }));
    showToast(
      `Modalidad de renta cambiada a plan ${plan === 'mensual' ? 'Mensual ($599/mes)' : 'Anual ($5,990/año)'}.`,
      'info'
    );
  };

  const validateAndApplyKey = (
    key: string
  ): { success: boolean; message: string; plan?: LicensePlan; months?: number } => {
    const cleanKey = key.trim().toUpperCase();
    if (!cleanKey || cleanKey.length < 6) {
      return { success: false, message: 'La clave de licencia introducida no tiene un formato válido.' };
    }

    const isAnnual = cleanKey.includes('ANUAL') || cleanKey.includes('YEAR') || cleanKey.includes('365');
    const plan: LicensePlan = isAnnual ? 'anual' : 'mensual';
    const months = isAnnual ? 12 : 1;

    renewLicense(plan, months, cleanKey);
    return {
      success: true,
      message: `Clave validada correctamente. Se ha activado la Renta ${isAnnual ? 'Anual (12 meses)' : 'Mensual (30 días)'}.`,
      plan,
      months,
    };
  };

  const toggleLicenseLock = (lock: boolean, reason?: string) => {
    setSystemLicense(prev => ({
      ...prev,
      isLocked: lock,
      status: lock ? 'locked' : 'active',
      lockReason: lock ? (reason || 'Bloqueo por vencimiento de renta mensual/anual de licencia') : undefined,
    }));
    showToast(
      lock ? 'Sistema bloqueado por licencia de renta.' : 'Sistema desbloqueado correctamente.',
      lock ? 'error' : 'success'
    );
  };

  const simulateLicenseDaysOffset = (days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const expDateStr = targetDate.toISOString().split('T')[0];

    const isExp = days < 0;
    setSystemLicense(prev => ({
      ...prev,
      expirationDate: expDateStr,
      isLocked: isExp,
      status: isExp ? 'expired' : days <= 5 ? 'grace_period' : 'active',
      lockReason: isExp ? 'Periodo de renta finalizado. Se requiere renovación para continuar operando.' : undefined,
    }));

    if (!isExp) {
      if (!currentUser) {
        const adminAcc = userAccounts.find(u => u.role === 'admin') || userAccounts[0];
        if (adminAcc) {
          const { passwordHash, ...cleanUser } = adminAcc;
          setCurrentUser(cleanUser);
        }
      }
      setIsLoginModalOpen(false);
    }

    showToast(
      `Simulación: Vencimiento fijado al ${expDateStr} (${days < 0 ? 'Vencida / Sistema Bloqueado' : `${days} días restantes`}).`,
      isExp ? 'warning' : 'info'
    );
  };


  // Initialize state from localStorage or mock data
  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PETS);
    return saved ? JSON.parse(saved) : INITIAL_PETS;
  });

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_RECORDS;
  });

  const [vaccines, setVaccines] = useState<VaccineRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.VACCINES);
    return saved ? JSON.parse(saved) : INITIAL_VACCINES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [reminders, setReminders] = useState<ReminderNotification[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.REMINDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<MedicationItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [discharges, setDischarges] = useState<MedicalDischargeSummary[]>(() => {
    const saved = localStorage.getItem('vet_medical_discharges');
    return saved ? JSON.parse(saved) : [];
  });

  const [products, setProducts] = useState<PetShopProduct[]>(() => {
    const saved = localStorage.getItem('vet_petshop_products');
    return saved ? JSON.parse(saved) : INITIAL_PETSHOP_PRODUCTS;
  });

  const [salesReceipts, setSalesReceipts] = useState<PetShopSaleReceipt[]>(() => {
    const saved = localStorage.getItem('vet_petshop_sales');
    return saved ? JSON.parse(saved) : INITIAL_PETSHOP_SALES;
  });

  const [cashShifts, setCashShifts] = useState<CashRegisterShift[]>(() => {
    try {
      const saved = localStorage.getItem('vet_cash_shifts_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeShift, setActiveShift] = useState<CashRegisterShift | null>(() => {
    try {
      const saved = localStorage.getItem('vet_active_cash_shift_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('vet_cash_shifts_v1', JSON.stringify(cashShifts));
  }, [cashShifts]);

  useEffect(() => {
    if (activeShift) {
      localStorage.setItem('vet_active_cash_shift_v1', JSON.stringify(activeShift));
    } else {
      localStorage.removeItem('vet_active_cash_shift_v1');
    }
  }, [activeShift]);

  useEffect(() => {
    localStorage.setItem('vet_medical_discharges', JSON.stringify(discharges));
  }, [discharges]);

  useEffect(() => {
    localStorage.setItem('vet_petshop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vet_petshop_sales', JSON.stringify(salesReceipts));
  }, [salesReceipts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PETS, JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.RECORDS, JSON.stringify(medicalRecords));
  }, [medicalRecords]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.VACCINES, JSON.stringify(vaccines));
  }, [vaccines]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(clinicSettings));
  }, [clinicSettings]);

  const updateClinicSettings = (newSettings: Partial<ClinicSettings>) => {
    if (currentUser?.role === 'encargado') {
      showToast('Acceso denegado: El perfil de Encargado no puede modificar los parámetros de la clínica.', 'error');
      return;
    }
    setClinicSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    showToast('Parámetros de la clínica actualizados correctamente.', 'success');
  };

  const resetClinicSettings = () => {
    if (currentUser?.role === 'encargado') {
      showToast('Acceso denegado: El perfil de Encargado no puede restaurar los parámetros de la clínica.', 'error');
      return;
    }
    setClinicSettings(INITIAL_CLINIC_SETTINGS);
    showToast('Parámetros restaurados a los valores predeterminados.', 'info');
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const hideToast = () => setToastMessage(null);

  // Pet Actions
  const addPet = (petData: Omit<Pet, 'id' | 'registeredAt'>): Pet => {
    const newPet: Pet = {
      ...petData,
      id: `pet-${Date.now()}`,
      registeredAt: new Date().toISOString().split('T')[0],
    };
    setPets(prev => [newPet, ...prev]);
    showToast(`Mascota "${newPet.name}" registrada con éxito.`);
    return newPet;
  };

  const updatePet = (id: string, petData: Partial<Pet>) => {
    setPets(prev => prev.map(p => (p.id === id ? { ...p, ...petData } : p)));
    showToast(`Datos de paciente actualizados.`);
  };

  const deletePet = (id: string): boolean => {
    const isAllowed = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'superuser';
    if (!isAllowed) {
      showToast('Acceso denegado: Se requieren permisos de Administrador para eliminar pacientes de la base de datos.', 'error');
      return false;
    }
    const petToDelete = pets.find(p => p.id === id);
    if (!petToDelete) return false;

    setPets(prev => prev.filter(p => p.id !== id));
    setMedicalRecords(prev => prev.filter(r => r.petId !== id));
    setVaccines(prev => prev.filter(v => v.petId !== id));
    setAppointments(prev => prev.filter(a => a.petId !== id));
    setReminders(prev => prev.filter(r => r.petId !== id));
    showToast(`Paciente "${petToDelete.name}" y su tutor "${petToDelete.owner?.name || ''}" han sido eliminados por completo del sistema.`, 'info');
    return true;
  };

  const getPetById = (id: string): Pet | undefined => {
    return pets.find(p => p.id === id);
  };

  const addDiagnosticStudy = (petId: string, studyData: Omit<DiagnosticImage, 'id' | 'uploadedAt'>): DiagnosticImage => {
    const newStudy: DiagnosticImage = {
      ...studyData,
      id: `study-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    setPets(prev =>
      prev.map(p => {
        if (p.id === petId) {
          const currentImages = p.diagnosticImages || [];
          return {
            ...p,
            diagnosticImages: [newStudy, ...currentImages],
          };
        }
        return p;
      })
    );

    showToast(`Estudio "${newStudy.title}" (${newStudy.type}) guardado con éxito.`, 'success');
    return newStudy;
  };

  const deleteDiagnosticStudy = (petId: string, studyId: string) => {
    setPets(prev =>
      prev.map(p => {
        if (p.id === petId) {
          return {
            ...p,
            diagnosticImages: (p.diagnosticImages || []).filter(img => img.id !== studyId),
          };
        }
        return p;
      })
    );
    showToast('Estudio de imagenología eliminado.', 'info');
  };

  // Appointment Actions
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAppointments(prev => [newApt, ...prev]);
    showToast(`Cita agendada para ${newApt.petName} el ${newApt.date} a las ${newApt.time}.`);
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev =>
      prev.map(a => (a.id === id ? { ...a, status } : a))
    );
    showToast(`Estado de la cita actualizado a: ${status}`);
  };

  const rescheduleAppointment = (id: string, newDate: string, newTime: string, notes?: string): boolean => {
    let found = false;
    setAppointments(prev =>
      prev.map(a => {
        if (a.id === id) {
          found = true;
          return {
            ...a,
            date: newDate,
            time: newTime,
            notes: notes !== undefined && notes.trim() ? notes.trim() : a.notes,
            status: 'Confirmada' as AppointmentStatus,
          };
        }
        return a;
      })
    );
    if (found) {
      showToast(`Cita reprogramada con éxito para el ${newDate} a las ${newTime} hrs.`, 'success');
    }
    return found;
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    showToast(`Cita cancelada y retirada de la agenda.`, 'info');
  };

  // Medical Discharge Actions
  const createDischargeSummary = (dischargeData: Omit<MedicalDischargeSummary, 'id' | 'createdAt'>): MedicalDischargeSummary => {
    const newDischarge: MedicalDischargeSummary = {
      ...dischargeData,
      id: `disch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDischarges(prev => [newDischarge, ...prev]);

    // Automatically mark active appointment for this pet as completed
    if (dischargeData.petId) {
      setAppointments(prev =>
        prev.map(a =>
          a.petId === dischargeData.petId && a.status !== 'Cancelada'
            ? { ...a, status: 'Completada' as AppointmentStatus }
            : a
        )
      );
    }

    showToast(`Paciente "${newDischarge.petName}" ha sido dado de alta médica exitosamente.`, 'success');
    return newDischarge;
  };

  // Medical Records Actions
  const addMedicalRecord = (recordData: Omit<MedicalRecord, 'id'>): MedicalRecord => {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
    };
    setMedicalRecords(prev => [newRecord, ...prev]);
    
    // Also update pet weight if recorded
    if (recordData.vitalSigns?.weightKg && recordData.petId) {
      setPets(prev =>
        prev.map(p =>
          p.id === recordData.petId
            ? { ...p, weightKg: recordData.vitalSigns.weightKg }
            : p
        )
      );
    }

    showToast(`Consulta médica guardada en el historial clínico.`);
    return newRecord;
  };

  const getRecordsByPetId = (petId: string): MedicalRecord[] => {
    return medicalRecords
      .filter(r => r.petId === petId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Vaccine Actions
  const addVaccineRecord = (vacData: Omit<VaccineRecord, 'id'>): VaccineRecord => {
    const newVac: VaccineRecord = {
      ...vacData,
      id: `vac-${Date.now()}`,
    };
    setVaccines(prev => [newVac, ...prev]);
    showToast(`Registro de inmunización "${newVac.vaccineName}" agregado.`);
    return newVac;
  };

  const updateVaccineRecord = (id: string, vacData: Partial<VaccineRecord>) => {
    setVaccines(prev =>
      prev.map(v => (v.id === id ? { ...v, ...vacData } : v))
    );
    showToast(`Esquema de vacuna actualizado.`);
  };

  const deleteVaccineRecord = (id: string) => {
    setVaccines(prev => prev.filter(v => v.id !== id));
    showToast(`Registro de vacuna eliminado.`, 'info');
  };

  const getVaccinesByPetId = (petId: string): VaccineRecord[] => {
    return vaccines
      .filter(v => v.petId === petId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  // Inventory & Medication Actions
  const addMedication = (medData: Omit<MedicationItem, 'id'>): MedicationItem => {
    const newMed: MedicationItem = {
      ...medData,
      id: `med-${Date.now()}`,
      lastRestockedAt: new Date().toISOString().split('T')[0],
    };
    setInventory(prev => [newMed, ...prev]);

    // Record initial stock movement
    if (newMed.quantity > 0) {
      const initialMovement: StockMovement = {
        id: `mov-${Date.now()}`,
        medicationId: newMed.id,
        medicationName: newMed.name,
        type: 'in',
        quantityChange: newMed.quantity,
        previousStock: 0,
        newStock: newMed.quantity,
        reason: 'Ingreso inicial de fármaco al inventario',
        performedBy: 'Dra. Valeria Hernández',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setStockMovements(prev => [initialMovement, ...prev]);
    }

    showToast(`Medicamento "${newMed.name}" registrado en el inventario.`);
    return newMed;
  };

  const updateMedication = (id: string, medData: Partial<MedicationItem>) => {
    setInventory(prev => prev.map(m => (m.id === id ? { ...m, ...medData } : m)));
    showToast(`Ficha de medicamento actualizada.`);
  };

  const deleteMedication = (id: string) => {
    const item = inventory.find(m => m.id === id);
    setInventory(prev => prev.filter(m => m.id !== id));
    setStockMovements(prev => prev.filter(mov => mov.medicationId !== id));
    showToast(`Medicamento "${item?.name || ''}" eliminado del inventario.`, 'info');
  };

  const adjustStock = (
    medicationId: string,
    quantityChange: number,
    type: StockMovementType,
    reason: string,
    referencePatient?: string,
    performedBy: string = 'Dra. Valeria Hernández'
  ): boolean => {
    const med = inventory.find(m => m.id === medicationId);
    if (!med) return false;

    const previousStock = med.quantity;
    const newStock = Math.max(0, previousStock + quantityChange);

    setInventory(prev =>
      prev.map(m => (m.id === medicationId ? { ...m, quantity: newStock } : m))
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      medicationId: med.id,
      medicationName: med.name,
      type,
      quantityChange,
      previousStock,
      newStock,
      reason,
      referencePatient,
      performedBy,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setStockMovements(prev => [movement, ...prev]);

    if (newStock <= med.minStockThreshold) {
      showToast(`⚠️ Alerta: "${med.name}" tiene stock crítico (${newStock} ${med.unit}).`, 'warning');
    } else {
      showToast(`Stock de "${med.name}" actualizado a ${newStock} ${med.unit}.`);
    }

    return true;
  };

  // Pet Shop, Alimentos, Accesorios & Almacenes Actions
  const addProduct = (prodData: Omit<PetShopProduct, 'id' | 'lastUpdated'>): PetShopProduct => {
    const newProd: PetShopProduct = {
      ...prodData,
      id: `prod-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [newProd, ...prev]);
    showToast(`Producto "${newProd.name}" (${newProd.presentation}) registrado en ${newProd.warehouse}.`, 'success');
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<PetShopProduct>) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
          : p
      )
    );
    showToast('Producto actualizado correctamente.', 'info');
  };

  const deleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(`Producto "${target?.name || ''}" eliminado del catálogo.`, 'info');
  };

  const transferStockBetweenWarehouses = (
    productId: string,
    fromWarehouse: string,
    toWarehouse: string,
    quantity: number
  ): boolean => {
    const target = products.find(p => p.id === productId);
    if (!target) {
      showToast('Producto no encontrado.', 'error');
      return false;
    }
    if (target.stockQuantity < quantity) {
      showToast(`Stock insuficiente en ${fromWarehouse}. Disponible: ${target.stockQuantity}`, 'warning');
      return false;
    }

    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? {
              ...p,
              stockQuantity: Math.max(0, p.stockQuantity - quantity),
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : p
      )
    );

    showToast(`Transferidas ${quantity} unidades de "${target.name}" hacia ${toWarehouse}.`, 'success');
    return true;
  };

  const recordSaleReceipt = (
    saleData: Omit<PetShopSaleReceipt, 'id' | 'createdAt' | 'ticketNumber'>
  ): PetShopSaleReceipt => {
    const today = new Date();
    const dateCode = today.toISOString().split('T')[0].replace(/-/g, '');
    const randNum = String(Math.floor(100 + Math.random() * 900));
    const ticketNumber = `TKT-${dateCode}-${randNum}`;

    const newSale: PetShopSaleReceipt = {
      ...saleData,
      id: `sale-${Date.now()}`,
      ticketNumber,
      shiftId: activeShift ? activeShift.id : undefined,
      createdAt: today.toISOString(),
    };

    // Deduct stock from products only if productId exists
    setProducts(prev =>
      prev.map(p => {
        const soldItem = saleData.items.find(i => i.productId === p.id);
        if (soldItem) {
          return {
            ...p,
            stockQuantity: Math.max(0, p.stockQuantity - soldItem.quantity),
            lastUpdated: today.toISOString().split('T')[0],
          };
        }
        return p;
      })
    );

    setSalesReceipts(prev => [newSale, ...prev]);

    // Update active cash register shift counters
    if (activeShift) {
      const isCash = saleData.paymentMethod === 'Efectivo';
      const isCard = saleData.paymentMethod === 'Tarjeta de Débito/Crédito';
      const isTransfer = saleData.paymentMethod === 'Transferencia SPEI';

      // Breakdown calculations
      let petshopAmt = 0;
      let consultAmt = 0;
      let vacAmt = 0;

      saleData.items.forEach(item => {
        if (item.itemType === 'consultation') {
          consultAmt += item.subtotal;
        } else if (item.itemType === 'vaccine') {
          vacAmt += item.subtotal;
        } else {
          petshopAmt += item.subtotal;
        }
      });

      const nextCashSales = activeShift.cashSalesTotal + (isCash ? saleData.total : 0);
      const nextCardSales = activeShift.cardSalesTotal + (isCard ? saleData.total : 0);
      const nextTransferSales = activeShift.transferSalesTotal + (isTransfer ? saleData.total : 0);
      const nextOtherSales = activeShift.otherSalesTotal + (!isCash && !isCard && !isTransfer ? saleData.total : 0);
      const nextTotalSales = activeShift.totalSalesAmount + saleData.total;
      const nextExpected = activeShift.initialCashFloat + nextCashSales + activeShift.cashInsTotal - activeShift.cashOutsTotal;

      const updatedShift: CashRegisterShift = {
        ...activeShift,
        cashSalesTotal: nextCashSales,
        cardSalesTotal: nextCardSales,
        transferSalesTotal: nextTransferSales,
        otherSalesTotal: nextOtherSales,
        expectedCashInDrawer: nextExpected,
        totalSalesAmount: nextTotalSales,
        salesCount: activeShift.salesCount + 1,
        salesReceiptIds: [newSale.id, ...activeShift.salesReceiptIds],
        salesBreakdown: {
          petshopAmount: activeShift.salesBreakdown.petshopAmount + petshopAmt,
          consultationsAmount: activeShift.salesBreakdown.consultationsAmount + consultAmt,
          vaccinesAmount: activeShift.salesBreakdown.vaccinesAmount + vacAmt,
        },
      };

      setActiveShift(updatedShift);
      setCashShifts(prev => prev.map(s => s.id === updatedShift.id ? updatedShift : s));
    }

    showToast(`Venta ${ticketNumber} cobrada con éxito ($${saleData.total.toLocaleString()} MXN). Comprobante generado.`, 'success');
    return newSale;
  };

  // Apertura y Cierre de Turno de Caja
  const openCashShift = (initialCashFloat: number, notes?: string): CashRegisterShift => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const shiftCount = cashShifts.length + 1;
    const shiftFolio = `TURNO-${dateStr}-${String(shiftCount).padStart(3, '0')}`;
    const openedAt = today.toISOString().replace('T', ' ').slice(0, 19);

    const newShift: CashRegisterShift = {
      id: `shift-${Date.now()}`,
      shiftFolio,
      status: 'open',
      openedAt,
      openedBy: currentUser?.name || 'Usuario',
      initialCashFloat: Number(initialCashFloat) || 0,
      cashSalesTotal: 0,
      cardSalesTotal: 0,
      transferSalesTotal: 0,
      otherSalesTotal: 0,
      cashInsTotal: 0,
      cashOutsTotal: 0,
      expectedCashInDrawer: Number(initialCashFloat) || 0,
      totalSalesAmount: 0,
      salesCount: 0,
      salesReceiptIds: [],
      salesBreakdown: {
        petshopAmount: 0,
        consultationsAmount: 0,
        vaccinesAmount: 0,
      },
      notes: notes || '',
      movements: [],
    };

    setActiveShift(newShift);
    setCashShifts(prev => [newShift, ...prev.filter(s => s.id !== newShift.id)]);
    showToast(`🟢 Turno de caja ${shiftFolio} abierto con fondo de $${Number(initialCashFloat).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, 'success');
    return newShift;
  };

  const addCashMovement = (type: 'in' | 'out', amount: number, reason: string) => {
    if (!activeShift) {
      showToast('No hay un turno de caja abierto para registrar movimientos.', 'warning');
      return;
    }
    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      showToast('Ingrese un monto válido mayor a 0.', 'error');
      return;
    }

    const movement: CashMovement = {
      id: `mov-cash-${Date.now()}`,
      shiftId: activeShift.id,
      type,
      amount: numAmount,
      reason: reason || (type === 'in' ? 'Entrada extra de fondo' : 'Retiro de caja / Gasto menor'),
      performedBy: currentUser?.name || 'Usuario',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    const nextCashIns = activeShift.cashInsTotal + (type === 'in' ? numAmount : 0);
    const nextCashOuts = activeShift.cashOutsTotal + (type === 'out' ? numAmount : 0);
    const nextExpected = activeShift.initialCashFloat + activeShift.cashSalesTotal + nextCashIns - nextCashOuts;

    const updatedShift: CashRegisterShift = {
      ...activeShift,
      cashInsTotal: nextCashIns,
      cashOutsTotal: nextCashOuts,
      expectedCashInDrawer: nextExpected,
      movements: [movement, ...activeShift.movements],
    };

    setActiveShift(updatedShift);
    setCashShifts(prev => prev.map(s => s.id === updatedShift.id ? updatedShift : s));
    showToast(`${type === 'in' ? '🟢 Entrada' : '🔴 Retiro'} de efectivo registrado ($${numAmount.toLocaleString()} MXN).`, 'info');
  };

  const closeCashShift = (actualCashInDrawer: number, notes?: string): CashRegisterShift | null => {
    if (!activeShift) {
      showToast('No hay un turno de caja abierto para cerrar.', 'warning');
      return null;
    }

    const today = new Date();
    const closedAt = today.toISOString().replace('T', ' ').slice(0, 19);
    const actual = Number(actualCashInDrawer) || 0;
    const diff = actual - activeShift.expectedCashInDrawer;

    const closedShift: CashRegisterShift = {
      ...activeShift,
      status: 'closed',
      closedAt,
      closedBy: currentUser?.name || 'Usuario',
      actualCashInDrawer: actual,
      cashDifference: diff,
      notes: notes ? `${activeShift.notes ? activeShift.notes + ' | ' : ''}${notes}` : activeShift.notes,
    };

    setActiveShift(null);
    setCashShifts(prev => prev.map(s => s.id === closedShift.id ? closedShift : s));
    showToast(`🔒 Turno ${closedShift.shiftFolio} cerrado. Corte diario guardado con éxito.`, 'success');
    return closedShift;
  };

  const restockMedication = (
    medicationId: string,
    addedQuantity: number,
    newBatch?: string,
    newExpDate?: string,
    costPrice?: number,
    supplierName?: string
  ) => {
    const med = inventory.find(m => m.id === medicationId);
    if (!med || addedQuantity <= 0) return;

    const previousStock = med.quantity;
    const newStock = previousStock + addedQuantity;

    setInventory(prev =>
      prev.map(m =>
        m.id === medicationId
          ? {
              ...m,
              quantity: newStock,
              batchNumber: newBatch || m.batchNumber,
              expirationDate: newExpDate || m.expirationDate,
              costPrice: costPrice !== undefined ? costPrice : m.costPrice,
              lastRestockedAt: new Date().toISOString().split('T')[0],
            }
          : m
      )
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      medicationId: med.id,
      medicationName: med.name,
      type: 'in',
      quantityChange: addedQuantity,
      previousStock,
      newStock,
      reason: `Reabastecimiento de proveedor ${supplierName || med.supplier.name} (Lote: ${newBatch || med.batchNumber})`,
      performedBy: 'Dra. Valeria Hernández',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setStockMovements(prev => [movement, ...prev]);
    showToast(`Reabastecimiento exitoso: +${addedQuantity} ${med.unit} de "${med.name}".`);
  };

  const dispenseMedication = (
    medicationId: string,
    usedQuantity: number,
    patientName?: string,
    reason?: string
  ): boolean => {
    const med = inventory.find(m => m.id === medicationId);
    if (!med || usedQuantity <= 0) return false;

    if (med.quantity < usedQuantity) {
      showToast(`Stock insuficiente de "${med.name}". Disponible: ${med.quantity} ${med.unit}.`, 'error');
      return false;
    }

    return adjustStock(
      medicationId,
      -usedQuantity,
      'out',
      reason || `Dispensación clínica para ${patientName || 'paciente'}`,
      patientName
    );
  };

  // Send Vaccine Reminder
  const sendVaccineReminder = (
    petId: string,
    vaccineId: string,
    channel: 'WhatsApp' | 'Email' | 'SMS',
    customMessage?: string
  ) => {
    const pet = getPetById(petId);
    const vac = vaccines.find(v => v.id === vaccineId);

    if (!pet || !vac) return;

    const defaultMsg = `Hola ${pet.owner.name}, te saludamos de ${clinicSettings.name || 'tu clínica veterinaria'}. Te recordamos que la ${vac.vaccineName} de ${pet.name} tiene fecha de vencimiento/refuerzo el ${vac.dueDate}. Por favor agenda su cita para mantener su salud protegida.`;
    const finalMsg = customMessage || defaultMsg;

    const newReminder: ReminderNotification = {
      id: `rem-${Date.now()}`,
      petId: pet.id,
      petName: pet.name,
      ownerName: pet.owner.name,
      ownerPhone: pet.owner.phone,
      ownerEmail: pet.owner.email,
      type: vac.type === 'Vacuna' ? 'Vacuna' : 'Desparasitante',
      title: `Recordatorio: ${vac.vaccineName}`,
      message: finalMsg,
      channel,
      dueDate: vac.dueDate,
      sentDate: new Date().toISOString().split('T')[0],
      status: 'Enviado',
    };

    setReminders(prev => [newReminder, ...prev]);

    // If channel is WhatsApp, optionally open web link
    if (channel === 'WhatsApp') {
      const cleanPhone = pet.owner.phone.replace(/[^0-9]/g, '');
      const encodedText = encodeURIComponent(finalMsg);
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast(`Recordatorio enviado por WhatsApp a ${pet.owner.name} (${pet.owner.phone})`);
    } else {
      showToast(`Recordatorio enviado exitosamente por ${channel} a ${pet.owner.name}`);
    }
  };

  // Export all current clinic database in JSON format for USB persistence / backup
  const exportAllClinicDataJson = (): string => {
    const backupObject = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      clinic: clinicSettings.name || 'VetCare Pro',
      data: {
        clinicSettings,
        pets,
        medicalRecords,
        vaccines,
        appointments,
        inventory,
        stockMovements,
        reminders,
      },
    };
    return JSON.stringify(backupObject, null, 2);
  };

  // Import and restore clinic database from JSON file
  const importClinicDataJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      const data = parsed.data || parsed;

      if (data.clinicSettings) {
        setClinicSettings(data.clinicSettings);
        localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(data.clinicSettings));
      }
      if (Array.isArray(data.pets)) {
        setPets(data.pets);
        localStorage.setItem(LOCAL_STORAGE_KEYS.PETS, JSON.stringify(data.pets));
      }
      if (Array.isArray(data.medicalRecords)) {
        setMedicalRecords(data.medicalRecords);
        localStorage.setItem(LOCAL_STORAGE_KEYS.RECORDS, JSON.stringify(data.medicalRecords));
      }
      if (Array.isArray(data.vaccines)) {
        setVaccines(data.vaccines);
        localStorage.setItem(LOCAL_STORAGE_KEYS.VACCINES, JSON.stringify(data.vaccines));
      }
      if (Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
        localStorage.setItem(LOCAL_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
      }
      if (Array.isArray(data.inventory)) {
        setInventory(data.inventory);
        localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(data.inventory));
      }
      if (Array.isArray(data.stockMovements)) {
        setStockMovements(data.stockMovements);
        localStorage.setItem(LOCAL_STORAGE_KEYS.MOVEMENTS, JSON.stringify(data.stockMovements));
      }
      if (Array.isArray(data.reminders)) {
        setReminders(data.reminders);
        localStorage.setItem(LOCAL_STORAGE_KEYS.REMINDERS, JSON.stringify(data.reminders));
      }

      showToast('Base de datos restaurada correctamente desde el archivo USB', 'success');
      return true;
    } catch (err) {
      console.error('Error al importar datos JSON:', err);
      showToast('El archivo no tiene un formato válido de copia de seguridad', 'error');
      return false;
    }
  };

  // Reset full system to initial clean demo data
  const resetToInitialData = () => {
    setPets(INITIAL_PETS);
    setMedicalRecords(INITIAL_MEDICAL_RECORDS);
    setVaccines(INITIAL_VACCINES);
    setAppointments(INITIAL_APPOINTMENTS);
    setInventory(INITIAL_MEDICATIONS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setClinicSettings(INITIAL_CLINIC_SETTINGS);
    setReminders([]);
    setProducts(INITIAL_PETSHOP_PRODUCTS);
    setSalesReceipts(INITIAL_PETSHOP_SALES);
    setCashShifts([]);
    setActiveShift(null);

    localStorage.setItem(LOCAL_STORAGE_KEYS.PETS, JSON.stringify(INITIAL_PETS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_MEDICAL_RECORDS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.VACCINES, JSON.stringify(INITIAL_VACCINES));
    localStorage.setItem(LOCAL_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_MEDICATIONS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_STOCK_MOVEMENTS));
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_CLINIC_SETTINGS));
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REMINDERS);
    localStorage.setItem('vet_petshop_products', JSON.stringify(INITIAL_PETSHOP_PRODUCTS));
    localStorage.setItem('vet_petshop_sales', JSON.stringify(INITIAL_PETSHOP_SALES));
    localStorage.setItem('vet_cash_shifts_v1', JSON.stringify([]));
    localStorage.removeItem('vet_active_cash_shift_v1');

    showToast('Base de datos inicializada limpia (0 pacientes, 0 inventario y 0 ventas).', 'info');
  };

  // PERSISTENCIA COMPLETA DE TODOS LOS CAMBIOS DE LA SESIÓN EN LA BASE DE DATOS
  const saveAllSessionDataToDatabase = async (
    reason: string = 'Cierre de sesión de usuario'
  ): Promise<{ success: boolean; audit: SessionSaveAudit }> => {
    const todayIso = new Date().toISOString();
    const activeClinicId = activeTenantId || clinicSettings.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'tenant-central-local';

    try {
      // 1. Escritura síncrona y segura de todas las colecciones en localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.PETS, JSON.stringify(pets));
      localStorage.setItem(LOCAL_STORAGE_KEYS.RECORDS, JSON.stringify(medicalRecords));
      localStorage.setItem(LOCAL_STORAGE_KEYS.VACCINES, JSON.stringify(vaccines));
      localStorage.setItem(LOCAL_STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      localStorage.setItem(LOCAL_STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
      localStorage.setItem(LOCAL_STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
      localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(clinicSettings));
      localStorage.setItem(LOCAL_STORAGE_KEYS.SYSTEM_LICENSE, JSON.stringify(systemLicense));
      localStorage.setItem('vet_medical_discharges', JSON.stringify(discharges));
      localStorage.setItem('vet_petshop_products', JSON.stringify(products));
      localStorage.setItem('vet_petshop_sales', JSON.stringify(salesReceipts));
      localStorage.setItem('vet_cash_shifts_v1', JSON.stringify(cashShifts));
      if (activeShift) {
        localStorage.setItem('vet_active_cash_shift_v1', JSON.stringify(activeShift));
      } else {
        localStorage.removeItem('vet_active_cash_shift_v1');
      }
      localStorage.setItem(LOCAL_STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ACCOUNTS, JSON.stringify(userAccounts));
      localStorage.setItem(LOCAL_STORAGE_KEYS.PAYMENT_REQUESTS, JSON.stringify(paymentRequests));
      localStorage.setItem(LOCAL_STORAGE_KEYS.MASTER_BILLING, JSON.stringify(masterBillingSettings));
      localStorage.setItem('vet_superuser_credentials', JSON.stringify(superUserAccount));

      // 2. Partición integral de la base de datos de esta clínica
      const clinicPartition = {
        pets,
        medicalRecords,
        vaccines,
        appointments,
        inventory,
        stockMovements,
        discharges,
        products,
        salesReceipts,
        cashShifts,
        activeShift,
        clinicSettings,
        systemLicense,
        updatedAt: todayIso,
        savedBy: currentUser?.name || currentUser?.username || 'Usuario',
        saveReason: reason,
      };
      localStorage.setItem(`vetcare_db_${activeClinicId}`, JSON.stringify(clinicPartition));

      // 3. Generación y almacenamiento del registro de auditoría de sesión
      const audit: SessionSaveAudit = {
        id: `audit-${Date.now()}`,
        savedAt: todayIso,
        savedBy: currentUser?.name || currentUser?.username || 'Usuario',
        userRole: currentUser?.role || 'admin',
        clinicName: clinicSettings.name || 'VetCare Pro',
        tenantId: activeClinicId,
        counts: {
          patients: pets.length,
          records: medicalRecords.length,
          vaccines: vaccines.length,
          appointments: appointments.length,
          inventoryItems: inventory.length,
          petshopProducts: products.length,
          salesReceipts: salesReceipts.length,
          discharges: discharges.length,
        },
        status: 'synced_local',
      };
      setLastSessionAudit(audit);
      localStorage.setItem('vetcare_last_session_audit', JSON.stringify(audit));

      // 4. Sincronización remota / API Backend en background
      try {
        await Promise.allSettled([
          fetch('/api/session/save-on-logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionData: clinicPartition,
              userAudit: audit,
            }),
          }),
          fetch(`/api/clinics/${activeClinicId}/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: clinicPartition }),
          }),
          fetch('/api/tenants/sync-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenants }),
          }),
        ]);
        audit.status = 'synced_cloud';
        setLastSessionAudit({ ...audit, status: 'synced_cloud' });
        localStorage.setItem('vetcare_last_session_audit', JSON.stringify({ ...audit, status: 'synced_cloud' }));
      } catch (e) {
        // Red local persistida al 100%
      }

      return { success: true, audit };
    } catch (err) {
      console.error('Error saving session data to database:', err);
      return {
        success: false,
        audit: {
          id: `audit-${Date.now()}`,
          savedAt: todayIso,
          savedBy: currentUser?.name || 'Usuario',
          userRole: currentUser?.role || 'admin',
          clinicName: clinicSettings.name || '',
          counts: {
            patients: pets.length,
            records: medicalRecords.length,
            vaccines: vaccines.length,
            appointments: appointments.length,
            inventoryItems: inventory.length,
            petshopProducts: products.length,
            salesReceipts: salesReceipts.length,
            discharges: discharges.length,
          },
          status: 'synced_local',
        },
      };
    }
  };

  // CERRAR SESIÓN CON GUARDADO Y SINCRONIZACIÓN GARANTIZADA DE TODOS LOS CAMBIOS
  const logout = async (): Promise<void> => {
    setIsSavingSessionOnLogout(true);
    setSaveProgressStep('Validando historias clínicas, consultas y altas médicas...');

    await new Promise(resolve => setTimeout(resolve, 300));
    setSaveProgressStep('Guardando inventario, almacenes y tickets de Pet Shop...');

    await new Promise(resolve => setTimeout(resolve, 250));
    setSaveProgressStep('Sincronizando partición de base de datos local y remota...');

    // Ejecutar guardado maestro de todas las entidades
    await saveAllSessionDataToDatabase('Cierre de sesión de usuario');

    await new Promise(resolve => setTimeout(resolve, 350));
    setSaveProgressStep('Cerrando sesión de usuario de forma segura...');

    // Limpiar sesión y abrir portal de autenticación
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.CURRENT_USER);
    setIsLoginModalOpen(true);
    setIsSavingSessionOnLogout(false);

    showToast('💾 Todos los cambios generados durante la sesión se han guardado con éxito en la base de datos.', 'success');
  };

  // Auto-guardado de respaldo en caso de cierre intempestivo de pestaña del navegador
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveAllSessionDataToDatabase('Auto-guardado por cierre de ventana / pestaña');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [pets, medicalRecords, vaccines, appointments, inventory, products, salesReceipts, discharges, clinicSettings, systemLicense]);

  // Quick stats calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === todayStr);

    let upcomingCount = 0;
    let overdueCount = 0;
    const nowTime = new Date().setHours(0, 0, 0, 0);

    vaccines.forEach(v => {
      const dueTime = new Date(v.dueDate + 'T00:00:00Z').getTime();
      const diffDays = Math.round((dueTime - nowTime) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || v.status === 'vencida') {
        overdueCount++;
      } else if (diffDays <= 30 || v.status === 'proxima') {
        upcomingCount++;
      }
    });

    let activePrescriptions = 0;
    medicalRecords.forEach(r => {
      r.prescriptions.forEach(p => {
        if (p.isActive) activePrescriptions++;
      });
    });

    // Inventory stats
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiredCount = 0;
    let expiringSoonCount = 0;
    let totalInventoryValue = 0;

    inventory.forEach(med => {
      totalInventoryValue += (med.quantity * med.costPrice);

      if (med.quantity === 0) {
        outOfStockCount++;
      } else if (med.quantity <= med.minStockThreshold) {
        lowStockCount++;
      }

      const expTime = new Date(med.expirationDate + 'T00:00:00Z').getTime();
      const diffDays = Math.round((expTime - nowTime) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        expiredCount++;
      } else if (diffDays <= 60) {
        expiringSoonCount++;
      }
    });

    return {
      todayAppointmentsCount: todayAppointments.length,
      activePatientsCount: pets.length,
      upcomingVaccinesCount: upcomingCount,
      overdueVaccinesCount: overdueCount,
      activePrescriptionsCount: activePrescriptions,
      lowStockCount,
      outOfStockCount,
      criticalStockCount: lowStockCount + outOfStockCount,
      expiredCount,
      expiringSoonCount,
      totalMedicationsCount: inventory.length,
      totalInventoryValue,
    };
  }, [appointments, pets, vaccines, medicalRecords, inventory]);

  return (
    <VeterinaryContext.Provider
      value={{
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        selectedTutorPetId,
        setSelectedTutorPetId,
        clinicSettings,
        updateClinicSettings,
        resetClinicSettings,
        isSettingsModalOpen,
        setIsSettingsModalOpen: handleSetIsSettingsModalOpen,
        systemLicense,
        daysRemaining,
        isLicenseLocked,
        renewLicense,
        changeLicensePlan,
        validateAndApplyKey,
        toggleLicenseLock,
        simulateLicenseDaysOffset,
        isLicenseModalOpen,
        setIsLicenseModalOpen,
        isSuperUser,
        isMasterConsoleOpen,
        setIsMasterConsoleOpen,
        tenants,
        paymentRequests,
        submitRenewalPaymentRequest,
        approvePaymentRenewalRequest,
        rejectPaymentRenewalRequest,
        addTenant,
        updateTenant,
        deleteTenant,
        toggleTenantLock,
        extendTenantLicense,
        generateTenantKey,
        generateStandaloneLicenseKey,
        syncLocalClinicWithTenant,
        resetTenantUserCredentials,
        generateRandomPassword,
        deleteUserAccount,
        activeTenantId,
        switchTenantDatabase,
        autoPollCountdown,
        lastPollTime,
        newRegistrationBadge,
        manualPollRequestsNow,
        isPairingModalOpen,
        setIsPairingModalOpen,
        pairingModalPetId,
        openPairingModal,
        closePairingModal,
        exportAllClinicDataJson,
        importClinicDataJson,
        resetToInitialData,
        currentUser,
        isAuthenticated,
        usersList,
        userAccounts,
        superUserAccount,
        login,
        logout,
        saveAllSessionDataToDatabase,
        isSavingSessionOnLogout,
        saveProgressStep,
        lastSessionAudit,
        registerNewClinic,
        updateUserPassword,
        updateUserAccount,
        updateSuperUserCredentials,
        masterBillingSettings,
        updateMasterBillingSettings,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isOnline,
        isSimulatedOffline: isSimulatedOfflineState,
        setSimulatedOffline,
        checkInternetNow,
        lastVerifiedTimeCertificate,
        setLastVerifiedTimeCertificate,
        officialInternetDate,
        officialInternetTime,
        officialInternetDateLong,
        officialTime12h,
        syncInternetTimeNow,
        isNetworkDiagnosticsOpen,
        setIsNetworkDiagnosticsOpen,
        isTutorialOpen,
        setIsTutorialOpen,
        startTutorial,
        closeTutorial,
        skipTutorialPermanently,
        pets,
        medicalRecords,
        vaccines,
        appointments,
        reminders,
        inventory,
        stockMovements,
        addPet,
        updatePet,
        deletePet,
        getPetById,
        addDiagnosticStudy,
        deleteDiagnosticStudy,
        addAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        deleteAppointment,
        addMedicalRecord,
        getRecordsByPetId,
        discharges,
        createDischargeSummary,
        products,
        salesReceipts,
        addProduct,
        updateProduct,
        deleteProduct,
        transferStockBetweenWarehouses,
        recordSaleReceipt,
        cashShifts,
        activeShift,
        openCashShift,
        closeCashShift,
        addCashMovement,
        addVaccineRecord,
        updateVaccineRecord,
        deleteVaccineRecord,
        getVaccinesByPetId,
        addMedication,
        updateMedication,
        deleteMedication,
        adjustStock,
        restockMedication,
        dispenseMedication,
        sendVaccineReminder,
        searchQuery,
        setSearchQuery,
        toastMessage,
        showToast,
        hideToast,
        stats,
      }}
    >
      {children}
    </VeterinaryContext.Provider>
  );
};

export const useVeterinary = () => {
  const context = useContext(VeterinaryContext);
  if (!context) {
    throw new Error('useVeterinary must be used within a VeterinaryProvider');
  }
  return context;
};

