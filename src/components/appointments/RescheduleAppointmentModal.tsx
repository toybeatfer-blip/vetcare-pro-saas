import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  Send,
  User,
  Phone,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import { Appointment } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';

interface RescheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { rescheduleAppointment, clinicSettings, showToast } = useVeterinary();

  if (!isOpen || !appointment) return null;

  const [newDate, setNewDate] = useState(appointment.date);
  const [newTime, setNewTime] = useState(appointment.time);
  const [notes, setNotes] = useState(appointment.notes || '');

  const quickSlots = ['09:00', '10:00', '11:30', '13:00', '15:00', '16:30', '18:00', '19:30'];

  const setOffsetDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNewDate(d.toISOString().split('T')[0]);
  };

  const handleSave = (notifyWhatsApp = false) => {
    if (!newDate || !newTime) {
      showToast('Por favor selecciona una fecha y un horario válido.', 'warning');
      return;
    }

    const success = rescheduleAppointment(appointment.id, newDate, newTime, notes);
    if (success) {
      if (notifyWhatsApp) {
        handleWhatsAppNotification();
      }
      onClose();
    }
  };

  const handleWhatsAppNotification = () => {
    const phoneClean = (appointment.ownerPhone || '').replace(/\D/g, '');
    if (!phoneClean) {
      showToast('El tutor no tiene registrado un número telefónico válido.', 'warning');
      return;
    }

    const formattedDate = new Date(newDate + 'T00:00:00').toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const clinic = clinicSettings.name || 'VetCare Pro';
    const message = `🐾 *REPROGRAMACIÓN DE CITA VETERINARIA*\n🏥 *${clinic}*\n\nEstimado(a) *${appointment.ownerName}*,\nTe informamos que la cita médica para *${appointment.petName}* (${appointment.species}) ha sido reagendada con éxito.\n\n📅 *Nueva Fecha:* ${formattedDate}\n⏰ *Nuevo Horario:* ${newTime} hrs\n🩺 *Motivo:* ${appointment.reason}\n${notes ? `📝 *Nota:* ${notes}\n` : ''}${clinicSettings.phone ? `📞 *Teléfono:* ${clinicSettings.phone}\n` : ''}${clinicSettings.address ? `📍 *Dirección:* ${clinicSettings.address}\n` : ''}\n¡Te esperamos puntual! Si requieres algún cambio adicional, avísanos con anticipación. 🐶🐱`;

    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-6"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-900 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <CalendarClock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Reagendar / Cambio de Horario</h2>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Modifica la fecha, hora y notifica al tutor en 1 clic
                </p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            {/* Appointment Summary Box */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{appointment.petName}</span>
                  <span className="text-slate-500 font-medium">({appointment.species})</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {appointment.ownerName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {appointment.ownerPhone}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Cita Actual</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 inline-block mt-0.5">
                  {appointment.date} @ {appointment.time}
                </span>
              </div>
            </div>

            {/* Date Picker & Quick Shortcuts */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Nueva Fecha de Consulta *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                />
              </div>

              {/* Quick Date Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Atajos:</span>
                <button
                  type="button"
                  onClick={() => setOffsetDate(0)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetDate(1)}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mañana (+1d)
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetDate(2)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  En 2 días (+2d)
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetDate(7)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  En 1 semana (+7d)
                </button>
              </div>
            </div>

            {/* Time Picker & Quick Time Slots */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Nuevo Horario *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                />
              </div>

              {/* Quick Time Slots */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {quickSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setNewTime(slot)}
                    className={`py-1.5 text-xs font-bold rounded-xl transition-all border ${
                      newTime === slot
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Reason for change */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Motivo del Cambio o Notas Adicionales
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Reprogramado a solicitud del tutor por viaje familiar."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden resize-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Guardar cambio y abrir WhatsApp con la confirmación para el tutor"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Guardar y WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Cambio</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
