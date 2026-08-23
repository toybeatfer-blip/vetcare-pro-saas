import React from 'react';
import { MedicalRecord, Pet } from '../../types';
import { Stethoscope, Printer, X, ShieldCheck, Heart, Send, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';

interface PrintableMedicalSheetProps {
  isOpen: boolean;
  record: MedicalRecord | null;
  pet: Pet | null;
  onClose: () => void;
}

export const PrintableMedicalSheet: React.FC<PrintableMedicalSheetProps> = ({
  isOpen,
  record,
  pet,
  onClose,
}) => {
  const { clinicSettings, showToast } = useVeterinary();

  if (!isOpen || !record || !pet) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsAppPrescription = () => {
    const cleanPhone = pet.owner.phone.replace(/[^0-9]/g, '');
    let msg = `🐾 *RECETA MÉDICA - ${clinicSettings.name || 'Clínica Veterinaria'}*\n`;
    msg += `Paciente: *${pet.name}* (${pet.species} - ${pet.breed})\n`;
    msg += `Tutor: *${pet.owner.name}*\n`;
    msg += `Fecha: ${record.date} • Médico: ${record.veterinarianName || clinicSettings.directorName}\n`;
    msg += `Diagnóstico: *${record.diagnosis}*\n\n`;

    if (record.prescriptions && record.prescriptions.length > 0) {
      msg += `📋 *Tratamiento Prescrito:*\n`;
      record.prescriptions.forEach((p, idx) => {
        msg += `${idx + 1}. *${p.medication}*: ${p.dose} - ${p.frequency} (${p.duration})\n`;
      });
      msg += `\n`;
    }

    if (record.treatmentPlan) {
      msg += `📌 *Indicaciones Generales:*\n${record.treatmentPlan}\n\n`;
    }

    if (record.nextFollowUpDate) {
      msg += `📅 *Próxima Cita de Control:* ${record.nextFollowUpDate}\n\n`;
    }

    msg += `📞 Urgencias y Consultas: ${clinicSettings.phone}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    showToast(`Receta enviada por WhatsApp a ${pet.owner.name}`);
  };

  const handleSendEmailPrescription = () => {
    if (!pet.owner.email) {
      showToast('El tutor no tiene correo electrónico registrado', 'info');
      return;
    }
    const subject = encodeURIComponent(`Receta Médica e Indicaciones para ${pet.name} - ${clinicSettings.name || 'Clínica Veterinaria'}`);
    let body = `Estimado/a ${pet.owner.name},\n\nAdjuntamos el resumen médico y receta emitida en ${clinicSettings.name || 'nuestra clínica'}:\n\n`;
    body += `Paciente: ${pet.name} (${pet.species})\nFecha: ${record.date}\nDiagnóstico: ${record.diagnosis}\n\n`;
    if (record.prescriptions && record.prescriptions.length > 0) {
      body += `TRATAMIENTO PRESCRITO:\n`;
      record.prescriptions.forEach((p, idx) => {
        body += `${idx + 1}. ${p.medication} - Dosis: ${p.dose}, Frecuencia: ${p.frequency}, Duración: ${p.duration}\n`;
      });
      body += `\n`;
    }
    if (record.treatmentPlan) {
      body += `INDICACIONES:\n${record.treatmentPlan}\n\n`;
    }
    body += `Atentamente,\n${record.veterinarianName || clinicSettings.directorName}\n${clinicSettings.name}\nTel: ${clinicSettings.phone}`;
    window.open(`mailto:${pet.owner.email}?subject=${subject}&body=${encodeURIComponent(body)}`, '_blank');
    showToast(`Correo de receta abierto para ${pet.owner.email}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 border border-slate-200 my-6 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none text-slate-800 font-sans"
        >
          {/* Action Bar (Hidden on print) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200 print:hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Vista Previa de Receta & Ficha Médica
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSendWhatsAppPrescription}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Enviar receta por WhatsApp al tutor"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar WhatsApp</span>
              </button>
              {pet.owner.email && (
                <button
                  type="button"
                  onClick={handleSendEmailPrescription}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                  title="Enviar receta por correo al tutor"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Enviar Email</span>
                </button>
              )}
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Documento</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Document Content */}
          <div className="space-y-6 pt-4">
            {/* Clinic Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                {clinicSettings.logoUrl ? (
                  <img
                    src={clinicSettings.logoUrl}
                    alt={clinicSettings.name}
                    className="w-14 h-14 rounded-xl object-contain border border-slate-300 p-0.5 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-center font-black text-xl shadow-xs border border-indigo-300">
                    <div className="relative flex items-center justify-center">
                      <span className="font-black text-sm tracking-tight font-mono uppercase">
                        {clinicSettings.logoText || (clinicSettings.name ? clinicSettings.name.substring(0, 3).toUpperCase() : 'VET')}
                      </span>
                      <span className="absolute -top-2 -right-2.5 text-[10px]">
                        {clinicSettings.logoEmoji || '🐾'}
                      </span>
                    </div>
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {clinicSettings.name}
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">{clinicSettings.slogan}</p>
                  <p className="text-[10px] text-slate-400">{clinicSettings.address}</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p className="font-bold text-slate-800">Ficha Clínica Nº #{record.id.slice(-6).toUpperCase()}</p>
                <p>Fecha: {record.date} • {record.time} hrs</p>
                <p>Tel: {clinicSettings.phone} • {clinicSettings.email}</p>
                <p className="text-[10px] text-slate-400">RFC: {clinicSettings.taxId}</p>
              </div>
            </div>

            {/* Patient & Owner Box */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-teal-800 uppercase block text-[10px]">Datos del Paciente</span>
                <p><strong className="text-slate-900">Nombre:</strong> {pet.name} ({pet.species} - {pet.breed})</p>
                <p><strong className="text-slate-900">Sexo / Estado:</strong> {pet.gender} • {pet.isNeutered ? 'Castrado' : 'Entero'}</p>
                <p><strong className="text-slate-900">Edad:</strong> {pet.ageDisplay} • <strong className="text-slate-900">Peso:</strong> {record.vitalSigns.weightKg} kg</p>
                <p><strong className="text-slate-900">Microchip:</strong> {pet.microchipNumber || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-teal-800 uppercase block text-[10px]">Datos del Tutor</span>
                <p><strong className="text-slate-900">Tutor:</strong> {pet.owner.name}</p>
                <p><strong className="text-slate-900">Teléfono:</strong> {pet.owner.phone}</p>
                <p><strong className="text-slate-900">Dirección:</strong> {pet.owner.address}</p>
                <p><strong className="text-slate-900">Doc. ID:</strong> {pet.owner.documentId}</p>
              </div>
            </div>

            {/* Vital Signs Table */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Constantes Fisiológicas Evaluadas
              </span>
              <div className="grid grid-cols-5 gap-2 p-3 bg-white border border-slate-200 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Temperatura</span>
                  <strong className="text-slate-800">{record.vitalSigns.temperatureC} °C</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Frec. Cardíaca</span>
                  <strong className="text-slate-800">{record.vitalSigns.heartRateBpm} lpm</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Frec. Resp.</span>
                  <strong className="text-slate-800">{record.vitalSigns.respRateBpm} rpm</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Cond. Corporal</span>
                  <strong className="text-slate-800">{record.vitalSigns.bodyConditionScore}/5</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Mucosas</span>
                  <strong className="text-slate-800">{record.vitalSigns.mucosaColor}</strong>
                </div>
              </div>
            </div>

            {/* Diagnosis & Treatment */}
            <div className="space-y-3 text-xs">
              <div>
                <strong className="text-slate-900 block font-bold mb-0.5">Motivo & Anamnesis:</strong>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">{record.anamnesis}</p>
              </div>

              <div>
                <strong className="text-teal-900 block font-bold mb-0.5">Diagnóstico Clínico:</strong>
                <p className="text-slate-900 font-semibold bg-teal-50/50 p-2.5 rounded-lg border border-teal-200/80">{record.diagnosis}</p>
              </div>

              <div>
                <strong className="text-slate-900 block font-bold mb-0.5">Plan de Tratamiento & Recomendaciones:</strong>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">{record.treatmentPlan}</p>
              </div>
            </div>

            {/* Prescriptions (Receta Médica) */}
            {record.prescriptions.length > 0 && (
              <div className="space-y-2 pt-3 border-t-2 border-dashed border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4" />
                  <span>Prescripción Farmacológica / Receta Médica</span>
                </div>
                <div className="space-y-2">
                  {record.prescriptions.map((rx, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 text-sm font-bold">{idx + 1}. {rx.medication}</strong>
                        <span className="font-semibold text-teal-800">Dosis: {rx.dose}</span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        <strong>Frecuencia:</strong> {rx.frequency} • <strong>Duración:</strong> {rx.duration}
                      </p>
                      {rx.instructions && (
                        <p className="text-slate-500 italic mt-0.5 text-[11px]">
                          Instrucciones: {rx.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {clinicSettings.prescriptionFooter && (
                  <p className="text-[10px] text-slate-400 italic pt-1">
                    * {clinicSettings.prescriptionFooter}
                  </p>
                )}
              </div>
            )}

            {/* Signatures & Seal */}
            <div className="pt-8 flex items-end justify-between border-t border-slate-200 text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-700">{clinicSettings.name}</p>
                <p>Responsable Sanitario: {clinicSettings.directorName}</p>
                <p>Cédula Profesional MVZ: {clinicSettings.directorLicense}</p>
                {clinicSettings.directorSpecialty && (
                  <p className="text-[10px] text-slate-400">{clinicSettings.directorSpecialty}</p>
                )}
              </div>

              <div className="text-center w-60">
                <div className="border-b border-slate-400 pb-1 mb-1">
                  <span className="font-serif italic text-sm text-teal-900">
                    {record.veterinarianName || clinicSettings.directorName}
                  </span>
                </div>
                <p className="font-bold text-slate-800">{record.veterinarianName || clinicSettings.directorName}</p>
                <p className="text-[10px]">Firma & Sello Médico Veterinario</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
