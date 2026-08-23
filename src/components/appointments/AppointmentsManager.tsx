import React, { useState, useMemo } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
  Filter,
  Stethoscope,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  User,
  Trash2,
  Check,
  Wifi,
  RefreshCw,
  Globe,
  Mail,
  Send,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react';
import { Appointment, AppointmentStatus, AppointmentReason, Pet } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { RescheduleAppointmentModal } from './RescheduleAppointmentModal';
import { MedicalDischargeModal } from '../medical-records/MedicalDischargeModal';

interface AppointmentsManagerProps {
  onOpenNewAppointment: () => void;
  onOpenNewConsultation: (petId?: string) => void;
  onSelectPet: (petId: string) => void;
}

export const AppointmentsManager: React.FC<AppointmentsManagerProps> = ({
  onOpenNewAppointment,
  onOpenNewConsultation,
  onSelectPet,
}) => {
  const {
    appointments,
    pets,
    updateAppointmentStatus,
    deleteAppointment,
    searchQuery,
    officialInternetDate,
    officialInternetTime,
    officialInternetDateLong,
    officialTime12h,
    syncInternetTimeNow,
    isOnline,
    clinicSettings,
    showToast,
  } = useVeterinary();

  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [dischargingPet, setDischargingPet] = useState<Pet | null>(null);

  const handleSendAppointmentWhatsApp = (apt: Appointment) => {
    const cleanPhone = apt.ownerPhone.replace(/[^0-9]/g, '');
    const msg = `¡Hola ${apt.ownerName}! Te saludamos de ${clinicSettings.name || 'tu clínica veterinaria'}. Te recordamos la cita programada para ${apt.petName} el día ${apt.date} a las ${apt.time} hrs por motivo: "${apt.reason}". ¡Te esperamos puntualmente!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    showToast(`Recordatorio de cita por WhatsApp abierto para ${apt.ownerName}`);
  };

  const handleSendAppointmentEmail = (apt: Appointment) => {
    if (!apt.ownerEmail) {
      showToast('El tutor no tiene correo electrónico registrado en esta cita', 'info');
      return;
    }
    const subject = encodeURIComponent(`Recordatorio de Cita Médica para ${apt.petName} - ${clinicSettings.name || 'Clínica Veterinaria'}`);
    const body = encodeURIComponent(`¡Hola ${apt.ownerName}!\n\nTe saludamos de ${clinicSettings.name || 'tu clínica veterinaria'}.\n\nTe recordamos la cita médica programada para ${apt.petName}:\n📅 Fecha: ${apt.date}\n⏰ Hora: ${apt.time} hrs\n🩺 Motivo: ${apt.reason}\n📍 Dirección: ${clinicSettings.address}\n📞 Teléfono: ${clinicSettings.phone}\n\n¡Te esperamos puntualmente!`);
    window.open(`mailto:${apt.ownerEmail}?subject=${subject}&body=${body}`, '_blank');
    showToast(`Correo de recordatorio abierto para ${apt.ownerEmail}`);
  };

  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const todayStr = officialInternetDate || new Date().toISOString().split('T')[0];
  const nextWeekStr = useMemo(() => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, [todayStr]);

  const handleSyncTime = async () => {
    setIsSyncing(true);
    await syncInternetTimeNow();
    setTimeout(() => setIsSyncing(false), 600);
  };

  const filteredAppointments = appointments.filter((apt) => {
    // Search query matching
    const matchSearch =
      searchQuery === '' ||
      apt.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.ownerPhone.includes(searchQuery) ||
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    let matchDate = true;
    if (dateFilter === 'today') {
      matchDate = apt.date === todayStr;
    } else if (dateFilter === 'week') {
      matchDate = apt.date >= todayStr && apt.date <= nextWeekStr;
    }

    // Status filter
    const matchStatus = statusFilter === 'all' || apt.status === statusFilter;

    // Reason filter
    const matchReason = reasonFilter === 'all' || apt.reason === reasonFilter;

    return matchSearch && matchDate && matchStatus && matchReason;
  });

  // Sort by date ascending then time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dComp = a.date.localeCompare(b.date);
    if (dComp !== 0) return dComp;
    return a.time.localeCompare(b.time);
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmada':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmada</span>;
      case 'En curso':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 animate-pulse"><Stethoscope className="w-3 h-3" /> En Consulta</span>;
      case 'Completada':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><Check className="w-3 h-3" /> Atendida</span>;
      case 'Cancelada':
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelada</span>;
      default:
        return <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-slate-100 text-slate-700">Pendiente</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls with Real-Time Internet Sync Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Agenda & Control de Citas</span>
          </h1>
          
          {/* Real-time Internet Time Synchronization Pill */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full font-bold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sincronía Internet Oficial: <strong>{officialInternetDateLong}</strong> • <strong className="font-mono">{officialTime12h}</strong></span>
              <button
                type="button"
                onClick={handleSyncTime}
                className="p-1 hover:bg-emerald-200/60 rounded-full text-emerald-700 transition-all cursor-pointer ml-1"
                title="Actualizar y resincronizar hora oficial por internet"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-500 font-medium">Auto-programación en tiempo real</span>
          </div>
        </div>

        <button
          id="btn-schedule-appointment"
          onClick={onOpenNewAppointment}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 self-start md:self-auto text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agendar Nueva Cita</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        {/* Date Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              dateFilter === 'all' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({appointments.length})
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              dateFilter === 'today' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoy ({appointments.filter(a => a.date === todayStr).length})
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              dateFilter === 'week' ? 'bg-white text-indigo-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Próximos 7 días
          </button>
        </div>

        {/* Status Select Filter */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-700"
          >
            <option value="all">Todos los Estados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="En curso">En curso</option>
            <option value="Completada">Completadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>

        {/* Reason Select Filter */}
        <div className="flex items-center gap-2 min-w-[150px]">
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 text-slate-700"
          >
            <option value="all">Todos los Motivos</option>
            <option value="Consulta General">Consulta General</option>
            <option value="Vacunación">Vacunación</option>
            <option value="Desparasitación">Desparasitación</option>
            <option value="Cirugía">Cirugía</option>
            <option value="Control Post-quirúrgico">Control Post-quirúrgico</option>
            <option value="Urgencia">Urgencia</option>
            <option value="Estética/Peluquería">Estética/Peluquería</option>
          </select>
        </div>
      </div>

      {/* Appointments List View */}
      {sortedAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-500 shadow-sm">
          <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron citas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No hay registros con los filtros seleccionados. Intenta cambiar el filtro o programa una nueva cita.
          </p>
          <button
            onClick={onOpenNewAppointment}
            className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-sm"
          >
            + Agendar Cita
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAppointments.map((apt) => {
            const pet = pets.find((p) => p.id === apt.petId);
            const isToday = apt.date === todayStr;

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isToday ? 'border-indigo-200 ring-1 ring-indigo-500/10' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Left: Date / Time Pill + Pet Info */}
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                    isToday ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-200' : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(apt.date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' })}
                    </span>
                    <span className="text-lg font-black leading-none my-0.5">
                      {apt.date.split('-')[2]}
                    </span>
                    <span className="text-[10px] font-bold opacity-90">{apt.time}</span>
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          if (pet) onSelectPet(pet.id);
                        }}
                        className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {apt.petName}
                      </button>
                      <span className="text-xs text-slate-400 font-medium">({apt.species} {pet ? `• ${pet.breed}` : ''})</span>
                      {getStatusBadge(apt.status)}
                    </div>

                    <p className="text-xs text-slate-700 font-semibold mt-1">
                      Motivo: <span className="text-indigo-900 font-bold">{apt.reason}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Tutor: {apt.ownerName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {apt.ownerPhone}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">Vet: {apt.veterinarianName.split(' ')[0]} {apt.veterinarianName.split(' ')[1]}</span>
                    </div>

                    {apt.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg mt-2 inline-block border border-slate-100">
                        Notas: {apt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {apt.status !== 'Completada' && (
                    <button
                      id={`btn-attend-apt-${apt.id}`}
                      onClick={() => onOpenNewConsultation(apt.petId)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Atender</span>
                    </button>
                  )}

                  {/* Button for Reschedule / Change Appointment Date or Time */}
                  {apt.status !== 'Completada' && (
                    <button
                      type="button"
                      id={`btn-reschedule-apt-${apt.id}`}
                      onClick={() => setReschedulingAppointment(apt)}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Cambiar fecha u horario de la cita"
                    >
                      <CalendarClock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Reagendar / Horario</span>
                    </button>
                  )}

                  {/* Button to Discharge Patient ("Dar de Alta Médica") */}
                  {apt.status !== 'Completada' && (
                    <button
                      type="button"
                      id={`btn-discharge-pet-${apt.id}`}
                      onClick={() => {
                        const matchedPet = pets.find((p) => p.id === apt.petId) || {
                          id: apt.petId,
                          name: apt.petName,
                          species: apt.species,
                          breed: 'Mestizo',
                          ageYears: 2,
                          weightKg: 5,
                          gender: 'Macho',
                          owner: {
                            id: `owner-${apt.id}`,
                            name: apt.ownerName,
                            phone: apt.ownerPhone,
                            email: apt.ownerEmail || '',
                            address: '',
                          },
                          registeredAt: apt.date,
                        };
                        setDischargingPet(matchedPet as Pet);
                      }}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Dar de alta al paciente y emitir hoja de egreso"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dar de Alta</span>
                    </button>
                  )}

                  {apt.status === 'Pendiente' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Confirmada')}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      Confirmar
                    </button>
                  )}

                  {apt.status === 'Confirmada' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'En curso')}
                      className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer"
                    >
                      En espera
                    </button>
                  )}

                  {apt.status === 'En curso' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Completada')}
                      className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Finalizar</span>
                    </button>
                  )}

                  {/* WhatsApp & Email Reminder Dispatchers */}
                  <button
                    type="button"
                    onClick={() => handleSendAppointmentWhatsApp(apt)}
                    className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title={`Enviar recordatorio de cita por WhatsApp a ${apt.ownerName}`}
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  {apt.ownerEmail && (
                    <button
                      type="button"
                      onClick={() => handleSendAppointmentEmail(apt)}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title={`Enviar recordatorio de cita por Email a ${apt.ownerEmail}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Email</span>
                    </button>
                  )}

                  <button
                    onClick={() => setDeletingAppointmentId(apt.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Cancelar y eliminar cita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      <RescheduleAppointmentModal
        isOpen={Boolean(reschedulingAppointment)}
        onClose={() => setReschedulingAppointment(null)}
        appointment={reschedulingAppointment}
      />

      {/* Medical Discharge Modal */}
      <MedicalDischargeModal
        isOpen={Boolean(dischargingPet)}
        onClose={() => setDischargingPet(null)}
        pet={dischargingPet}
      />

      {/* Confirmation modal for appointment deletion */}
      <ConfirmationModal
        isOpen={Boolean(deletingAppointmentId)}
        onClose={() => setDeletingAppointmentId(null)}
        onConfirm={() => {
          if (deletingAppointmentId) {
            deleteAppointment(deletingAppointmentId);
            setDeletingAppointmentId(null);
          }
        }}
        title="¿Cancelar y eliminar esta cita?"
        message="Esta acción retirará la cita programada del calendario y liberará el horario de atención."
        confirmText="Sí, Eliminar Cita"
        cancelText="Conservar Cita"
        type="danger"
      />
    </div>
  );
};
