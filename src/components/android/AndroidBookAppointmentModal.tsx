import React, { useState } from 'react';
import { Pet, AppointmentReason } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Check,
  Sparkles,
  Phone,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AndroidBookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  onSuccess?: () => void;
}

export const AndroidBookAppointmentModal: React.FC<AndroidBookAppointmentModalProps> = ({
  isOpen,
  onClose,
  pet,
  onSuccess,
}) => {
  const { addAppointment, showToast } = useVeterinary();

  const todayStr = new Date().toISOString().split('T')[0];
  const [reason, setReason] = useState<AppointmentReason>('Consulta General');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('10:30');
  const [veterinarian, setVeterinarian] = useState('Dr. Alejandro Soto (Medicina Interna)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const reasonsList: AppointmentReason[] = [
    'Consulta General',
    'Vacunación',
    'Desparasitación',
    'Control Post-quirúrgico',
    'Estética/Peluquería',
    'Exámenes de Laboratorio',
    'Urgencia',
  ];

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:30', '12:00', '16:00', '16:30', '17:30', '18:00'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      addAppointment({
        petId: pet.id,
        petName: pet.name,
        species: pet.species,
        ownerName: pet.owner.name,
        ownerPhone: pet.owner.phone,
        ownerEmail: pet.owner.email,
        date,
        time,
        reason,
        status: 'Confirmada',
        veterinarianName: veterinarian,
        notes: notes.trim() || 'Cita solicitada desde la App Android de Tutores',
      });

      showToast(`¡Cita agendada para ${pet.name} el ${date} a las ${time}!`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast('Error al agendar cita.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="bg-slate-900 text-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Agendar Cita Veterinaria</h3>
                <p className="text-[11px] text-slate-400">Para {pet.name} ({pet.species})</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Reason Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Motivo de Consulta
              </label>
              <div className="grid grid-cols-2 gap-2">
                {reasonsList.slice(0, 6).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`p-2.5 rounded-xl text-left font-semibold text-xs border transition-all ${
                      reason === r
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time Selector */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hora
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t} hrs
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Veterinarian */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Especialista Veterinario
              </label>
              <select
                value={veterinarian}
                onChange={(e) => setVeterinarian(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Dr. Alejandro Soto (Medicina Interna)">Dr. Alejandro Soto (Medicina Interna)</option>
                <option value="Dra. Valeria Ramos (Cirugía & Tejidos)">Dra. Valeria Ramos (Cirugía & Tejidos)</option>
                <option value="Dr. Carlos Medina (Dermatología & Vacunas)">Dr. Carlos Medina (Dermatología & Vacunas)</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Observaciones o Síntomas (Opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Come menos desde ayer, requiere refuerzo de vacuna, etc."
                className="w-full px-3 py-2 bg-slate-800 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Agendar Cita</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
