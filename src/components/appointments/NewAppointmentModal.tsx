import React, { useState, useEffect } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { AppointmentReason, SpeciesType } from '../../types';
import { X, Calendar, Clock, User, Phone, Stethoscope, FileText, PawPrint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPetId?: string;
}

const APPOINTMENT_REASONS: AppointmentReason[] = [
  'Consulta General',
  'Vacunación',
  'Desparasitación',
  'Cirugía',
  'Control Post-quirúrgico',
  'Urgencia',
  'Estética/Peluquería',
  'Exámenes de Laboratorio',
];

const VETERINARIANS = [
  'Dra. Valeria Hernández (MVZ Esp. Traumatología)',
  'Dr. Santiago Morales (MVZ Medicina Interna)',
  'Dra. Camila Torres (MVZ Cirugía General)',
  'Aux. Canino Martín (Estética & Cuidados)',
];

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  initialPetId,
}) => {
  const { pets, addAppointment, showToast, officialInternetDate, officialInternetTime } = useVeterinary();

  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId || (pets[0]?.id || ''));
  const [date, setDate] = useState<string>(() => officialInternetDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(() => officialInternetTime || '15:00');
  const [reason, setReason] = useState<AppointmentReason>('Consulta General');
  const [veterinarianName, setVeterinarianName] = useState<string>(VETERINARIANS[0]);
  const [notes, setNotes] = useState<string>('');

  // If manual tutor/pet entry
  const [isManualPet, setIsManualPet] = useState<boolean>(false);
  const [manualPetName, setManualPetName] = useState<string>('');
  const [manualSpecies, setManualSpecies] = useState<SpeciesType>('Perro');
  const [manualOwnerName, setManualOwnerName] = useState<string>('');
  const [manualOwnerPhone, setManualOwnerPhone] = useState<string>('');

  useEffect(() => {
    if (initialPetId) {
      setSelectedPetId(initialPetId);
      setIsManualPet(false);
    } else if (pets[0]?.id) {
      setSelectedPetId(pets[0].id);
    }
    setDate(officialInternetDate || new Date().toISOString().split('T')[0]);
    if (officialInternetTime) {
      setTime(officialInternetTime);
    }
  }, [initialPetId, isOpen, pets, officialInternetDate, officialInternetTime]);

  if (!isOpen) return null;

  const currentPet = pets.find((p) => p.id === selectedPetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isManualPet) {
      if (!manualPetName.trim() || !manualOwnerName.trim() || !manualOwnerPhone.trim()) {
        showToast('Por favor completa el nombre de la mascota, tutor y teléfono.', 'warning');
        return;
      }
      addAppointment({
        petId: `temp-${Date.now()}`,
        petName: manualPetName.trim(),
        species: manualSpecies,
        ownerName: manualOwnerName.trim(),
        ownerPhone: manualOwnerPhone.trim(),
        date,
        time,
        reason,
        status: 'Confirmada',
        veterinarianName,
        notes,
      });
    } else {
      if (!currentPet) {
        showToast('Por favor selecciona un paciente registrado.', 'warning');
        return;
      }
      addAppointment({
        petId: currentPet.id,
        petName: currentPet.name,
        species: currentPet.species,
        ownerName: currentPet.owner.name,
        ownerPhone: currentPet.owner.phone,
        ownerEmail: currentPet.owner.email,
        date,
        time,
        reason,
        status: 'Confirmada',
        veterinarianName,
        notes,
      });
    }

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
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Agendar Nueva Cita</h2>
                <p className="text-xs text-slate-500">Programa una consulta, vacunación o procedimiento</p>
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
            {/* Toggle Existing vs New Patient */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsManualPet(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  !isManualPet ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paciente Registrado
              </button>
              <button
                type="button"
                onClick={() => setIsManualPet(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  isManualPet ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nuevo / Cita Rápida
              </button>
            </div>

            {!isManualPet ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seleccionar Paciente
                </label>
                <div className="relative">
                  <select
                    id="select-appointment-pet"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  >
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species}, {p.breed}) — Tutor: {p.owner.name} ({p.owner.phone})
                      </option>
                    ))}
                  </select>
                  <PawPrint className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Mascota *</label>
                  <input
                    type="text"
                    required
                    value={manualPetName}
                    onChange={(e) => setManualPetName(e.target.value)}
                    placeholder="Ej. Toby"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Especie</label>
                  <select
                    value={manualSpecies}
                    onChange={(e) => setManualSpecies(e.target.value as SpeciesType)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del Tutor *</label>
                  <input
                    type="text"
                    required
                    value={manualOwnerName}
                    onChange={(e) => setManualOwnerName(e.target.value)}
                    placeholder="Ej. Ana Martínez"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono Tutor *</label>
                  <input
                    type="tel"
                    required
                    value={manualOwnerPhone}
                    onChange={(e) => setManualOwnerPhone(e.target.value)}
                    placeholder="+52 55..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fecha
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hora
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Reason & Veterinarian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Motivo de Consulta
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as AppointmentReason)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  {APPOINTMENT_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Veterinario Asignado
                </label>
                <select
                  value={veterinarianName}
                  onChange={(e) => setVeterinarianName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                >
                  {VETERINARIANS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notas / Síntomas Previos (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones previas reportadas por el tutor..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 resize-none"
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
                id="btn-submit-appointment"
                className="px-5 py-2.5 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors"
              >
                Confirmar y Agendar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
