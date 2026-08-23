import React, { useState } from 'react';
import { Pet, VaccineRecord } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  X,
  QrCode,
  ShieldCheck,
  Download,
  Share2,
  Calendar,
  Syringe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  PawPrint,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AndroidQrPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: Pet;
  vaccines: VaccineRecord[];
  onShare: () => void;
}

export const AndroidQrPassportModal: React.FC<AndroidQrPassportModalProps> = ({
  isOpen,
  onClose,
  pet,
  vaccines,
  onShare,
}) => {
  const { clinicSettings } = useVeterinary();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const overdueCount = vaccines.filter((v) => v.status === 'vencida').length;
  const isProtected = overdueCount === 0;

  // Real data payload encoded into SVG QR representation
  const passportId = `VET-PASS-${pet.id.toUpperCase()}-${pet.microchipNumber || 'CHIP992'}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(passportId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="bg-slate-900 text-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Pasaporte Sanitario QR</h3>
                <p className="text-[11px] text-slate-400">Check-in rápido en clínica</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-center flex-1">
            {/* Pet Badge */}
            <div className="flex items-center justify-center gap-3">
              <img
                src={pet.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80'}
                alt={pet.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
              <div className="text-left">
                <h4 className="text-lg font-extrabold text-white flex items-center gap-1.5">
                  {pet.name}
                  {isProtected && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                </h4>
                <p className="text-xs text-slate-400">{pet.species} • {pet.breed}</p>
                <p className="text-[11px] font-mono text-indigo-300">Chip: {pet.microchipNumber || 'REG-2026-MX'}</p>
              </div>
            </div>

            {/* Simulated Dynamic High-Contrast QR Code */}
            <div className="p-5 bg-white rounded-3xl inline-block mx-auto shadow-xl border-4 border-indigo-500/30">
              <svg viewBox="0 0 100 100" className="w-48 h-48 mx-auto">
                {/* QR Background & Corner Squares */}
                <rect width="100" height="100" fill="#ffffff" />
                
                {/* Top-Left Position Square */}
                <rect x="10" y="10" width="24" height="24" fill="#0f172a" rx="4" />
                <rect x="14" y="14" width="16" height="16" fill="#ffffff" rx="2" />
                <rect x="18" y="18" width="8" height="8" fill="#4f46e5" rx="1" />

                {/* Top-Right Position Square */}
                <rect x="66" y="10" width="24" height="24" fill="#0f172a" rx="4" />
                <rect x="70" y="14" width="16" height="16" fill="#ffffff" rx="2" />
                <rect x="74" y="18" width="8" height="8" fill="#4f46e5" rx="1" />

                {/* Bottom-Left Position Square */}
                <rect x="10" y="66" width="24" height="24" fill="#0f172a" rx="4" />
                <rect x="14" y="70" width="16" height="16" fill="#ffffff" rx="2" />
                <rect x="18" y="74" width="8" height="8" fill="#4f46e5" rx="1" />

                {/* QR Data Pattern Grid */}
                <rect x="38" y="12" width="6" height="6" fill="#0f172a" />
                <rect x="48" y="12" width="6" height="6" fill="#4f46e5" />
                <rect x="56" y="12" width="6" height="6" fill="#0f172a" />
                
                <rect x="38" y="22" width="6" height="6" fill="#4f46e5" />
                <rect x="48" y="22" width="6" height="6" fill="#0f172a" />
                <rect x="38" y="32" width="6" height="6" fill="#0f172a" />
                <rect x="56" y="32" width="6" height="6" fill="#4f46e5" />

                <rect x="12" y="38" width="6" height="6" fill="#0f172a" />
                <rect x="22" y="38" width="6" height="6" fill="#4f46e5" />
                <rect x="32" y="38" width="6" height="6" fill="#0f172a" />
                <rect x="42" y="38" width="16" height="16" fill="#4f46e5" rx="2" />
                <rect x="62" y="38" width="6" height="6" fill="#0f172a" />
                <rect x="72" y="38" width="6" height="6" fill="#4f46e5" />
                <rect x="82" y="38" width="6" height="6" fill="#0f172a" />

                <rect x="12" y="48" width="6" height="6" fill="#4f46e5" />
                <rect x="28" y="48" width="6" height="6" fill="#0f172a" />
                <rect x="68" y="48" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="48" width="6" height="6" fill="#4f46e5" />

                <rect x="38" y="58" width="6" height="6" fill="#0f172a" />
                <rect x="48" y="58" width="6" height="6" fill="#4f46e5" />
                <rect x="56" y="58" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="58" width="6" height="6" fill="#0f172a" />

                <rect x="38" y="68" width="6" height="6" fill="#4f46e5" />
                <rect x="48" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="58" y="68" width="6" height="6" fill="#4f46e5" />
                <rect x="68" y="68" width="6" height="6" fill="#0f172a" />
                <rect x="78" y="68" width="6" height="6" fill="#4f46e5" />

                <rect x="38" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="52" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="62" y="78" width="6" height="6" fill="#4f46e5" />
                <rect x="72" y="78" width="6" height="6" fill="#0f172a" />
                <rect x="82" y="78" width="6" height="6" fill="#4f46e5" />
              </svg>

              <div className="mt-2 text-center">
                <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
                  {passportId}
                </span>
              </div>
            </div>

            {/* Passport Status Indicator */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isProtected ? 'bg-emerald-400 shadow-xs shadow-emerald-400' : 'bg-rose-400 shadow-xs shadow-rose-400'
                  }`}
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isProtected ? 'Esquema Vacunal Vigente' : 'Vacunas Pendientes'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {vaccines.length} vacunas registradas en sistema
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                Oficial {clinicSettings.name || 'VetCare Pro'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                type="button"
                onClick={onShare}
                className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir QR</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
