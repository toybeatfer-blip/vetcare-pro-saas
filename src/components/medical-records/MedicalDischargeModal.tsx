import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Send,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Pill,
  FileText,
  AlertTriangle,
  Stethoscope,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Pet, MedicalDischargeSummary, DischargeType, Prescription } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';

interface MedicalDischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet | null;
  initialDiagnosis?: string;
  initialProcedure?: string;
  initialPrescriptions?: Prescription[];
  onDischargeSuccess?: (discharge: MedicalDischargeSummary) => void;
}

export const MedicalDischargeModal: React.FC<MedicalDischargeModalProps> = ({
  isOpen,
  onClose,
  pet,
  initialDiagnosis = '',
  initialProcedure = '',
  initialPrescriptions = [],
  onDischargeSuccess,
}) => {
  const { clinicSettings, currentUser, createDischargeSummary, showToast } = useVeterinary();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !pet) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const currentTimeStr = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

  const [dischargeStatus, setDischargeStatus] = useState<DischargeType>('Alta Médica Definitiva');
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis || 'Recuperación favorable post-tratamiento');
  const [procedurePerformed, setProcedurePerformed] = useState(initialProcedure || 'Consulta y estabilización clínica');
  const [homeCareInstructions, setHomeCareInstructions] = useState(
    'Reposo relativo en casa por 48 horas. Mantener hidratación continua y administrar la medicación prescrita según los horarios indicados. Evitar saltos y ejercicios bruscos.'
  );
  const [alarmSigns, setAlarmSigns] = useState(
    'Acudir de urgencia en caso de vómitos recurrentes, letargia profunda, dificultad respiratoria o sangrado inusual.'
  );
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [dischargeDate, setDischargeDate] = useState(todayStr);
  const [dischargeTime, setDischargeTime] = useState(currentTimeStr);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    initialPrescriptions.length > 0
      ? initialPrescriptions
      : [
          {
            id: `rx-${Date.now()}`,
            medication: 'Amoxicilina + Ácido Clavulánico 250mg',
            dose: '1/2 tableta',
            frequency: 'Cada 12 horas',
            duration: '7 días',
            instructions: 'Administrar vía oral con alimento',
            isActive: true,
            startDate: todayStr,
          },
        ]
  );
  const [notes, setNotes] = useState('');

  const quickCarePresets = [
    {
      label: 'Reposo + Collar Isabelino',
      text: 'Uso obligatorio de collar isabelino 24/7 para evitar lamido de la herida. Reposo en área limpia y seca.',
    },
    {
      label: 'Dieta Blanda Gastrointestinal',
      text: 'Ofrecer dieta blanda de fácil digestión en porciones pequeñas y frecuentes (4 a 5 veces al día) con agua fresca a libre acceso.',
    },
    {
      label: 'Curación de Herida Quirúrgica',
      text: 'Limpieza de la herida 2 veces al día con solución antiséptica (clorhexidina o microdacyn). Mantener seca y vigilar ausencia de enrojecimiento.',
    },
    {
      label: 'Retiro de Puntos en 10 días',
      text: 'Acudir a control clínico en 10 días hábiles para evaluación de cicatrización y retiro de material de sutura.',
    },
  ];

  const handleAddPrescription = () => {
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      medication: '',
      dose: '',
      frequency: 'Cada 24 horas',
      duration: '5 días',
      instructions: '',
      isActive: true,
      startDate: dischargeDate,
    };
    setPrescriptions([...prescriptions, newRx]);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((r) => r.id !== id));
  };

  const handleUpdatePrescription = (id: string, field: keyof Prescription, val: any) => {
    setPrescriptions(prescriptions.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const handleSaveDischarge = (notifyWhatsApp = false) => {
    if (!diagnosis.trim()) {
      showToast('Por favor escribe el diagnóstico de alta médica.', 'warning');
      return;
    }

    const dischargeData: Omit<MedicalDischargeSummary, 'id' | 'createdAt'> = {
      petId: pet.id,
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      ownerName: pet.owner?.name || 'Tutor de Mascota',
      ownerPhone: pet.owner?.phone || '',
      ownerEmail: pet.owner?.email || '',
      dischargeDate,
      dischargeTime,
      diagnosis: diagnosis.trim(),
      procedurePerformed: procedurePerformed.trim(),
      dischargeStatus,
      homeCareInstructions: homeCareInstructions.trim(),
      alarmSigns: alarmSigns.trim(),
      prescriptions: prescriptions.filter((r) => r.medication.trim() !== ''),
      nextFollowUpDate: nextFollowUpDate || undefined,
      veterinarianName: clinicSettings.directorName || currentUser?.name || 'Médico Veterinario',
      veterinarianLicense: clinicSettings.directorLicense || undefined,
      notes: notes.trim() || undefined,
    };

    const created = createDischargeSummary(dischargeData);
    if (created) {
      if (notifyWhatsApp) {
        handleWhatsAppDischarge(created);
      }
      if (onDischargeSuccess) {
        onDischargeSuccess(created);
      }
      onClose();
    }
  };

  const handleWhatsAppDischarge = (disch?: MedicalDischargeSummary) => {
    const target = disch || {
      petName: pet.name,
      species: pet.species,
      ownerName: pet.owner?.name || 'Tutor',
      ownerPhone: pet.owner?.phone || '',
      dischargeDate,
      dischargeStatus,
      diagnosis,
      procedurePerformed,
      homeCareInstructions,
      alarmSigns,
      nextFollowUpDate,
      prescriptions,
    };

    const phoneClean = (target.ownerPhone || '').replace(/\D/g, '');
    if (!phoneClean) {
      showToast('El tutor no tiene un teléfono registrado para WhatsApp.', 'warning');
      return;
    }

    const clinic = clinicSettings.name || 'VetCare Pro';
    let msg = `📋 *HOJA DE ALTA MÉDICA Y RESUMEN DE EGRESO*\n🏥 *${clinic}*\n\n` +
      `Estimado(a) *${target.ownerName}*,\n` +
      `Te compartimos la constancia de *ALTA MÉDICA* para tu mascota *${target.petName}* (${target.species}).\n\n` +
      `✅ *Estado de Egreso:* ${target.dischargeStatus}\n` +
      `📅 *Fecha de Alta:* ${target.dischargeDate}\n` +
      `🩺 *Diagnóstico:* ${target.diagnosis}\n`;

    if (target.procedurePerformed) {
      msg += `💉 *Procedimiento:* ${target.procedurePerformed}\n`;
    }

    if (target.homeCareInstructions) {
      msg += `\n🏠 *CUIDADOS Y REPOSO EN CASA:*\n${target.homeCareInstructions}\n`;
    }

    if (target.prescriptions && target.prescriptions.length > 0) {
      msg += `\n💊 *MEDICACIÓN PRESCRITA EN CASA:*\n`;
      target.prescriptions.forEach((rx, idx) => {
        if (rx.medication) {
          msg += ` ${idx + 1}. *${rx.medication}* - ${rx.dose} | ${rx.frequency} por ${rx.duration}\n    _${rx.instructions || 'Vía oral' }_\n`;
        }
      });
    }

    if (target.alarmSigns) {
      msg += `\n⚠️ *SIGNOS DE ALARMA:* ${target.alarmSigns}\n`;
    }

    if (target.nextFollowUpDate) {
      msg += `\n📅 *Próxima Cita de Control:* ${target.nextFollowUpDate}\n`;
    }

    if (clinicSettings.phone) msg += `\n📞 *Contacto Clínica:* ${clinicSettings.phone}`;
    if (clinicSettings.emergencyPhone) msg += `\n🚨 *Urgencias 24h:* ${clinicSettings.emergencyPhone}`;
    msg += `\n\n¡Le deseamos una pronta y completa recuperación a ${target.petName}! 🐾❤️`;

    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 my-6 print:border-none print:shadow-none print:m-0 print:max-w-none"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 p-6 text-white relative print:hidden">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Dar de Alta Médica al Paciente</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-white/20 rounded-full">Egreso Clínico</span>
                </h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Emisión de constancia de alta, indicaciones de cuidado en casa y receta ambulatoria
                </p>
              </div>
            </div>
          </div>

          {/* Printable Sheet Form */}
          <div ref={printRef} className="p-6 space-y-5 print:p-8">
            {/* Printable Clinic Header */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900">{clinicSettings.name || 'VetCare Pro'}</h1>
                <p className="text-xs text-slate-600 font-medium">{clinicSettings.slogan || 'Servicios Veterinarios Integrales'}</p>
                <p className="text-[11px] text-slate-500">{clinicSettings.address || ''} • Tel: {clinicSettings.phone || ''}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-800 uppercase block">Hoja de Alta Médica</span>
                <span className="text-xs font-bold text-slate-700">Fecha: {dischargeDate} @ {dischargeTime}</span>
              </div>
            </div>

            {/* Patient & Tutor Info Banner */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-base shrink-0">
                  🐾
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">{pet.name}</span>
                    <span className="text-slate-600 font-bold">({pet.species} • {pet.breed || 'Mestizo'})</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Tutor: <strong>{pet.owner?.name}</strong> • Tel: <strong>{pet.owner?.phone}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Condición de Alta</label>
                  <select
                    value={dischargeStatus}
                    onChange={(e) => setDischargeStatus(e.target.value as DischargeType)}
                    className="px-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
                  >
                    <option value="Alta Médica Definitiva">🟢 Alta Médica Definitiva</option>
                    <option value="Alta Ambulatoria con Tratamiento">🟡 Alta Ambulatoria con Tratamiento</option>
                    <option value="Alta Post-Quirúrgica">🟣 Alta Post-Quirúrgica</option>
                    <option value="Alta por Mejoría Clínica">🔵 Alta por Mejoría Clínica</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Diagnosis & Procedure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                  Diagnóstico de Egreso *
                </label>
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Ej: Gastroenteritis aguda resuelta, paciente afebril y normohidratado."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Procedimiento o Tratamiento Realizado
                </label>
                <textarea
                  rows={2}
                  value={procedurePerformed}
                  onChange={(e) => setProcedurePerformed(e.target.value)}
                  placeholder="Ej: Fluidoterapia IV, antibioterapia, profilaxis y estabilización."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
                />
              </div>
            </div>

            {/* Home Care Instructions & Quick Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Indicaciones y Cuidados de Reposo en Casa *
                </label>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap print:hidden">
                <span className="text-[11px] text-slate-400 font-medium">Insertar sugerencia:</span>
                {quickCarePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setHomeCareInstructions((prev) => (prev ? `${prev} ${preset.text}` : preset.text))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={homeCareInstructions}
                onChange={(e) => setHomeCareInstructions(e.target.value)}
                placeholder="Detalla las instrucciones de cuidado, reposo, dieta, higiene de heridas..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden resize-none"
              />
            </div>

            {/* Medications for Home (Prescriptions) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Medicación Prescrita para el Hogar
                </h3>
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors print:hidden cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Medicamento</span>
                </button>
              </div>

              <div className="space-y-2">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Medicamento</label>
                      <input
                        type="text"
                        value={rx.medication}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'medication', e.target.value)}
                        placeholder="Nombre comercial / genérico"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Dosis</label>
                      <input
                        type="text"
                        value={rx.dose}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'dose', e.target.value)}
                        placeholder="Ej: 1 tableta"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Frecuencia</label>
                      <input
                        type="text"
                        value={rx.frequency}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'frequency', e.target.value)}
                        placeholder="Ej: Cada 12 horas"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Duración</label>
                      <input
                        type="text"
                        value={rx.duration}
                        onChange={(e) => handleUpdatePrescription(rx.id, 'duration', e.target.value)}
                        placeholder="Ej: 7 días"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end print:hidden">
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(rx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alarm Signs & Next Follow-Up */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Signos de Alarma para Acudir de Urgencia
                </label>
                <textarea
                  rows={2}
                  value={alarmSigns}
                  onChange={(e) => setAlarmSigns(e.target.value)}
                  placeholder="Signos de alarma que ameritan consulta inmediata..."
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs text-rose-950 font-medium focus:bg-white focus:ring-2 focus:ring-rose-400 outline-hidden resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Próxima Cita de Control o Retiro de Puntos (Opcional)
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-400">
                  Deja vacío si el alta médica no requiere cita de seguimiento.
                </p>
              </div>
            </div>

            {/* Printable Medical Signature block */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-10 border-t border-slate-300 mt-8 text-center text-xs">
              <div>
                <div className="border-t border-slate-400 w-48 mx-auto mb-1 pt-1 font-bold text-slate-800">
                  {clinicSettings.directorName || currentUser?.name || 'Médico Veterinario Responsable'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Cédula: {clinicSettings.directorLicense || 'Reg. Sanitario'} • MVZ
                </div>
              </div>

              <div>
                <div className="border-t border-slate-400 w-48 mx-auto mb-1 pt-1 font-bold text-slate-800">
                  {pet.owner?.name || 'Tutor de la Mascota'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Firma de conformidad de alta médica recibida
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Imprimir Hoja de Alta Médica oficial"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Imprimir Hoja</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveDischarge(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Guardar alta médica y abrir WhatsApp con la hoja de egreso para el tutor"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Alta y WhatsApp</span>
              </button>

              <button
                type="button"
                id="btn-confirm-discharge"
                onClick={() => handleSaveDischarge(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Alta Médica</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
