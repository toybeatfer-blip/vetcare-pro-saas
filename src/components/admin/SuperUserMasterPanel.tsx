import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Lock,
  Unlock,
  Key,
  Calendar,
  DollarSign,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  MessageCircle,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Sparkles,
  Zap,
  LogIn,
  Shield,
  Check,
  X,
  UserCheck,
  UserCog,
  KeyRound,
  Eye,
  EyeOff,
  FileText,
  Send,
  Inbox,
  CreditCard,
  Receipt,
  Server,
  Activity,
  Download,
  Upload,
  Settings,
  TrendingUp,
  Globe,
  Sliders,
  LogOut,
  ExternalLink,
  ChevronRight,
  Database,
  Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { TenantClinic, LicensePlan, PaymentRenewalRequest } from '../../types';

interface SuperUserMasterPanelProps {
  onSwitchToClinicView?: () => void;
}

export const SuperUserMasterPanel: React.FC<SuperUserMasterPanelProps> = ({ onSwitchToClinicView }) => {
  const {
    tenants,
    currentUser,
    isSuperUser,
    paymentRequests,
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
    logout,
    exportAllClinicDataJson,
    importClinicDataJson,
    isOnline,
    lastVerifiedTimeCertificate,
    masterBillingSettings,
    updateMasterBillingSettings,
    superUserAccount,
    updateSuperUserCredentials,
    officialInternetDate,
    officialInternetTime,
    officialInternetDateLong,
    officialTime12h,
    syncInternetTimeNow,
    activeTenantId,
    switchTenantDatabase,
    autoPollCountdown,
    lastPollTime,
    newRegistrationBadge,
    manualPollRequestsNow,
  } = useVeterinary();

  // Active section inside the dedicated Master Panel
  const [activeSection, setActiveSection] = useState<'dashboard' | 'tenants' | 'payments' | 'keys' | 'users' | 'settings'>('dashboard');

  // Search and filters for tenants
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked' | 'expiring' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'mensual' | 'anual'>('all');

  // Modal States
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [isEditingBillingModalOpen, setIsEditingBillingModalOpen] = useState(false);
  const [isSuperUserConfigModalOpen, setIsSuperUserConfigModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantClinic | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<TenantClinic | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [selectedTenantForKey, setSelectedTenantForKey] = useState<TenantClinic | null>(null);
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState<TenantClinic | null>(null);
  const [activeUserTab, setActiveUserTab] = useState<'admin' | 'encargado' | 'summary'>('admin');
  const [isSyncingTime, setIsSyncingTime] = useState(false);

  const currentSuperUserAcc = useMemo(() => {
    return superUserAccount || {
      username: currentUser?.username || 'Fernando01',
      name: currentUser?.name || 'Fernando (Super Admin Master)',
      passwordHash: 'Bazzoka1313AS.',
    };
  }, [superUserAccount, currentUser]);

  useEffect(() => {
    manualPollRequestsNow();
  }, []);

  const [superUserForm, setSuperUserForm] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [showSuperUserPassword, setShowSuperUserPassword] = useState(false);

  const handleOpenSuperUserConfig = () => {
    setSuperUserForm({
      username: currentSuperUserAcc.username || 'superuser',
      name: currentSuperUserAcc.name || 'Super Administrador Master',
      password: '',
      confirmPassword: '',
    });
    setShowSuperUserPassword(false);
    setIsSuperUserConfigModalOpen(true);
  };

  const handleSaveSuperUserConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superUserForm.username.trim() || superUserForm.username.trim().length < 3) {
      alert('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (!superUserForm.name.trim() || superUserForm.name.trim().length < 2) {
      alert('El nombre del Super Usuario no puede estar vacío.');
      return;
    }
    if (superUserForm.password.trim()) {
      if (superUserForm.password.trim().length < 4) {
        alert('La nueva contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (superUserForm.password.trim() !== superUserForm.confirmPassword.trim()) {
        alert('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
    }

    const success = updateSuperUserCredentials({
      username: superUserForm.username,
      name: superUserForm.name,
      ...(superUserForm.password.trim() ? { password: superUserForm.password.trim() } : {}),
    });

    if (success) {
      setIsSuperUserConfigModalOpen(false);
    }
  };

  const handleManualSyncTime = async () => {
    setIsSyncingTime(true);
    await syncInternetTimeNow();
    setTimeout(() => setIsSyncingTime(false), 600);
  };

  // Billing Settings Form
  const [billingForm, setBillingForm] = useState({
    bankName: masterBillingSettings.bankName,
    clabe: masterBillingSettings.clabe,
    accountHolder: masterBillingSettings.accountHolder,
    oxxoReference: masterBillingSettings.oxxoReference,
    ownerEmail: masterBillingSettings.ownerEmail,
    supportPhone: masterBillingSettings.supportPhone,
    monthlyPrice: masterBillingSettings.monthlyPrice,
    annualPrice: masterBillingSettings.annualPrice,
    instructionsNotes: masterBillingSettings.instructionsNotes || '',
  });

  // Sync form with context
  useEffect(() => {
    setBillingForm({
      bankName: masterBillingSettings.bankName,
      clabe: masterBillingSettings.clabe,
      accountHolder: masterBillingSettings.accountHolder,
      oxxoReference: masterBillingSettings.oxxoReference,
      ownerEmail: masterBillingSettings.ownerEmail,
      supportPhone: masterBillingSettings.supportPhone,
      monthlyPrice: masterBillingSettings.monthlyPrice,
      annualPrice: masterBillingSettings.annualPrice,
      instructionsNotes: masterBillingSettings.instructionsNotes || '',
    });
  }, [masterBillingSettings]);

  const handleSaveBillingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingForm.bankName.trim() || !billingForm.clabe.trim() || !billingForm.ownerEmail.trim()) {
      alert('Banco, CLABE y Correo del Propietario son obligatorios.');
      return;
    }
    updateMasterBillingSettings({
      bankName: billingForm.bankName.trim(),
      clabe: billingForm.clabe.trim(),
      accountHolder: billingForm.accountHolder.trim(),
      oxxoReference: billingForm.oxxoReference.trim(),
      ownerEmail: billingForm.ownerEmail.trim(),
      supportPhone: billingForm.supportPhone.trim(),
      monthlyPrice: Number(billingForm.monthlyPrice) || 599,
      annualPrice: Number(billingForm.annualPrice) || 5990,
      instructionsNotes: billingForm.instructionsNotes.trim(),
    });
    setIsEditingBillingModalOpen(false);
  };

  // User Management Forms
  const [adminUserForm, setAdminUserForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  });
  const [encargadoUserForm, setEncargadoUserForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  });
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showEncargadoPassword, setShowEncargadoPassword] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Standalone Key Generator State
  const [generatorPlan, setGeneratorPlan] = useState<LicensePlan>('mensual');
  const [generatorClinicName, setGeneratorClinicName] = useState('');
  const [generatedStandaloneKey, setGeneratedStandaloneKey] = useState<{
    key: string;
    serial: string;
    message: string;
  } | null>(null);

  // Tenant Form State
  const [tenantForm, setTenantForm] = useState({
    clinicName: '',
    directorName: '',
    email: '',
    phone: '',
    city: '',
    plan: 'mensual' as LicensePlan,
    priceAmount: 599,
    currency: 'MXN',
    startDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
    adminUsername: '',
    adminPassword: '',
    encargadoUsername: '',
    encargadoPassword: '',
  });

  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const showToast = (msg: string, _type?: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // SaaS KPIs Calculations
  const metrics = useMemo(() => {
    const total = tenants.length;
    const now = new Date();
    const active = tenants.filter(t => t.status === 'active' && !t.isLocked).length;
    const locked = tenants.filter(t => t.isLocked || t.status === 'locked').length;

    const expiringSoon = tenants.filter(t => {
      if (t.isLocked) return false;
      const exp = new Date(t.expirationDate);
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    const expired = tenants.filter(t => {
      const exp = new Date(t.expirationDate);
      return exp < now;
    }).length;

    const mrr = tenants.reduce((acc, t) => {
      if (t.isLocked) return acc;
      if (t.plan === 'mensual') return acc + (t.priceAmount || 599);
      if (t.plan === 'anual') return acc + Math.round((t.priceAmount || 5990) / 12);
      return acc;
    }, 0);

    const arr = mrr * 12;
    const pendingPayments = paymentRequests.filter(r => r.status === 'pending').length;
    const totalPaymentAmountInValidation = paymentRequests
      .filter(r => r.status === 'pending')
      .reduce((acc, r) => acc + r.amount, 0);

    return { total, active, locked, expiringSoon, expired, mrr, arr, pendingPayments, totalPaymentAmountInValidation };
  }, [tenants, paymentRequests]);

  // Filtered Tenants List
  const filteredTenants = useMemo(() => {
    const now = new Date();
    return tenants.filter((tenant) => {
      if (!tenant) return false;
      const term = (searchTerm || '').toLowerCase();
      const clinicName = (tenant.clinicName || '').toLowerCase();
      const directorName = (tenant.directorName || '').toLowerCase();
      const email = (tenant.email || '').toLowerCase();
      const phone = tenant.phone || '';
      const city = (tenant.city || '').toLowerCase();
      const adminUser = (tenant.adminCredentials?.username || '').toLowerCase();
      const encUser = (tenant.encargadoCredentials?.username || '').toLowerCase();

      const matchesSearch =
        clinicName.includes(term) ||
        directorName.includes(term) ||
        email.includes(term) ||
        phone.includes(searchTerm || '') ||
        city.includes(term) ||
        adminUser.includes(term) ||
        encUser.includes(term);

      if (!matchesSearch) return false;

      if (statusFilter === 'active' && (tenant.isLocked || tenant.status === 'locked')) return false;
      if (statusFilter === 'locked' && !tenant.isLocked && tenant.status !== 'locked') return false;

      const expDate = new Date(tenant.expirationDate || now);
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (statusFilter === 'expiring' && (diffDays > 7 || diffDays < 0)) return false;
      if (statusFilter === 'expired' && expDate >= now) return false;
      if (planFilter !== 'all' && tenant.plan !== planFilter) return false;

      return true;
    });
  }, [tenants, searchTerm, statusFilter, planFilter]);

  // Open modal for new tenant
  const handleOpenNewTenantModal = () => {
    setEditingTenant(null);
    setTenantForm({
      clinicName: '',
      directorName: '',
      email: '',
      phone: '',
      city: '',
      plan: 'mensual',
      priceAmount: 599,
      currency: 'MXN',
      startDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: '',
      adminUsername: 'admin',
      adminPassword: 'admin123',
      encargadoUsername: 'encargado',
      encargadoPassword: 'encargado123',
    });
    setIsNewTenantModalOpen(true);
  };

  // Open modal for editing tenant
  const handleOpenEditModal = (tenant: TenantClinic) => {
    setEditingTenant(tenant);
    setTenantForm({
      clinicName: tenant.clinicName,
      directorName: tenant.directorName,
      email: tenant.email,
      phone: tenant.phone,
      city: tenant.city || '',
      plan: tenant.plan,
      priceAmount: tenant.priceAmount,
      currency: tenant.currency || 'MXN',
      startDate: tenant.startDate,
      expirationDate: tenant.expirationDate,
      notes: tenant.notes || '',
      adminUsername: tenant.adminCredentials?.username || 'admin',
      adminPassword: tenant.adminCredentials?.password || 'admin123',
      encargadoUsername: tenant.encargadoCredentials?.username || 'encargado',
      encargadoPassword: tenant.encargadoCredentials?.password || 'encargado123',
    });
    setIsNewTenantModalOpen(true);
  };

  // Save Tenant
  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantForm.clinicName.trim() || !tenantForm.directorName.trim()) {
      alert('El nombre de la clínica y el médico responsable son obligatorios.');
      return;
    }

    if (editingTenant) {
      updateTenant(editingTenant.id, {
        clinicName: tenantForm.clinicName,
        directorName: tenantForm.directorName,
        email: tenantForm.email,
        phone: tenantForm.phone,
        city: tenantForm.city,
        plan: tenantForm.plan,
        priceAmount: Number(tenantForm.priceAmount),
        startDate: tenantForm.startDate,
        expirationDate: tenantForm.expirationDate,
        notes: tenantForm.notes,
        adminCredentials: {
          username: tenantForm.adminUsername || editingTenant.adminCredentials?.username || 'admin',
          password: tenantForm.adminPassword || editingTenant.adminCredentials?.password || 'admin123',
          name: tenantForm.directorName,
          email: tenantForm.email,
          updatedAt: new Date().toISOString().split('T')[0],
        },
        encargadoCredentials: {
          username: tenantForm.encargadoUsername || editingTenant.encargadoCredentials?.username || 'encargado',
          password: tenantForm.encargadoPassword || editingTenant.encargadoCredentials?.password || 'encargado123',
          name: editingTenant.encargadoCredentials?.name || 'Encargado de Clínica',
          email: tenantForm.email,
          updatedAt: new Date().toISOString().split('T')[0],
        },
      });
      showToast(`Arrendatario "${tenantForm.clinicName}" actualizado con éxito.`);
    } else {
      addTenant({
        clinicName: tenantForm.clinicName,
        directorName: tenantForm.directorName,
        email: tenantForm.email,
        phone: tenantForm.phone,
        city: tenantForm.city,
        plan: tenantForm.plan,
        priceAmount: Number(tenantForm.priceAmount),
        currency: tenantForm.currency || 'MXN',
        startDate: tenantForm.startDate,
        expirationDate: tenantForm.expirationDate,
        lastPaymentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        isLocked: false,
        patientsCount: 0,
        notes: tenantForm.notes,
        adminCredentials: {
          username: tenantForm.adminUsername || 'admin',
          password: tenantForm.adminPassword || 'admin123',
          name: tenantForm.directorName,
          email: tenantForm.email,
          updatedAt: new Date().toISOString().split('T')[0],
        },
        encargadoCredentials: {
          username: tenantForm.encargadoUsername || 'encargado',
          password: tenantForm.encargadoPassword || 'encargado123',
          name: 'Encargado de Clínica',
          email: tenantForm.email,
          updatedAt: new Date().toISOString().split('T')[0],
        },
      });
    }
    setIsNewTenantModalOpen(false);
  };

  // Open User Credentials Management Modal
  const handleOpenUsersModal = (tenant: TenantClinic) => {
    setSelectedTenantForUsers(tenant);
    const citySlug = (tenant.city || 'vet').toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 6);

    setAdminUserForm({
      username: tenant.adminCredentials?.username || `admin.${citySlug}`,
      password: tenant.adminCredentials?.password || 'admin123',
      name: tenant.adminCredentials?.name || tenant.directorName || 'Director(a) Médico',
      email: tenant.adminCredentials?.email || tenant.email || '',
    });

    setEncargadoUserForm({
      username: tenant.encargadoCredentials?.username || `recepcion.${citySlug}`,
      password: tenant.encargadoCredentials?.password || 'encargado123',
      name: tenant.encargadoCredentials?.name || 'Encargado(a) de Clínica',
      email: tenant.encargadoCredentials?.email || tenant.email || '',
    });

    setActiveUserTab('admin');
    setShowAdminPassword(false);
    setShowEncargadoPassword(false);
    setCopiedSummary(false);
  };

  // Reset Admin Credentials
  const handleSaveAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForUsers) return;

    if (!adminUserForm.username.trim()) {
      alert('El nombre de usuario administrador no puede estar vacío.');
      return;
    }
    if (!adminUserForm.password.trim() || adminUserForm.password.trim().length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const success = resetTenantUserCredentials(selectedTenantForUsers.id, 'admin', {
      username: adminUserForm.username,
      password: adminUserForm.password,
      name: adminUserForm.name,
      email: adminUserForm.email,
    });

    if (success) {
      showToast(`Usuario Administrador de "${selectedTenantForUsers.clinicName}" restablecido con éxito.`);
      setSelectedTenantForUsers(prev => {
        if (!prev) return null;
        return {
          ...prev,
          adminCredentials: {
            username: adminUserForm.username,
            password: adminUserForm.password,
            name: adminUserForm.name,
            email: adminUserForm.email,
            updatedAt: new Date().toISOString().split('T')[0],
          },
          directorName: adminUserForm.name || prev.directorName,
          email: adminUserForm.email || prev.email,
        };
      });
    }
  };

  // Reset Encargado Credentials
  const handleSaveEncargadoCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForUsers) return;

    if (!encargadoUserForm.username.trim()) {
      alert('El nombre de usuario encargado no puede estar vacío.');
      return;
    }
    if (!encargadoUserForm.password.trim() || encargadoUserForm.password.trim().length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const success = resetTenantUserCredentials(selectedTenantForUsers.id, 'encargado', {
      username: encargadoUserForm.username,
      password: encargadoUserForm.password,
      name: encargadoUserForm.name,
      email: encargadoUserForm.email,
    });

    if (success) {
      showToast(`Usuario Encargado de "${selectedTenantForUsers.clinicName}" restablecido con éxito.`);
      setSelectedTenantForUsers(prev => {
        if (!prev) return null;
        return {
          ...prev,
          encargadoCredentials: {
            username: encargadoUserForm.username,
            password: encargadoUserForm.password,
            name: encargadoUserForm.name,
            email: encargadoUserForm.email,
            updatedAt: new Date().toISOString().split('T')[0],
          },
        };
      });
    }
  };

  // Send WhatsApp to Clinic with Payment/Credentials
  const handleSendPaymentWhatsApp = (req: PaymentRenewalRequest) => {
    if (!req) return;
    const cleanPhone = (req.phone || '').replace(/[^0-9]/g, '');
    const isApproved = req.status === 'approved';
    let msg = `Hola Dr(a). ${req.directorName || 'Director'}, le saludamos de la Dirección del Software Veterinario.\n\n`;
    if (isApproved) {
      msg += `✅ Le confirmamos que su pago de *$${Number(req.amount || 0).toLocaleString('es-MX')} MXN* (Referencia: *${req.referenceFolio || 'N/A'}*) ha sido acreditado exitosamente.\n\nSu licencia para *${req.clinicName || 'su clínica'}* ha sido reactivada por *${req.plan === 'mensual' ? '+30 días (+1 Mes)' : '+365 días (+1 Año)'}*.\n\nPuede ingresar normalmente al sistema.\n¡Muchas gracias por su preferencia!`;
    } else {
      msg += `Hemos recibido su referencia de renovación para *${req.clinicName || 'su clínica'}* con folio *${req.referenceFolio || 'N/A'}* por *$${Number(req.amount || 0).toLocaleString('es-MX')} MXN* (${(req.paymentMethod || 'SPEI').toUpperCase()}).\n\nSu comprobante está en proceso de validación y la reactivación se dará en un plazo máximo de 24 horas hábiles.`;
    }
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      showToast('Esta solicitud no tiene registrado un número telefónico de contacto.', 'warning');
    }
  };

  const handleGenerateStandaloneKey = (e: React.FormEvent) => {
    e.preventDefault();
    const result = generateStandaloneLicenseKey(generatorPlan, generatorClinicName);
    setGeneratedStandaloneKey(result);
    showToast('Nueva clave de licencia emitida.');
  };

  const handleCopyText = (text: string, label: string = 'Texto') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
    showToast(`${label} copiado al portapapeles.`);
  };

  const handleExportBackup = () => {
    const data = exportAllClinicDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VETCARE-MASTER-BACKUP-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Respaldo maestro descargado exitosamente.', 'success');
  };

  // Permanent Delete Clinic & All Associated Data
  const handleOpenDeleteModal = (tenant: TenantClinic) => {
    setTenantToDelete(tenant);
    setDeleteConfirmText('');
  };

  const handleConfirmPermanentDelete = () => {
    if (!tenantToDelete) return;
    deleteTenant(tenantToDelete.id);
    setTenantToDelete(null);
    setDeleteConfirmText('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-purple-500 selection:text-white">
      {/* Toast Alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-[99999] bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 text-sm font-bold"
          >
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP MASTER HEADER */}
      <header className="bg-slate-900/90 border-b border-purple-900/40 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Creator Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-amber-300 font-black shadow-lg shadow-purple-900/50 border border-purple-400/40 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black tracking-wider uppercase text-purple-300">
                VetCare Pro • Creator Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-widest flex items-center gap-1 shadow-2xs">
                <CrownIcon /> Super Usuario Master
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              Panel Maestro de Administración SaaS
            </h1>
          </div>
        </div>

        {/* Server, Official Time & 5-Min Auto-Poll Status */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs flex items-center gap-2 text-purple-200">
            <Server className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Servidor Nube: <strong className="text-emerald-400">Activo (NTP OK)</strong></span>
          </div>

          {/* 5-Min Auto-Poll Countdown Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-800/50 text-xs flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Auto-Revisión: <strong className="text-amber-400 font-mono">{Math.floor(autoPollCountdown / 60)}:{String(autoPollCountdown % 60).padStart(2, '0')}</strong> min</span>
            <button
              type="button"
              onClick={manualPollRequestsNow}
              className="p-1 hover:bg-purple-800/80 rounded-md text-amber-300 hover:text-white transition-all cursor-pointer"
              title="Comprobar solicitudes de clínicas nuevas ahora"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center gap-2 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>MRR: <strong className="text-amber-400">${metrics.mrr.toLocaleString('es-MX')} MXN</strong></span>
          </div>
        </div>

        {/* Creator Actions (Switch to Clinic Demo & Logout) */}
        <div className="flex items-center gap-2.5">
          {onSwitchToClinicView && (
            <button
              type="button"
              id="btn-switch-to-clinic-demo"
              onClick={onSwitchToClinicView}
              className="px-3.5 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Inspeccionar cómo interactúa una clínica veterinaria"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Modo Clínica</span>
            </button>
          )}

          <button
            type="button"
            id="btn-config-superuser-header"
            onClick={handleOpenSuperUserConfig}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            title="Configurar Nombre, Usuario y Contraseña del Super Usuario"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Configurar Super Usuario</span>
          </button>

          <button
            type="button"
            id="btn-logout-superuser-master"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800/50 text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Cerrar sesión de Super Usuario"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* MAIN MASTER WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT DEDICATED MASTER SIDEBAR */}
        <aside className="w-full lg:w-64 bg-slate-900/70 border-r border-purple-900/30 p-3 sm:p-4 shrink-0 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto">
          <div className="hidden lg:block px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Módulos del Creador
          </div>

          <button
            type="button"
            id="nav-master-dashboard"
            onClick={() => setActiveSection('dashboard')}
            className={`flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
              activeSection === 'dashboard'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-900/40 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Dashboard & Ingresos</span>
          </button>

          <button
            type="button"
            id="nav-master-tenants"
            onClick={() => setActiveSection('tenants')}
            className={`flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
              activeSection === 'tenants'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-900/40 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-400" />
            <span>Clínicas & Licencias ({tenants.length})</span>
          </button>

          <button
            type="button"
            id="nav-master-payments"
            onClick={() => setActiveSection('payments')}
            className={`flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer whitespace-nowrap ${
              activeSection === 'payments'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-emerald-400" />
              <span>Solicitudes & Pagos</span>
            </div>
            {metrics.pendingPayments > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                {metrics.pendingPayments}
              </span>
            )}
          </button>

          <button
            type="button"
            id="nav-master-keys"
            onClick={() => setActiveSection('keys')}
            className={`flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
              activeSection === 'keys'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-900/40 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Generador de Claves</span>
          </button>

          <button
            type="button"
            id="nav-master-users"
            onClick={() => setActiveSection('users')}
            className={`flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
              activeSection === 'users'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-900/40 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCog className="w-4 h-4 text-amber-400" />
            <span>Accesos & Contraseñas</span>
          </button>

          <button
            type="button"
            id="nav-master-settings"
            onClick={() => setActiveSection('settings')}
            className={`flex-1 lg:flex-none px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap ${
              activeSection === 'settings'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md shadow-purple-900/40 font-black'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Parámetros & Respaldo</span>
          </button>
        </aside>

        {/* RIGHT MAIN VIEWPORT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {/* SECTION 1: SAAS EXECUTIVE DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-purple-800/40 relative overflow-hidden shadow-xl">
                <div className="relative z-10 space-y-2">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-full text-xs font-black uppercase tracking-wider">
                    Control Ejecutivo Global
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Bienvenido, Creador Master
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                    Supervisa en tiempo real el rendimiento de tus clínicas arrendatarias, ingresos recurrentes (MRR), validación de pagos en 24 horas y emisión de licencias.
                  </p>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-900/40 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase">Total Arrendados</span>
                  <div className="text-2xl font-black text-white mt-1">{metrics.total}</div>
                  <span className="text-[10px] text-purple-400">Clínicas en el sistema</span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-emerald-900/40 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-400 block uppercase">Activas</span>
                  <div className="text-2xl font-black text-emerald-300 mt-1">{metrics.active}</div>
                  <span className="text-[10px] text-emerald-500">Operando al 100%</span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-rose-900/40 shadow-xs">
                  <span className="text-[11px] font-bold text-rose-400 block uppercase">Bloqueadas</span>
                  <div className="text-2xl font-black text-rose-300 mt-1">{metrics.locked}</div>
                  <span className="text-[10px] text-rose-500">Mora o vencimiento</span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-amber-900/40 shadow-xs">
                  <span className="text-[11px] font-bold text-amber-400 block uppercase">Por Vencer (≤7d)</span>
                  <div className="text-2xl font-black text-amber-300 mt-1">{metrics.expiringSoon}</div>
                  <span className="text-[10px] text-amber-500">Avisos automáticos</span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-indigo-900/40 shadow-xs">
                  <span className="text-[11px] font-bold text-indigo-300 block uppercase">MRR Mensual</span>
                  <div className="text-xl font-black text-amber-300 mt-1">${metrics.mrr.toLocaleString('es-MX')}</div>
                  <span className="text-[10px] text-indigo-400">MXN recurrente</span>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-900/40 shadow-xs">
                  <span className="text-[11px] font-bold text-purple-300 block uppercase">ARR Proyectado</span>
                  <div className="text-xl font-black text-emerald-400 mt-1">${metrics.arr.toLocaleString('es-MX')}</div>
                  <span className="text-[10px] text-purple-400">MXN anualizado</span>
                </div>
              </div>

              {/* 5-Minute Auto-Poll & Isolated Database Engine Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-800/50 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-black text-white text-sm">
                      Sincronización Automática en Tiempo Real (Cada 15 Segundos)
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full font-bold text-[10px]">
                      MOTOR ACTIVO
                    </span>
                    <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800 rounded-full font-bold text-[10px]">
                      MULTIDISPOSITIVO GLOBAL
                    </span>
                  </div>
                  <p className="text-slate-300">
                    El sistema consulta en tiempo real cada 15 segundos la nube central para reflejar al instante cualquier nueva clínica, cambio de datos o comprobante de pago.
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                    <span>Última comprobación: <strong className="text-amber-300">{lastPollTime}</strong></span>
                    <span>•</span>
                    <span>Siguiente actualización en: <strong className="text-emerald-400">{autoPollCountdown}s</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="btn-manual-poll-requests"
                    onClick={manualPollRequestsNow}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Comprobar Solicitudes Ahora</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveSection('tenants')}
                  className="p-5 rounded-2xl bg-slate-900 border border-purple-900/40 hover:border-purple-500 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Gestionar Clínicas & Arrendados</h3>
                  <p className="text-xs text-slate-400">
                    Bloqueo remoto, cambio de planes y supervisión de vencimientos.
                  </p>
                </div>

                <div
                  onClick={() => setActiveSection('payments')}
                  className="p-5 rounded-2xl bg-slate-900 border border-amber-900/40 hover:border-amber-500 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Inbox className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Bandeja de Pagos Entrantes</h3>
                  <p className="text-xs text-slate-400">
                    {metrics.pendingPayments} solicitudes por validar con SLA de 24 horas.
                  </p>
                </div>

                <div
                  onClick={() => setActiveSection('keys')}
                  className="p-5 rounded-2xl bg-slate-900 border border-indigo-900/40 hover:border-indigo-500 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-white">Generar Licencia Oficial</h3>
                  <p className="text-xs text-slate-400">
                    Emite claves seriales mensuales, anuales o de cortesía instantáneas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CLINICS & LICENSES MULTI-TENANT HUB */}
          {activeSection === 'tenants' && (
            <div className="space-y-6">
              {/* Header & New Tenant Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-400" />
                    <span>Control Global de Clínicas Arrendatarias</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Supervisa, bloquea remotamente por falta de pago o modifica vigencias de cada licencia.
                  </p>
                </div>

                <button
                  type="button"
                  id="btn-create-tenant-master"
                  onClick={handleOpenNewTenantModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Nueva Clínica</span>
                </button>
              </div>

              {/* Search & Filters */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-purple-900/30 flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por clínica, médico director, ciudad, teléfono..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs font-bold text-slate-300 outline-hidden"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="locked">Bloqueadas</option>
                    <option value="expiring">Por Vencer</option>
                    <option value="expired">Vencidas</option>
                  </select>

                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-xs font-bold text-slate-300 outline-hidden"
                  >
                    <option value="all">Todos los planes</option>
                    <option value="mensual">Mensual ($599)</option>
                    <option value="anual">Anual ($5,990)</option>
                  </select>
                </div>
              </div>

              {/* Tenants Grid */}
              <div className="space-y-3">
                {filteredTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className={`p-5 rounded-2xl border transition-all bg-slate-900/90 shadow-md ${
                      tenant.isLocked || tenant.status === 'locked'
                        ? 'border-rose-700/60 bg-rose-950/20'
                        : 'border-purple-900/40 hover:border-purple-700/60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-white">{tenant.clinicName}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              tenant.isLocked || tenant.status === 'locked'
                                ? 'bg-rose-900/80 text-rose-200 border border-rose-600/40'
                                : 'bg-emerald-900/80 text-emerald-200 border border-emerald-600/40'
                            }`}
                          >
                            {tenant.isLocked || tenant.status === 'locked' ? '⛔ Bloqueada' : '✅ Licencia Activa'}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-800/40">
                            {tenant.plan === 'mensual' ? 'Plan Mensual ($599/mes)' : 'Plan Anual ($5,990/año)'}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                            tenant.id === activeTenantId
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : 'bg-slate-950 text-slate-400 border-purple-950'
                          }`}>
                            📦 BD: {tenant.id === activeTenantId ? '🟢 CARGADA' : 'Aislada'}
                          </span>

                          {tenant.city && (
                            <span className="text-xs text-slate-400">📍 {tenant.city}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Médico Director</span>
                            <span className="font-bold text-slate-200">{tenant.directorName}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Vencimiento</span>
                            <span className="font-mono font-bold text-amber-300">{tenant.expirationDate}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Contacto</span>
                            <span className="font-mono text-slate-300">{tenant.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold">Serie de Licencia</span>
                            <span className="font-mono text-purple-300 truncate block">{tenant.serialNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Master Control Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Switch / Load Isolated Database */}
                        <button
                          type="button"
                          onClick={() => switchTenantDatabase(tenant.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            tenant.id === activeTenantId
                              ? 'bg-emerald-950 border border-emerald-700 text-emerald-300 font-black shadow-xs'
                              : 'bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/60 text-indigo-200'
                          }`}
                          title="Cargar y operar en la base de datos aislada de esta clínica"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>{tenant.id === activeTenantId ? 'BD Activa' : 'Cargar BD'}</span>
                        </button>

                        {/* Remote Lock Switch */}
                        <button
                          type="button"
                          onClick={() => toggleTenantLock(tenant.id, !tenant.isLocked)}
                          className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                            tenant.isLocked
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          {tenant.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{tenant.isLocked ? 'Desbloquear' : 'Bloquear'}</span>
                        </button>

                        {/* Extend +30d */}
                        <button
                          type="button"
                          onClick={() => extendTenantLicense(tenant.id, 'month')}
                          className="px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800/60 text-xs font-bold transition-all cursor-pointer"
                          title="Extender +30 días"
                        >
                          +30 Días
                        </button>

                        {/* Reset Users */}
                        <button
                          type="button"
                          onClick={() => handleOpenUsersModal(tenant)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          <span>Credenciales</span>
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(tenant)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          title="Editar detalles"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Permanently */}
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(tenant)}
                          className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 hover:border-rose-600 cursor-pointer transition-colors"
                          title="Eliminar clínica y datos definitivamente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: PAYMENTS INBOX & 24H SLA RENEWALS */}
          {activeSection === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-amber-400" />
                    <span>Bandeja de Pagos & Referencias (Validación en 24h)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Notificaciones de pago recibidas en <strong>super.admin@vetcare.master.com</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-amber-950 text-amber-300 border border-amber-800/60 text-xs font-black">
                    {metrics.pendingPayments} Pendientes de Validar
                  </span>
                </div>
              </div>

              {paymentRequests.length === 0 ? (
                <div className="bg-slate-900 rounded-3xl p-12 text-center border border-purple-900/30 space-y-3">
                  <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">No hay pagos pendientes</h4>
                  <p className="text-xs text-slate-500">
                    Cuando una veterinaria pague por Tarjeta, SPEI o OXXO, su solicitud aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentRequests.map((req) => (
                    <div
                      key={req.id}
                      className={`p-5 rounded-2xl border transition-all bg-slate-900/90 shadow-md ${
                        req.status === 'pending'
                          ? 'border-amber-500/60 ring-2 ring-amber-500/10'
                          : 'border-emerald-900/40 bg-emerald-950/10'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 bg-slate-950 text-amber-300 font-mono font-black text-xs rounded-xl border border-amber-500/40">
                              Folio: {req.referenceFolio}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                                req.status === 'pending'
                                  ? 'bg-amber-400 text-slate-950 animate-pulse'
                                  : 'bg-emerald-900 text-emerald-200 border border-emerald-600/40'
                              }`}
                            >
                              {req.status === 'pending' ? '⏳ Pendiente (Validar en 24h)' : '✅ Aprobado & Reactivado'}
                            </span>
                            <span className="text-xs text-slate-400">Fecha: {req.paymentDate}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-bold">Clínica</span>
                              <span className="font-extrabold text-white text-sm">{req.clinicName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-bold">Director</span>
                              <span className="font-bold text-slate-300">{req.directorName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-bold">Monto & Plan</span>
                              <span className="font-black text-emerald-400 text-sm">
                                ${Number(req.amount || 0).toLocaleString('es-MX')} MXN ({req.plan || 'mensual'})
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] uppercase font-bold">Método</span>
                              <span className="font-bold text-indigo-300 uppercase">{req.paymentMethod || 'SPEI'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                          {req.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => approvePaymentRenewalRequest(req.id)}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Aprobar Pago & Activar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => rejectPaymentRenewalRequest(req.id, 'Comprobante no coincide con los registros bancarios')}
                                className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Rechazar Solicitud</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSendPaymentWhatsApp(req)}
                            className="px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>WhatsApp a la Clínica</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AUTOMATIC NEW CLINIC REGISTRATIONS HUB */}
              <div className="pt-6 border-t border-purple-900/40 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Clínicas Registradas Automáticamente ({tenants.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Todas las veterinarias creadas desde el portal web aparecen aquí en tiempo real con su base de datos independiente.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-bold">
                    Auto-sincronizado
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/40 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-black text-white">{tenant.clinicName}</h4>
                          <span className="text-[11px] text-slate-400">
                            Director: <strong className="text-slate-200">{tenant.directorName}</strong>
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          tenant.isLocked || tenant.status === 'locked'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {tenant.isLocked || tenant.status === 'locked' ? 'Bloqueada' : 'Activa'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-purple-950 font-mono">
                        <div>
                          <span className="text-slate-500 block text-[9.5px] uppercase">Vencimiento</span>
                          <span className="font-bold text-amber-300">{tenant.expirationDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9.5px] uppercase">Contacto</span>
                          <span className="text-slate-300 truncate block">{tenant.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9.5px] uppercase">Usuario Admin</span>
                          <span className="text-purple-300">{tenant.adminCredentials?.username || 'admin'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[9.5px] uppercase">Plan</span>
                          <span className="text-slate-300 font-bold uppercase">{tenant.plan}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => switchTenantDatabase(tenant.id)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                            tenant.id === activeTenantId
                              ? 'bg-emerald-950 border-emerald-700 text-emerald-300 font-black'
                              : 'bg-indigo-950 hover:bg-indigo-900 border-indigo-800 text-indigo-200'
                          }`}
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>{tenant.id === activeTenantId ? 'BD Cargada' : 'Cargar BD Aislada'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => extendTenantLicense(tenant.id, 'month')}
                          className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-amber-300 border border-purple-800/60 rounded-lg text-xs font-bold cursor-pointer transition-all"
                          title="Extender 30 días adicionales"
                        >
                          +30d
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: LICENSE KEY & SERIAL GENERATOR */}
          {activeSection === 'keys' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                  <span>Generador Criptográfico de Licencias y Seriales</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Emite claves oficiales para activación manual en cualquier clínica veterinaria.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Generator Form */}
                <form onSubmit={handleGenerateStandaloneKey} className="p-6 bg-slate-900/90 rounded-3xl border border-purple-900/40 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Plan o Modalidad de la Licencia
                    </label>
                    <select
                      value={generatorPlan}
                      onChange={(e) => setGeneratorPlan(e.target.value as LicensePlan)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs font-bold text-white outline-hidden"
                    >
                      <option value="mensual">Renta Mensual (+30 Días) - $599 MXN</option>
                      <option value="anual">Renta Anual (+365 Días) - $5,990 MXN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nombre de la Clínica Destino (Opcional)
                    </label>
                    <input
                      type="text"
                      value={generatorClinicName}
                      onChange={(e) => setGeneratorClinicName(e.target.value)}
                      placeholder="Ej. Hospital Veterinario del Norte"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-xs text-white placeholder:text-slate-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generar y Firmar Clave Oficial</span>
                  </button>
                </form>

                {/* Generated Key Result */}
                {generatedStandaloneKey && (
                  <div className="p-6 bg-purple-950/40 rounded-3xl border border-purple-600/40 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold">
                        Clave Emitida con Éxito
                      </span>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Clave de Licencia (Key)</span>
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-purple-900 mt-1 font-mono font-bold text-amber-300 text-sm">
                          <span>{generatedStandaloneKey.key}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(generatedStandaloneKey.key, 'Clave')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Número de Serie Oficial</span>
                        <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-purple-900 mt-1 font-mono text-xs text-purple-200">
                          <span>{generatedStandaloneKey.serial}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(generatedStandaloneKey.serial, 'Serie')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Entrega esta clave al médico de la veterinaria para que la ingrese en <em>Configuración &gt; Licencia</em>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: UNIVERSAL USERS & PASSWORDS RESET */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-amber-400" />
                  <span>Restablecimiento Universal de Usuarios & Contraseñas</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Cambia usuarios o restablece contraseñas de cualquier clínica sin importar si está activa, vencida o bloqueada.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="p-5 rounded-2xl bg-slate-900 border border-purple-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white">{tenant.clinicName}</h3>
                      <span className="text-[10px] font-mono text-purple-300">
                        {tenant.adminCredentials?.username || 'admin'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Director: <strong className="text-slate-200">{tenant.directorName}</strong></div>
                      <div>Email: <strong className="text-slate-200">{tenant.email}</strong></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenUsersModal(tenant)}
                      className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 text-amber-300 border border-purple-800/60 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Restablecer Accesos</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: SAAS SETTINGS & GLOBAL BACKUPS */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-400" />
                  <span>Parámetros Globales del Software & Respaldos SaaS</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Configuración del creador, datos de cobro oficiales y copias de seguridad.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Banking & Billing Parameters */}
                <div className="p-6 bg-slate-900/90 rounded-3xl border border-purple-900/40 space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Datos de Cobro Oficiales Mostrados a las Clínicas</span>
                    </h3>
                    <button
                      type="button"
                      id="btn-edit-master-billing"
                      onClick={() => setIsEditingBillingModalOpen(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modificar Datos de Cobro</span>
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-purple-900 font-mono">
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Banco Receptor:</span>
                      <span className="text-white font-bold">{masterBillingSettings.bankName}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">CLABE SPEI (18 dígitos):</span>
                      <span className="text-indigo-400 font-bold">{masterBillingSettings.clabe}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Titular / Beneficiario:</span>
                      <span className="text-slate-200 font-bold">{masterBillingSettings.accountHolder}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Convenio OXXO Pay:</span>
                      <span className="text-emerald-400 font-bold">{masterBillingSettings.oxxoReference}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Correo del Propietario (Notificaciones):</span>
                      <span className="text-amber-400 font-bold">{masterBillingSettings.ownerEmail}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">WhatsApp / Soporte:</span>
                      <span className="text-slate-300 font-bold">{masterBillingSettings.supportPhone}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Tarifas Base SaaS:</span>
                      <span className="text-purple-300 font-bold">
                        ${masterBillingSettings.monthlyPrice} /mes • ${masterBillingSettings.annualPrice} /año ({masterBillingSettings.currency})
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Estos datos se reflejan automáticamente en todas las pantallas de pago, transferencias SPEI y pantalla de bloqueo de todas las veterinarias.
                  </p>
                </div>

                {/* Super User Credentials Management */}
                <div className="p-6 bg-slate-900/90 rounded-3xl border border-purple-900/40 space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-amber-400" />
                      <span>Acceso del Super Usuario (Creador Master)</span>
                    </h3>
                    <button
                      type="button"
                      id="btn-edit-superuser-credentials"
                      onClick={handleOpenSuperUserConfig}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Cambiar Nombre y Clave</span>
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-purple-900 font-mono">
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Nombre del Creador:</span>
                      <span className="text-white font-bold">{currentSuperUserAcc.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Usuario Master:</span>
                      <span className="text-amber-300 font-bold">{currentSuperUserAcc.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Rol del Sistema:</span>
                      <span className="text-purple-300 font-bold">SUPER ADMINISTRADOR MASTER</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Seguridad:</span>
                      <span className="text-emerald-400 font-bold">Protegido con Criptografía de Sesión</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Puedes actualizar tu nombre de usuario y tu contraseña de acceso cuando lo desees para mayor seguridad.
                  </p>
                </div>

                {/* Real-time Internet Time Synchronization Engine */}
                <div className="p-6 bg-slate-900/90 rounded-3xl border border-purple-900/40 space-y-4 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span>Sincronización Automática de Fecha y Hora (Internet)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleManualSyncTime}
                      className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTime ? 'animate-spin text-amber-400' : ''}`} />
                      <span>Sincronizar Ahora</span>
                    </button>
                  </div>

                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-purple-900 font-mono">
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Fecha Oficial:</span>
                      <span className="text-white font-bold">{officialInternetDateLong}</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Hora en Vivo:</span>
                      <span className="text-emerald-400 font-bold">{officialTime12h} (24h: {officialInternetTime})</span>
                    </div>
                    <div className="flex justify-between border-b border-purple-900/40 pb-1.5">
                      <span className="text-slate-500">Estado de Conexión:</span>
                      <span className={isOnline ? "text-emerald-400 font-bold flex items-center gap-1" : "text-rose-400 font-bold"}>
                        {isOnline ? "🟢 Conectado a Servidor NTP Mundial (UTC)" : "🔴 Modo Fuera de Línea"}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">Sincronía en Agendas:</span>
                      <span className="text-indigo-300 font-bold">100% Automática en Tiempo Real</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Las agendas de consultas, citas y carnet de vacunas de todas las clínicas se calibran automáticamente con la fecha y hora oficial de la red.
                  </p>
                </div>

                {/* Global Backups */}
                <div className="p-6 bg-slate-900/90 rounded-3xl border border-purple-900/40 space-y-4 text-xs md:col-span-2">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <span>Copia de Seguridad de Toda la Base de Datos SaaS</span>
                  </h3>

                  <p className="text-slate-400">
                    Descarga en formato JSON encriptable el archivo maestro con todas las clínicas arrendadas, historiales y configuraciones.
                  </p>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Respaldo Global JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal: New / Edit Tenant */}
      <AnimatePresence>
        {isNewTenantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-purple-500 shadow-2xl p-6 space-y-4 text-slate-100 my-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
                <h3 className="text-base font-black text-white">
                  {editingTenant ? 'Editar Clínica Arrendataria' : 'Registrar Nueva Clínica Arrendataria'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTenant} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nombre de la Veterinaria *</label>
                    <input
                      type="text"
                      required
                      value={tenantForm.clinicName}
                      onChange={(e) => setTenantForm({ ...tenantForm, clinicName: e.target.value })}
                      placeholder="Ej. Clínica Veterinaria San Ángel"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Médico Director Responsable *</label>
                    <input
                      type="text"
                      required
                      value={tenantForm.directorName}
                      onChange={(e) => setTenantForm({ ...tenantForm, directorName: e.target.value })}
                      placeholder="Ej. Dr. Alejandro Soto"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={tenantForm.email}
                      onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                      placeholder="contacto@veterinaria.com"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={tenantForm.phone}
                      onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                      placeholder="+52 55 1234 5678"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Ciudad / Estado</label>
                    <input
                      type="text"
                      value={tenantForm.city}
                      onChange={(e) => setTenantForm({ ...tenantForm, city: e.target.value })}
                      placeholder="Ej. CDMX"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Plan de Renta</label>
                    <select
                      value={tenantForm.plan}
                      onChange={(e) => setTenantForm({ ...tenantForm, plan: e.target.value as LicensePlan, priceAmount: e.target.value === 'mensual' ? 599 : 5990 })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden"
                    >
                      <option value="mensual">Renta Mensual ($599 MXN)</option>
                      <option value="anual">Renta Anual ($5,990 MXN)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-purple-900/50">
                  <button
                    type="button"
                    onClick={() => setIsNewTenantModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer"
                  >
                    Guardar Arrendatario
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Restablecer Claves y Usuarios por Licencia */}
      <AnimatePresence>
        {selectedTenantForUsers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-purple-500 shadow-2xl p-6 space-y-4 text-slate-100 my-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
                <div>
                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block">
                    Control Maestro de Creador
                  </span>
                  <h3 className="text-base font-black text-white">
                    Restablecer Accesos: {selectedTenantForUsers.clinicName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTenantForUsers(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveUserTab('admin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    activeUserTab === 'admin' ? 'bg-purple-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Administrador (Director)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveUserTab('encargado')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                    activeUserTab === 'encargado' ? 'bg-purple-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Encargado de Recepción
                </button>
              </div>

              {activeUserTab === 'admin' && (
                <form onSubmit={handleSaveAdminCredentials} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nombre de Usuario (Login)</label>
                    <input
                      type="text"
                      required
                      value={adminUserForm.username}
                      onChange={(e) => setAdminUserForm({ ...adminUserForm, username: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        required
                        value={adminUserForm.password}
                        onChange={(e) => setAdminUserForm({ ...adminUserForm, password: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl"
                  >
                    Guardar y Restablecer Administrador
                  </button>
                </form>
              )}

              {activeUserTab === 'encargado' && (
                <form onSubmit={handleSaveEncargadoCredentials} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nombre de Usuario (Login)</label>
                    <input
                      type="text"
                      required
                      value={encargadoUserForm.username}
                      onChange={(e) => setEncargadoUserForm({ ...encargadoUserForm, username: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showEncargadoPassword ? 'text' : 'password'}
                        required
                        value={encargadoUserForm.password}
                        onChange={(e) => setEncargadoUserForm({ ...encargadoUserForm, password: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEncargadoPassword(!showEncargadoPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showEncargadoPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl"
                  >
                    Guardar y Restablecer Encargado
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Modificar Datos de Cobro Oficiales & Correo del Propietario */}
      <AnimatePresence>
        {isEditingBillingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 rounded-3xl border border-amber-500 shadow-2xl p-6 space-y-4 text-slate-100 my-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Modificar Datos de Cobro Oficiales del Propietario
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configuración para transferencias SPEI, OXXO Pay y notificaciones de pago
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-close-billing-modal"
                  onClick={() => setIsEditingBillingModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBillingSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      🏦 Banco Receptor Oficial *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingForm.bankName}
                      onChange={(e) => setBillingForm({ ...billingForm, bankName: e.target.value })}
                      placeholder="Ej. STP / BBVA México / Santander"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      💳 CLABE Interbancaria SPEI (18 dígitos) *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingForm.clabe}
                      onChange={(e) => setBillingForm({ ...billingForm, clabe: e.target.value })}
                      placeholder="Ej. 646180112400981234"
                      maxLength={18}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-indigo-300 font-mono font-bold outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      👤 Titular de la Cuenta / Razón Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingForm.accountHolder}
                      onChange={(e) => setBillingForm({ ...billingForm, accountHolder: e.target.value })}
                      placeholder="Ej. Software Veterinario Pro S.A. de C.V."
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      🏪 Referencia / Convenio OXXO Pay *
                    </label>
                    <input
                      type="text"
                      required
                      value={billingForm.oxxoReference}
                      onChange={(e) => setBillingForm({ ...billingForm, oxxoReference: e.target.value })}
                      placeholder="Ej. 9384 1029 4819 0281"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-emerald-300 font-mono font-bold outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-300 font-bold mb-1">
                      📧 Correo Oficial del Propietario (Notificaciones de Pago) *
                    </label>
                    <input
                      type="email"
                      required
                      value={billingForm.ownerEmail}
                      onChange={(e) => setBillingForm({ ...billingForm, ownerEmail: e.target.value })}
                      placeholder="super.admin@vetcare.master.com"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-amber-500/60 rounded-xl text-amber-300 font-bold outline-hidden focus:border-amber-400"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      A este correo se enviarán las referencias y folios pagados por las clínicas.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      📞 Teléfono / WhatsApp de Soporte
                    </label>
                    <input
                      type="text"
                      value={billingForm.supportPhone}
                      onChange={(e) => setBillingForm({ ...billingForm, supportPhone: e.target.value })}
                      placeholder="+52 55 4912 8301"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      💵 Tarifa Mensual ($ MXN)
                    </label>
                    <input
                      type="number"
                      value={billingForm.monthlyPrice}
                      onChange={(e) => setBillingForm({ ...billingForm, monthlyPrice: Number(e.target.value) })}
                      placeholder="599"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      💰 Tarifa Anual ($ MXN)
                    </label>
                    <input
                      type="number"
                      value={billingForm.annualPrice}
                      onChange={(e) => setBillingForm({ ...billingForm, annualPrice: Number(e.target.value) })}
                      placeholder="5990"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    📝 Leyenda o Instrucciones para las Clínicas
                  </label>
                  <textarea
                    rows={2}
                    value={billingForm.instructionsNotes}
                    onChange={(e) => setBillingForm({ ...billingForm, instructionsNotes: e.target.value })}
                    placeholder="Realiza tu pago y conserva tu referencia..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-purple-900/50">
                  <button
                    type="button"
                    onClick={() => setIsEditingBillingModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-save-master-billing"
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    Guardar Datos de Cobro Oficiales
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmación de Eliminación Definitiva de Clínica & Datos */}
      <AnimatePresence>
        {tenantToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-3xl border-2 border-rose-600 shadow-2xl p-6 space-y-4 text-slate-100 my-auto"
            >
              <div className="flex items-center gap-3 border-b border-rose-900/50 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-lg shadow-rose-600/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Eliminar Clínica Definitivamente
                  </h3>
                  <p className="text-[11px] text-rose-400 font-bold">
                    Acción irreversible del Creador / Super Usuario
                  </p>
                </div>
              </div>

              <div className="p-4 bg-rose-950/30 rounded-2xl border border-rose-900/60 space-y-2 text-xs">
                <p className="text-slate-200">
                  ¿Estás seguro de que deseas eliminar permanentemente la clínica <strong>"{tenantToDelete.clinicName}"</strong>?
                </p>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-rose-950 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clínica:</span>
                    <span className="text-white font-bold">{tenantToDelete.clinicName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Director:</span>
                    <span className="text-slate-300">{tenantToDelete.directorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Usuario Admin:</span>
                    <span className="text-purple-300">{tenantToDelete.adminCredentials?.username || 'admin'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Serie Licencia:</span>
                    <span className="text-amber-300">{tenantToDelete.serialNumber}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-[11px] text-rose-300">
                  <span className="font-bold block">⚠️ Al eliminar se borrará de forma definitiva:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                    <li>El registro y la licencia del arrendatario.</li>
                    <li>Todos los usuarios y credenciales asociadas a esta clínica.</li>
                    <li>Expedientes clínicos, vacunas, pacientes e inventarios.</li>
                    <li>Historial de solicitudes de pago y folios de cobro.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <label className="block text-slate-300 font-bold">
                  Para confirmar, escribe <span className="text-rose-400 font-black font-mono">ELIMINAR</span> abajo:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Escribe ELIMINAR para confirmar"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-rose-800/60 rounded-xl text-rose-300 font-mono font-bold outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setTenantToDelete(null);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-tenant"
                  disabled={deleteConfirmText.trim().toUpperCase() !== 'ELIMINAR'}
                  onClick={handleConfirmPermanentDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl cursor-pointer shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Definitivamente</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Configuración de Acceso del Super Usuario (Creador Master) */}
      <AnimatePresence>
        {isSuperUserConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 rounded-3xl border-2 border-amber-500/80 shadow-2xl p-6 space-y-4 text-slate-100 my-auto"
            >
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Configuración de Acceso del Super Usuario
                    </h3>
                    <p className="text-[11px] text-amber-400 font-bold">
                      Personaliza tu nombre, usuario y contraseña de Creador Master
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSuperUserConfigModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSuperUserConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    👤 Nombre Completo del Creador / Super Administrador *
                  </label>
                  <input
                    type="text"
                    required
                    value={superUserForm.name}
                    onChange={(e) => setSuperUserForm({ ...superUserForm, name: e.target.value })}
                    placeholder="Ej. Creador Master / Ing. Alejandro"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-white outline-hidden focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    🔑 Nombre de Usuario de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    value={superUserForm.username}
                    onChange={(e) => setSuperUserForm({ ...superUserForm, username: e.target.value })}
                    placeholder="superuser"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-900/50 rounded-xl text-amber-300 font-mono font-bold outline-hidden focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Este es el usuario con el que iniciarás sesión en el sistema.
                  </span>
                </div>

                <div className="p-4 bg-purple-950/40 rounded-2xl border border-purple-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">Cambiar Contraseña Master (Opcional)</span>
                    <button
                      type="button"
                      onClick={() => setShowSuperUserPassword(!showSuperUserPassword)}
                      className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      {showSuperUserPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSuperUserPassword ? 'Ocultar' : 'Ver'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type={showSuperUserPassword ? 'text' : 'password'}
                      value={superUserForm.password}
                      onChange={(e) => setSuperUserForm({ ...superUserForm, password: e.target.value })}
                      placeholder="Dejar en blanco para mantener la contraseña actual"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden focus:border-amber-400"
                    />
                  </div>

                  {superUserForm.password.trim() && (
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Confirmar Nueva Contraseña *
                      </label>
                      <input
                        type={showSuperUserPassword ? 'text' : 'password'}
                        value={superUserForm.confirmPassword}
                        onChange={(e) => setSuperUserForm({ ...superUserForm, confirmPassword: e.target.value })}
                        placeholder="Repite la nueva contraseña"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-purple-900/50 rounded-xl text-white font-mono outline-hidden focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-purple-900/50">
                  <button
                    type="button"
                    onClick={() => setIsSuperUserConfigModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-save-superuser-config"
                    className="px-5 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Cambios de Super Usuario</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CrownIcon = () => (
  <svg className="w-3 h-3 text-slate-950 inline-block" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
  </svg>
);
