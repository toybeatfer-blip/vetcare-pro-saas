import React from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Calendar,
  Users,
  AlertTriangle,
  Pill,
  Clock,
  ArrowRight,
  Plus,
  Syringe,
  MessageCircle,
  Stethoscope,
  ChevronRight,
  CheckCircle2,
  Phone,
  Sparkles,
  Building2,
  Settings,
  QrCode,
  Smartphone,
  ShoppingBag,
} from 'lucide-react';
import { Appointment, Pet, VaccineRecord } from '../../types';

interface VeterinaryDashboardProps {
  onOpenNewAppointment: () => void;
  onOpenNewPatient: () => void;
  onOpenNewConsultation: (petId?: string) => void;
  onOpenApplyVaccine?: (petId?: string) => void;
  onSelectPet: (petId: string) => void;
  onOpenCopilot: () => void;
}

export const VeterinaryDashboard: React.FC<VeterinaryDashboardProps> = ({
  onOpenNewAppointment,
  onOpenNewPatient,
  onOpenNewConsultation,
  onOpenApplyVaccine,
  onSelectPet,
  onOpenCopilot,
}) => {
  const {
    stats,
    appointments,
    pets,
    vaccines,
    medicalRecords,
    setActiveTab,
    setViewMode,
    updateAppointmentStatus,
    sendVaccineReminder,
    clinicSettings,
    setIsSettingsModalOpen,
    openPairingModal,
  } = useVeterinary();

  const todayStr = '2026-08-14';
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  // Overdue and imminent vaccines
  const criticalVaccines = vaccines
    .filter((v) => {
      const nowTime = new Date('2026-08-14T00:00:00Z').getTime();
      const dueTime = new Date(v.dueDate + 'T00:00:00Z').getTime();
      const diffDays = Math.round((dueTime - nowTime) / (1000 * 60 * 60 * 24));
      return v.status === 'vencida' || diffDays <= 7;
    })
    .slice(0, 4);

  // Recent medical records
  const recentRecords = medicalRecords.slice(0, 4);

  const getPetInfo = (petId: string): Pet | undefined => {
    return pets.find((p) => p.id === petId);
  };

  // Select featured pet (first patient or one with rich data)
  const featuredPet = pets.find((p) => p.name.includes('Max')) || pets[0];
  const featuredPetRecord = medicalRecords.find((r) => r.petId === featuredPet?.id);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmada':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700">Confirmada</span>;
      case 'En curso':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-100 text-amber-800 animate-pulse">En curso</span>;
      case 'Completada':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-100 text-emerald-800">Completada</span>;
      case 'Cancelada':
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-800">Cancelada</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-slate-100 text-slate-800">Pendiente</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{clinicSettings.name || 'VetCare Pro'}</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm">
            Bienvenido de nuevo, <strong className="text-slate-800">{clinicSettings.directorName || 'Dr(a). Encargado(a)'}</strong> • {clinicSettings.slogan || 'Panel de Gestión Clínica'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-quick-copilot"
            onClick={onOpenCopilot}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>VetCopilot IA</span>
          </button>
          <button
            id="btn-quick-new-patient"
            onClick={onOpenNewPatient}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
          <button
            id="btn-quick-new-appointment"
            onClick={onOpenNewAppointment}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 text-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>+ Nueva Cita</span>
          </button>
        </div>
      </header>

      {/* Clinic Setup Banner if contact / doctor info is missing */}
      {(!clinicSettings.phone || !clinicSettings.directorName) && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-300/80 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-base shadow-2xs">
              ⚙️
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configuración Inicial de la Clínica Pendiente</h3>
              <p className="text-xs text-slate-600">
                Los datos del médico responsable, cédula, números de teléfono y membrete de recetas están en blanco. Complétalos para personalizar tus consultas e impresiones.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Configurar Ahora
          </button>
        </div>
      )}

      {/* Main 12-Column Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bento Tile 1: Próximas Citas (Col 4) */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-slate-900">Próximas Citas</h2>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">HOY</span>
            </div>

            <div className="space-y-3">
              {todayAppointments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium">No hay citas programadas para hoy</p>
                </div>
              ) : (
                todayAppointments.slice(0, 3).map((apt, idx) => {
                  const pet = getPetInfo(apt.petId);
                  const bgColors = ['bg-amber-100 text-amber-700', 'bg-indigo-100 text-indigo-700', 'bg-emerald-100 text-emerald-700'];
                  const colorClass = bgColors[idx % bgColors.length];

                  return (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100 group"
                    >
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${colorClass}`}>
                          {apt.petName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3.5">
                          <button
                            onClick={() => onSelectPet(apt.petId)}
                            className="font-bold text-slate-800 text-sm hover:text-indigo-600 text-left"
                          >
                            {apt.petName} <span className="text-slate-400 font-medium text-xs">({apt.species})</span>
                          </button>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                            {apt.reason} • {apt.time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {apt.status !== 'Completada' && (
                          <button
                            onClick={() => onOpenNewConsultation(apt.petId)}
                            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-colors"
                            title="Atender consulta"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('appointments')}
            className="w-full mt-4 py-2.5 text-slate-400 font-bold text-xs hover:text-indigo-600 border-t border-slate-100 transition-colors flex items-center justify-center gap-1"
          >
            <span>Ver calendario completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bento Tile 2: Paciente Destacado (Col 5) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="font-bold text-lg text-slate-900">Paciente Destacado</h2>
              <button
                onClick={() => featuredPet && onSelectPet(featuredPet.id)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Ver Ficha
              </button>
            </div>

            {featuredPet ? (
              <div className="flex items-start space-x-5 relative z-10">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-100 border-4 border-white shadow-md overflow-hidden shrink-0">
                  {featuredPet.photoUrl ? (
                    <img
                      src={featuredPet.photoUrl}
                      alt={featuredPet.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-black italic">
                      {featuredPet.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-black text-slate-900 truncate">{featuredPet.name}</h3>
                  <p className="text-slate-500 font-medium text-xs mt-0.5">
                    {featuredPet.breed} • {featuredPet.age} {featuredPet.ageUnit}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                      ESTABLE
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      VACUNA AL DÍA
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase">Último Peso</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {featuredPet?.weightKg ? `${featuredPet.weightKg} kg` : '32.4 kg'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase">Última Visita</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {featuredPetRecord ? featuredPetRecord.date.slice(5) : '12 Oct'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Column 3 & 4: Stacked Client Portal & Urgent Alerts (Col 3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 justify-between">
          {/* Client Portal Dark Tile */}
          <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between flex-1 min-h-[190px]">
            <div>
              <h2 className="font-bold text-lg">Portal Cliente</h2>
              <p className="text-indigo-300 text-xs mt-1">Acceso de propietarios activo</p>
            </div>
            <div className="flex items-center space-x-3 my-3">
              <div className="flex -space-x-2.5">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-slate-300 flex items-center justify-center text-[10px] text-slate-800 font-bold">M</div>
                <div className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-slate-400 flex items-center justify-center text-[10px] text-white font-bold">L</div>
                <div className="w-8 h-8 rounded-full border-2 border-indigo-900 bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">R</div>
              </div>
              <span className="text-xs font-bold text-indigo-200">+{stats.activePatientsCount} tutores</span>
            </div>
            <button
              onClick={() => setViewMode('tutor')}
              className="bg-white/10 hover:bg-white/20 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-center"
            >
              Gestionar accesos
            </button>
          </div>

          {/* Critical Alerts Stack */}
          <div className="space-y-3">
            {/* Inventory Low Stock Alert Tile */}
            <div
              onClick={() => setActiveTab('inventory')}
              className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center space-x-3.5 cursor-pointer hover:bg-amber-100/70 transition-all shadow-xs"
            >
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-200">
                <Pill className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-amber-950 font-bold leading-tight text-sm flex items-center justify-between">
                  <span>Farmacia & Stock</span>
                  <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    {stats.criticalStockCount} alertas
                  </span>
                </p>
                <p className="text-amber-800 text-xs font-medium truncate mt-0.5">
                  {stats.criticalStockCount > 0
                    ? `${stats.criticalStockCount} fármacos en nivel crítico`
                    : 'Inventario de fármacos óptimo'}
                </p>
              </div>
            </div>

            {/* Pet Shop & Alimentos Tile */}
            <div
              onClick={() => setActiveTab('petshop')}
              className="bg-orange-50 border border-orange-200 rounded-3xl p-4 flex items-center space-x-3.5 cursor-pointer hover:bg-orange-100/70 transition-all shadow-xs"
            >
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-orange-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-orange-950 font-bold leading-tight text-sm flex items-center justify-between">
                  <span>Pet Shop & Alimentos</span>
                  <span className="text-xs bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-bold">
                    Tienda POS
                  </span>
                </p>
                <p className="text-orange-800 text-xs font-medium truncate mt-0.5">
                  Venta de accesorios, croquetas y almacenes
                </p>
              </div>
            </div>

            {/* Critical Vaccines Rose Tile */}
            <div
              onClick={() => setActiveTab('vaccines')}
              className="bg-rose-50 border border-rose-100 rounded-3xl p-4 flex items-center space-x-3.5 cursor-pointer hover:bg-rose-100/60 transition-colors"
            >
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-rose-900 font-bold leading-tight text-sm">
                  {stats.overdueVaccinesCount} Vacunas Críticas
                </p>
                <p className="text-rose-600 text-xs font-medium">Esquemas vencidos o por vencer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Tile 5: Historial Médico Reciente (Col 9) */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-lg text-slate-900">Historial Médico Reciente</h2>
              <p className="text-xs text-slate-400 font-medium">Últimas atenciones clínicas registradas</p>
            </div>
            <button
              onClick={() => setActiveTab('records')}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentRecords.map((rec, index) => {
              const pet = getPetInfo(rec.petId);
              return (
                <div
                  key={rec.id}
                  onClick={() => pet && onSelectPet(pet.id)}
                  className={`cursor-pointer group ${
                    index < recentRecords.length - 1 ? 'lg:border-r lg:border-slate-100 lg:pr-4' : ''
                  }`}
                >
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">{rec.date}</p>
                  <p className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {rec.reason}
                  </p>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    Paciente: <span className="font-bold">{pet?.name || 'Mascota'}</span>
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {rec.diagnosis}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bento Tile 6: Estado de Salud Global (Col 3) */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <h2 className="font-bold text-lg text-center text-slate-900 mb-4">Estado de Salud Global</h2>

          <div className="flex-1 flex flex-col items-center justify-center space-y-5 my-2">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-current text-slate-100"
                  strokeWidth="4"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-current text-indigo-600"
                  strokeWidth="4"
                  strokeDasharray="85, 100"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-slate-900">85%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ÓPTIMO</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider text-[10px]">Pacientes Estables</span>
                <span className="text-slate-800">124/145</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section: Parámetros del Negocio */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-5 text-white shadow-sm border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Parámetros del Negocio</h4>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                Configuración
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {clinicSettings.name} • {clinicSettings.address} • Tel: {clinicSettings.phone} • Médico Encargado: {clinicSettings.directorName || 'Dr(a). Encargado(a)'} (Céd. {clinicSettings.directorLicense || '---'})
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-bottom-clinic-settings"
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          title="Editar parámetros del negocio: Dirección, Médico Encargado, Cédula, Teléfonos y Horarios"
        >
          <Settings className="w-4 h-4 text-slate-950" />
          <span>Configurar Parámetros del Negocio</span>
        </button>
      </div>
    </div>
  );
};
