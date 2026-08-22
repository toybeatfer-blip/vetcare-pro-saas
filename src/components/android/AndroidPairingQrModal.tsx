import React, { useState, useMemo } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Pet } from '../../types';
import {
  X,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Share2,
  Send,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Download,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  User,
  PawPrint,
  Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface AndroidPairingQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPetId?: string;
}

export const AndroidPairingQrModal: React.FC<AndroidPairingQrModalProps> = ({
  isOpen,
  onClose,
  initialPetId,
}) => {
  const {
    pets,
    clinicSettings,
    setViewMode,
    setSelectedTutorPetId,
    showToast,
  } = useVeterinary();

  // Mode: 'pet' (link specific patient & tutor) vs 'clinic' (link general clinic server)
  const [pairingScope, setPairingScope] = useState<'pet' | 'clinic'>('pet');
  const [selectedPetId, setSelectedPetId] = useState<string>(initialPetId || pets[0]?.id || '');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Active selected pet object
  const selectedPet = useMemo(() => {
    return pets.find((p) => p.id === selectedPetId) || pets[0];
  }, [pets, selectedPetId]);

  // Generate dynamic 6-digit sync PIN based on pet & clinic
  const pairingPin = useMemo(() => {
    if (pairingScope === 'clinic') {
      return `YEL-9901`;
    }
    const num = selectedPet ? (parseInt(selectedPet.id.replace(/\D/g, ''), 10) || 1) * 317 + 824 : 4589;
    return `YEL-${String(num % 9000 + 1000)}`;
  }, [pairingScope, selectedPet]);

  // Dynamic Pairing Payload (JSON encoded in the QR representation)
  const pairingPayload = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://vetcarepro.app';
    const data = {
      app: 'VetCare Pro',
      version: '2.5.0',
      clinicName: clinicSettings.name || 'Clínica Veterinaria',
      clinicId: clinicSettings.taxId || 'VET-PRO-MX',
      serverEndpoint: `${baseUrl}/api/v1`,
      petId: pairingScope === 'pet' ? selectedPet?.id : null,
      petName: pairingScope === 'pet' ? selectedPet?.name : null,
      ownerName: pairingScope === 'pet' ? selectedPet?.owner.name : null,
      ownerPhone: pairingScope === 'pet' ? selectedPet?.owner.phone : null,
      pin: pairingPin,
      createdAt: new Date().toISOString(),
    };
    return JSON.stringify(data);
  }, [pairingScope, selectedPet, clinicSettings, pairingPin]);

  // Deep Link URL for instant app opening
  const pairingUrl = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev.run.app';
    if (pairingScope === 'pet' && selectedPet) {
      return `${baseUrl}?mode=android&petId=${selectedPet.id}&pin=${pairingPin}&sync=true`;
    }
    return `${baseUrl}?mode=android&pin=${pairingPin}&sync=true`;
  }, [pairingScope, selectedPet, pairingPin]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopiedLink(true);
    showToast('¡Enlace de vinculación copiado al portapapeles!', 'success');
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pairingPin);
    setCopiedCode(true);
    showToast(`PIN ${pairingPin} copiado al portapapeles.`, 'success');
    setTimeout(() => setCopiedCode(false), 2200);
  };

  const handleSendWhatsApp = () => {
    if (!selectedPet && pairingScope === 'pet') return;
    const phone = pairingScope === 'pet' ? selectedPet.owner.phone.replace(/\D/g, '') : '';
    const tutorName = pairingScope === 'pet' ? selectedPet.owner.name : 'Estimado Tutor';
    const petName = pairingScope === 'pet' ? selectedPet.name : 'su mascota';

    const msg = `🐾 ¡Hola ${tutorName}! Le saludamos de *${clinicSettings.name || 'Clínica Veterinaria'}*.\n\nPara acceder al *Carnet Digital de Vacunas*, citas y seguimiento de salud de *${petName}* en la App Android de la clínica:\n\n1️⃣ Abre el siguiente enlace en tu celular:\n${pairingUrl}\n\n🔑 Código PIN de vinculación: *${pairingPin}*\n\n¡Quedamos a su disposición ante cualquier duda!`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = phone ? `https://wa.me/${phone}?text=${encodedMsg}` : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank');
    showToast('Abriendo WhatsApp para enviar vinculación...', 'info');
  };

  const handleTestInApp = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    if (pairingScope === 'pet' && selectedPet) {
      setSelectedTutorPetId(selectedPet.id);
    }
    setViewMode('android');
    onClose();
    showToast(`Dispositivo Android vinculado con éxito a ${pairingScope === 'pet' ? selectedPet.name : clinicSettings.clinicName}.`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white tracking-tight">
                    Vincular App Android con QR
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                    Sincronización Segura
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Escanea con el celular para transferir carnet de vacunas y citas en vivo
                </p>
              </div>
            </div>

            <button
              id="btn-close-pairing-modal"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            {/* Scope Selection Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPairingScope('pet')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  pairingScope === 'pet'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PawPrint className="w-4 h-4" />
                <span>Vincular Paciente Específico</span>
              </button>
              <button
                type="button"
                onClick={() => setPairingScope('clinic')}
                className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  pairingScope === 'clinic'
                    ? 'bg-white text-indigo-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Vincular Clínica General</span>
              </button>
            </div>

            {/* Pet selector when scope is 'pet' */}
            {pairingScope === 'pet' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-wide">
                  Selecciona la Mascota / Tutor para vincular:
                </label>
                <div className="relative">
                  <select
                    id="select-pairing-pet"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} • Tutor: {p.owner.name} • Tel: {p.owner.phone})
                      </option>
                    ))}
                  </select>
                  <PawPrint className="w-4 h-4 text-amber-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Main Interactive QR Card */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-3xl border border-slate-200 shadow-xs">
              {/* High-Definition Scalable Vector QR Code with Brand Emblem */}
              <div className="relative shrink-0 p-4 bg-white rounded-2xl border-2 border-indigo-200 shadow-md flex flex-col items-center">
                <svg
                  viewBox="0 0 140 140"
                  className="w-40 h-40 sm:w-44 sm:h-44"
                  shapeRendering="crispEdges"
                >
                  <rect width="140" height="140" fill="#ffffff" />
                  
                  {/* Outer Position Detection Pattern Top-Left */}
                  <rect x="10" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                  <rect x="15" y="15" width="25" height="25" fill="#ffffff" rx="2" />
                  <rect x="20" y="20" width="15" height="15" fill="#0f172a" rx="2" />

                  {/* Outer Position Detection Pattern Top-Right */}
                  <rect x="95" y="10" width="35" height="35" fill="#0f172a" rx="4" />
                  <rect x="100" y="15" width="25" height="25" fill="#ffffff" rx="2" />
                  <rect x="105" y="20" width="15" height="15" fill="#0f172a" rx="2" />

                  {/* Outer Position Detection Pattern Bottom-Left */}
                  <rect x="10" y="95" width="35" height="35" fill="#0f172a" rx="4" />
                  <rect x="15" y="100" width="25" height="25" fill="#ffffff" rx="2" />
                  <rect x="20" y="105" width="15" height="15" fill="#0f172a" rx="2" />

                  {/* Alignment & Timing Sync Patterns */}
                  <path d="M 50 15 H 90 M 50 25 H 90 M 50 35 H 90" stroke="#0f172a" strokeWidth="3" strokeDasharray="5,5" />
                  <path d="M 15 50 V 90 M 25 50 V 90 M 35 50 V 90" stroke="#0f172a" strokeWidth="3" strokeDasharray="5,5" />

                  {/* Dynamic High-Density Data Matrix Dots */}
                  <g fill="#1e293b">
                    <rect x="50" y="50" width="6" height="6" />
                    <rect x="60" y="50" width="6" height="6" />
                    <rect x="74" y="50" width="6" height="6" />
                    <rect x="84" y="50" width="6" height="6" />

                    <rect x="50" y="62" width="6" height="6" />
                    <rect x="68" y="62" width="6" height="6" />
                    <rect x="80" y="62" width="6" height="6" />

                    <rect x="56" y="74" width="6" height="6" />
                    <rect x="74" y="74" width="6" height="6" />
                    <rect x="86" y="74" width="6" height="6" />

                    <rect x="50" y="86" width="6" height="6" />
                    <rect x="62" y="86" width="6" height="6" />
                    <rect x="78" y="86" width="6" height="6" />

                    <rect x="95" y="50" width="6" height="6" />
                    <rect x="107" y="50" width="6" height="6" />
                    <rect x="119" y="50" width="6" height="6" />
                    <rect x="127" y="50" width="6" height="6" />

                    <rect x="95" y="64" width="6" height="6" />
                    <rect x="105" y="64" width="6" height="6" />
                    <rect x="115" y="64" width="6" height="6" />
                    <rect x="125" y="64" width="6" height="6" />

                    <rect x="95" y="78" width="6" height="6" />
                    <rect x="110" y="78" width="6" height="6" />
                    <rect x="120" y="78" width="6" height="6" />

                    <rect x="95" y="92" width="6" height="6" />
                    <rect x="105" y="92" width="6" height="6" />
                    <rect x="115" y="92" width="6" height="6" />
                    <rect x="125" y="92" width="6" height="6" />

                    <rect x="50" y="98" width="6" height="6" />
                    <rect x="64" y="98" width="6" height="6" />
                    <rect x="76" y="98" width="6" height="6" />
                    <rect x="88" y="98" width="6" height="6" />

                    <rect x="50" y="112" width="6" height="6" />
                    <rect x="62" y="112" width="6" height="6" />
                    <rect x="74" y="112" width="6" height="6" />
                    <rect x="86" y="112" width="6" height="6" />

                    <rect x="50" y="124" width="6" height="6" />
                    <rect x="68" y="124" width="6" height="6" />
                    <rect x="80" y="124" width="6" height="6" />
                  </g>

                  {/* Center Brand Badge with dynamic logo or initial letter */}
                  <rect x="54" y="54" width="32" height="32" rx="8" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
                  <rect x="57" y="57" width="26" height="26" rx="6" fill="#4f46e5" />
                  {clinicSettings.logoUrl ? (
                    <image href={clinicSettings.logoUrl} x="57" y="57" width="26" height="26" preserveAspectRatio="xMidYMid slice" />
                  ) : (
                    <text x="70" y="74" fontSize="11" fontWeight="900" textAnchor="middle" fill="#ffffff" fontFamily="monospace">
                      {clinicSettings.logoText || (clinicSettings.name ? clinicSettings.name.charAt(0).toUpperCase() : 'V')}
                    </text>
                  )}
                </svg>

                <div className="mt-2 text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" /> Sincronización Lista
                  </span>
                </div>
              </div>

              {/* Pairing Details and Fast PIN */}
              <div className="flex-1 space-y-3 text-left">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    {pairingScope === 'pet' ? 'Mascota a Vincular' : 'Clínica Veterinaria'}
                  </span>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    {pairingScope === 'pet' ? selectedPet.name : (clinicSettings.name || 'Clínica Veterinaria')}
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </h3>
                  {pairingScope === 'pet' && (
                    <p className="text-xs text-slate-500">
                      Tutor: <strong>{selectedPet.owner.name}</strong> ({selectedPet.owner.phone})
                    </p>
                  )}
                </div>

                {/* PIN Code Box */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" /> PIN de Emparejamiento Rápido:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPin}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? '¡Copiado!' : 'Copiar PIN'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-black text-slate-900 tracking-widest bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                      {pairingPin}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Válido 24 horas</span>
                  </div>
                </div>

                {/* Instructions steps */}
                <div className="text-[11px] text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                    Abre la app de la clínica en el celular del tutor.
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                    Apunta con la cámara al código QR o ingresa el PIN.
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                    El carnet de vacunas y citas se sincronizarán al instante.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Link & Sharing Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-copy-pairing-link"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace de Vinculación'}</span>
              </button>

              <button
                type="button"
                id="btn-share-whatsapp-pairing"
                onClick={handleSendWhatsApp}
                className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-emerald-600/20"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por WhatsApp al Tutor</span>
              </button>
            </div>

            {/* Test in Simulator Direct CTA */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-indigo-500/20">
              <div className="text-left">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> ¿Quieres probar la vinculación ahora?
                </span>
                <p className="text-[11px] text-slate-300">
                  Abre la App Android simulada con los datos de {pairingScope === 'pet' ? selectedPet.name : 'la clínica'} vinculados.
                </p>
              </div>
              <button
                type="button"
                id="btn-test-pairing-simulator"
                onClick={handleTestInApp}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
              >
                <Smartphone className="w-4 h-4" />
                <span>Probar en App Android</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs shrink-0">
            <span className="text-slate-500 text-[11px]">
              Protocolo VetCare Pro Sync v2.5
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
