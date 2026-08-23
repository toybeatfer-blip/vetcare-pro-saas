import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  RefreshCw,
  ShieldAlert,
  Radio,
  Server,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkActiveInternet } from '../../services/networkTimeService';

interface OfflineBarrierModalProps {
  isOpen: boolean;
  onReconnected?: () => void;
}

export const OfflineBarrierModal: React.FC<OfflineBarrierModalProps> = ({
  isOpen,
  onReconnected,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) return;

    // Countdown ticker for automatic retry
    const timer = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          handleCheckNow();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleCheckNow = async () => {
    setIsChecking(true);
    setLastCheckMessage(null);

    try {
      const result = await checkActiveInternet();
      setIsChecking(false);

      if (result.isOnline) {
        setLastCheckMessage('¡Conexión a Internet restablecida con éxito!');
        if (onReconnected) {
          onReconnected();
        }
      } else {
        setLastCheckMessage('Sin respuesta de red. Continúa desconectado.');
        setRetryCountdown(10);
      }
    } catch {
      setIsChecking(false);
      setLastCheckMessage('Fallo en la prueba de enlace de red.');
      setRetryCountdown(10);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-rose-500/40 overflow-hidden my-auto"
        >
          {/* Top Banner Alert Header */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white p-6 sm:p-8 relative overflow-hidden border-b border-rose-800/50">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 -mb-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-rose-600/30 border-2 border-rose-400/60 flex items-center justify-center text-rose-300 shadow-xl shadow-rose-950/50">
                    <WifiOff className="w-8 h-8 text-rose-400 animate-pulse" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-rose-500/30 text-rose-200 border border-rose-400/40 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Radio className="w-3 h-3 text-rose-400 animate-spin" />
                      <span>Bloqueo de Seguridad Activo</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Conexión a Internet Requerida
                  </h2>
                  <p className="text-xs text-rose-200/90 font-medium">
                    El sistema no puede operar sin acceso activo a la red.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                  Reintento Automático
                </span>
                <span className="text-lg font-black font-mono text-amber-400">
                  {retryCountdown}s
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-black text-rose-950 text-sm">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>¿Por qué se requiere conexión obligatoria?</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-800">
                Este software veterinario centraliza la <strong>verificación de licencias en la nube</strong>,
                la <strong>sincronización horaria oficial contra servidores NTP mundiales</strong> para evitar
                alteraciones fraudulentas de fecha en el equipo, y la <strong>emisión de alertas y notificaciones</strong>.
              </p>
            </div>

            {/* Diagnostic Table */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Diagnóstico del Enlace en Tiempo Real:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-800 block">Adaptador de Red</span>
                      <span className="text-[10px] text-slate-500">Dispositivo local</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md font-bold text-[10px]">
                    {navigator.onLine ? 'Enlazado' : 'Desconectado'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <WifiOff className="w-4 h-4 text-rose-500" />
                    <div>
                      <span className="font-bold text-slate-800 block">Acceso a Internet</span>
                      <span className="text-[10px] text-slate-500">Salida WAN / Nube</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold text-[10px] flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Sin Internet
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-800 block">Servidor de Tiempo NTP</span>
                      <span className="text-[10px] text-slate-500">World Time Authority</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold text-[10px]">
                    En Pausa
                  </span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-purple-500" />
                    <div>
                      <span className="font-bold text-slate-800 block">Validación de Licencia</span>
                      <span className="text-[10px] text-slate-500">Control de arrendamiento</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-bold text-[10px]">
                    Bloqueado
                  </span>
                </div>
              </div>
            </div>

            {lastCheckMessage && (
              <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-700 animate-in fade-in">
                {lastCheckMessage}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 text-center sm:text-left">
                Verifica tu cable Ethernet o conexión Wi-Fi para reanudar automáticamente.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="btn-verify-connection-now"
                  disabled={isChecking}
                  onClick={handleCheckNow}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Comprobando Enlace...' : 'Verificar Conexión Ahora'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
