import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, CheckCircle2, ShieldCheck, Loader2, Sparkles, Lock, Server } from 'lucide-react';
import { useVeterinary } from '../../context/VeterinaryContext';

interface SavingSessionModalProps {
  isOpen: boolean;
  stepMessage?: string;
}

export const SavingSessionModal: React.FC<SavingSessionModalProps> = ({ isOpen, stepMessage }) => {
  const { currentUser, clinicSettings, pets, medicalRecords, vaccines, appointments, inventory, products, salesReceipts } = useVeterinary();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden"
        >
          {/* Top Decorative Gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

          {/* Animated Database Icon */}
          <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-emerald-100 animate-ping opacity-25" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10">
              <Database className="w-10 h-10 animate-bounce text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md ring-2 ring-white z-20">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Titles */}
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Guardando Cambios de Sesión
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium max-w-xs mx-auto">
            Asegurando y sincronizando toda la información generada durante la sesión en la base de datos
          </p>

          {/* User & Clinic Context Card */}
          <div className="my-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Usuario Activo:</span>
              <span className="font-bold text-slate-900 truncate max-w-[180px]">
                {currentUser?.name || 'Usuario'} ({currentUser?.role === 'superuser' ? 'Creador' : currentUser?.role === 'admin' ? 'Administrador' : 'Encargado'})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Clínica / Base de Datos:</span>
              <span className="font-bold text-indigo-700 truncate max-w-[180px]">
                {clinicSettings.name || 'VetCare Pro'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1 text-[10px] text-center font-bold text-slate-600">
              <div className="p-1 bg-white rounded-lg border border-slate-100">
                <span className="block text-emerald-600 font-black text-xs">{pets.length}</span>
                Pacientes
              </div>
              <div className="p-1 bg-white rounded-lg border border-slate-100">
                <span className="block text-indigo-600 font-black text-xs">{medicalRecords.length}</span>
                Consultas
              </div>
              <div className="p-1 bg-white rounded-lg border border-slate-100">
                <span className="block text-amber-600 font-black text-xs">{inventory.length + products.length}</span>
                Artículos Stock
              </div>
            </div>
          </div>

          {/* Real-Time Sync Steps */}
          <div className="space-y-2 text-left text-xs mb-5">
            <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1. Historias clínicas, vacunas y altas verificadas</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>2. Inventario, almacenes y ventas Pet Shop guardados</span>
            </div>
            <div className="flex items-center gap-2 text-indigo-800 font-bold bg-indigo-50/80 p-2 rounded-xl border border-indigo-100">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
              <span>{stepMessage || '3. Sincronizando base de datos local y remota...'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Cierre de sesión seguro y protegido</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
