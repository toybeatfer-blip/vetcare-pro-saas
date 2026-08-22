import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Pet, MedicalRecord, VaccineRecord } from '../../types';
import {
  X,
  PawPrint,
  Calendar,
  Syringe,
  FileText,
  Activity,
  User,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Plus,
  Printer,
  ShieldCheck,
  Heart,
  ChevronRight,
  Sparkles,
  QrCode,
  Film,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagnosticStudiesTab } from './DiagnosticStudiesTab';
import { DeletePatientModal } from './DeletePatientModal';

interface PatientDetailModalProps {
  isOpen: boolean;
  petId: string | null;
  onClose: () => void;
  onOpenNewConsultation: (petId: string) => void;
  onOpenApplyVaccine: (petId: string) => void;
  onPrintRecord: (record: MedicalRecord, pet: Pet) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  petId,
  onClose,
  onOpenNewConsultation,
  onOpenApplyVaccine,
  onPrintRecord,
}) => {
  const { pets, getRecordsByPetId, getVaccinesByPetId, sendVaccineReminder, openPairingModal, currentUser } = useVeterinary();
  const [activeTab, setActiveTab] = useState<'summary' | 'records' | 'vaccines' | 'imaging' | 'weight_chart'>('summary');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  if (!isOpen || !petId) return null;

  const pet = pets.find((p) => p.id === petId);
  if (!pet) return null;

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superuser';

  const medicalRecords = getRecordsByPetId(pet.id);
  const vaccines = getVaccinesByPetId(pet.id);

  // Collect historical weight points from medical records
  const weightPoints = medicalRecords
    .filter((r) => r.vitalSigns?.weightKg)
    .map((r) => ({
      date: r.date,
      weight: r.vitalSigns.weightKg,
      temperature: r.vitalSigns.temperatureC,
    }))
    .reverse();

  // If no previous weight points, fallback to current
  if (weightPoints.length === 0) {
    weightPoints.push({
      date: pet.registeredAt,
      weight: pet.weightKg,
      temperature: 38.5,
    });
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 my-6 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-teal-800 to-emerald-800 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {pet.photoUrl ? (
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 text-white font-extrabold flex items-center justify-center text-2xl shrink-0">
                    {pet.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl font-extrabold text-white">{pet.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
                      {pet.species} • {pet.breed}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-600/60 text-xs font-medium">
                      {pet.gender} • {pet.isNeutered ? 'Esterilizado' : 'Entero'}
                    </span>
                  </div>
                  <p className="text-teal-100 text-xs mt-1">
                    Edad: <strong>{pet.ageDisplay}</strong> • Peso actual: <strong>{pet.weightKg} kg</strong> • Microchip: {pet.microchipNumber || 'Sin microchip'}
                  </p>
                </div>
              </div>

              {/* Quick action buttons in modal */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="btn-modal-new-consult"
                  onClick={() => onOpenNewConsultation(pet.id)}
                  className="px-3.5 py-2 bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-teal-700" />
                  <span>Nueva Consulta</span>
                </button>
                <button
                  id="btn-modal-apply-vaccine"
                  onClick={() => onOpenApplyVaccine(pet.id)}
                  className="px-3.5 py-2 bg-teal-900/40 hover:bg-teal-900/60 border border-white/30 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Syringe className="w-4 h-4" />
                  <span>Aplicar Vacuna</span>
                </button>

                {/* BOTÓN PARA ELIMINAR PACIENTE Y TUTOR: REQUIERE ROL ADMIN */}
                <button
                  id="btn-modal-delete-pet"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3 py-2 bg-rose-500/20 hover:bg-rose-600 text-rose-100 hover:text-white border border-rose-400/40 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title={isAdmin ? "Eliminar paciente y tutor de la base de datos (Admin)" : "Requiere permisos de Administrador"}
                >
                  <Trash2 className="w-4 h-4 text-rose-200" />
                  <span>Eliminar Ficha</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside modal */}
            <div className="flex items-center gap-2 mt-6 pt-2 border-t border-white/10 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'summary' ? 'bg-white text-teal-900 font-bold' : 'text-teal-100 hover:bg-white/10'
                }`}
              >
                Ficha General
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'records' ? 'bg-white text-teal-900 font-bold' : 'text-teal-100 hover:bg-white/10'
                }`}
              >
                <span>Historial Médico</span>
                <span className="px-1.5 py-0.2 bg-teal-900/40 rounded-full text-[10px]">
                  {medicalRecords.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('vaccines')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'vaccines' ? 'bg-white text-teal-900 font-bold' : 'text-teal-100 hover:bg-white/10'
                }`}
              >
                <span>Carnet de Vacunas</span>
                <span className="px-1.5 py-0.2 bg-teal-900/40 rounded-full text-[10px]">
                  {vaccines.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('imaging')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'imaging' ? 'bg-white text-teal-900 font-bold' : 'text-teal-100 hover:bg-white/10'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Rayos X & Ultrasonidos</span>
                <span className="px-1.5 py-0.2 bg-teal-900/40 rounded-full text-[10px]">
                  {(pet.diagnosticImages || []).length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('weight_chart')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'weight_chart' ? 'bg-white text-teal-900 font-bold' : 'text-teal-100 hover:bg-white/10'
                }`}
              >
                Evolución de Peso & Constantes
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Tab 1: Ficha General */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Tutor Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-700" />
                    Información del Tutor Responsable
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Nombre del Tutor:</span>
                      <strong className="text-slate-900 text-sm">{pet.owner.name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Teléfono / WhatsApp:</span>
                      <strong className="text-teal-800 text-sm flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {pet.owner.phone}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Correo Electrónico:</span>
                      <strong className="text-slate-800">{pet.owner.email}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Dirección:</span>
                      <span className="text-slate-700">{pet.owner.address}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Identificación Oficial:</span>
                      <span className="text-slate-700 font-mono">{pet.owner.documentId}</span>
                    </div>
                  </div>
                </div>

                {/* Clinical Alerts: Allergies & Chronic Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80">
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Alergias Conocidas
                    </h4>
                    {pet.allergies.length > 0 ? (
                      <ul className="space-y-1">
                        {pet.allergies.map((allergy, i) => (
                          <li key={i} className="text-xs text-rose-800 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            {allergy}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No se registran alergias adversas.</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Heart className="w-4 h-4 text-amber-600" />
                      Condiciones Crónicas / Cuidados Especiales
                    </h4>
                    {pet.chronicConditions.length > 0 ? (
                      <ul className="space-y-1">
                        {pet.chronicConditions.map((condition, i) => (
                          <li key={i} className="text-xs text-amber-900 font-medium flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {condition}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Sin condiciones crónicas registradas.</p>
                    )}
                  </div>
                </div>

                {/* Latest Checkup Snapshot */}
                {medicalRecords[0] && (
                  <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-700" />
                        Última Consulta Médica ({medicalRecords[0].date})
                      </h4>
                      <button
                        onClick={() => onPrintRecord(medicalRecords[0], pet)}
                        className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Receta</span>
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Diagnóstico: <span className="font-normal text-slate-700">{medicalRecords[0].diagnosis}</span>
                    </p>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      Tratamiento: <span className="font-normal text-slate-700">{medicalRecords[0].treatmentPlan}</span>
                    </p>
                  </div>
                )}

                {/* Zona de Administración y Eliminación de Paciente y Tutor */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Zona de Administración: Eliminación Definitiva</span>
                    </h4>
                    <p className="text-[11px] text-rose-700 leading-snug">
                      Eliminar por completo a <strong>{pet.name}</strong>, la ficha de su tutor <strong>{pet.owner.name}</strong> y todo su historial de la base de datos (Requiere rol de Administrador).
                    </p>
                  </div>

                  <button
                    type="button"
                    id="btn-tab-summary-delete-pet"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Paciente y Tutor</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Historial Médico Completo */}
            {activeTab === 'records' && (
              <div className="space-y-4">
                {medicalRecords.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Sin consultas registradas aún</p>
                    <button
                      onClick={() => onOpenNewConsultation(pet.id)}
                      className="mt-3 px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-semibold hover:bg-teal-800"
                    >
                      + Registrar Primera Consulta
                    </button>
                  </div>
                ) : (
                  medicalRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{record.date}</span>
                            <span className="text-xs text-slate-500">({record.time} hrs)</span>
                            <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[11px] font-semibold rounded-md">
                              {record.reason}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Atendido por: {record.veterinarianName}</p>
                        </div>
                        <button
                          onClick={() => onPrintRecord(record, pet)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Imprimir Ficha</span>
                        </button>
                      </div>

                      {/* Vital Signs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Temperatura</span>
                          <strong className="text-slate-800">{record.vitalSigns.temperatureC} °C</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Frec. Cardíaca</span>
                          <strong className="text-slate-800">{record.vitalSigns.heartRateBpm} lpm</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Frec. Resp.</span>
                          <strong className="text-slate-800">{record.vitalSigns.respRateBpm} rpm</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Peso</span>
                          <strong className="text-slate-800">{record.vitalSigns.weightKg} kg</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase">Cond. Corporal</span>
                          <strong className="text-slate-800">{record.vitalSigns.bodyConditionScore}/5</strong>
                        </div>
                      </div>

                      {/* Anamnesis & Diagnosis */}
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <p>
                          <strong className="text-slate-900">Anamnesis:</strong> {record.anamnesis}
                        </p>
                        <p>
                          <strong className="text-teal-950">Diagnóstico Clínico:</strong> {record.diagnosis}
                        </p>
                        <p>
                          <strong className="text-slate-900">Plan Terapéutico:</strong> {record.treatmentPlan}
                        </p>
                      </div>

                      {/* Prescriptions Table if any */}
                      {record.prescriptions.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                            Receta Médica Digital
                          </span>
                          <div className="space-y-1.5">
                            {record.prescriptions.map((rx) => (
                              <div key={rx.id} className="p-2.5 bg-teal-50/50 rounded-xl text-xs flex items-center justify-between">
                                <div>
                                  <strong className="text-teal-950">{rx.medication}</strong>
                                  <p className="text-slate-600 text-[11px]">
                                    Dosis: {rx.dose} • Frecuencia: {rx.frequency} • {rx.duration}
                                  </p>
                                </div>
                                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full">
                                  {rx.isActive ? 'Activo' : 'Finalizado'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Carnet de Vacunas */}
            {activeTab === 'vaccines' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Registro de Inmunizaciones & Desparasitaciones
                  </h3>
                  <button
                    onClick={() => onOpenApplyVaccine(pet.id)}
                    className="px-3 py-1.5 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar Dosis</span>
                  </button>
                </div>

                {vaccines.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Syringe className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium">No hay vacunas registradas para este paciente.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {vaccines.map((vac) => {
                      const isOverdue = vac.status === 'vencida';
                      const isUpcoming = vac.status === 'proxima';
                      return (
                        <div
                          key={vac.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                            isOverdue
                              ? 'bg-rose-50/60 border-rose-200'
                              : isUpcoming
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                isOverdue
                                  ? 'bg-rose-200 text-rose-800'
                                  : isUpcoming
                                  ? 'bg-amber-200 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              <Syringe className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-slate-900 text-sm">{vac.vaccineName}</strong>
                                <span className="text-[11px] text-slate-500">({vac.type})</span>
                              </div>
                              <p className="text-slate-500 text-[11px] mt-0.5">
                                Aplicación: <strong>{vac.applicationDate}</strong> • Próximo Refuerzo: <strong className={isOverdue ? 'text-rose-700' : 'text-slate-800'}>{vac.dueDate}</strong> • Lote: {vac.lotNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              id={`btn-remind-patient-modal-${vac.id}`}
                              onClick={() => sendVaccineReminder(pet.id, vac.id, 'WhatsApp')}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs flex items-center gap-1 shadow-xs"
                            >
                              <span>Avisar WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Diagnostic Imaging & Ultrasound / X-rays */}
            {activeTab === 'imaging' && (
              <DiagnosticStudiesTab pet={pet} />
            )}

            {/* Tab 5: Weight & Vital Signs Interactive Evolution Graph */}
            {activeTab === 'weight_chart' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-700" />
                    Curva Ponderal Histórica de {pet.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Evolución del peso corporal (kg) registrado a lo largo de las visitas clínicas.
                  </p>

                  {/* SVG Chart */}
                  <div className="h-52 w-full relative flex items-end pt-8 pb-6 px-4 bg-white rounded-xl border border-slate-200">
                    <div className="absolute inset-x-4 top-4 border-b border-dashed border-slate-200 text-[10px] text-slate-400">
                      Máx: {Math.max(...weightPoints.map((p) => p.weight)) + 2} kg
                    </div>
                    <div className="absolute inset-x-4 top-24 border-b border-dashed border-slate-200 text-[10px] text-slate-400">
                      Promedio: {(weightPoints.reduce((acc, p) => acc + p.weight, 0) / weightPoints.length).toFixed(1)} kg
                    </div>

                    <div className="w-full flex items-end justify-around h-full z-10">
                      {weightPoints.map((pt, i) => {
                        const maxW = Math.max(...weightPoints.map((p) => p.weight)) + 3;
                        const heightPct = Math.min(100, Math.max(20, (pt.weight / maxW) * 100));
                        return (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <span className="text-xs font-extrabold text-teal-900">{pt.weight} kg</span>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-10 bg-gradient-to-t from-teal-700 to-emerald-500 rounded-t-lg transition-all shadow-xs"
                            ></div>
                            <span className="text-[10px] font-medium text-slate-500">{pt.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal to Delete Patient and Tutor from Database */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        pet={pet}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={() => {
          setIsDeleteModalOpen(false);
          onClose();
        }}
      />
    </AnimatePresence>
  );
};
