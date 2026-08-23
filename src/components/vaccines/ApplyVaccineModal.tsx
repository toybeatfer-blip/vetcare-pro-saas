import React, { useState } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { VaccineRecord } from '../../types';
import { X, Syringe, Calendar, PawPrint, ShieldAlert, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApplyVaccineModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPetId?: string;
}

const COMMON_VACCINES = [
  { name: 'Vacuna Antirrábica', type: 'vacuna' as const, defaultIntervalMonths: 12 },
  { name: 'Séxtuple Canina (DHPPi+L)', type: 'vacuna' as const, defaultIntervalMonths: 12 },
  { name: 'Puppy DP (Distemper + Parvo)', type: 'vacuna' as const, defaultIntervalMonths: 1 },
  { name: 'Triple Felina (Rinotraqueítis, Calicivirus, Panleucopenia)', type: 'vacuna' as const, defaultIntervalMonths: 12 },
  { name: 'Leucemia Viral Felina (FeLV)', type: 'vacuna' as const, defaultIntervalMonths: 12 },
  { name: 'Bordetella Bronchiseptica (Tos de las Perreras)', type: 'vacuna' as const, defaultIntervalMonths: 12 },
  { name: 'Desparasitación Interna (Prazicuantel / Febantel)', type: 'desparasitante_interno' as const, defaultIntervalMonths: 3 },
  { name: 'Desparasitación Externa (Pipeta / Comprimido)', type: 'desparasitante_externo' as const, defaultIntervalMonths: 1 },
];

export const ApplyVaccineModal: React.FC<ApplyVaccineModalProps> = ({
  isOpen,
  onClose,
  initialPetId,
}) => {
  const { pets, addVaccineRecord } = useVeterinary();

  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId || (pets[0]?.id || ''));
  const [selectedPreset, setSelectedPreset] = useState<string>(COMMON_VACCINES[0].name);
  const [vaccineName, setVaccineName] = useState<string>(COMMON_VACCINES[0].name);
  const [type, setType] = useState<VaccineRecord['type']>('vacuna');
  const [applicationDate, setApplicationDate] = useState<string>('2026-08-14');
  const [dueDate, setDueDate] = useState<string>('2027-08-14');
  const [lotNumber, setLotNumber] = useState<string>('LOT-2026-X49');
  const [veterinarianName, setVeterinarianName] = useState<string>('Dra. Valeria Hernández (MVZ)');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const currentPet = pets.find((p) => p.id === selectedPetId);

  const handlePresetChange = (presetName: string) => {
    setSelectedPreset(presetName);
    const found = COMMON_VACCINES.find((v) => v.name === presetName);
    if (found) {
      setVaccineName(found.name);
      setType(found.type);

      // compute due date based on interval
      const appD = new Date(applicationDate);
      appD.setMonth(appD.getMonth() + found.defaultIntervalMonths);
      setDueDate(appD.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPet || !vaccineName.trim() || !dueDate) return;

    // determine initial status
    let status: VaccineRecord['status'] = 'vigente';
    if (dueDate < '2026-08-14') {
      status = 'vencida';
    } else if (dueDate <= '2026-08-28') {
      status = 'proxima';
    }

    addVaccineRecord({
      petId: currentPet.id,
      vaccineName: vaccineName.trim(),
      type,
      applicationDate,
      dueDate,
      lotNumber: lotNumber.trim() || 'S/L',
      status,
      veterinarianName,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-100 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Syringe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registrar Inmunización</h2>
                <p className="text-xs text-slate-500">Vacunación o desparasitación con cálculo de refuerzo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Patient select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Seleccionar Paciente *
              </label>
              <select
                id="select-vaccine-pet"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white"
              >
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} • {p.breed}) — Tutor: {p.owner.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Plantilla / Vacuna Frecuente
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 bg-teal-50/50 border border-teal-200 rounded-xl text-xs font-semibold text-teal-900 focus:bg-white"
              >
                {COMMON_VACCINES.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Name & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nombre del Biológico *
                </label>
                <input
                  type="text"
                  required
                  value={vaccineName}
                  onChange={(e) => setVaccineName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tipo de Inmunización
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  <option value="vacuna">Vacuna Inmunológica</option>
                  <option value="desparasitante_interno">Desparasitante Interno</option>
                  <option value="desparasitante_externo">Desparasitante Externo / Pipeta</option>
                </select>
              </div>
            </div>

            {/* Dates: Application & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fecha de Aplicación *
                </label>
                <input
                  type="date"
                  required
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Próximo Refuerzo (Vencimiento) *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-teal-800"
                />
              </div>
            </div>

            {/* Lot & Vet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Lote / Serie
                </label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  placeholder="Ej. LOT-8491A"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Veterinario Aplicador
                </label>
                <input
                  type="text"
                  value={veterinarianName}
                  onChange={(e) => setVeterinarianName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observaciones Clínicas / Reacciones
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sin reacciones secundarias inmediatas, tolera bien..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-vaccine-record"
                className="px-5 py-2.5 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
              >
                Registrar en Carnet
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
