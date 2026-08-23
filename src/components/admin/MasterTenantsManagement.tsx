import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { TenantClinic, LicensePlan, PaymentRenewalRequest } from '../../types';

export const MasterTenantsManagement: React.FC = () => {
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
    syncLocalClinicWithTenant,
    resetTenantUserCredentials,
    generateRandomPassword,
  } = useVeterinary();

  const [masterSubTab, setMasterSubTab] = useState<'tenants' | 'payments'>('tenants');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked' | 'expiring' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'mensual' | 'anual'>('all');

  // Modal States
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantClinic | null>(null);
  const [selectedTenantForKey, setSelectedTenantForKey] = useState<TenantClinic | null>(null);
  const [selectedTenantForUsers, setSelectedTenantForUsers] = useState<TenantClinic | null>(null);
  const [activeUserTab, setActiveUserTab] = useState<'admin' | 'encargado' | 'summary'>('admin');

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

  const [generatedKeyResult, setGeneratedKeyResult] = useState<{
    key: string;
    expiresAt: string;
    plan: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State for Create / Edit Tenant
  const [tenantForm, setTenantForm] = useState<{
    clinicName: string;
    directorName: string;
    email: string;
    phone: string;
    city: string;
    plan: LicensePlan;
    priceAmount: number;
    currency: string;
    startDate: string;
    expirationDate: string;
    notes: string;
    adminUsername: string;
    adminPassword: string;
    encargadoUsername: string;
    encargadoPassword: string;
  }>({
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
    adminUsername: '',
    adminPassword: '',
    encargadoUsername: '',
    encargadoPassword: '',
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
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
      // Update local reference in modal
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
      alert('El nombre de usuario de encargado no puede estar vacío.');
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

  // Generate random password helper
  const handleGenerateRandomPassword = (role: 'admin' | 'encargado') => {
    if (role === 'admin') {
      const generated = generateRandomPassword('VetAdmin');
      setAdminUserForm(prev => ({ ...prev, password: generated }));
      setShowAdminPassword(true);
      showToast('Nueva contraseña de administrador generada.');
    } else {
      const generated = generateRandomPassword('StaffVet');
      setEncargadoUserForm(prev => ({ ...prev, password: generated }));
      setShowEncargadoPassword(true);
      showToast('Nueva contraseña de encargado generada.');
    }
  };

  // Copy Full Credentials Slip
  const handleCopyCredentialsSummary = () => {
    if (!selectedTenantForUsers) return;
    const isLocked = selectedTenantForUsers.isLocked || selectedTenantForUsers.status === 'locked';
    const statusText = isLocked ? '⚠️ Bloqueada (Suspensión por pago)' : '✅ Licencia Activa';

    const text =
      `🐾 *CREDENCIALES DE ACCESO - SOFTWARE VETERINARIO*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏥 *Clínica:* ${selectedTenantForUsers.clinicName}\n` +
      `👨‍⚕️ *Titular / Responsable:* ${adminUserForm.name || selectedTenantForUsers.directorName}\n` +
      `📍 *Ubicación:* ${selectedTenantForUsers.city || 'México'}\n` +
      `📜 *Estado de Licencia:* ${statusText}\n` +
      `🔑 *Clave de Licencia:* ${selectedTenantForUsers.licenseKey}\n\n` +
      `🔐 *1. ACCESO ADMINISTRADOR GENERAL (Director)*\n` +
      `• *Usuario:* \`${adminUserForm.username}\`\n` +
      `• *Contraseña:* \`${adminUserForm.password}\`\n` +
      `• *Permisos:* Control total, pacientes, inventario, reportes y configuración.\n\n` +
      `🔐 *2. ACCESO ENCARGADO / RECEPCIÓN (Operativo)*\n` +
      `• *Usuario:* \`${encargadoUserForm.username}\`\n` +
      `• *Contraseña:* \`${encargadoUserForm.password}\`\n` +
      `• *Permisos:* Citas, expedientes, vacunas y atención al cliente.\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💡 *Instrucciones de Ingreso:* Inicie el sistema e ingrese sus credenciales en la pantalla de acceso.\n` +
      `⚡ *Nota:* Credenciales administradas por el Creador del Sistema.`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
    showToast('Ficha completa de credenciales copiada al portapapeles.');
  };

  // Send WhatsApp with Reset Credentials
  const handleSendCredentialsWhatsApp = () => {
    if (!selectedTenantForUsers) return;
    const cleanPhone = (selectedTenantForUsers.phone || '').replace(/[^0-9]/g, '');
    const isLocked = selectedTenantForUsers.isLocked || selectedTenantForUsers.status === 'locked';

    let msg = `Hola Dr(a). *${adminUserForm.name || selectedTenantForUsers.directorName || 'Director'}*, le saludamos del soporte técnico del Software Veterinario.\n\n`;
    msg += `A continuación le hacemos entrega formal de los accesos y credenciales restablecidas para la clínica *${selectedTenantForUsers.clinicName}*:\n\n`;
    msg += `👑 *ACCESO ADMINISTRADOR*\n• Usuario: \`${adminUserForm.username}\`\n• Contraseña: \`${adminUserForm.password}\`\n\n`;
    msg += `👤 *ACCESO ENCARGADO / RECEPCIÓN*\n• Usuario: \`${encargadoUserForm.username}\`\n• Contraseña: \`${encargadoUserForm.password}\`\n\n`;

    if (isLocked) {
      msg += `⚠️ *Aviso de Licencia:* Su licencia se encuentra en estado suspendido. Puede ingresar para verificar su cuenta o ponerse en contacto para renovar su vigencia.\n\n`;
    } else {
      msg += `✅ Su licencia se encuentra activa. Puede ingresar normalmente.\n\n`;
    }

    msg += `Por favor guarde estas credenciales en un lugar seguro.`;

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      setSuccessToast('No hay teléfono registrado para esta clínica.');
    }
  };

  // KPI Calculations
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

    const monthlyIncome = tenants.reduce((acc, t) => {
      if (t.plan === 'mensual') return acc + (t.priceAmount || 599);
      if (t.plan === 'anual') return acc + Math.round((t.priceAmount || 5990) / 12);
      return acc;
    }, 0);

    return { total, active, locked, expiringSoon, expired, monthlyIncome };
  }, [tenants]);

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

      // Status filter
      if (statusFilter === 'active' && (tenant.isLocked || tenant.status === 'locked')) return false;
      if (statusFilter === 'locked' && !tenant.isLocked && tenant.status !== 'locked') return false;

      const expDate = new Date(tenant.expirationDate || now);
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (statusFilter === 'expiring' && (diffDays > 7 || diffDays < 0)) return false;
      if (statusFilter === 'expired' && expDate >= now) return false;

      // Plan filter
      if (planFilter !== 'all' && tenant.plan !== planFilter) return false;

      return true;
    });
  }, [tenants, searchTerm, statusFilter, planFilter]);

  if (!isSuperUser) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Acceso Restringido - Nivel Creador</h2>
        <p className="text-sm text-slate-600">
          Esta pantalla está reservada exclusivamente para el <strong>Super Usuario (Creador del Sistema)</strong>. Inicia sesión con la cuenta maestra para administrar licencias y arrendados.
        </p>
      </div>
    );
  }

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

  // Save Tenant (Create or Update)
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
        currency: 'MXN',
        startDate: tenantForm.startDate,
        expirationDate: tenantForm.expirationDate,
        notes: tenantForm.notes,
        status: 'active',
        isLocked: false,
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
      showToast(`Nuevo arrendatario "${tenantForm.clinicName}" registrado.`);
    }

    setIsNewTenantModalOpen(false);
  };

  // Handle License Extension
  const handleExtendLicense = (tenantId: string, durationType: 'month' | 'year') => {
    extendTenantLicense(tenantId, durationType);
  };

  // Handle Key Generation
  const handleOpenKeyGenerator = (tenant: TenantClinic) => {
    setSelectedTenantForKey(tenant);
    setGeneratedKeyResult(null);
    setCopiedKey(false);
  };

  const handleGenerateKey = (plan: LicensePlan) => {
    if (!selectedTenantForKey) return;
    const newKey = generateTenantKey(selectedTenantForKey.id, plan);
    const expDate = new Date();
    if (plan === 'mensual') expDate.setDate(expDate.getDate() + 30);
    else expDate.setDate(expDate.getDate() + 365);

    setGeneratedKeyResult({
      key: newKey,
      expiresAt: expDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }),
      plan: plan === 'mensual' ? 'Renta Mensual (30 Días)' : 'Renta Anual (365 Días)',
    });
  };

  // Copy Key to Clipboard
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
    showToast('Clave copiada al portapapeles.');
  };

  // Send WhatsApp Reminder / Key
  const handleSendWhatsApp = (tenant: TenantClinic | null, customKey?: string) => {
    if (!tenant) return;
    const cleanPhone = (tenant.phone || '').replace(/[^0-9]/g, '');
    const expDate = new Date(tenant.expirationDate || new Date()).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    let msg = `Hola Dr(a). ${tenant.directorName || 'Director'}, le saludamos del equipo técnico del Software Veterinario.\n\n`;
    if (customKey) {
      msg += `Adjuntamos su nueva clave de activación y desbloqueo de licencia:\n🔑 *${customKey}*\n\nVigencia hasta: ${expDate}.\n\nPara activarla ingrese a Configuración > Licencia > Activar Clave.`;
    } else if (tenant.isLocked) {
      msg += `Le notificamos que el acceso de la clínica *${tenant.clinicName}* se encuentra actualmente suspendido por vencimiento de renta mensual/anual.\n\nPor favor comuníquese con nosotros para renovar su servicio.`;
    } else {
      msg += `Le recordamos que su licencia para *${tenant.clinicName}* vence el día *${expDate}*.\n\nFavor de confirmar su pago para extender la vigencia sin interrupciones en su clínica.`;
    }

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      setSuccessToast('No hay teléfono registrado para esta clínica.');
    }
  };

  // Send WhatsApp with Payment Receipt & Approval Notice
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
      setSuccessToast('No hay teléfono registrado para esta solicitud.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-amber-300 px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 text-sm font-bold"
          >
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner - Creator Master Portal */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-purple-800/40 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Panel Maestro del Creador</span>
              </span>
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold">
                ⚡ Super Usuario: {currentUser?.name}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-mono font-bold">
                Cuenta Irremovible
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-purple-400" />
              <span>Administración Global de Arrendados, Licencias & Usuarios</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Supervisión de clínicas arrendatarias, control de cobros, bloqueo remoto por falta de pago y <strong>restablecimiento de contraseñas de usuarios administradores y encargados de cada licencia esté activa o no</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              id="btn-add-tenant-master"
              onClick={handleOpenNewTenantModal}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-400/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Arrendatario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-purple-900/40 text-xs">
        <button
          type="button"
          onClick={() => setMasterSubTab('tenants')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            masterSubTab === 'tenants'
              ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Clínicas Arrendatarias ({tenants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMasterSubTab('payments')}
          className={`flex-1 py-2.5 px-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
            masterSubTab === 'payments'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>2. Solicitudes de Pago & Renovaciones (24h)</span>
          {paymentRequests.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
              {paymentRequests.filter(r => r.status === 'pending').length} Pendientes
            </span>
          )}
        </button>
      </div>

      {masterSubTab === 'tenants' ? (
        <>
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tenants */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Arrendados</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <div className="text-[11px] text-slate-500 font-medium">Clínicas registradas</div>
        </div>

        {/* Active Licences */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold">Activas</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.active}</div>
          <div className="text-[11px] text-emerald-600/80 font-medium">Operando sin bloqueo</div>
        </div>

        {/* Locked Licences */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold">Bloqueadas</span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-700">{metrics.locked}</div>
          <div className="text-[11px] text-rose-600/80 font-medium">Por falta de pago</div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold">Por Vencer</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-700">{metrics.expiringSoon}</div>
          <div className="text-[11px] text-amber-600/80 font-medium">Próximos 7 días</div>
        </div>

        {/* Expired */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold">Vencidas</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{metrics.expired}</div>
          <div className="text-[11px] text-slate-500 font-medium">Requieren renovación</div>
        </div>

        {/* Estimated Monthly Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-purple-100 bg-purple-50/30 shadow-xs">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-xs font-bold">Renta Mensual</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-xl font-black text-purple-900">
            ${metrics.monthlyIncome.toLocaleString('es-MX')}
          </div>
          <div className="text-[11px] text-purple-700/80 font-medium">MXN recurrente est.</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="input-search-tenants"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por clínica, médico, usuario (admin / encargado), teléfono..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Estado:</span>
            {[
              { key: 'all', label: 'Todos' },
              { key: 'active', label: 'Activas' },
              { key: 'locked', label: 'Bloqueadas' },
              { key: 'expiring', label: 'Por Vencer' },
              { key: 'expired', label: 'Vencidas' },
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setStatusFilter(st.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  statusFilter === st.key
                    ? 'bg-purple-900 text-amber-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-xs font-bold text-slate-500">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden"
            >
              <option value="all">Todos los planes</option>
              <option value="mensual">Mensual ($599)</option>
              <option value="anual">Anual ($5,990)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenants List Grid */}
      <div className="space-y-4">
        {filteredTenants.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">No se encontraron arrendatarios</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hay clínicas que coincidan con los filtros aplicados. Puedes agregar un nuevo cliente arrendatario haciendo clic en "Nuevo Arrendatario".
            </p>
            <button
              type="button"
              onClick={handleOpenNewTenantModal}
              className="px-4 py-2 bg-purple-900 text-amber-300 rounded-xl text-xs font-black inline-flex items-center gap-1.5 cursor-pointer hover:bg-purple-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Arrendatario</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTenants.map((tenant) => {
              const now = new Date();
              const expDate = new Date(tenant.expirationDate);
              const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const isExpired = expDate < now;
              const isExpiringSoon = diffDays <= 7 && diffDays >= 0;

              return (
                <div
                  key={tenant.id}
                  id={`tenant-card-${tenant.id}`}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-xs hover:shadow-md ${
                    tenant.isLocked || tenant.status === 'locked'
                      ? 'border-rose-300 bg-rose-50/20'
                      : isExpired
                      ? 'border-orange-300 bg-orange-50/20'
                      : isExpiringSoon
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Clinic Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {tenant.isLocked || tenant.status === 'locked' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueada
                          </span>
                        ) : isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-600 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Renta Vencida
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Vence en {diffDays} días
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Activa
                          </span>
                        )}

                        {/* Plan Badge */}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {tenant.plan === 'mensual' ? '📅 Renta Mensual' : '⭐ Renta Anual'}
                        </span>

                        {/* Monthly Fee */}
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900">
                          ${(tenant.priceAmount || (tenant.plan === 'mensual' ? 599 : 5990)).toLocaleString('es-MX')} MXN
                          {tenant.plan === 'mensual' ? '/mes' : '/año'}
                        </span>

                        {tenant.city && (
                          <span className="text-xs text-slate-500 font-medium">
                            📍 {tenant.city}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                          <span>{tenant.clinicName}</span>
                          {tenant.id === 'tenant-central-local' && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold">
                              Clínica Local Principal
                            </span>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                          <span className="font-bold text-slate-800">
                            👨‍⚕️ {tenant.directorName}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3.5 h-3.5" /> {tenant.phone}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Mail className="w-3.5 h-3.5" /> {tenant.email}
                          </span>
                        </div>
                      </div>

                      {/* Credentials & Users Summary Pill for this tenant */}
                      <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCog className="w-3.5 h-3.5 text-purple-700" />
                            <span>Usuarios de Gestión de la Licencia:</span>
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Restablecimiento Disponible (Activa o Bloqueada)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {/* Admin user info */}
                          <div className="bg-white p-2 rounded-xl border border-purple-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-500 block">👑 Administrador Principal:</span>
                              <span className="font-mono font-bold text-purple-950 text-xs">
                                {tenant.adminCredentials?.username || 'admin'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Clave: ••••••••
                            </span>
                          </div>

                          {/* Encargado user info */}
                          <div className="bg-white p-2 rounded-xl border border-purple-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-500 block">👤 Encargado / Recepción:</span>
                              <span className="font-mono font-bold text-slate-800 text-xs">
                                {tenant.encargadoCredentials?.username || 'encargado'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Clave: ••••••••
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* License Dates and Key */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Vigencia de Licencia:</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            {new Date(tenant.expirationDate).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Clave de Licencia Actual:</span>
                          <span className="font-mono text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {tenant.licenseKey || 'VET-MENS-KEY-2026'}
                          </span>
                        </div>
                      </div>

                      {tenant.notes && (
                        <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/60">
                          <span className="font-bold text-slate-700">Notas de Cobranza:</span> {tenant.notes}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions Toolbar */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:w-68 border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-4 lg:pt-0 lg:pl-5 justify-center">
                      {/* Restablecer Usuarios y Claves (FEATURE PROMINENTE) */}
                      <button
                        type="button"
                        id={`btn-manage-users-${tenant.id}`}
                        onClick={() => handleOpenUsersModal(tenant)}
                        className="w-full py-2 px-3 bg-gradient-to-r from-purple-900 to-slate-900 hover:from-purple-950 hover:to-slate-950 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        title="Restablecer claves y usuarios de administración (activo o no)"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restablecer Usuarios & Claves</span>
                      </button>

                      {/* Lock / Unlock Toggle Button */}
                      <button
                        type="button"
                        id={`btn-toggle-lock-${tenant.id}`}
                        onClick={() => {
                          const willLock = !tenant.isLocked && tenant.status !== 'locked';
                          toggleTenantLock(tenant.id, willLock, willLock ? 'Bloqueo manual por falta de pago' : undefined);
                        }}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          tenant.isLocked || tenant.status === 'locked'
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        }`}
                      >
                        {tenant.isLocked || tenant.status === 'locked' ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Desbloquear Acceso</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Bloquear Inmediatamente</span>
                          </>
                        )}
                      </button>

                      {/* Quick Extend License (+1 mes / +1 año) */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          id={`btn-extend-1m-${tenant.id}`}
                          onClick={() => handleExtendLicense(tenant.id, 'month')}
                          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                          title="Extender 30 días a partir de hoy o fecha actual"
                        >
                          <RefreshCw className="w-3 h-3 text-purple-600" />
                          <span>+1 Mes</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-extend-1y-${tenant.id}`}
                          onClick={() => handleExtendLicense(tenant.id, 'year')}
                          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                          title="Extender 1 año (365 días)"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>+1 Año</span>
                        </button>
                      </div>

                      {/* Generate Key Modal */}
                      <button
                        type="button"
                        id={`btn-open-keygen-${tenant.id}`}
                        onClick={() => handleOpenKeyGenerator(tenant)}
                        className="w-full py-1.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-purple-600" />
                        <span>Generar Clave de Activación</span>
                      </button>

                      {/* WhatsApp Reminder Button */}
                      <button
                        type="button"
                        id={`btn-whatsapp-${tenant.id}`}
                        onClick={() => handleSendWhatsApp(tenant)}
                        className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aviso por WhatsApp</span>
                      </button>

                      {/* Secondary Buttons (Switch clinic test, Edit, Delete) */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          id={`btn-switch-clinic-${tenant.id}`}
                          onClick={() => {
                            syncLocalClinicWithTenant(tenant.id);
                          }}
                          className="flex-1 py-1.5 px-2 bg-slate-900 hover:bg-slate-950 text-amber-300 rounded-xl text-[10.5px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                          title="Cargar y emular esta clínica en pantalla"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Emular Clínica</span>
                        </button>

                        <button
                          type="button"
                          id={`btn-edit-tenant-${tenant.id}`}
                          onClick={() => handleOpenEditModal(tenant)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Editar información"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          id={`btn-delete-tenant-${tenant.id}`}
                          onClick={() => {
                            if (window.confirm(`¿Estás seguro de eliminar el registro del arrendatario "${tenant.clinicName}"?`)) {
                              deleteTenant(tenant.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Eliminar arrendatario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  ) : (
    /* PAYMENT REQUESTS & 24H SLA RENEWALS VIEW */
    <div className="space-y-6">
      {/* Summary Stats Header for Payments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Notificaciones</span>
            <Inbox className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{paymentRequests.length}</div>
          <div className="text-[11px] text-slate-500 font-medium">Comprobantes enviados por clínicas</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pendientes de Validar (24h)</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-900">
            {paymentRequests.filter((r) => r.status === 'pending').length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium">Reactivación en plazo de 24 horas</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aprobadas & Reactivadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {paymentRequests.filter((r) => r.status === 'approved').length}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium">Licencias extendidas con éxito</div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-xs">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Correo Receptor Master</span>
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xs font-black text-purple-900 truncate" title={currentUser?.email || 'super.admin@vetcare.master.com'}>
            {currentUser?.email || 'super.admin@vetcare.master.com'}
          </div>
          <div className="text-[11px] text-purple-700 font-medium">Notificación automática activa</div>
        </div>
      </div>

      {/* Payment Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>Bandeja de Referencias de Pago Entrantes (Notificadas por Correo)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Las clínicas cuentan con un plazo de reactivación de hasta 24 horas tras enviar su comprobante.
            </p>
          </div>
        </div>

        {paymentRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">No hay referencias de pago registradas</h4>
            <p className="text-xs text-slate-500">
              Cuando las clínicas paguen su renta mensual o anual, aquí se listarán para su validación inmediata.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentRequests.map((req) => (
              <div
                key={req.id}
                className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                  req.status === 'pending'
                    ? 'border-amber-300 ring-2 ring-amber-400/20'
                    : req.status === 'approved'
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 opacity-70'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-slate-900 text-amber-300 font-mono font-black text-xs rounded-xl flex items-center gap-1.5 shadow-2xs">
                        <Receipt className="w-3.5 h-3.5 text-amber-400" />
                        <span>{req.referenceFolio}</span>
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                          req.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse'
                            : req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.status === 'pending' ? (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Pendiente (Validar en 24h)</span>
                          </>
                        ) : req.status === 'approved' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Aprobado & Reactivado ({req.approvedAt?.slice(0, 10)})</span>
                          </>
                        ) : (
                          'Rechazado'
                        )}
                      </span>

                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold uppercase">
                        {req.paymentMethod === 'card' ? '💳 Tarjeta Bancaria' : req.paymentMethod === 'oxxo' ? '🏪 OXXO' : '⚡ SPEI'}
                      </span>

                      <span className="text-xs text-slate-400 font-medium">
                        Fecha: {req.paymentDate}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Clínica Arrendataria</span>
                        <span className="font-extrabold text-slate-900 text-sm">{req.clinicName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Médico Titular</span>
                        <span className="font-bold text-slate-800">{req.directorName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Plan & Monto</span>
                        <span className="font-black text-emerald-700 text-sm">
                          ${Number(req.amount || 0).toLocaleString('es-MX')} MXN ({req.plan === 'mensual' ? '+30 Días' : '+365 Días'})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Contacto / Correo</span>
                        <span className="font-mono text-slate-700 truncate block" title={req.email}>
                          {req.email || 'N/A'} {req.phone ? `• ${req.phone}` : ''}
                        </span>
                      </div>
                    </div>

                    {req.notes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <strong>Detalle:</strong> {req.notes}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                    {req.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => approvePaymentRenewalRequest(req.id)}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:shadow-emerald-600/20 cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Validar Pago & Reactivar (+{req.plan === 'mensual' ? '30d' : '365d'})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSendPaymentWhatsApp(req)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp a la Clínica</span>
                    </button>

                    {req.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => rejectPaymentRenewalRequest(req.id)}
                        className="px-3 py-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        Rechazar Comprobante
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )}

      {/* Modal: Restablecer Claves y Usuarios de Administración por Licencia */}
      <AnimatePresence>
        {selectedTenantForUsers && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-purple-300 overflow-hidden my-auto"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white flex items-center justify-between border-b border-purple-800/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Control Maestro de Super Usuario
                    </span>
                    {selectedTenantForUsers.isLocked || selectedTenantForUsers.status === 'locked' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600/80 text-white border border-rose-400/40 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Licencia Bloqueada
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/80 text-white border border-emerald-400/40 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Licencia Activa
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>Restablecer Accesos & Usuarios: {selectedTenantForUsers.clinicName}</span>
                  </h3>
                  <p className="text-xs text-purple-200">
                    Modifique usuarios, reasigne contraseñas o genere credenciales aleatorias seguras <strong>(disponible en cualquier estado de licencia: activa, suspendida o vencida)</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-close-users-modal"
                  onClick={() => setSelectedTenantForUsers(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Master Privilege Notice */}
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Acceso Maestro Global:</strong> Como creador del sistema, los cambios aplicados aquí actualizarán inmediatamente las credenciales de ingreso para el titular y personal de esta clínica.
                </span>
              </div>

              {/* Tabs Bar */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveUserTab('admin')}
                  className={`pb-3 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                    activeUserTab === 'admin'
                      ? 'border-purple-700 text-purple-900 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserCog className="w-3.5 h-3.5 text-purple-600" />
                  <span>1. Administrador (Director)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveUserTab('encargado')}
                  className={`pb-3 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                    activeUserTab === 'encargado'
                      ? 'border-purple-700 text-purple-900 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>2. Encargado (Recepción)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveUserTab('summary')}
                  className={`pb-3 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                    activeUserTab === 'summary'
                      ? 'border-purple-700 text-purple-900 bg-white rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>3. Ficha de Entrega & WhatsApp</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* TAB 1: ADMIN USER */}
                {activeUserTab === 'admin' && (
                  <form onSubmit={handleSaveAdminCredentials} className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-purple-700" />
                          <span>Perfil de Administrador General (Titular de la Licencia)</span>
                        </div>
                        <p className="text-[11px] text-purple-800">
                          Tiene acceso total a pacientes, registros médicos, inventario, reportes y parámetros de la clínica.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGenerateRandomPassword('admin')}
                        className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                        title="Genera una contraseña criptográficamente segura"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Generar Clave Segura</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre de Usuario (Login) *
                        </label>
                        <input
                          type="text"
                          required
                          value={adminUserForm.username}
                          onChange={(e) => setAdminUserForm({ ...adminUserForm, username: e.target.value })}
                          placeholder="Ej. admin.gdl"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-purple-950 focus:ring-2 focus:ring-purple-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre del Médico Titular *
                        </label>
                        <input
                          type="text"
                          required
                          value={adminUserForm.name}
                          onChange={(e) => setAdminUserForm({ ...adminUserForm, name: e.target.value })}
                          placeholder="Ej. Dr. Mauricio Elizondo"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Correo Electrónico de Contacto
                        </label>
                        <input
                          type="email"
                          value={adminUserForm.email}
                          onChange={(e) => setAdminUserForm({ ...adminUserForm, email: e.target.value })}
                          placeholder="contacto@veterinaria.mx"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nueva Contraseña de Acceso *
                        </label>
                        <div className="relative">
                          <input
                            type={showAdminPassword ? 'text' : 'password'}
                            required
                            value={adminUserForm.password}
                            onChange={(e) => setAdminUserForm({ ...adminUserForm, password: e.target.value })}
                            placeholder="Mínimo 4 caracteres..."
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        Última actualización: {selectedTenantForUsers.adminCredentials?.updatedAt || 'Registro inicial'}
                      </span>
                      <button
                        type="submit"
                        id="btn-save-admin-creds"
                        className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Guardar & Restablecer Administrador</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: ENCARGADO USER */}
                {activeUserTab === 'encargado' && (
                  <form onSubmit={handleSaveEncargadoCredentials} className="space-y-4">
                    <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                          <span>Perfil de Encargado Operativo / Recepción</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Acceso para registro de consultas, citas, pacientes y vacunas. Sin acceso a parámetros de facturación.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGenerateRandomPassword('encargado')}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                        title="Genera una contraseña criptográficamente segura"
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Generar Clave Segura</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre de Usuario (Login) *
                        </label>
                        <input
                          type="text"
                          required
                          value={encargadoUserForm.username}
                          onChange={(e) => setEncargadoUserForm({ ...encargadoUserForm, username: e.target.value })}
                          placeholder="Ej. recepcion.gdl"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre del Encargado(a) *
                        </label>
                        <input
                          type="text"
                          required
                          value={encargadoUserForm.name}
                          onChange={(e) => setEncargadoUserForm({ ...encargadoUserForm, name: e.target.value })}
                          placeholder="Ej. Lic. Sofía Ramos"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={encargadoUserForm.email}
                          onChange={(e) => setEncargadoUserForm({ ...encargadoUserForm, email: e.target.value })}
                          placeholder="recepcion@veterinaria.mx"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nueva Contraseña de Acceso *
                        </label>
                        <div className="relative">
                          <input
                            type={showEncargadoPassword ? 'text' : 'password'}
                            required
                            value={encargadoUserForm.password}
                            onChange={(e) => setEncargadoUserForm({ ...encargadoUserForm, password: e.target.value })}
                            placeholder="Mínimo 4 caracteres..."
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEncargadoPassword(!showEncargadoPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showEncargadoPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500">
                        Última actualización: {selectedTenantForUsers.encargadoCredentials?.updatedAt || 'Registro inicial'}
                      </span>
                      <button
                        type="submit"
                        id="btn-save-encargado-creds"
                        className="px-5 py-2.5 bg-purple-900 hover:bg-purple-950 text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        <span>Guardar & Restablecer Encargado</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: SUMMARY & DIRECT WHATSAPP DELIVERY */}
                {activeUserTab === 'summary' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-amber-400 border-b border-slate-800 pb-2">
                        <span className="font-bold flex items-center gap-1.5">
                          <FileText className="w-4 h-4" /> Resumen de Accesos Listos para Entrega
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {selectedTenantForUsers.clinicName}
                        </span>
                      </div>

                      <div className="space-y-2 text-slate-300 text-[11.5px] leading-relaxed select-all">
                        <p><strong>🏥 Clínica:</strong> {selectedTenantForUsers.clinicName}</p>
                        <p><strong>👨‍⚕️ Titular:</strong> {adminUserForm.name || selectedTenantForUsers.directorName}</p>
                        <p><strong>📜 Estado de Licencia:</strong> {selectedTenantForUsers.isLocked ? '⚠️ Bloqueada por falta de pago' : '✅ Licencia Activa'}</p>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <p className="text-amber-300 font-bold">👑 USUARIO ADMINISTRADOR GENERAL:</p>
                          <p>• Usuario: <span className="text-white font-bold">{adminUserForm.username}</span></p>
                          <p>• Contraseña: <span className="text-amber-300 font-bold">{adminUserForm.password}</span></p>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <p className="text-emerald-300 font-bold">👤 USUARIO ENCARGADO / RECEPCIÓN:</p>
                          <p>• Usuario: <span className="text-white font-bold">{encargadoUserForm.username}</span></p>
                          <p>• Contraseña: <span className="text-emerald-300 font-bold">{encargadoUserForm.password}</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        id="btn-copy-summary-slip"
                        onClick={handleCopyCredentialsSummary}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        {copiedSummary ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>¡Copiado al Portapapeles!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-purple-700" />
                            <span>Copiar Ficha de Accesos</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id="btn-send-whatsapp-creds"
                        onClick={handleSendCredentialsWhatsApp}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Enviar Accesos por WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTenantForUsers(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add or Edit Tenant */}
      <AnimatePresence>
        {isNewTenantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
            >
              <div className="p-6 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <span>{editingTenant ? 'Editar Arrendatario' : 'Registrar Nuevo Arrendatario'}</span>
                  </h3>
                  <p className="text-xs text-purple-200">
                    Datos del consultorio/clínica, plan contratado y esquema de renta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTenant} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre de la Clínica Veterinaria *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenantForm.clinicName}
                      onChange={(e) => setTenantForm({ ...tenantForm, clinicName: e.target.value })}
                      placeholder="Ej. Clínica Veterinaria San Francisco"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Médico Responsable / Titular *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenantForm.directorName}
                      onChange={(e) => setTenantForm({ ...tenantForm, directorName: e.target.value })}
                      placeholder="Ej. Dr. Mario Santos"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      value={tenantForm.phone}
                      onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })}
                      placeholder="Ej. 525512345678"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={tenantForm.email}
                      onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })}
                      placeholder="contacto@veterinaria.com"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ciudad / Región
                    </label>
                    <input
                      type="text"
                      value={tenantForm.city}
                      onChange={(e) => setTenantForm({ ...tenantForm, city: e.target.value })}
                      placeholder="Ej. Ciudad de México / Guadalajara"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Plan de Renta
                    </label>
                    <select
                      value={tenantForm.plan}
                      onChange={(e) => {
                        const newPlan = e.target.value as LicensePlan;
                        setTenantForm({
                          ...tenantForm,
                          plan: newPlan,
                          priceAmount: newPlan === 'mensual' ? 599 : 5990,
                        });
                      }}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    >
                      <option value="mensual">Renta Mensual ($599 MXN)</option>
                      <option value="anual">Renta Anual ($5,990 MXN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tarifa de Cobro (MXN)
                    </label>
                    <input
                      type="number"
                      value={tenantForm.priceAmount}
                      onChange={(e) => setTenantForm({ ...tenantForm, priceAmount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fecha de Inicio de Contrato
                    </label>
                    <input
                      type="date"
                      value={tenantForm.startDate}
                      onChange={(e) => setTenantForm({ ...tenantForm, startDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fecha de Vencimiento de Licencia
                    </label>
                    <input
                      type="date"
                      value={tenantForm.expirationDate}
                      onChange={(e) => setTenantForm({ ...tenantForm, expirationDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                    />
                  </div>
                </div>

                {/* Initial Admin & Staff Credentials */}
                <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-3">
                  <div className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <UserCog className="w-4 h-4 text-purple-700" />
                    <span>Credenciales Iniciales de Administración de la Licencia:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Usuario Administrador</label>
                      <input
                        type="text"
                        value={tenantForm.adminUsername}
                        onChange={(e) => setTenantForm({ ...tenantForm, adminUsername: e.target.value })}
                        placeholder="admin"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-purple-950 focus:ring-2 focus:ring-purple-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Contraseña Administrador</label>
                      <input
                        type="text"
                        value={tenantForm.adminPassword}
                        onChange={(e) => setTenantForm({ ...tenantForm, adminPassword: e.target.value })}
                        placeholder="admin123"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Usuario Encargado</label>
                      <input
                        type="text"
                        value={tenantForm.encargadoUsername}
                        onChange={(e) => setTenantForm({ ...tenantForm, encargadoUsername: e.target.value })}
                        placeholder="encargado"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">Contraseña Encargado</label>
                      <input
                        type="text"
                        value={tenantForm.encargadoPassword}
                        onChange={(e) => setTenantForm({ ...tenantForm, encargadoPassword: e.target.value })}
                        placeholder="encargado123"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notas Administrativas o de Cobranza
                  </label>
                  <textarea
                    rows={2}
                    value={tenantForm.notes}
                    onChange={(e) => setTenantForm({ ...tenantForm, notes: e.target.value })}
                    placeholder="Detalles sobre acuerdos de pago, transferencias o recordatorios..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsNewTenantModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingTenant ? 'Guardar Cambios' : 'Registrar Arrendatario'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Generate License Key for Tenant */}
      <AnimatePresence>
        {selectedTenantForKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
            >
              <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <span>Generador de Claves Criptográficas</span>
                  </h3>
                  <p className="text-xs text-purple-200">
                    Emitir clave de desbloqueo para: <strong>{selectedTenantForKey.clinicName}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTenantForKey(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    Selecciona el Periodo de Licencia a Emitir:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="btn-genkey-30d"
                      onClick={() => handleGenerateKey('mensual')}
                      className="p-3.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-black text-purple-950">1 Mes (Renta Mensual)</div>
                      <div className="text-[10px] text-purple-700 font-medium mt-0.5">30 Días de Acceso ($599 MXN)</div>
                    </button>

                    <button
                      type="button"
                      id="btn-genkey-365d"
                      onClick={() => handleGenerateKey('anual')}
                      className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition-colors cursor-pointer"
                    >
                      <div className="text-xs font-black text-amber-950">1 Año (Renta Anual)</div>
                      <div className="text-[10px] text-amber-700 font-medium mt-0.5">365 Días Anuales ($5,990 MXN)</div>
                    </button>
                  </div>
                </div>

                {/* Generated Key Output Box */}
                {generatedKeyResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-900 rounded-2xl border border-purple-500/40 text-white space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-black flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Clave Generada ({generatedKeyResult.plan})
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Hasta: {generatedKeyResult.expiresAt}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                      <code className="text-xs font-mono font-bold text-amber-300 select-all">
                        {generatedKeyResult.key}
                      </code>
                      <button
                        type="button"
                        id="btn-copy-generated-key"
                        onClick={() => handleCopyKey(generatedKeyResult.key)}
                        className="p-2 bg-purple-800 hover:bg-purple-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      >
                        {copiedKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copiada</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(selectedTenantForKey, generatedKeyResult.key)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enviar Clave por WhatsApp al Cliente</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
                  <span className="font-bold block flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-700" /> ¿Cómo activa el cliente esta clave?
                  </span>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    El doctor titular puede ingresar a su sistema en el menú <strong>Configuración &rarr; Licencia & Renta</strong>, pegar este código y hacer clic en <strong>Validar y Aplicar Licencia</strong> para desbloquear o extender la vigencia automáticamente.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
