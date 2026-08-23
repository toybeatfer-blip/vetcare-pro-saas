import React from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Syringe,
  Pill,
  Sparkles,
  AlertTriangle,
  Clock,
  Building2,
  Settings,
  QrCode,
  User,
  ShieldCheck,
  LogOut,
  Lock,
  ShoppingBag,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    setViewMode,
    clinicSettings,
    setIsSettingsModalOpen,
    openPairingModal,
    currentUser,
    setIsLoginModalOpen,
    logout,
    tenants,
    startTutorial,
  } = useVeterinary();

  const isSuperUser = currentUser?.role === 'superuser';
  const isAdmin = currentUser?.role === 'admin' || isSuperUser;
  const isEncargado = currentUser?.role === 'encargado';

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Tablero Principal',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'appointments',
      label: 'Citas & Agenda',
      icon: <Calendar className="w-5 h-5" />,
      badge: stats.todayAppointmentsCount > 0 ? `${stats.todayAppointmentsCount} hoy` : undefined,
      badgeColor: 'bg-indigo-50 text-indigo-700 font-bold',
    },
    {
      id: 'patients',
      label: 'Pacientes & Fichas',
      icon: <Users className="w-5 h-5" />,
      badge: stats.activePatientsCount,
      badgeColor: 'bg-slate-100 text-slate-700 font-bold',
    },
    {
      id: 'records',
      label: 'Historial Clínico',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: 'vaccines',
      label: 'Vacunas & Avisos',
      icon: <Syringe className="w-5 h-5" />,
      badge: stats.overdueVaccinesCount > 0 ? stats.overdueVaccinesCount : undefined,
      badgeColor: 'bg-rose-50 text-rose-700 font-bold border border-rose-100',
    },
    {
      id: 'inventory',
      label: 'Inventario & Farmacia',
      icon: <Pill className="w-5 h-5" />,
      badge: stats.criticalStockCount > 0 ? `${stats.criticalStockCount} alerta` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 font-bold border border-amber-200',
    },
    {
      id: 'petshop',
      label: 'Alimentos & Pet Shop',
      icon: <ShoppingBag className="w-5 h-5 text-amber-600" />,
      badge: 'Tienda',
      badgeColor: 'bg-amber-100 text-amber-900 font-bold border border-amber-200',
    },
    {
      id: 'copilot',
      label: 'VetCopilot IA',
      icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
      badge: 'IA',
      badgeColor: 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100',
    },
  ];

  if (isSuperUser) {
    navItems.push({
      id: 'master_tenants',
      label: 'Consola Arrendados',
      icon: <Building2 className="w-5 h-5 text-purple-600" />,
      badge: `${tenants.length} clínicas`,
      badgeColor: 'bg-purple-100 text-purple-900 font-black border border-purple-200',
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 shrink-0 hidden lg:flex lg:flex-col justify-between p-5 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Gestión Clínica
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-indigo-600 text-white font-bold' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Status Bento Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2.5">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Alertas del Día
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
            <span className="text-slate-500">Fármacos stock bajo:</span>
            <span className={`font-bold ${stats.criticalStockCount > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
              {stats.criticalStockCount} alertas
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Vacunas vencidas:</span>
            <span className={`font-bold ${stats.overdueVaccinesCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {stats.overdueVaccinesCount} pendientes
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Por vencer (30d):</span>
            <span className="font-bold text-slate-700">
              {stats.upcomingVaccinesCount} dosis
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        {/* User Account & Role Card */}
        <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-2xs shrink-0 ${
                  isSuperUser
                    ? 'bg-purple-700 text-purple-100 ring-2 ring-purple-300'
                    : isAdmin
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-200'
                    : 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                }`}
              >
                {isSuperUser ? '⚡' : isAdmin ? '👑' : '👤'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-900 truncate">
                  {currentUser?.name || 'Usuario'}
                </p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                      isSuperUser
                        ? 'bg-purple-200 text-purple-950 border border-purple-300'
                        : isAdmin
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isSuperUser ? 'Creador Sistema' : isAdmin ? 'Administrador' : 'Encargado'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              id="btn-sidebar-open-auth-portal"
              onClick={() => setIsLoginModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Cambiar de usuario o abrir portal de login"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </button>
          </div>

          {isEncargado && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Configuración oculta (Perfil Encargado)</span>
            </div>
          )}
        </div>

        {/* BOTÓN TUTORIAL DE USO GUIADO */}
        {!isSuperUser && (
          <button
            type="button"
            id="btn-sidebar-start-tutorial"
            onClick={startTutorial}
            className="w-full flex items-center justify-between p-2.5 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 hover:border-amber-300 rounded-xl text-xs font-black text-amber-900 transition-all shadow-2xs group cursor-pointer"
            title="Iniciar tutorial interactivo paso a paso con globos explicativos"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs group-hover:bg-amber-500 transition-colors">
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <span className="block font-black text-slate-900 text-xs">Tutorial del Sistema</span>
                <span className="block text-[10px] text-amber-800 font-medium">Globos explicativos interactivos</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-200/80 text-amber-950 rounded font-mono font-bold">Guía</span>
          </button>
        )}



        {/* BOTÓN DE CONFIGURACIÓN & PARÁMETROS: SÓLO VISIBLE PARA ADMINISTRADOR */}
        {isAdmin && (
          <button
            id="btn-sidebar-clinic-settings"
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-amber-50/80 border border-slate-200/80 hover:border-amber-300 rounded-xl text-xs font-bold text-slate-800 hover:text-amber-950 transition-all shadow-2xs group cursor-pointer"
            title="Editar dirección, médico encargado, cédula, teléfonos y horarios (Solo Administrador)"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs group-hover:bg-amber-500 transition-colors">
                <Settings className="w-4 h-4 text-slate-950 group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <span className="block font-black text-slate-900 text-xs">Parámetros del Negocio</span>
                <span className="block text-[10px] text-slate-500 font-medium group-hover:text-amber-800">Dirección, médico, teléfonos</span>
              </div>
            </div>
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:rotate-45 transition-transform" />
          </button>
        )}

        {/* BOTÓN CERRAR SESIÓN & GUARDAR BASE DE DATOS */}
        <button
          type="button"
          id="btn-sidebar-logout"
          onClick={() => logout()}
          className="w-full flex items-center justify-between p-2.5 bg-rose-50/70 hover:bg-rose-100/90 border border-rose-200/80 hover:border-rose-300 rounded-xl text-xs font-black text-rose-900 transition-all shadow-2xs group cursor-pointer"
          title="Cerrar sesión de usuario y guardar todos los cambios en la base de datos"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black shadow-xs group-hover:bg-rose-700 transition-colors">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <span className="block font-black text-rose-950 text-xs">Cerrar Sesión</span>
              <span className="block text-[10px] text-rose-700 font-medium">Guarda cambios en Base de Datos</span>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 bg-rose-200 text-rose-950 rounded font-mono font-bold">Salir</span>
        </button>
      </div>
    </aside>
  );
};
