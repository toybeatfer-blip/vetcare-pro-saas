import React, { useState, useEffect } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { MedicalRecord, Prescription, VitalSigns, LabTest } from '../../types';
import {
  X,
  Stethoscope,
  Activity,
  Pill,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  CheckCircle2,
  PawPrint,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askVetCopilot } from '../../services/geminiService';
import { MedicalDischargeModal } from './MedicalDischargeModal';
import { Pet } from '../../types';

interface NewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPetId?: string;
  onPrintAfterSave?: (record: MedicalRecord) => void;
}

export const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  isOpen,
  onClose,
  initialPetId,
  onPrintAfterSave,
}) => {
  const { pets, addMedicalRecord, inventory, showToast } = useVeterinary();

  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [savedDischargeData, setSavedDischargeData] = useState<{
    pet: Pet;
    diagnosis: string;
    procedure: string;
    prescriptions: Prescription[];
  } | null>(null);

  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId || (pets[0]?.id || ''));
  const [date, setDate] = useState<string>('2026-08-14');
  const [time, setTime] = useState<string>('12:00');
  const [reason, setReason] = useState<string>('Consulta General de Rutina');
  const [anamnesis, setAnamnesis] = useState<string>('');
  const [veterinarianName, setVeterinarianName] = useState<string>('Dra. Valeria Hernández (MVZ)');

  // Vital Signs
  const [temperatureC, setTemperatureC] = useState<number>(38.5);
  const [heartRateBpm, setHeartRateBpm] = useState<number>(100);
  const [respRateBpm, setRespRateBpm] = useState<number>(24);
  const [weightKg, setWeightKg] = useState<number>(10.0);
  const [bodyConditionScore, setBodyConditionScore] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [mucosaColor, setMucosaColor] = useState<VitalSigns['mucosaColor']>('Rosa');
  const [capillaryRefillTimeSec, setCapillaryRefillTimeSec] = useState<number>(1.5);

  // Diagnosis & Treatment
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [treatmentPlan, setTreatmentPlan] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Prescriptions List
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: `rx-${Date.now()}`,
      medication: '',
      dose: '',
      frequency: '',
      duration: '',
      instructions: '',
      isActive: true,
      startDate: '2026-08-14',
    },
  ]);

  // AI Guidance state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  const currentPet = pets.find((p) => p.id === selectedPetId);

  // Sync weight from pet if changed
  useEffect(() => {
    if (currentPet?.weightKg) {
      setWeightKg(currentPet.weightKg);
    }
  }, [selectedPetId, currentPet]);

  if (!isOpen) return null;

  const handleAddPrescription = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        medication: '',
        dose: '',
        frequency: '',
        duration: '',
        instructions: '',
        isActive: true,
        startDate: date,
      },
    ]);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePrescription = (id: string, field: keyof Prescription, val: any) => {
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  // AI Assistant trigger
  const handleConsultAiCopilot = async () => {
    if (!currentPet) return;
    setIsAiLoading(true);
    try {
      const prompt = `Paciente: ${currentPet.name}, Especie: ${currentPet.species}, Raza: ${currentPet.breed}, Peso: ${weightKg}kg.
Motivo de consulta: ${reason}.
Anamnesis / Síntomas: ${anamnesis || 'Chequeo general'}.
Diagnóstico presuntivo: ${diagnosis || 'En evaluación'}.

Proporciona:
1. Pauta de dosificación sugerida para esta especie y peso.
2. 3 diagnósticos diferenciales o consideraciones clínicas clave.
3. Indicaciones claras de cuidado para el tutor.`;

      const resp = await askVetCopilot(prompt, currentPet, 'clinical');
      setAiSuggestions(resp.result);
      showToast('Sugerencias clínicas de VetCopilot generadas.', 'info');
    } catch (e) {
      showToast('Error al consultar IA.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPet) return;
    if (!diagnosis.trim()) {
      alert('Por favor ingresa un diagnóstico para la consulta.');
      return;
    }

    const validPrescriptions = prescriptions.filter((p) => p.medication.trim() !== '');

    const newRecord = addMedicalRecord({
      petId: currentPet.id,
      date,
      time,
      reason,
      anamnesis: anamnesis.trim() || 'Sin antecedentes reportados por el tutor.',
      vitalSigns: {
        temperatureC: Number(temperatureC),
        heartRateBpm: Number(heartRateBpm),
        respRateBpm: Number(respRateBpm),
        weightKg: Number(weightKg),
        bodyConditionScore,
        mucosaColor,
        capillaryRefillTimeSec: Number(capillaryRefillTimeSec),
      },
      diagnosis: diagnosis.trim(),
      treatmentPlan: treatmentPlan.trim() || 'Seguimiento clínico y reposo relativo.',
      prescriptions: validPrescriptions,
      labTests: [],
      veterinarianName,
      notes: notes.trim() || undefined,
    });

    if (onPrintAfterSave) {
      onPrintAfterSave(newRecord);
    }

    onClose();
  };

  const handleSaveAndDischarge = () => {
    if (!currentPet) return;
    if (!diagnosis.trim()) {
      showToast('Por favor ingresa un diagnóstico para la consulta.', 'warning');
      return;
    }

    const validPrescriptions = prescriptions.filter((p) => p.medication.trim() !== '');

    addMedicalRecord({
      petId: currentPet.id,
      date,
      time,
      reason,
      anamnesis: anamnesis.trim() || 'Sin antecedentes reportados por el tutor.',
      vitalSigns: {
        temperatureC: Number(temperatureC),
        heartRateBpm: Number(heartRateBpm),
        respRateBpm: Number(respRateBpm),
        weightKg: Number(weightKg),
        bodyConditionScore,
        mucosaColor,
        capillaryRefillTimeSec: Number(capillaryRefillTimeSec),
      },
      diagnosis: diagnosis.trim(),
      treatmentPlan: treatmentPlan.trim() || 'Seguimiento clínico y reposo relativo.',
      prescriptions: validPrescriptions,
      labTests: [],
      veterinarianName,
      notes: notes.trim() || undefined,
    });

    setSavedDischargeData({
      pet: currentPet,
      diagnosis: diagnosis.trim(),
      procedure: reason,
      prescriptions: validPrescriptions,
    });
    setIsDischargeOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 my-6 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-teal-800 to-emerald-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Registrar Consulta Médica</h2>
                <p className="text-xs text-teal-100">Examen físico, constantes vitales, diagnóstico y receta</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Paciente y Metadatos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Paciente *
                </label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white"
                >
                  {pets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} • {p.owner.name.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fecha & Hora
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Veterinario Responsable
                </label>
                <input
                  type="text"
                  required
                  value={veterinarianName}
                  onChange={(e) => setVeterinarianName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Motivo & Anamnesis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Motivo de Consulta *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej. Chequeo anual, dolor articular, prurito..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Anamnesis / Historia Clínica Reportada
                </label>
                <textarea
                  rows={2}
                  value={anamnesis}
                  onChange={(e) => setAnamnesis(e.target.value)}
                  placeholder="Qué refiere el tutor, inicio de síntomas, evolución..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                />
              </div>
            </div>

            {/* Constantes Vitales & Examen Físico */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Examen Físico & Constantes Fisiológicas
                </h3>
                <span className="text-[11px] text-slate-500">Valores estándar de referencia</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">T° (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={temperatureC}
                    onChange={(e) => setTemperatureC(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-center"
                  />
                  <span className="text-[10px] text-slate-400 text-center block mt-0.5">38 - 39.2 °C</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">FC (lpm)</label>
                  <input
                    type="number"
                    required
                    value={heartRateBpm}
                    onChange={(e) => setHeartRateBpm(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-center"
                  />
                  <span className="text-[10px] text-slate-400 text-center block mt-0.5">60 - 160 lpm</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">FR (rpm)</label>
                  <input
                    type="number"
                    required
                    value={respRateBpm}
                    onChange={(e) => setRespRateBpm(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-center"
                  />
                  <span className="text-[10px] text-slate-400 text-center block mt-0.5">15 - 30 rpm</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-teal-800 text-center"
                  />
                  <span className="text-[10px] text-slate-400 text-center block mt-0.5">Actualizar</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condición</label>
                  <select
                    value={bodyConditionScore}
                    onChange={(e) => setBodyConditionScore(Number(e.target.value) as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-center"
                  >
                    <option value={1}>1 (Muy delgado)</option>
                    <option value={2}>2 (Bajo peso)</option>
                    <option value={3}>3 (Ideal)</option>
                    <option value={4}>4 (Sobrepeso)</option>
                    <option value={5}>5 (Obeso)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mucosas</label>
                  <select
                    value={mucosaColor}
                    onChange={(e) => setMucosaColor(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Rosa">Rosa (Normal)</option>
                    <option value="Pálida">Pálida</option>
                    <option value="Cianótica">Cianótica</option>
                    <option value="Ictérica">Ictérica</option>
                    <option value="Congestiva">Congestiva</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">TLLC (seg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={capillaryRefillTimeSec}
                    onChange={(e) => setCapillaryRefillTimeSec(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-center"
                  />
                  <span className="text-[10px] text-slate-400 text-center block mt-0.5">&lt; 2 seg</span>
                </div>
              </div>
            </div>

            {/* Diagnóstico y Plan Terapéutico con botón IA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Diagnóstico Clínico & Terapéutica *
                </label>
                <button
                  type="button"
                  onClick={handleConsultAiCopilot}
                  disabled={isAiLoading}
                  className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isAiLoading ? 'Consultando IA...' : 'Asistente IA Clínico'}</span>
                </button>
              </div>

              {aiSuggestions && (
                <div className="p-4 bg-teal-50/80 rounded-2xl border border-teal-200 text-xs text-teal-950 space-y-2 relative">
                  <div className="flex items-center justify-between font-bold text-teal-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600" /> Sugerencia Clínica VetCopilot
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiSuggestions(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="whitespace-pre-line text-[11px] leading-relaxed max-h-48 overflow-y-auto">
                    {aiSuggestions}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <textarea
                    rows={3}
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="Diagnóstico definitivo o presuntivo..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white"
                  />
                </div>
                <div>
                  <textarea
                    rows={3}
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="Plan de tratamiento general, dieta, reposo, cuidados..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Receta Médica Digital / Farmacología */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Prescripción Farmacológica / Receta Digital
                </h3>
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Medicamento</span>
                </button>
              </div>

              <div className="space-y-3">
                {prescriptions.map((rx, idx) => (
                  <div
                    key={rx.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
                  >
                    <div className="sm:col-span-4">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">
                          Medicamento / Farmacia
                        </label>
                        {(() => {
                          const matchedMed = inventory.find(
                            (m) => m.name.toLowerCase() === rx.medication.toLowerCase() ||
                                   m.genericName.toLowerCase() === rx.medication.toLowerCase()
                          );
                          if (!matchedMed) return null;
                          return (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                matchedMed.quantity <= matchedMed.minStockThreshold
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              Stock: {matchedMed.quantity} {matchedMed.unit}
                            </span>
                          );
                        })()}
                      </div>
                      <input
                        type="text"
                        list={`inventory-med-list-${rx.id}`}
                        value={rx.medication}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'medication', e.target.value)}
                        placeholder="Ej. Amoxicilina 500mg, Meloxicam..."
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-teal-500 focus:outline-none"
                      />
                      <datalist id={`inventory-med-list-${rx.id}`}>
                        {inventory.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.presentation} (Disp: {item.quantity} {item.unit})
                          </option>
                        ))}
                      </datalist>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Dosis
                      </label>
                      <input
                        type="text"
                        value={rx.dose}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'dose', e.target.value)}
                        placeholder="Ej. 1.5 ml"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Frecuencia
                      </label>
                      <input
                        type="text"
                        value={rx.frequency}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'frequency', e.target.value)}
                        placeholder="Ej. Cada 24 horas"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Duración
                      </label>
                      <input
                        type="text"
                        value={rx.duration}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'duration', e.target.value)}
                        placeholder="Ej. 7 días"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      {prescriptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(rx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="btn-save-and-discharge"
                onClick={handleSaveAndDischarge}
                className="px-4 py-2.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Guardar y Dar de Alta Médica</span>
              </button>

              <button
                type="submit"
                id="btn-save-consultation"
                className="px-5 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Guardar Consulta en Historial
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Discharge modal after saving consultation */}
      {savedDischargeData && (
        <MedicalDischargeModal
          isOpen={isDischargeOpen}
          onClose={() => {
            setIsDischargeOpen(false);
            onClose();
          }}
          pet={savedDischargeData.pet}
          initialDiagnosis={savedDischargeData.diagnosis}
          initialProcedure={savedDischargeData.procedure}
          initialPrescriptions={savedDischargeData.prescriptions}
        />
      )}
    </AnimatePresence>
  );
};
