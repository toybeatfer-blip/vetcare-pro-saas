import React from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import {
  Bell,
  X,
  Syringe,
  Pill,
  Calendar,
  Sparkles,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AndroidNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'vaccine' | 'medication' | 'appointment' | 'ai';
  isRead?: boolean;
}

interface AndroidNotificationShadeProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AndroidNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onSelectNotification?: (notif: AndroidNotification) => void;
}

export const AndroidNotificationShade: React.FC<AndroidNotificationShadeProps> = ({
  isOpen,
  onClose,
  notifications,
  onDismiss,
  onClearAll,
  onSelectNotification,
}) => {
  const { clinicSettings } = useVeterinary();
  if (!isOpen) return null;

  const getIcon = (type: AndroidNotification['type']) => {
    switch (type) {
      case 'vaccine':
        return <Syringe className="w-4 h-4 text-emerald-400" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-amber-400" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'ai':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-start bg-slate-950/80 backdrop-blur-md">
        {/* Top Header of Android Notification Center */}
        <div className="p-4 pt-6 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Notificaciones Push Android ({notifications.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
            <span>{clinicSettings?.name || 'VetCare Pro'} • Notificaciones del Sistema</span>
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Borrar Todo</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">Todo al día</p>
              <p className="text-[11px] text-slate-500">No tienes alertas pendientes</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-3.5 bg-slate-900/80 hover:bg-slate-850 border border-white/10 rounded-2xl flex items-start gap-3 transition-colors group cursor-pointer"
                onClick={() => {
                  onSelectNotification?.(notif);
                  onClose();
                }}
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">{notif.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{notif.body}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(notif.id);
                  }}
                  className="text-slate-500 hover:text-slate-300 p-1 opacity-60 group-hover:opacity-100 transition-opacity"
                  title="Descartar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Pull up Handle Footer */}
        <div
          onClick={onClose}
          className="p-3 bg-slate-900/90 border-t border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-850 shrink-0"
        >
          <div className="w-12 h-1 bg-white/30 rounded-full mb-1" />
          <span className="text-[10px] text-slate-400 font-medium">Toca para cerrar panel</span>
        </div>
      </div>
    </AnimatePresence>
  );
};
