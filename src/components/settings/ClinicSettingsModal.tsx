import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Stethoscope,
  Clock,
  Save,
  RotateCcw,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  BadgeCheck,
  Percent,
  Coins,
  ShieldCheck,
  Sparkles,
  Lock,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  CreditCard,
  User,
  ShieldAlert,
  HelpCircle,
  Zap,
  Upload,
  Image as ImageIcon,
  Palette,
  Trash2,
  Camera,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { ClinicSettings, UserAccountWithCredentials } from '../../types';

interface ClinicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: 'general' | 'medical' | 'schedule' | 'security' | 'license';
}

export const ClinicSettingsModal: React.FC<ClinicSettingsModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'general',
}) => {
  const {
    clinicSettings,
    updateClinicSettings,
    resetClinicSettings,
    currentUser,
    userAccounts,
    updateUserPassword,
    updateUserAccount,
    systemLicense,
    daysRemaining,
    renewLicense,
    changeLicensePlan,
    validateAndApplyKey,
    simulateLicenseDaysOffset,
    setIsLicenseModalOpen,
    showToast,
  } = useVeterinary();
  
  const [formData, setFormData] = useState<ClinicSettings>(clinicSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'medical' | 'schedule' | 'security' | 'license'>('general');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [settingsLicenseKeyInput, setSettingsLicenseKeyInput] = useState('');

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('La imagen supera los 2MB. Por favor sube un archivo más ligero.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData(prev => ({ ...prev, logoUrl: base64 }));
      showToast('¡Logotipo cargado con éxito! Haz clic en "Guardar Parámetros" para aplicar.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Security Credentials Local State for Admin
  const adminAccount = userAccounts.find(u => u.role === 'admin') || userAccounts[0];
  const encargadoAccount = userAccounts.find(u => u.role === 'encargado') || userAccounts[1];

  const [adminUsername, setAdminUsername] = useState(adminAccount?.username || 'admin');
  const [adminName, setAdminName] = useState(adminAccount?.name || '');
  const [adminEmail, setAdminEmail] = useState(adminAccount?.email || '');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Security Credentials Local State for Encargado
  const [encargadoUsername, setEncargadoUsername] = useState(encargadoAccount?.username || 'encargado');
  const [encargadoName, setEncargadoName] = useState(encargadoAccount?.name || '');
  const [encargadoEmail, setEncargadoEmail] = useState(encargadoAccount?.email || '');
  const [encargadoNewPassword, setEncargadoNewPassword] = useState('');
  const [encargadoConfirmPassword, setEncargadoConfirmPassword] = useState('');
  const [showEncargadoPass, setShowEncargadoPass] = useState(false);

  const isEncargado = currentUser?.role === 'encargado';

  // Sync state when modal opens or clinicSettings change
  useEffect(() => {
    if (isOpen) {
      setFormData(clinicSettings);
      setActiveSection(initialSection);
      setIsSavedRecently(false);

      if (adminAccount) {
        setAdminUsername(adminAccount.username);
        setAdminName(adminAccount.name);
        setAdminEmail(adminAccount.email);
        setAdminNewPassword('');
        setAdminConfirmPassword('');
      }

      if (encargadoAccount) {
        setEncargadoUsername(encargadoAccount.username);
        setEncargadoName(encargadoAccount.name);
        setEncargadoEmail(encargadoAccount.email);
        setEncargadoNewPassword('');
        setEncargadoConfirmPassword('');
      }
    }
  }, [isOpen, clinicSettings, initialSection, adminAccount, encargadoAccount]);

  if (!isOpen) return null;

  if (isEncargado) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-rose-200 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Acceso Restringido
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El perfil de <strong>Encargado de Clínica</strong> no tiene permisos para ver ni modificar los parámetros del negocio (datos fiscales, director médico ni gestión de claves de acceso).
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-amber-300 font-black text-xs rounded-xl transition-colors cursor-pointer"
            >
              Entendido, Regresar al Sistema
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  const handleChange = (field: keyof ClinicSettings, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicSettings(formData);
    setIsSavedRecently(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleSaveAdminCredentials = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!adminAccount) return;

    if (!adminUsername.trim()) {
      showToast('El nombre de usuario de Administrador no puede estar vacío.', 'warning');
      return;
    }

    if (adminNewPassword) {
      if (adminNewPassword.length < 4) {
        showToast('La nueva contraseña de Administrador debe tener al menos 4 caracteres.', 'warning');
        return;
      }
      if (adminConfirmPassword && adminNewPassword !== adminConfirmPassword) {
        showToast('Las contraseñas escritas para Administrador no coinciden.', 'warning');
        return;
      }
    }

    const updates: Partial<UserAccountWithCredentials> = {
      username: adminUsername.trim(),
      name: adminName.trim() || adminAccount.name,
      email: adminEmail.trim() || adminAccount.email,
    };

    if (adminNewPassword) {
      updates.passwordHash = adminNewPassword.trim();
    }

    updateUserAccount(adminAccount.id, updates);
    setAdminNewPassword('');
    setAdminConfirmPassword('');
    showToast('Credenciales de Administrador actualizadas correctamente.', 'success');
  };

  const handleSaveEncargadoCredentials = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!encargadoAccount) return;

    if (!encargadoUsername.trim()) {
      showToast('El nombre de usuario de Encargado no puede estar vacío.', 'warning');
      return;
    }

    if (encargadoNewPassword) {
      if (encargadoNewPassword.length < 4) {
        showToast('La nueva contraseña de Encargado debe tener al menos 4 caracteres.', 'warning');
        return;
      }
      if (encargadoConfirmPassword && encargadoNewPassword !== encargadoConfirmPassword) {
        showToast('Las contraseñas escritas para Encargado no coinciden.', 'warning');
        return;
      }
    }

    const updates: Partial<UserAccountWithCredentials> = {
      username: encargadoUsername.trim(),
      name: encargadoName.trim() || encargadoAccount.name,
      email: encargadoEmail.trim() || encargadoAccount.email,
    };

    if (encargadoNewPassword) {
      updates.passwordHash = encargadoNewPassword.trim();
    }

    updateUserAccount(encargadoAccount.id, updates);
    setEncargadoNewPassword('');
    setEncargadoConfirmPassword('');
    showToast('Credenciales de Encargado de Clínica actualizadas correctamente.', 'success');
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas restaurar todos los parámetros de la clínica a sus valores iniciales?')) {
      resetClinicSettings();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Top Modal Header */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-400/20 border border-yellow-200">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    Parámetros del Negocio y Clínica
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Configuración Global
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Edita la dirección, médico encargado, cédula profesional, teléfonos y horarios.
                </p>
              </div>
            </div>

            <button
              id="btn-close-clinic-settings"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('general')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeSection === 'general'
                  ? 'bg-white text-amber-700 border-amber-500 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>1. Identidad & Contacto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('medical')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeSection === 'medical'
                  ? 'bg-white text-amber-700 border-amber-500 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>2. Dirección Médica & Recetas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('schedule')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeSection === 'schedule'
                  ? 'bg-white text-amber-700 border-amber-500 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>3. Horarios & Operación</span>
            </button>

            <button
              type="button"
              id="tab-settings-security"
              onClick={() => setActiveSection('security')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeSection === 'security'
                  ? 'bg-white text-rose-700 border-rose-500 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <KeyRound className="w-4 h-4 text-rose-600" />
              <span>4. Seguridad & Claves</span>
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded-md">
                Admin / Encargado
              </span>
            </button>

            <button
              type="button"
              id="tab-settings-license"
              onClick={() => setActiveSection('license')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeSection === 'license'
                  ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>5. Licencia & Renta</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] font-black rounded-md ${
                  daysRemaining < 0
                    ? 'bg-rose-100 text-rose-800'
                    : daysRemaining <= 5
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {daysRemaining < 0 ? 'Vencida' : `${daysRemaining}d`}
              </span>
            </button>
          </div>

          {/* Form Content Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 30-Day Free Trial / License Status Banner */}
            {daysRemaining > 0 && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                    🎁
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-emerald-950">
                        {systemLicense.priceAmount === 0 || systemLicense.licenseKey.includes('GRATIS') || systemLicense.licenseKey.includes('TRIAL')
                          ? '🌟 Licencia Gratuita de Prueba por 30 Días Activa'
                          : 'Licencia del Sistema Activa'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 border border-emerald-300">
                        {daysRemaining} días restantes
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                      Tu clínica tiene acceso total a todas las herramientas médicas, recetas, kárdex y citas sin costo durante el periodo de evaluación.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('license')}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Ver Licencia</span>
                </button>
              </div>
            )}

            {/* SECTION 1: General Info & Contact */}
            {activeSection === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* BRAND & LOGO CUSTOMIZATION CARD */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/20 via-purple-950/20 to-slate-900/50 border-2 border-indigo-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                          <span>Logotipo & Personalización de Marca</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                            100% Personalizable
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Sube tu logotipo oficial o diseña tu monograma con colores corporativos para todo el software.
                        </p>
                      </div>
                    </div>

                    {/* Live Preview Pill */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Vista Previa:</span>
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Preview"
                          className="w-7 h-7 rounded-lg object-contain border border-slate-200"
                        />
                      ) : (
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${
                          formData.brandColor === 'emerald' ? 'from-emerald-600 to-teal-800' :
                          formData.brandColor === 'purple' ? 'from-purple-600 to-fuchsia-800' :
                          formData.brandColor === 'amber' ? 'from-amber-500 to-yellow-600' :
                          formData.brandColor === 'blue' ? 'from-blue-600 to-cyan-800' :
                          formData.brandColor === 'rose' ? 'from-rose-600 to-pink-800' :
                          formData.brandColor === 'teal' ? 'from-teal-600 to-emerald-800' :
                          formData.brandColor === 'cyan' ? 'from-cyan-600 to-blue-800' :
                          'from-indigo-600 to-purple-700'
                        } flex items-center justify-center text-white text-[10px] font-black font-mono relative shadow-2xs`}>
                          <span>{formData.logoText || (formData.name ? formData.name.substring(0, 3).toUpperCase() : 'VET')}</span>
                          <span className="absolute -top-1.5 -right-1.5 text-[8px]">{formData.logoEmoji || '🐾'}</span>
                        </div>
                      )}
                      <span className="text-xs font-black text-slate-800 truncate max-w-[120px]">
                        {formData.name || 'Mi Clínica'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* OPTION 1: Upload Logo Image */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5">
                      <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                          Subir Imagen de Logotipo (PNG / JPG / SVG)
                        </span>
                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                            className="text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                            title="Eliminar imagen y usar monograma"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Quitar Imagen</span>
                          </button>
                        )}
                      </label>

                      <div className="flex items-center gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 text-xs font-bold cursor-pointer transition-all">
                          <Upload className="w-4 h-4" />
                          <span>{formData.logoUrl ? 'Cambiar Archivo de Logo' : 'Seleccionar Archivo de Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block">O ingresa URL directa de la imagen:</span>
                        <input
                          type="url"
                          value={formData.logoUrl || ''}
                          onChange={e => handleChange('logoUrl', e.target.value)}
                          placeholder="https://ejemplo.com/logo-clinica.png"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {/* OPTION 2: Monogram, Emoji & Color Palette */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Siglas / Texto del Logo (2-4 letras)
                          </label>
                          <input
                            type="text"
                            maxLength={5}
                            value={formData.logoText || ''}
                            onChange={e => handleChange('logoText', e.target.value.toUpperCase())}
                            placeholder="Ej. VET, SAN, PET"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 uppercase outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Ícono / Emoji del Logo
                          </label>
                          <div className="flex items-center gap-1">
                            {['🐾', '🐕', '🐱', '🏥', '⚕️', '🩺', '🦁', '🦜'].map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleChange('logoEmoji', emoji)}
                                className={`w-6 h-6 rounded-md text-xs flex items-center justify-center transition-all cursor-pointer ${
                                  formData.logoEmoji === emoji
                                    ? 'bg-indigo-600 text-white scale-110 shadow-xs ring-2 ring-indigo-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Brand Color Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                          Color Corporativo Principal del Logo:
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[
                            { id: 'indigo', label: 'Índigo Pro', bg: 'bg-indigo-600' },
                            { id: 'emerald', label: 'Esmeralda Médico', bg: 'bg-emerald-600' },
                            { id: 'purple', label: 'Púrpura Imperial', bg: 'bg-purple-600' },
                            { id: 'blue', label: 'Azul Real', bg: 'bg-blue-600' },
                            { id: 'amber', label: 'Ámbar Dorado', bg: 'bg-amber-500' },
                            { id: 'rose', label: 'Rosa Fucsia', bg: 'bg-rose-600' },
                            { id: 'teal', label: 'Verde Teal', bg: 'bg-teal-600' },
                            { id: 'cyan', label: 'Azul Cyan', bg: 'bg-cyan-600' },
                          ].map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleChange('brandColor', c.id as any)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold text-white transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${c.bg} ${
                                (formData.brandColor || 'indigo') === c.id
                                  ? 'ring-2 ring-slate-900 scale-105 font-black'
                                  : 'opacity-85 hover:opacity-100'
                              }`}
                            >
                              {(formData.brandColor || 'indigo') === c.id && <Check className="w-2.5 h-2.5" />}
                              <span>{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-500" />
                      Nombre Oficial del Negocio / Clínica *
                    </label>
                    <input
                      id="input-settings-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                      placeholder="Ej. Hospital Veterinario San Ángel"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Slogan o Subtítulo Institucional
                    </label>
                    <input
                      id="input-settings-slogan"
                      type="text"
                      value={formData.slogan}
                      onChange={e => handleChange('slogan', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                      placeholder="Ej. Clínica & Hospital Veterinario de Especialidades"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    Dirección Física Completa (para recetas, membretes y mapa GPS) *
                  </label>
                  <input
                    id="input-settings-address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                    placeholder="Ej. Av. Revolución 1420, Col. San Ángel, Álvaro Obregón, 01000 CDMX"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      Teléfono Principal / WhatsApp de Atención *
                    </label>
                    <input
                      id="input-settings-phone"
                      type="text"
                      required
                      value={formData.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                      placeholder="+52 55 4912 8301"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      Línea de Urgencias Médicas 24/7 (Botón SOS en App) *
                    </label>
                    <input
                      id="input-settings-emergency-phone"
                      type="text"
                      required
                      value={formData.emergencyPhone}
                      onChange={e => handleChange('emergencyPhone', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white font-mono"
                      placeholder="+52 55 4912 8301"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      Correo Electrónico
                    </label>
                    <input
                      id="input-settings-email"
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                      placeholder="contacto@mi-veterinaria.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-600" />
                      Sitio Web Oficial
                    </label>
                    <input
                      id="input-settings-website"
                      type="text"
                      value={formData.website}
                      onChange={e => handleChange('website', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
                      placeholder="www.mi-veterinaria.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      RFC / Registro Fiscal
                    </label>
                    <input
                      id="input-settings-taxid"
                      type="text"
                      value={formData.taxId}
                      onChange={e => handleChange('taxId', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white uppercase font-mono"
                      placeholder="VET-980415-YLW"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 2: Medical Director & Prescriptions */}
            {activeSection === 'medical' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <strong>Responsable Sanitario:</strong> Estos datos se incluirán de forma automática en todas las recetas médicas generadas, consentimientos informados, historias clínicas de pacientes y órdenes de compra con proveedores.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      Médico Veterinario Encargado / Director Médico *
                    </label>
                    <input
                      id="input-settings-director-name"
                      type="text"
                      required
                      value={formData.directorName}
                      onChange={e => handleChange('directorName', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white"
                      placeholder="Ej. Dra. Valeria Hernández Morales"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />
                      Cédula Profesional MVZ / Matrícula Sanitaria *
                    </label>
                    <input
                      id="input-settings-director-license"
                      type="text"
                      required
                      value={formData.directorLicense}
                      onChange={e => handleChange('directorLicense', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white font-mono"
                      placeholder="Ej. 8491203-MVZ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Especialidad o Subespecialidad Médica
                  </label>
                  <input
                    id="input-settings-director-specialty"
                    type="text"
                    value={formData.directorSpecialty}
                    onChange={e => handleChange('directorSpecialty', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                    placeholder="Ej. Medicina Interna, Cirugía & Cuidados Críticos de Pequeñas Especies"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    Pie de Página y Advertencia en Recetas Médicas Imprimibles
                  </label>
                  <textarea
                    id="input-settings-prescription-footer"
                    rows={3}
                    value={formData.prescriptionFooter || ''}
                    onChange={e => handleChange('prescriptionFooter', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white leading-relaxed"
                    placeholder="En caso de reacciones adversas, vómito persistente o decaimiento severo, acuda de inmediato a urgencias 24h."
                  />
                </div>

                {/* Precios y Tarifas de Servicios Médicos para Pet Shop / POS */}
                <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-teal-700" />
                    <div>
                      <h4 className="text-xs font-black text-teal-950 uppercase tracking-wide">
                        Tarifas y Costos Automáticos de Servicios Médicos (Punto de Venta)
                      </h4>
                      <p className="text-[11px] text-teal-800 font-medium">
                        Precios precargados automáticamente al cobrar consultas o vacunas de pacientes en el Punto de Venta (Pet Shop POS).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Consulta General ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={formData.consultationPrice ?? 450}
                        onChange={e => handleChange('consultationPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
                        placeholder="450"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Consulta Urgencia ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={formData.emergencyConsultationPrice ?? 750}
                        onChange={e => handleChange('emergencyConsultationPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
                        placeholder="750"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Vacuna Estándar ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={formData.standardVaccinePrice ?? 380}
                        onChange={e => handleChange('standardVaccinePrice', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
                        placeholder="380"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Desparasitación ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={formData.dewormingPrice ?? 220}
                        onChange={e => handleChange('dewormingPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white font-mono"
                        placeholder="220"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 3: Schedules & Operations */}
            {activeSection === 'schedule' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Horario de Atención (Lunes a Viernes) *
                    </label>
                    <input
                      id="input-settings-hours-weekday"
                      type="text"
                      required
                      value={formData.openingHoursWeekday}
                      onChange={e => handleChange('openingHoursWeekday', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                      placeholder="Lunes a Viernes: 08:00 - 20:00 hrs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Horario Fines de Semana & Urgencias *
                    </label>
                    <input
                      id="input-settings-hours-weekend"
                      type="text"
                      required
                      value={formData.openingHoursWeekend}
                      onChange={e => handleChange('openingHoursWeekend', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                      placeholder="Sábados: 09:00 - 18:00 hrs • Urgencias 24/7"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      Moneda Principal de Cobro
                    </label>
                    <input
                      id="input-settings-currency"
                      type="text"
                      value={formData.currency}
                      onChange={e => handleChange('currency', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                      placeholder="MXN ($)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-purple-600" />
                      Tasa de Impuesto IVA (%)
                    </label>
                    <input
                      id="input-settings-vat"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.vatRate}
                      onChange={e => handleChange('vatRate', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white"
                      placeholder="16"
                    />
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>👁️ Vista Previa en Tiempo Real del Membrete</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      RFC: {formData.taxId || '---'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                      Y
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">
                        {formData.name || 'Nombre de la Clínica'}
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        {formData.slogan || 'Slogan institucional'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400">Dir. Médico:</span> {formData.directorName} ({formData.directorLicense})
                    </div>
                    <div>
                      <span className="text-slate-400">Urgencias:</span> {formData.emergencyPhone}
                    </div>
                    <div className="sm:col-span-2 text-[10px] text-slate-400 truncate">
                      📍 {formData.address}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 4: Security & Access Passwords */}
            {activeSection === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header Information Banner */}
                <div className="p-4 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border border-rose-200/80 rounded-2xl flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span>Gestión de Claves y Credenciales de Acceso</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-200 text-rose-900">
                        Solo Administrador
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Aquí puedes modificar las contraseñas predeterminadas de los perfiles de <strong>Administrador</strong> y <strong>Encargado de Clínica</strong>. Los cambios se guardan de forma persistente y se exigirán de inmediato en el próximo inicio de sesión.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CARD 1: Administrador General */}
                  <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/30 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-2xs">
                          👑
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">
                            Perfil de Administrador General
                          </h4>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Acceso Total & Control Maestro
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                          adminAccount?.passwordHash === 'admin123'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {adminAccount?.passwordHash === 'admin123'
                          ? 'Clave por defecto (admin123)'
                          : 'Clave personalizada activa'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre de Usuario (Login)
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            id="input-admin-username-settings"
                            value={adminUsername}
                            onChange={(e) => setAdminUsername(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                            placeholder="admin"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre del Titular / Médico
                        </label>
                        <input
                          type="text"
                          id="input-admin-name-settings"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                          placeholder="Ej. Dra. Valeria Hernández M."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          id="input-admin-email-settings"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden"
                          placeholder="admin@mi-veterinaria.com"
                        />
                      </div>

                      <div className="pt-2 border-t border-amber-200/60 space-y-2.5">
                        <label className="block text-xs font-black text-slate-900">
                          Nueva Contraseña para Administrador
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type={showAdminPass ? 'text' : 'password'}
                            id="input-admin-new-password"
                            value={adminNewPassword}
                            onChange={(e) => setAdminNewPassword(e.target.value)}
                            placeholder="Escribe la nueva contraseña (mín. 4 caracteres)"
                            className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAdminPass(!showAdminPass)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {adminNewPassword && (
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type={showAdminPass ? 'text' : 'password'}
                              id="input-admin-confirm-password"
                              value={adminConfirmPassword}
                              onChange={(e) => setAdminConfirmPassword(e.target.value)}
                              placeholder="Confirmar nueva contraseña"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        id="btn-save-admin-password"
                        onClick={handleSaveAdminCredentials}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-amber-300 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Credenciales de Admin</span>
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: Encargado de Clínica */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-2xs">
                          👤
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">
                            Perfil de Encargado de Clínica
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Modo Operativo Clínico
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                          encargadoAccount?.passwordHash === 'encargado123'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                      >
                        {encargadoAccount?.passwordHash === 'encargado123'
                          ? 'Clave por defecto (encargado123)'
                          : 'Clave personalizada activa'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre de Usuario (Login)
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            id="input-encargado-username-settings"
                            value={encargadoUsername}
                            onChange={(e) => setEncargadoUsername(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                            placeholder="encargado"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nombre del Titular / Encargado
                        </label>
                        <input
                          type="text"
                          id="input-encargado-name-settings"
                          value={encargadoName}
                          onChange={(e) => setEncargadoName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                          placeholder="Ej. Lic. Carlos Méndez"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          id="input-encargado-email-settings"
                          value={encargadoEmail}
                          onChange={(e) => setEncargadoEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                          placeholder="recepcion@mi-veterinaria.com"
                        />
                      </div>

                      <div className="pt-2 border-t border-emerald-200/60 space-y-2.5">
                        <label className="block text-xs font-black text-slate-900">
                          Nueva Contraseña para Encargado
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type={showEncargadoPass ? 'text' : 'password'}
                            id="input-encargado-new-password"
                            value={encargadoNewPassword}
                            onChange={(e) => setEncargadoNewPassword(e.target.value)}
                            placeholder="Escribe la nueva contraseña (mín. 4 caracteres)"
                            className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEncargadoPass(!showEncargadoPass)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showEncargadoPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {encargadoNewPassword && (
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                              type={showEncargadoPass ? 'text' : 'password'}
                              id="input-encargado-confirm-password"
                              value={encargadoConfirmPassword}
                              onChange={(e) => setEncargadoConfirmPassword(e.target.value)}
                              placeholder="Confirmar nueva contraseña"
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        id="btn-save-encargado-password"
                        onClick={handleSaveEncargadoCredentials}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-emerald-300 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Credenciales de Encargado</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Important Security Notice */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Seguridad y Blindaje de Configuración:</span>
                    <span>
                      El perfil de Encargado de Clínica tiene restringido el acceso a este panel y no puede alterar estas claves ni los parámetros fiscales de la veterinaria. Solo el Administrador puede efectuar cambios.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 5: License & Subscription Rent */}
            {activeSection === 'license' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Banner Status */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold block">
                        Licencia Registrada
                      </span>
                      <h3 className="text-base font-black text-white">
                        {formData.name || clinicSettings.name}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-white/10 text-amber-300 font-black text-xs rounded-xl border border-white/10 uppercase tracking-wider">
                      Modalidad Renta {systemLicense.plan === 'mensual' ? 'Mensual ($599/mes)' : 'Anual ($5,990/año)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Vencimiento</span>
                      <span className="font-extrabold text-white text-sm">{systemLicense.expirationDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Días Restantes</span>
                      <span className={`font-extrabold text-sm ${daysRemaining < 0 ? 'text-rose-400' : daysRemaining <= 5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)} días vencida` : `${daysRemaining} días`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Cuota Renta</span>
                      <span className="font-extrabold text-white text-sm">${systemLicense.priceAmount} MXN</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Estado</span>
                      <span className="font-extrabold text-emerald-400 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {daysRemaining >= 0 ? 'Activa' : 'Bloqueada'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Redeem Key Form */}
                <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>Canjear Clave de Activación o Cupón de Pago</span>
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="input-settings-license-key"
                      value={settingsLicenseKeyInput}
                      onChange={(e) => setSettingsLicenseKeyInput(e.target.value)}
                      placeholder="Ej. VET-MENS-8942-7719-2026 o VET-ANUAL-..."
                      className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                    />
                    <button
                      type="button"
                      id="btn-settings-apply-key"
                      onClick={() => {
                        if (!settingsLicenseKeyInput.trim()) {
                          showToast('Introduce una clave de licencia.', 'warning');
                          return;
                        }
                        const res = validateAndApplyKey(settingsLicenseKeyInput.trim());
                        if (res.success) {
                          setSettingsLicenseKeyInput('');
                        } else {
                          showToast(res.message, 'error');
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Validar Clave
                    </button>
                  </div>
                </div>

                {/* Direct Renewal Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs">Renta Mensual</span>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                          $599 MXN
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Renovación por 30 días con todos los módulos y app móvil.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setIsLicenseModalOpen(true);
                      }}
                      className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pagar y Renovar Plan Mensual ($599)</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs">Renta Anual (Recomendado)</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          $5,990 MXN
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        12 meses completos con 2 meses gratis de descuento.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setIsLicenseModalOpen(true);
                      }}
                      className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Pagar y Renovar Plan Anual ($5,990)</span>
                    </button>
                  </div>
                </div>

                {/* Simulator Buttons */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>Pruebas de Bloqueo por Vencimiento</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        simulateLicenseDaysOffset(-1);
                        onClose();
                      }}
                      className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      ⛔ Bloquear (-1d)
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateLicenseDaysOffset(3)}
                      className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      ⚠️ Gracia (3d)
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateLicenseDaysOffset(30)}
                      className="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      ✅ Mensual (30d)
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateLicenseDaysOffset(365)}
                      className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      🌟 Anual (365d)
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="btn-reset-clinic-settings"
                  onClick={handleReset}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Restaurar Valores</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  id="btn-save-clinic-settings"
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavedRecently ? '¡Guardado con Éxito!' : 'Guardar Parámetros'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
