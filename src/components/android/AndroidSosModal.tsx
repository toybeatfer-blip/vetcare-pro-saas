import React from 'react';
import {
  X,
  PhoneCall,
  Navigation,
  AlertTriangle,
  HeartPulse,
  Clock,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';

interface AndroidSosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidSosModal: React.FC<AndroidSosModalProps> = ({ isOpen, onClose }) => {
  const { clinicSettings } = useVeterinary();

  if (!isOpen) return null;

  const phoneCallUrl = `tel:${clinicSettings.emergencyPhone.replace(/\s+/g, '')}`;
  const mapsQuery = encodeURIComponent(`${clinicSettings.name} ${clinicSettings.address}`);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 120 }}
          className="bg-slate-900 text-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden border border-rose-500/30 shadow-2xl"
        >
          {/* Header Emergency Banner */}
          <div className="p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Línea de Urgencia 24 Horas</h3>
                <p className="text-[11px] text-rose-100">{clinicSettings.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Direct Call Button */}
            <a
              href={phoneCallUrl}
              className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 transition-transform active:scale-98"
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>Llamar Ahora ({clinicSettings.emergencyPhone})</span>
            </a>

            {/* GPS Navigation */}
            <a
              href={`https://maps.google.com/?q=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4 text-indigo-400" />
              <span>Abrir GPS en Google Maps (Cómo Llegar)</span>
            </a>

            {/* Clinic Address & Hours */}
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-1.5 text-slate-300">
              <div className="flex items-center gap-2 text-white font-bold">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Ubicación de Urgencias:</span>
              </div>
              <p className="text-[11px] pl-6 text-slate-400">
                {clinicSettings.address}
              </p>
              <div className="flex items-center gap-2 text-[11px] pl-6 text-emerald-400 font-semibold pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Horario Urgencias: {clinicSettings.emergencyHours || 'Servicio continuo 24/7'}</span>
              </div>
            </div>

            {/* First-Aid Emergency Guidelines */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Primeros Auxilios Rápidos
              </h4>

              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="p-2.5 bg-slate-800 rounded-xl border border-white/5">
                  <strong className="text-rose-300 block mb-0.5">• Sospecha de intoxicación / veneno:</strong>
                  No induzcas el vómito sin consultar al veterinario. Lleva contigo el envase o restos de la sustancia.
                </div>

                <div className="p-2.5 bg-slate-800 rounded-xl border border-white/5">
                  <strong className="text-amber-300 block mb-0.5">• Golpe de calor / Dificultad respiratoria:</strong>
                  Coloca toallas húmedas templadas (no heladas) en patas e ingle. Enciende el aire acondicionado del auto.
                </div>

                <div className="p-2.5 bg-slate-800 rounded-xl border border-white/5">
                  <strong className="text-indigo-300 block mb-0.5">• Traumatismo o herida sangrante:</strong>
                  Aplica presión suave con una gasa o paño limpio y traslada a tu mascota sobre una superficie rígida o manta.
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
            >
              Cerrar Panel de Emergencia
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
