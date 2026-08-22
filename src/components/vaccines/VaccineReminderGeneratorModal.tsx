import React, { useState, useEffect } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Pet, VaccineRecord } from '../../types';
import { X, Send, Sparkles, Phone, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateVaccineReminderMessage } from '../../services/geminiService';

interface VaccineReminderGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaccine: VaccineRecord | null;
  pet: Pet | null;
}

export const VaccineReminderGeneratorModal: React.FC<VaccineReminderGeneratorModalProps> = ({
  isOpen,
  onClose,
  vaccine,
  pet,
}) => {
  const { sendVaccineReminder, showToast, clinicSettings } = useVeterinary();
  const [channel, setChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [tone, setTone] = useState<'cordial' | 'urgente' | 'cariñoso'>('cariñoso');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && pet && vaccine) {
      handleGenerate();
    }
  }, [isOpen, pet, vaccine, tone]);

  if (!isOpen || !vaccine || !pet) return null;

  const isOverdue = vaccine.status === 'vencida';

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const prompt = `Escribe un mensaje recordatorio ${tone} de vacunación/desparasitación para enviar por ${channel}.
Mascota: ${pet.name} (${pet.species})
Tutor: ${pet.owner.name}
Vacuna/Tratamiento: ${vaccine.vaccineName}
Fecha límite/refuerzo: ${vaccine.dueDate}
Estado: ${isOverdue ? 'Vencida (requiere refuerzo urgente)' : 'Próxima a vencer'}
Clínica: ${clinicSettings.name || 'Clínica Veterinaria'} (Tel: ${clinicSettings.phone || ''})`;

      const text = await generateVaccineReminderMessage(pet, vaccine, channel);
      setMessage(text);
    } catch (e) {
      setMessage(`¡Hola ${pet.owner.name}! Te escribimos de ${clinicSettings.name || 'tu veterinaria'} para recordarte que a ${pet.name} le corresponde su refuerzo de ${vaccine.vaccineName} el ${vaccine.dueDate}. ¡Agenda su cita para mantenerlo protegido!`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    showToast('Mensaje copiado al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    sendVaccineReminder(pet.id, vaccine.id, 'WhatsApp');
    const cleanPhone = pet.owner.phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    onClose();
  };

  const handleSendEmail = () => {
    sendVaccineReminder(pet.id, vaccine.id, 'Email');
    const subject = encodeURIComponent(`Recordatorio de Vacunación para ${pet.name} - ${clinicSettings.name || 'Clínica Veterinaria'}`);
    const body = encodeURIComponent(message);
    window.open(`mailto:${pet.owner.email}?subject=${subject}&body=${body}`, '_blank');
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
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Redactor de Recordatorio con IA</h2>
                <p className="text-xs text-slate-500">
                  Notificación para {pet.owner.name} sobre {pet.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Canal de Envío
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('WhatsApp')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      channel === 'WhatsApp'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('Email')}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      channel === 'Email'
                        ? 'bg-teal-50 text-teal-800 border-teal-300 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tono del Mensaje
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="cariñoso">Cariñoso & Empático</option>
                  <option value="cordial">Cordial & Profesional</option>
                  <option value="urgente">Alerta / Importante</option>
                </select>
              </div>
            </div>

            {/* AI Generated Message box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Mensaje Personalizado Generado
                </label>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Generando...' : 'Regenerar'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                />
              </div>
            </div>

            {/* Recipient Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
              <span className="text-slate-500">Destinatario:</span>
              <strong className="text-slate-800">
                {pet.owner.name} ({channel === 'WhatsApp' ? pet.owner.phone : pet.owner.email})
              </strong>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>

                {channel === 'WhatsApp' ? (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar por WhatsApp</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar por Email</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
