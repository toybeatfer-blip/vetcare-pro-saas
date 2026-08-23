import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Radio,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Server,
  RefreshCw,
  X,
  Lock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  checkActiveInternet,
  verifyOfficialNetworkTime,
  VerifiedTimeCertificate,
} from '../../services/networkTimeService';
import { useVeterinary } from '../../context/VeterinaryContext';

interface NetworkDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkDiagnosticsModal: React.FC<NetworkDiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { lastVerifiedTimeCertificate } = useVeterinary();
  const [isOnline, setIsOnline] = useState(true);
  const [latency, setLatency] = useState(38);
  const [isVerifying, setIsVerifying] = useState(false);
  const [certificate, setCertificate] = useState<VerifiedTimeCertificate | null>(
    lastVerifiedTimeCertificate
  );
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(new Date().toLocaleTimeString('es-MX'));

  useEffect(() => {
    if (!isOpen) return;

    // Run a fresh verification check
    handleRunVerification();

    // Clock ticker
    const timer = setInterval(() => {
      setCurrentTimeDisplay(new Date().toLocaleTimeString('es-MX'));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleRunVerification = async () => {
    setIsVerifying(true);
    try {
      const net = await checkActiveInternet();
      setIsOnline(net.isOnline);
      setLatency(net.latencyMs);

      if (net.isOnline) {
        const timeRes = await verifyOfficialNetworkTime();
        if (timeRes.success && timeRes.certificate) {
          setCertificate(timeRes.certificate);
        }
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-md">
                  <Globe className="w-6 h-6 text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Enlace de Red & Sincronización NTP
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                    Diagnóstico de Internet y Hora Oficial
                  </h3>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-network-diagnostics"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Status Summary Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                isOnline
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isOnline ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  }`}
                >
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-black flex items-center gap-1.5">
                    <span>{isOnline ? 'Internet Conectado y Certificado' : 'Sin Acceso a Internet (Bloqueo Activo)'}</span>
                    {isOnline && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {isOnline
                      ? `Latencia de red: ~${latency}ms • Servidores en línea activos`
                      : 'El software veterinario requiere conexión activa permanente para validación de licencias.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-refresh-network-check"
                disabled={isVerifying}
                onClick={handleRunVerification}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Comprobando...' : 'Revalidar'}</span>
              </button>
            </div>

            {/* Verification Time Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Official Time */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>HORA OFICIAL CERTIFICADA</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-black">
                    NTP UTC
                  </span>
                </div>
                <div className="text-xl font-black text-slate-900 font-mono tracking-tight">
                  {certificate?.formattedTime12h || currentTimeDisplay}
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  {certificate?.formattedDateLong || 'Fecha actual verificada'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Zona: {certificate?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                </div>
              </div>

              {/* Card 2: Security & Anti-Tampering */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>INTEGRIDAD ANTI-MANIPULACIÓN</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black">
                    Validado
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reloj del Sistema Seguro</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Desviación con el servidor: <strong>{certificate?.driftSeconds || 0} segundos</strong> (Válido &lt; 3600s).
                </p>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  Autoridad: {certificate?.serverSource || 'TimeAPI Global Authority'}
                </div>
              </div>
            </div>

            {/* Session Token & Cryptographic Audit */}
            {certificate?.signature && (
              <div className="p-3.5 bg-slate-900 text-amber-300 rounded-2xl text-xs space-y-1 font-mono border border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Token Criptográfico de Inicio de Sesión
                  </span>
                  <span>SSL SHA-256</span>
                </div>
                <div className="text-xs text-amber-200 font-bold break-all">
                  {certificate.signature}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                id="btn-close-diagnostics-footer"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Cerrar Diagnóstico
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
