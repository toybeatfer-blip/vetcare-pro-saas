import React, { useState, useEffect } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { MedicationItem, StockMovementType } from '../../types';
import {
  X,
  PlusCircle,
  MinusCircle,
  Sliders,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  User,
  PawPrint,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: MedicationItem | null;
  initialType?: StockMovementType;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  medication,
  initialType = 'out',
}) => {
  const { pets, adjustStock, restockMedication, showToast } = useVeterinary();

  const [type, setType] = useState<StockMovementType>(initialType);
  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [newBatch, setNewBatch] = useState<string>('');
  const [newExpDate, setNewExpDate] = useState<string>('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [performedBy, setPerformedBy] = useState<string>('Dra. Valeria Hernández (MVZ)');

  useEffect(() => {
    if (medication) {
      setType(initialType);
      setQuantityChange(1);
      setNewBatch(medication.batchNumber);
      setNewExpDate(medication.expirationDate);
      setCostPrice(medication.costPrice);

      if (initialType === 'out') {
        setReason(`Dispensación para tratamiento veterinario`);
      } else if (initialType === 'in') {
        setReason(`Reabastecimiento de existencias - Proveedor ${medication.supplier.name}`);
      } else if (initialType === 'adjustment') {
        setReason(`Ajuste de inventario por conteo físico`);
      } else {
        setReason(`Baja por caducidad o merma de producto`);
      }
    }
  }, [medication, initialType, isOpen]);

  if (!isOpen || !medication) return null;

  const currentStock = medication.quantity;
  let newProjectedStock = currentStock;

  if (type === 'in') {
    newProjectedStock = currentStock + Number(quantityChange || 0);
  } else if (type === 'out' || type === 'expired_waste') {
    newProjectedStock = Math.max(0, currentStock - Number(quantityChange || 0));
  } else if (type === 'adjustment') {
    newProjectedStock = Math.max(0, Number(quantityChange || 0));
  }

  const isLowStockWarning = newProjectedStock <= medication.minStockThreshold;
  const isOutOfStock = newProjectedStock === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const changeVal = Number(quantityChange) || 0;
    if (changeVal <= 0 && type !== 'adjustment') {
      showToast('Por favor introduce una cantidad válida mayor a cero.', 'warning');
      return;
    }

    const targetPet = pets.find((p) => p.id === selectedPetId);
    const patientName = targetPet ? `${targetPet.name} (${targetPet.species})` : undefined;

    if (type === 'in') {
      restockMedication(
        medication.id,
        changeVal,
        newBatch,
        newExpDate,
        costPrice,
        medication.supplier.name
      );
    } else if (type === 'out' || type === 'expired_waste') {
      adjustStock(
        medication.id,
        -changeVal,
        type,
        reason.trim() || (type === 'out' ? 'Dispensación a paciente' : 'Merma de inventario'),
        patientName,
        performedBy
      );
    } else if (type === 'adjustment') {
      const difference = changeVal - currentStock;
      adjustStock(
        medication.id,
        difference,
        'adjustment',
        reason.trim() || 'Ajuste de arqueo físico de inventario',
        undefined,
        performedBy
      );
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 my-6 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                  {medication.category}
                </span>
                <span className="text-xs text-slate-300 font-mono">Lote: {medication.batchNumber}</span>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">{medication.name}</h2>
              <p className="text-xs text-slate-300">
                Stock actual:{' '}
                <strong className="text-emerald-400 font-bold">
                  {medication.quantity} {medication.unit}
                </strong>{' '}
                • Umbral mínimo: {medication.minStockThreshold} {medication.unit}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Selector de Tipo de Movimiento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tipo de Operación
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('out');
                    setReason('Dispensación para tratamiento veterinario');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    type === 'out'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <MinusCircle className={`w-5 h-5 ${type === 'out' ? 'text-rose-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Dispensar / Venta</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('in');
                    setReason(`Reabastecimiento de proveedor ${medication.supplier.name}`);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    type === 'in'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <PlusCircle className={`w-5 h-5 ${type === 'in' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Reabastecer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('adjustment');
                    setReason('Ajuste de inventario por conteo físico');
                    setQuantityChange(medication.quantity);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    type === 'adjustment'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-800 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Sliders className={`w-5 h-5 ${type === 'adjustment' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Ajuste / Conteo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('expired_waste');
                    setReason('Baja por merma / caducidad de lote');
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    type === 'expired_waste'
                      ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Trash2 className={`w-5 h-5 ${type === 'expired_waste' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold">Baja / Merma</span>
                </button>
              </div>
            </div>

            {/* Cantidad y Cálculo en Tiempo Real */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {type === 'adjustment'
                    ? `Nuevo Stock Real (${medication.unit}) *`
                    : `Cantidad a ${type === 'in' ? 'Ingresar' : 'Retirar'} (${medication.unit}) *`}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={type === 'out' || type === 'expired_waste' ? currentStock : 9999}
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Caja de previsualización de Stock Resultante */}
              <div
                className={`p-3.5 rounded-2xl border flex flex-col justify-center transition-all ${
                  isOutOfStock
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : isLowStockWarning
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>Stock Resultante:</span>
                  <span className="font-mono text-sm font-bold">
                    {newProjectedStock} {medication.unit}
                  </span>
                </div>
                <div className="text-[11px] flex items-center gap-1.5">
                  {isOutOfStock ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="font-bold text-rose-700">¡Quedará agotado sin existencias!</span>
                    </>
                  ) : isLowStockWarning ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-bold text-amber-700">Quedará en nivel de alerta crítica</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-700">Nivel de stock óptimo</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Campos condicionales para Reabastecimiento */}
            {type === 'in' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Detalles del Nuevo Lote recibido
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Lote Facturado
                    </label>
                    <input
                      type="text"
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Nueva Fecha Caducidad
                    </label>
                    <input
                      type="date"
                      value={newExpDate}
                      onChange={(e) => setNewExpDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paciente asociado (opcional para dispensación) */}
            {type === 'out' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <PawPrint className="w-3.5 h-3.5 text-indigo-600" />
                  Paciente Asociado (Opcional)
                </label>
                <select
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
                >
                  <option value="">-- Sin vincular a paciente específico --</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species} • Tutor: {pet.owner.name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Motivo / Justificación */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Motivo / Justificación del Movimiento *
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. Tratamiento post-operatorio, compra a distribuidor..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Veterinario / Responsable */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Responsable del Registro
              </label>
              <input
                type="text"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                  type === 'in'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                    : type === 'out'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar {type === 'in' ? 'Reabastecimiento' : type === 'out' ? 'Dispensación' : 'Ajuste'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
