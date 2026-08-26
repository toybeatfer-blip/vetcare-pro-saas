import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  PawPrint,
  Heart,
  ShieldCheck,
  Calendar,
  Syringe,
  Pill,
  Clock,
  Sparkles,
  Activity,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Printer,
  Smartphone,
  Film,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askVetCopilot } from '../../services/geminiService';
import { DiagnosticImage } from '../../types';
import { DiagnosticImageViewerModal } from '../patients/DiagnosticImageViewerModal';

interface ClientHealthPortalProps {
  onOpenNewAppointment: (petId?: string) => void;
}

export const ClientHealthPortal: React.FC<ClientHealthPortalProps> = ({ onOpenNewAppointment }) => {
  const {
    pets,
    appointments,
    medicalRecords,
    vaccines,
    showToast,
    setViewMode,
    clinicSettings,
  } = useVeterinary();

  // Selected Pet for the tutor
  const [activePetId, setActivePetId] = useState<string>(pets[0]?.id || '');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [selectedStudyForViewer, setSelectedStudyForViewer] = useState<DiagnosticImage | null>(null);

  const currentPet = pets.find((p) => p.id === activePetId) || pets[0];

  if (!currentPet) {
    return (
      <div className="max-w-md mx-auto p-8 my-12 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
          <PawPrint className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-black text-slate-900">Portal de Salud para Tutores</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Aún no hay pacientes registrados en esta clínica. Registra a tu primera mascota desde el Software Clínico para visualizar su Carnet de Salud Digital y consultas médicas.
        </p>
        <button
          onClick={() => setViewMode('admin')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Ir al Software Clínico</span>
        </button>
      </div>
    );
  }

  const petVaccines = vaccines.filter((v) => v.petId === currentPet.id);
  const petRecords = medicalRecords.filter((r) => r.petId === currentPet.id);
  const petAppointments = appointments.filter((a) => a.petId === currentPet.id);

  // Active prescriptions across all records
  const activePrescriptions = petRecords
    .flatMap((r) => r.prescriptions)
    .filter((p) => p.isActive);

  // Health Protection Score (Calculated based on overdue vaccines & recent checkup)
  const overdueCount = petVaccines.filter((v) => v.status === 'vencida').length;
  let healthScore = 96;
  if (overdueCount > 0) healthScore -= overdueCount * 25;
  if (petRecords.length === 0) healthScore -= 15;
  healthScore = Math.max(30, Math.min(100, healthScore));

  const handleGeneratePetFriendlySummary = async () => {
    setIsAiLoading(true);
    try {
      const latestRecord = petRecords[0];
      const prompt = `Actúa como el médico veterinario de cabecera de ${currentPet.name} (${currentPet.species}, ${currentPet.breed}).
Explica de manera cariñosa, clara y sin tecnicismos difíciles a su tutor (${currentPet.owner.name}) el estado de salud actual de su mascota.
Datos:
- Peso: ${currentPet.weightKg} kg
- Alergias: ${currentPet.allergies.join(', ') || 'Ninguna'}
- Última consulta: ${latestRecord ? latestRecord.diagnosis : 'Sin consultas recientes'}
- Próximas vacunas: ${petVaccines.map((v) => `${v.vaccineName} (${v.dueDate})`).join(', ')}

Entrega 3 recomendaciones prácticas de nutrición, ejercicio y cuidados preventivos.`;

      const resp = await askVetCopilot(prompt, currentPet, 'client_summary');
      setAiSummary(resp.result);
      showToast('Resumen de salud generado por VetCopilot.', 'success');
    } catch (e) {
      showToast('Error al conectar con el asistente.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Tutor Banner / Pet Selector Bento Box */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Portal del Tutor & Seguimiento Médico</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Bienvenido, {currentPet.owner.name}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Monitorea en tiempo real el carnet de vacunas, tratamientos activos, citas y recomendaciones veterinarias de tus mascotas.
            </p>
          </div>

          {/* Quick Contact & Book */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setViewMode('android')}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-1.5"
              title="Abrir App Android con carnet digital QR y recordatorios"
            >
              <Smartphone className="w-4 h-4" />
              <span>Abrir App Android</span>
            </button>

            <a
              href={`tel:${(clinicSettings.emergencyPhone || clinicSettings.phone || '+525549128301').replace(/[^0-9+]/g, '')}`}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>Urgencias 24/7 ({clinicSettings.emergencyPhone || clinicSettings.phone})</span>
            </a>
            
            <button
              id="btn-portal-book-apt"
              onClick={() => onOpenNewAppointment(currentPet.id)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Solicitar Cita</span>
            </button>
          </div>
        </div>

        {/* Pet Switcher Tabs */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Tus Mascotas:
          </span>
          <div className="flex items-center gap-2">
            {pets.map((pet) => {
              const isSelected = pet.id === currentPet.id;
              return (
                <button
                  key={pet.id}
                  onClick={() => {
                    setActivePetId(pet.id);
                    setAiSummary(null);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-md scale-102 font-extrabold'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {pet.photoUrl ? (
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <PawPrint className="w-4 h-4" />
                  )}
                  <span>{pet.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-100 text-indigo-900' : 'bg-white/20'}`}>
                    {pet.species}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Pet Health Status Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Identity, Vaccines & Health AI Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Health Score Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {currentPet.photoUrl ? (
                <img
                  src={currentPet.photoUrl}
                  alt={currentPet.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-2xl flex items-center justify-center shrink-0">
                  {currentPet.name.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900">{currentPet.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                    {currentPet.species} • {currentPet.breed}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Edad: <strong>{currentPet.ageDisplay}</strong> • Peso: <strong>{currentPet.weightKg} kg</strong> • {currentPet.gender} ({currentPet.isNeutered ? 'Esterilizado' : 'Entero'})
                </p>
                {currentPet.microchipNumber && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Microchip: {currentPet.microchipNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Health Score Dial */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center shrink-0 min-w-[130px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Índice de Protección
              </span>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {healthScore}%
              </div>
              <span className="text-[10px] text-indigo-700 font-bold flex items-center justify-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {healthScore > 80 ? 'Excelente' : 'Requiere Refuerzo'}
              </span>
            </div>
          </div>

          {/* AI Health Explainer Card for Tutor */}
          <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Resumen de Salud Explicado por VetCopilot
                  </h3>
                  <p className="text-xs text-slate-500">
                    Explicación personalizada en lenguaje claro y cercano para el cuidado de {currentPet.name}
                  </p>
                </div>
              </div>

              <button
                onClick={handleGeneratePetFriendlySummary}
                disabled={isAiLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Analizando...' : aiSummary ? 'Actualizar' : 'Generar Explicación'}</span>
              </button>
            </div>

            {aiSummary ? (
              <div className="p-4 bg-white rounded-2xl border border-indigo-100 text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-xs">
                {aiSummary}
              </div>
            ) : (
              <div className="p-4 bg-white/80 rounded-2xl border border-dashed border-indigo-200 text-xs text-slate-500 text-center">
                Haz clic en <strong>"Generar Explicación"</strong> para obtener una guía amigable sobre la salud, nutrición y próximos cuidados de {currentPet.name}.
              </div>
            )}
          </div>

          {/* Digital Vaccine Passport */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Carnet Digital de Vacunas & Desparasitación
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {petVaccines.length} registradas
              </span>
            </div>

            {petVaccines.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Sin vacunas registradas aún.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {petVaccines.map((vac) => {
                  const isOverdue = vac.status === 'vencida';
                  const isUpcoming = vac.status === 'proxima';
                  return (
                    <div
                      key={vac.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                        isOverdue
                          ? 'bg-rose-50/60 border-rose-200'
                          : isUpcoming
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div>
                        <strong className="text-slate-900 text-xs block font-bold">{vac.vaccineName}</strong>
                        <span className="text-[11px] text-slate-400">
                          Aplicación: {vac.applicationDate}
                        </span>
                        <p className="text-[11px] font-semibold mt-0.5">
                          Próximo Refuerzo:{' '}
                          <span className={isOverdue ? 'text-rose-700 font-bold' : 'text-indigo-900 font-bold'}>
                            {vac.dueDate}
                          </span>
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {isOverdue && (
                          <span className="px-2.5 py-0.5 bg-rose-200 text-rose-800 font-bold rounded-md text-[10px]">
                            Vencida
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="px-2.5 py-0.5 bg-amber-200 text-amber-800 font-bold rounded-md text-[10px]">
                            Reforzar
                          </span>
                        )}
                        {!isOverdue && !isUpcoming && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                            Vigente
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Diagnostic Imaging Studies & X-rays (Tutor View) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Estudios de Imagenología (Rayos X & Ultrasonidos)
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {(currentPet.diagnosticImages || []).length} estudios
              </span>
            </div>

            {(currentPet.diagnosticImages || []).length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                <p>No hay placas ni ecografías adjuntas para {currentPet.name}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(currentPet.diagnosticImages || []).map((study) => (
                  <div
                    key={study.id}
                    onClick={() => setSelectedStudyForViewer(study)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative flex items-center justify-center">
                        <img
                          src={study.fileUrl}
                          alt={study.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 px-1 text-[8px] font-black bg-slate-950/80 text-white rounded-tl">
                          {study.fileFormat}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {study.title}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {study.region} • {study.date}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 bg-white text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white font-bold rounded-lg text-[10px] shadow-2xs border border-slate-200 shrink-0 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver Placa</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Prescriptions, Next Appointment & Reminders */}
        <div className="space-y-6">
          {/* Active Medications */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Tratamientos Activos</h3>
            </div>

            {activePrescriptions.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <p>No hay medicación activa en este momento.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activePrescriptions.map((rx) => (
                  <div key={rx.id} className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs">
                    <strong className="text-indigo-950 font-bold block">{rx.medication}</strong>
                    <p className="text-slate-700 text-[11px] mt-0.5">
                      Dosis: <strong>{rx.dose}</strong> • {rx.frequency}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Duración: {rx.duration}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Appointments */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Citas Programadas</h3>
              </div>
              <button
                onClick={() => onOpenNewAppointment(currentPet.id)}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                + Agendar
              </button>
            </div>

            {petAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No tienes citas agendadas.</p>
            ) : (
              <div className="space-y-2.5">
                {petAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900 block font-semibold">{apt.reason}</strong>
                      <p className="text-slate-400 text-[11px]">
                        {apt.date} a las {apt.time} hrs
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold text-[10px]">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinic Help / Direct WhatsApp Bento Box */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md space-y-3">
            <h4 className="text-sm font-bold">¿Dudas sobre tu mascota?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              El equipo de <strong className="text-white">{clinicSettings.name}</strong> está disponible para resolver dudas de dosificación, post-operatorio o emergencias.
            </p>
            <a
              href={`https://wa.me/${clinicSettings.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(clinicSettings.name)},%20tengo%20una%20consulta%20sobre%20mi%20mascota%20${encodeURIComponent(currentPet.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Chatear por WhatsApp ({clinicSettings.phone})</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox / DICOM Viewer for Tutor */}
      {selectedStudyForViewer && (
        <DiagnosticImageViewerModal
          isOpen={Boolean(selectedStudyForViewer)}
          onClose={() => setSelectedStudyForViewer(null)}
          study={selectedStudyForViewer}
          pet={currentPet}
        />
      )}
    </div>
  );
};
