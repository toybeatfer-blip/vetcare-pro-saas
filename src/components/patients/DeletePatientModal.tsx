import React from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { Pet } from '../../types';
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  X,
  User,
  Phone,
  FileText,
  Syringe,
  Calendar,
  Film,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeletePatientModalProps {
  isOpen: boolean;
  pet: Pet | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  pet,
  onClose,
  onDeleted,
}) => {
  const {
    currentUser,
    deletePet,
    getRecordsByPetId,
    getVaccinesByPetId,
    appointments,
    setIsLoginModalOpen,
  } = useVeterinary();

  if (!isOpen || !pet) return null;

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'superuser';
  const petRecords = getRecordsByPetId(pet.id);
  const petVaccines = getVaccinesByPetId(pet.id);
  const petAppointments = appointments.filter((a) => a.petId === pet.id);
  const petStudiesCount = (pet.diagnosticImages || []).length;

  const handleDelete = () => {
    if (!isAdmin) return;
    const success = deletePet(pet.id);
    if (success) {
      onClose();
      if (onDeleted) {
        onDeleted();
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-rose-100 overflow-hidden my-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-800 to-red-900 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">Eliminar de la Base de Datos</h2>
                <p className="text-xs text-rose-100 mt-0.5">
                  Eliminación definitiva de paciente y tutor
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Admin Status Notice */}
            {isAdmin ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Autenticación de Administrador Válida</span>
                  <span className="text-[11px] text-emerald-700">
                    Sesión activa: <strong>{currentUser?.name}</strong> (Rol: {currentUser?.role === 'superuser' ? 'Super Administrador' : 'Administrador'}).
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <span className="font-bold block text-sm text-amber-950">Acceso Restringido</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Solo el usuario con rol de <strong>Administrador</strong> tiene autorización para eliminar pacientes y tutores de la base de datos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsLoginModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cambiar a Usuario Administrador</span>
                  </button>
                </div>
              </div>
            )}

            {/* Target Patient & Tutor Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                {pet.photoUrl ? (
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 font-extrabold flex items-center justify-center text-lg shrink-0">
                    {pet.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{pet.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {pet.species} • {pet.breed} • Edad: {pet.ageDisplay}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 truncate">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Tutor: <strong className="text-slate-900">{pet.owner.name}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Tel: {pet.owner.phone}</span>
                </div>
              </div>
            </div>

            {/* Purged items count */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Registros que se eliminarán por completo:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                  <FileText className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                  <strong className="text-rose-900 font-bold block">{petRecords.length}</strong>
                  <span className="text-[10px] text-rose-700">Consultas</span>
                </div>
                <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                  <Syringe className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                  <strong className="text-rose-900 font-bold block">{petVaccines.length}</strong>
                  <span className="text-[10px] text-rose-700">Vacunas</span>
                </div>
                <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                  <Calendar className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                  <strong className="text-rose-900 font-bold block">{petAppointments.length}</strong>
                  <span className="text-[10px] text-rose-700">Citas</span>
                </div>
                <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl">
                  <Film className="w-4 h-4 text-rose-600 mx-auto mb-1" />
                  <strong className="text-rose-900 font-bold block">{petStudiesCount}</strong>
                  <span className="text-[10px] text-rose-700">Estudios</span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200/80 flex items-start gap-2.5 text-xs text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-800 leading-snug">
                <strong>Advertencia:</strong> Esta acción borrará de manera definitiva el paciente, la ficha del tutor y todo su historial médico de la base de datos del sistema. Esta operación no se puede deshacer.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              Cancelar
            </button>

            {isAdmin && (
              <button
                type="button"
                id="btn-confirm-delete-pet-tutor"
                onClick={handleDelete}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Definitivamente</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
