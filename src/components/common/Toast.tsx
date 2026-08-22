import React from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Toast: React.FC = () => {
  const { toastMessage, hideToast } = useVeterinary();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-teal-500 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/95 text-rose-900',
    warning: 'border-amber-200 bg-amber-50/95 text-amber-900',
    info: 'border-teal-200 bg-teal-50/95 text-teal-900',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-md shadow-lg"
      >
        <div
          id="toast-notification"
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border backdrop-blur-sm shadow-sm ${
            borderColors[toastMessage.type]
          }`}
        >
          {icons[toastMessage.type]}
          <p className="text-sm font-medium pr-2 leading-snug">{toastMessage.text}</p>
          <button
            id="btn-close-toast"
            onClick={hideToast}
            className="p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors ml-auto"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
