import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  DollarSign,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Receipt,
  User,
  Clock,
  Calendar,
  Sparkles,
  Printer,
  CreditCard,
  Banknote,
  Send,
  Building2,
} from 'lucide-react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { CashRegisterShift, CashMovement } from '../../types';
import { CashShiftReceiptModal } from './CashShiftReceiptModal';

interface CashRegisterShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashRegisterShiftModal: React.FC<CashRegisterShiftModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeShift,
    openCashShift,
    closeCashShift,
    addCashMovement,
    currentUser,
    clinicSettings,
    showToast,
  } = useVeterinary();

  const [activeTab, setActiveTab] = useState<'status' | 'close' | 'movement'>('status');

  // Open Shift Form State
  const [openInitialFloat, setOpenInitialFloat] = useState<number>(1000);
  const [openNotes, setOpenNotes] = useState<string>('Inicio de turno');

  // Close Shift / Arqueo Form State
  const [actualCashInDrawer, setActualCashInDrawer] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('Corte de caja completado');
  const [completedShiftForReceipt, setCompletedShiftForReceipt] = useState<CashRegisterShift | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // Cash Movement Form State
  const [movementType, setMovementType] = useState<'in' | 'out'>('out');
  const [movementAmount, setMovementAmount] = useState<number>(0);
  const [movementReason, setMovementReason] = useState<string>('');

  if (!isOpen) return null;

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openInitialFloat < 0) {
      showToast('El fondo inicial no puede ser negativo.', 'error');
      return;
    }
    openCashShift(openInitialFloat, openNotes);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;

    const closed = closeCashShift(actualCashInDrawer, closeNotes);
    if (closed) {
      setCompletedShiftForReceipt(closed);
      setIsReceiptModalOpen(true);
    }
  };

  const handleAddMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (movementAmount <= 0) {
      showToast('Ingrese un monto mayor a $0.', 'error');
      return;
    }
    if (!movementReason.trim()) {
      showToast('Por favor ingrese el motivo del movimiento.', 'warning');
      return;
    }
    addCashMovement(movementType, movementAmount, movementReason);
    setMovementAmount(0);
    setMovementReason('');
    setActiveTab('status');
  };

  const diff = activeShift ? actualCashInDrawer - activeShift.expectedCashInDrawer : 0;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 relative overflow-hidden"
          >
            {/* Top Accent Strip */}
            <div className={`absolute top-0 left-0 right-0 h-2 ${
              activeShift ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'
            }`} />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md ${
                  activeShift ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'
                }`}>
                  {activeShift ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      Control de Turnos & Caja POS
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      activeShift ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {activeShift ? '🟢 Turno Abierto' : '🔒 Caja Cerrada'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Apertura, arqueo en vivo, gastos menores y corte diario de caja
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIEW A: BOX IS CLOSED -> APERTURA DE TURNO */}
            {!activeShift ? (
              <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
                <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900">
                      <p className="font-bold">La caja se encuentra cerrada.</p>
                      <p className="text-amber-800 mt-0.5 font-medium">
                        Para registrar ventas en el Punto de Venta (POS), ingrese el monto del fondo inicial en efectivo y abra el turno.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cajero(a) Responsable
                    </label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>{currentUser?.name || 'Usuario'} ({currentUser?.role === 'admin' ? 'Administrador' : 'Encargado'})</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fondo Inicial de Caja (Efectivo para cambio) *
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={openInitialFloat}
                        onChange={(e) => setOpenInitialFloat(Number(e.target.value))}
                        required
                        className="w-full pl-9 pr-4 py-2.5 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        placeholder="Ej. 1000"
                      />
                    </div>
                    {/* Fast Presets */}
                    <div className="flex gap-2 mt-2">
                      {[300, 500, 1000, 1500, 2000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setOpenInitialFloat(preset)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            openInitialFloat === preset
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          ${preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notas de Apertura
                    </label>
                    <input
                      type="text"
                      value={openNotes}
                      onChange={(e) => setOpenNotes(e.target.value)}
                      placeholder="Ej. Turno matutino, fondo recibido de administración"
                      className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>🟢 Abrir Turno de Caja con ${openInitialFloat.toLocaleString()} MXN</span>
                  </button>
                </div>
              </form>
            ) : (
              /* VIEW B: BOX IS OPEN -> DASHBOARD, ARQUEO & CORTE DIARIO */
              <div className="space-y-4">
                {/* Navigation Pills */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('status')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'status'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📊 Estado del Turno
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('movement')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'movement'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    💸 Entradas / Gastos
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActualCashInDrawer(activeShift.expectedCashInDrawer);
                      setActiveTab('close');
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'close'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🔒 Corte Diario
                  </button>
                </div>

                {/* TAB 1: LIVE STATUS */}
                {activeTab === 'status' && (
                  <div className="space-y-3">
                    {/* Shift Metadata Card */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Folio de Turno:</span>
                        <span className="font-black text-indigo-700 font-mono">{activeShift.shiftFolio}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Cajero(a) Activo:</span>
                        <span className="font-bold text-slate-800">{activeShift.openedBy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Hora de Apertura:</span>
                        <span className="font-medium text-slate-700">{activeShift.openedAt}</span>
                      </div>
                    </div>

                    {/* Financial Metrics 3-Grid */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Fondo Inicial</span>
                        <span className="text-sm font-black text-slate-800 mt-0.5 block font-mono">
                          ${activeShift.initialCashFloat.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block">Ventas Efectivo</span>
                        <span className="text-sm font-black text-emerald-800 mt-0.5 block font-mono">
                          ${activeShift.cashSalesTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-3 bg-indigo-50 border border-indigo-200/80 rounded-2xl shadow-2xs">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase block">Ventas Tarjeta/SPEI</span>
                        <span className="text-sm font-black text-indigo-800 mt-0.5 block font-mono">
                          ${(activeShift.cardSalesTotal + activeShift.transferSalesTotal).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Total Cash Expected Highlight */}
                    <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider block">
                            Efectivo Esperado en Cajón (Arqueo Actual)
                          </span>
                          <div className="text-2xl font-black text-white mt-0.5 font-mono">
                            ${activeShift.expectedCashInDrawer.toLocaleString('es-MX', { minimumFractionDigits: 2 })} <span className="text-xs text-indigo-300 font-sans">MXN</span>
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-300">
                          <span className="block font-bold">{activeShift.salesCount} tickets emitidos</span>
                          <span className="text-emerald-400 font-mono font-bold">Total Ventas: ${activeShift.totalSalesAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Concept Breakdown */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                      <span className="font-bold text-slate-700 block text-[11px]">Desglose de Ventas del Turno:</span>
                      <div className="flex justify-between text-slate-600">
                        <span>🛍️ Alimentos & Pet Shop:</span>
                        <span className="font-bold font-mono">${(activeShift.salesBreakdown?.petshopAmount ?? 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>🩺 Consultas Médicas:</span>
                        <span className="font-bold font-mono">${(activeShift.salesBreakdown?.consultationsAmount ?? 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>💉 Vacunas & Desparasitaciones:</span>
                        <span className="font-bold font-mono">${(activeShift.salesBreakdown?.vaccinesAmount ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CASH MOVEMENTS (ENTRADAS / GASTOS) */}
                {activeTab === 'movement' && (
                  <form onSubmit={handleAddMovementSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMovementType('out')}
                        className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          movementType === 'out'
                            ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <ArrowDownRight className="w-4 h-4 text-rose-600" />
                        <span>🔴 Retiro / Gasto Menor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMovementType('in')}
                        className={`p-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          movementType === 'in'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        <span>🟢 Entrada Extra de Fondo</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Monto del Movimiento ($ MXN) *
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={movementAmount || ''}
                          onChange={(e) => setMovementAmount(Number(e.target.value))}
                          required
                          placeholder="Ej. 150"
                          className="w-full pl-9 pr-4 py-2.5 text-sm font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Motivo / Justificación del Movimiento *
                      </label>
                      <input
                        type="text"
                        value={movementReason}
                        onChange={(e) => setMovementReason(e.target.value)}
                        required
                        placeholder={movementType === 'out' ? 'Ej. Compra de agua purificada, pago repartidor' : 'Ej. Aporte extra de cambio en monedas'}
                        className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        movementType === 'out' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <span>Guardar {movementType === 'out' ? 'Retiro' : 'Entrada'} de Efectivo</span>
                    </button>

                    {/* Recent movements in shift */}
                    {activeShift.movements.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 max-h-36 overflow-y-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Movimientos en este turno:</span>
                        {activeShift.movements.map((mov) => (
                          <div key={mov.id} className="p-2 bg-slate-50 rounded-lg text-xs flex items-center justify-between border border-slate-100">
                            <div>
                              <span className={`font-bold ${mov.type === 'in' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {mov.type === 'in' ? '+ Entrada:' : '- Retiro:'} ${mov.amount.toFixed(2)}
                              </span>
                              <span className="text-slate-500 text-[11px] block">{mov.reason}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{mov.timestamp.split(' ')[1]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </form>
                )}

                {/* TAB 3: CLOSE SHIFT / CORTE DIARIO */}
                {activeTab === 'close' && (
                  <form onSubmit={handleCloseShiftSubmit} className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fondo Inicial:</span>
                        <span className="font-bold font-mono">${activeShift.initialCashFloat.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>(+) Ventas Efectivo:</span>
                        <span className="font-bold font-mono">+${activeShift.cashSalesTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-bold border-t border-slate-200 pt-1">
                        <span>(=) Efectivo Esperado:</span>
                        <span className="font-mono text-sm">${activeShift.expectedCashInDrawer.toFixed(2)} MXN</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Efectivo Físico Contado en Cajón (Arqueo) *
                      </label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={actualCashInDrawer}
                          onChange={(e) => setActualCashInDrawer(Number(e.target.value))}
                          required
                          className="w-full pl-9 pr-4 py-2.5 text-base font-black text-slate-900 bg-white border-2 border-indigo-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                        />
                      </div>

                      {/* Real-time difference feedback */}
                      <div className={`mt-2 p-2.5 rounded-xl border text-xs font-black flex items-center justify-between ${
                        diff === 0
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : diff > 0
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        <span>Diferencia en Arqueo:</span>
                        <span className="font-mono text-sm">
                          {diff === 0
                            ? '✅ Exacto ($0.00)'
                            : diff > 0
                            ? `🟢 Sobrante +$${diff.toFixed(2)}`
                            : `🔴 Faltante -$${Math.abs(diff).toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Notas de Cierre
                      </label>
                      <input
                        type="text"
                        value={closeNotes}
                        onChange={(e) => setCloseNotes(e.target.value)}
                        placeholder="Ej. Arqueo completado sin anomalías"
                        className="w-full px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <Lock className="w-4 h-4" />
                      <span>🔒 Realizar Corte Diario & Cerrar Turno</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Printable Receipt Modal when shift is closed */}
      <CashShiftReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setCompletedShiftForReceipt(null);
          onClose();
        }}
        shift={completedShiftForReceipt}
      />
    </>
  );
};
