import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  X,
  Stethoscope,
  Clock,
  RefreshCw,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Gift,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  checkActiveInternet,
  verifyOfficialNetworkTime,
  VerifiedTimeCertificate,
} from '../../services/networkTimeService';
import { RegisterClinicData } from '../../types';

interface LoginPortalModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const LoginPortalModal: React.FC<LoginPortalModalProps> = ({
  isOpen,
  onClose,
  canClose = true,
}) => {
  const {
    login,
    registerNewClinic,
    currentUser,
    isAuthenticated,
    clinicSettings,
    startTutorial,
  } = useVeterinary();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [registerClinicName, setRegisterClinicName] = useState('');
  const [registerDirectorName, setRegisterDirectorName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerCity, setRegisterCity] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verification state on login / register
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStage, setVerificationStage] = useState<
    'idle' | 'checking_network' | 'contacting_ntp' | 'validating_integrity' | 'success'
  >('idle');
  const [, setVerifiedCert] = useState<VerifiedTimeCertificate | null>(null);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Por favor ingresa tu nombre de usuario o correo.');
      return;
    }

    if (!cleanPass) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      return;
    }

    // Mandatory Network & Time Certification Flow
    setIsVerifying(true);
    setVerificationStage('checking_network');

    try {
      // Step 1: Real Internet check
      const netCheck = await checkActiveInternet();
      if (!netCheck.isOnline) {
        setIsVerifying(false);
        setVerificationStage('idle');
        setErrorMessage(
          'Acceso bloqueado: Se requiere conexión activa a Internet para certificar la fecha, hora oficial y vigencia de licencia en cada inicio de sesión.'
        );
        return;
      }

      // Step 2: Contact NTP / Global Time Server
      setVerificationStage('contacting_ntp');
      const timeResult = await verifyOfficialNetworkTime();

      if (!timeResult.success || !timeResult.certificate) {
        setIsVerifying(false);
        setVerificationStage('idle');
        setErrorMessage(
          timeResult.error || 'Fallo al sincronizar con el servidor de tiempo oficial. Verifique su conexión de red.'
        );
        return;
      }

      // Step 3: Integrity verification
      setVerificationStage('validating_integrity');
      setVerifiedCert(timeResult.certificate);

      // Brief delay for visual confirmation
      await new Promise(r => setTimeout(r, 450));

      // Attempt login with validated certificate
      const result = login(cleanUser, cleanPass, timeResult.certificate);

      if (!result.success) {
        setIsVerifying(false);
        setVerificationStage('idle');
        setErrorMessage(result.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
        return;
      }

      setVerificationStage('success');
      await new Promise(r => setTimeout(r, 550));

      setIsVerifying(false);
      if (onClose) onClose();

      // Auto-launch interactive onboarding tutorial for non-superuser users
      const isSuper =
        cleanUser === 'super.admin' ||
        cleanUser === 'creator' ||
        cleanUser === 'super' ||
        cleanUser.includes('master') ||
        cleanUser.includes('creator');
      if (!isSuper) {
        setTimeout(() => {
          startTutorial();
        }, 500);
      }
    } catch (err: any) {
      setIsVerifying(false);
      setVerificationStage('idle');
      setErrorMessage(
        'Error inesperado durante la verificación de red y tiempo: ' + (err.message || 'Error de conexión')
      );
    }
  };

  // Handle Register Submit (30 Days Free Trial)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const clinic = registerClinicName.trim();
    const user = registerUsername.trim().toLowerCase();
    const email = registerEmail.trim();
    const city = registerCity.trim();
    const pass = registerPassword.trim();
    const confirmPass = registerConfirmPassword.trim();

    if (!clinic) {
      setErrorMessage('Por favor escribe el nombre de la clínica veterinaria.');
      return;
    }
    if (!user) {
      setErrorMessage('Por favor define un nombre de usuario para el Administrador.');
      return;
    }
    if (user.length < 3) {
      setErrorMessage('El nombre de usuario debe tener al menos 3 caracteres.');
      return;
    }
    if (!pass) {
      setErrorMessage('Por favor ingresa una contraseña de acceso.');
      return;
    }
    if (pass.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    if (pass !== confirmPass) {
      setErrorMessage('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }

    // Mandatory Network & Time Certification Flow
    setIsVerifying(true);
    setVerificationStage('checking_network');

    try {
      // Step 1: Internet check
      const netCheck = await checkActiveInternet();
      if (!netCheck.isOnline) {
        setIsVerifying(false);
        setVerificationStage('idle');
        setErrorMessage(
          'Se requiere conexión a Internet para certificar la activación de la licencia de prueba por 30 días.'
        );
        return;
      }

      // Step 2: Contact NTP Server
      setVerificationStage('contacting_ntp');
      const timeResult = await verifyOfficialNetworkTime();

      if (!timeResult.success || !timeResult.certificate) {
        setIsVerifying(false);
        setVerificationStage('idle');
        setErrorMessage(
          timeResult.error || 'Fallo al sincronizar la hora oficial para la emisión de licencia.'
        );
        return;
      }

      setVerificationStage('validating_integrity');
      setVerifiedCert(timeResult.certificate);
      await new Promise(r => setTimeout(r, 450));

      const registerData: RegisterClinicData = {
        clinicName: clinic,
        directorName: '',
        username: user,
        email: email || `${user}@veterinaria.com`,
        phone: '',
        city: city || 'México',
        password: pass,
      };

      const success = registerNewClinic(registerData);

      if (!success) {
        setIsVerifying(false);
        setVerificationStage('idle');
        setErrorMessage('No se pudo registrar la clínica. Intente nuevamente.');
        return;
      }

      setVerificationStage('success');
      await new Promise(r => setTimeout(r, 550));
      setIsVerifying(false);

      if (onClose) onClose();
    } catch (err: any) {
      setIsVerifying(false);
      setVerificationStage('idle');
      setErrorMessage(
        'Error durante el registro de la clínica: ' + (err.message || 'Error de conexión')
      );
    }
  };

  const isModalClosable = canClose && isAuthenticated;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 p-5 sm:p-6 text-slate-950 overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3.5">
                {clinicSettings.logoUrl && authMode === 'login' ? (
                  <img
                    src={clinicSettings.logoUrl}
                    alt={clinicSettings.name}
                    className="w-12 h-12 rounded-2xl object-contain bg-white p-1 border-2 border-white/40 shadow-lg shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg border-2 border-white/40 shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-slate-950/90 text-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-300" />
                      {authMode === 'login' ? 'Acceso Autorizado' : 'Prueba Gratuita 30 Días'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight mt-1">
                    {authMode === 'login' ? 'Portal de Inicio de Sesión' : 'Registro de Nueva Clínica'}
                  </h2>
                  <p className="text-xs text-slate-900 font-medium truncate max-w-[280px]">
                    {authMode === 'login' ? clinicSettings.name : 'Activa tu software veterinario al instante'}
                  </p>
                </div>
              </div>

              {isModalClosable && (
                <button
                  id="btn-close-login-portal"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div className="mt-4 flex items-center bg-slate-950/15 p-1 rounded-xl gap-1">
              <button
                type="button"
                id="tab-login-mode"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-slate-950 text-amber-300 shadow-xs'
                    : 'text-slate-900 hover:bg-black/10'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                type="button"
                id="tab-register-mode"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-slate-950 text-emerald-300 shadow-xs'
                    : 'text-slate-900 hover:bg-black/10'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
                <span>Nueva Clínica (30d Gratis)</span>
              </button>
            </div>
          </div>

          {/* Body Content Scrollable */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 font-medium"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {authMode === 'login' ? (
              /* LOGIN FORM */
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Ingresar a tu Clínica</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Escribe tu usuario o correo electrónico y contraseña.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Usuario o Correo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="input-login-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Tu nombre de usuario o correo"
                        autoComplete="username"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="input-login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all placeholder:text-slate-400 font-mono"
                      />
                      <button
                        type="button"
                        id="btn-toggle-login-password"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Live Network & Time Verification Status Badge */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-slate-700">Verificación de Red:</span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Tiempo Oficial NTP
                    </span>
                  </div>

                  {/* Verification Progress Box */}
                  {isVerifying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-2 text-indigo-950 font-medium"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                          Certificando sesión con Servidor Mundial...
                        </span>
                        <span className="text-[10px] font-black uppercase text-indigo-600">NTP TimeAPI</span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className={`flex items-center gap-1.5 ${verificationStage !== 'idle' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> 1. Conexión de red verificada
                        </div>
                        <div className={`flex items-center gap-1.5 ${verificationStage === 'contacting_ntp' || verificationStage === 'validating_integrity' || verificationStage === 'success' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {verificationStage === 'contacting_ntp' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          2. Fecha y hora oficial certificada
                        </div>
                        <div className={`flex items-center gap-1.5 ${verificationStage === 'validating_integrity' || verificationStage === 'success' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {verificationStage === 'validating_integrity' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          3. Licencia e integridad de reloj validadas
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    id="btn-submit-login"
                    disabled={isVerifying}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 disabled:bg-slate-700 text-amber-300 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Certificando Fecha & Hora...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Iniciar Sesión</span>
                      </>
                    )}
                  </button>

                  {/* Banner to Register */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      id="btn-switch-to-register"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMessage(null);
                      }}
                      className="text-xs font-black text-indigo-700 hover:text-indigo-900 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span>¿Eres una nueva clínica? Regístrate aquí con 30 días gratis &rarr;</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* REGISTER NEW CLINIC FORM (30 DAYS FREE TRIAL) */
              <div className="space-y-4">
                {/* 30-Day Free Trial Notice Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-300 rounded-2xl text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-2 font-black text-emerald-950">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>🌟 Licencia Gratuita de Prueba por 30 Días Incluida</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    Crea tu clínica y accede de inmediato a todas las funciones: consultas SOAP, recetas, citas, vacunas, kárdex y VetCopilot IA. Al registrarte se abrirá el panel para configurar los parámetros de tu negocio.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre de la Clínica Veterinaria *
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          id="input-register-clinic-name"
                          value={registerClinicName}
                          onChange={(e) => setRegisterClinicName(e.target.value)}
                          placeholder="Ej: Hospital Veterinario San Ángel"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Usuario Administrador (Login) *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          id="input-register-username"
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          placeholder="Ej: admin.sanangel"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Ciudad / Estado
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          id="input-register-city"
                          value={registerCity}
                          onChange={(e) => setRegisterCity(e.target.value)}
                          placeholder="Ej: Monterrey, N.L."
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo Electrónico (Contacto)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        id="input-register-email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="contacto@sanangelvet.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Informative Note */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                    <span className="text-sm">ℹ️</span>
                    <p className="leading-snug">
                      <strong>Configuración Inicial:</strong> Los datos del médico encargado, cédula profesional, teléfonos de contacto y membrete de recetas se dejan en blanco para que los configures a tu gusto en el menú de <strong>Configuración de la Clínica</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contraseña de Acceso *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          id="input-register-password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          required
                          className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all placeholder:text-slate-400 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirmar Contraseña *
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          id="input-register-confirm-password"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          placeholder="Repite tu contraseña"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden transition-all placeholder:text-slate-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Network Verification Notice */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-slate-700">Certificación de Red:</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> NTP Hora Oficial
                    </span>
                  </div>

                  {/* Verification Progress Box */}
                  {isVerifying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-950 font-medium"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                          Generando Licencia y Certificando Hora NTP...
                        </span>
                        <span className="text-[10px] font-black uppercase text-emerald-700">30d Gratis</span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        <div className={`flex items-center gap-1.5 ${verificationStage !== 'idle' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> 1. Conexión de red certificada
                        </div>
                        <div className={`flex items-center gap-1.5 ${verificationStage === 'contacting_ntp' || verificationStage === 'validating_integrity' || verificationStage === 'success' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {verificationStage === 'contacting_ntp' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          2. Emisión de Licencia de 30 Días con Hora Oficial
                        </div>
                        <div className={`flex items-center gap-1.5 ${verificationStage === 'validating_integrity' || verificationStage === 'success' ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {verificationStage === 'validating_integrity' ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          3. Creación de Cuenta de Administrador
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    id="btn-submit-register"
                    disabled={isVerifying}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-700/25 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Activando Clínica y Licencia...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>Registrar Clínica e Iniciar Prueba Gratuita (30 Días)</span>
                      </>
                    )}
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      id="btn-switch-to-login"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage(null);
                      }}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                    >
                      ¿Ya tienes una cuenta de clínica? Inicia sesión aquí
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer Session Status Bar */}
          {currentUser && (
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 px-6 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sesión activa:</span>
                <span className="font-bold text-slate-800">{currentUser.name}</span>
              </div>

              {isModalClosable && (
                <button
                  type="button"
                  onClick={onClose}
                  className="font-bold text-slate-700 hover:text-slate-950 underline cursor-pointer"
                >
                  Continuar al Sistema &rarr;
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
