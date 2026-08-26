import React, { useState, useRef, useEffect } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Smartphone,
  Search,
  Plus,
  Sparkles,
  PawPrint,
  ChevronDown,
  Building2,
  Settings,
  QrCode,
  User,
  LogOut,
  ShieldCheck,
  LogIn,
  KeyRound,
  Globe,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewAppointment: () => void;
  onOpenNewPatient: () => void;
  onOpenCopilot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewAppointment,
  onOpenNewPatient,
  onOpenCopilot,
}) => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    pets,
    selectedTutorPetId,
    setSelectedTutorPetId,
    stats,
    clinicSettings,
    setIsSettingsModalOpen,
    openPairingModal,
    currentUser,
    setIsLoginModalOpen,
    logout,
    systemLicense,
    setIsLicenseModalOpen,
    isOnline,
    isSimulatedOffline,
    setIsNetworkDiagnosticsOpen,
    startTutorial,
    userAccounts,
    superUserAccount,
    login,
    showToast,
  } = useVeterinary();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleQuickSwitchUser = (acc: any) => {
    setIsUserMenuOpen(false);
    const pwd = acc.passwordHash || acc.password || (acc.role === 'superuser' ? 'Bazzoka1313AS.' : 'admin123');
    const res = login(acc.username, pwd);
    if (res.success) {
      const roleBadge = acc.role === 'superuser' ? '⚡ Super Usuario (Creador)' : acc.role === 'admin' ? 'Administrador' : 'Encargado';
      showToast(`Sesión cambiada a: ${acc.name} (${roleBadge})`, 'success');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const selectedPet = pets.find(p => p.id === selectedTutorPetId) || pets[0];
  const isSuperUser = currentUser?.role === 'superuser';
  const isAdmin = currentUser?.role === 'admin' || isSuperUser;
  const isEncargado = currentUser?.role === 'encargado';
  const { setActiveTab } = useVeterinary();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer" onClick={() => setIsSettingsModalOpen(true)} title="Haz clic para personalizar el logotipo y colores de tu clínica">
              {clinicSettings.logoUrl ? (
                <img
                  src={clinicSettings.logoUrl}
                  alt={clinicSettings.name}
                  className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-200 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                  clinicSettings.brandColor === 'emerald' ? 'from-emerald-600 via-teal-700 to-emerald-800 border-emerald-400/40 ring-emerald-500/20 shadow-emerald-500/20' :
                  clinicSettings.brandColor === 'purple' ? 'from-purple-600 via-fuchsia-700 to-purple-800 border-purple-400/40 ring-purple-500/20 shadow-purple-500/20' :
                  clinicSettings.brandColor === 'amber' ? 'from-amber-500 via-amber-600 to-yellow-600 border-amber-400/40 ring-amber-500/20 shadow-amber-500/20' :
                  clinicSettings.brandColor === 'blue' ? 'from-blue-600 via-cyan-700 to-blue-800 border-blue-400/40 ring-blue-500/20 shadow-blue-500/20' :
                  clinicSettings.brandColor === 'rose' ? 'from-rose-600 via-pink-700 to-rose-800 border-rose-400/40 ring-rose-500/20 shadow-rose-500/20' :
                  clinicSettings.brandColor === 'teal' ? 'from-teal-600 via-cyan-700 to-teal-800 border-teal-400/40 ring-teal-500/20 shadow-teal-500/20' :
                  'from-indigo-600 via-indigo-700 to-purple-700 border-indigo-400/40 ring-indigo-500/20 shadow-indigo-500/20'
                } flex items-center justify-center text-white shadow-md border ring-2 transition-transform group-hover:scale-105`}>
                  <div className="flex items-center justify-center relative">
                    <span className="font-black text-xs tracking-tight text-white font-mono uppercase">
                      {clinicSettings.logoText || (clinicSettings.name ? clinicSettings.name.substring(0, 3).toUpperCase() : 'VET')}
                    </span>
                    <span className="absolute -top-2.5 -right-3 text-[10px] transform rotate-12 select-none">
                      {clinicSettings.logoEmoji || '🐾'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight flex items-center truncate max-w-[200px] sm:max-w-[280px]">
                  {clinicSettings.name || 'VetCare Pro'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  {viewMode === 'admin' ? 'SOFTWARE CLÍNICO' : viewMode === 'android' ? 'APP ANDROID TUTOR' : 'PORTAL TUTOR'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate max-w-sm">
                {clinicSettings.slogan || 'Control Clínico, Citas, Farmacia & App Android'}
              </p>
            </div>
          </div>

          {/* Search bar in Admin mode */}
          {viewMode === 'admin' && (
            <div className="flex-1 max-w-md hidden md:block mx-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar paciente, tutor, microchip, medicamento..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 placeholder-slate-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 bg-slate-200 rounded"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tutor Pet Selector in Client Portal mode */}
          {viewMode === 'tutor' && (
            <div className="flex items-center gap-2 max-w-xs flex-1 justify-center sm:justify-start">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">Viendo:</span>
              <div className="relative inline-block w-full max-w-[220px]">
                <select
                  id="tutor-pet-selector"
                  value={selectedTutorPetId}
                  onChange={(e) => setSelectedTutorPetId(e.target.value)}
                  aria-label="Seleccionar mascota"
                  className="w-full appearance-none pl-8 pr-8 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {pets.length === 0 ? (
                    <option value="">Sin pacientes registrados</option>
                  ) : (
                    pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species} - {pet.owner.name.split(' ')[0]})
                      </option>
                    ))
                  )}
                </select>
                <PawPrint className="w-3.5 h-3.5 text-indigo-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-indigo-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Right actions: Mode switcher & Quick CTA buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Actions in Admin Mode */}
            {viewMode === 'admin' ? (
              <div className="flex items-center gap-2">
                {/* User Session Switcher / Profile Badge */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    id="btn-nav-user-profile"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                    title={`Usuario: ${currentUser?.name || 'Invitado'} (${currentUser?.role === 'admin' ? 'Administrador' : 'Encargado'})`}
                  >
                    <div className="w-6 h-6 rounded-lg overflow-hidden bg-slate-800 text-amber-300 flex items-center justify-center font-black text-xs shrink-0">
                      {currentUser?.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-tight">
                      <span className="text-[11px] font-black text-slate-900 truncate max-w-[120px]">
                        {currentUser?.name?.split(' ')[0] || 'Usuario'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500">
                        {isSuperUser ? '⚡ Creador' : isAdmin ? '👑 Admin' : '👤 Encargado'}
                      </span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider ${
                        isSuperUser
                          ? 'bg-purple-200 text-purple-950 border border-purple-300'
                          : isAdmin
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {isSuperUser ? 'Creador' : isAdmin ? 'Admin' : 'Encargado'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      id="dropdown-nav-user-menu"
                      className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <div className="p-2 border-b border-slate-100 mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-black block">
                          Sesión Actual
                        </span>
                        <p className="text-xs font-black text-slate-900 mt-0.5">
                          {currentUser?.name}
                        </p>
                        <p className="text-[10.5px] text-slate-500 truncate">
                          {currentUser?.email}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isSuperUser
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : isAdmin
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {isSuperUser
                              ? '⚡ Super Usuario (Creador)'
                              : isAdmin
                              ? '👑 Acceso Total'
                              : '👤 Modo Operativo'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Switch Accounts List (Clinic Staff) */}
                      {userAccounts && userAccounts.length > 0 && (
                        <div className="p-2 border-b border-slate-100 bg-slate-50/80 rounded-xl mb-2">
                          <span className="text-[10px] uppercase tracking-wider text-slate-600 font-extrabold block mb-1.5 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-indigo-600" />
                            <span>Cambiar de Usuario:</span>
                          </span>
                          <div className="space-y-1">
                            {userAccounts.map((acc) => {
                              const isCurrent =
                                currentUser?.username === acc.username ||
                                (currentUser?.role === acc.role && currentUser?.email === acc.email);
                              return (
                                <button
                                  key={acc.id}
                                  type="button"
                                  disabled={isCurrent}
                                  onClick={() => handleQuickSwitchUser(acc)}
                                  className={`w-full p-1.5 rounded-lg text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                                    isCurrent
                                      ? 'bg-white border border-indigo-200 text-indigo-950 shadow-2xs cursor-default'
                                      : 'bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="text-xs">
                                      {acc.role === 'admin' ? '👑' : '👤'}
                                    </span>
                                    <span className="truncate">{acc.name}</span>
                                  </div>
                                  {isCurrent ? (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                                      Activo
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-indigo-600 font-bold">
                                      Cambiar &rarr;
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="py-1 space-y-0.5">
                        {isSuperUser && (
                          <button
                            type="button"
                            id="btn-open-master-tenants-menu"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setActiveTab('master_tenants');
                            }}
                            className="w-full px-2.5 py-1.5 text-xs text-left font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-2 transition-colors cursor-pointer border border-purple-200"
                          >
                            <Building2 className="w-3.5 h-3.5 text-purple-700" />
                            <span>⚡ Consola Master de Arrendados</span>
                          </button>
                        )}

                        <button
                          type="button"
                          id="btn-open-login-portal"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsLoginModalOpen(true);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs text-left font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-950 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5 text-amber-600" />
                          <span>Iniciar Sesión con Otra Cuenta</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            id="btn-open-security-settings-menu"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsSettingsModalOpen(true);
                            }}
                            className="w-full px-2.5 py-1.5 text-xs text-left font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                            <span>Cambiar Claves de Acceso</span>
                          </button>
                        )}

                        <button
                          type="button"
                          id="btn-open-network-diagnostics-menu"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsNetworkDiagnosticsOpen(true);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs text-left font-bold text-slate-700 hover:bg-emerald-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Red & Hora Oficial NTP ({isOnline ? 'En Línea' : 'Desconectado'})</span>
                        </button>

                        <button
                          type="button"
                          id="btn-open-license-menu"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsLicenseModalOpen(true);
                          }}
                          className="w-full px-2.5 py-1.5 text-xs text-left font-bold text-slate-700 hover:bg-indigo-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Licencia & Renta ({systemLicense.plan === 'mensual' ? 'Mensual' : 'Anual'})</span>
                        </button>

                        {!isSuperUser && (
                          <button
                            type="button"
                            id="btn-open-tutorial-menu"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              startTutorial();
                            }}
                            className="w-full px-2.5 py-1.5 text-xs text-left font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100/90 rounded-lg flex items-center gap-2 transition-colors cursor-pointer border border-amber-200"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Tutorial de Uso Guiado</span>
                          </button>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          id="btn-logout-session"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full px-2.5 py-1.5 text-xs text-left font-bold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-600" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* BOTÓN CONSOLA MASTER ARRENDADOS: EXCLUSIVO PARA SUPERUSUARIO (CREADOR) */}
                {isSuperUser && (
                  <button
                    id="btn-nav-master-tenants"
                    onClick={() => setActiveTab('master_tenants')}
                    className="px-3 py-1.5 text-xs font-black text-purple-950 bg-gradient-to-r from-purple-100 via-purple-200 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 border border-purple-300 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ring-1 ring-purple-400/30 animate-pulse hover:animate-none"
                    title="Abrir Consola Master de Administración de Clínicas y Arrendatarios"
                  >
                    <Building2 className="w-4 h-4 text-purple-700" />
                    <span className="hidden sm:inline">⚡ Consola Arrendados</span>
                    <span className="sm:hidden">⚡ Master</span>
                  </button>
                )}

                <button
                  id="btn-nav-new-appointment"
                  onClick={onOpenNewAppointment}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva Cita</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* En modo tutor, si es admin puede ver parámetros */}
                {isAdmin && (
                  <button
                    id="btn-tutor-settings"
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl flex items-center gap-1 transition-all"
                    title="Configuración de la Clínica"
                  >
                    <Settings className="w-4 h-4 text-amber-800" />
                    <span className="hidden sm:inline">Parámetros</span>
                  </button>
                )}

                <a
                  id="btn-tutor-call"
                  href={`tel:${clinicSettings.emergencyPhone.replace(/\s+/g, '')}`}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors hidden sm:flex items-center gap-1.5"
                >
                  <span>Urgencias 24h: {clinicSettings.emergencyPhone}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
