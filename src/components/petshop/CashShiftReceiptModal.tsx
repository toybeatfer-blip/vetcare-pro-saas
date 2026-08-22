import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  DollarSign,
  Calendar,
  User,
  Clock,
  Receipt,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  ShoppingBag,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { CashRegisterShift } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import { printTicketSafely } from '../../utils/thermalPrinter';

interface CashShiftReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: CashRegisterShift | null;
}

export const CashShiftReceiptModal: React.FC<CashShiftReceiptModalProps> = ({
  isOpen,
  onClose,
  shift,
}) => {
  const { clinicSettings } = useVeterinary();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !shift) return null;

  const diff = shift.cashDifference ?? 0;
  const diffText =
    diff === 0
      ? 'Exacto (Cuadrado)'
      : diff > 0
      ? `Sobrante +$${diff.toFixed(2)}`
      : `Faltante -$${Math.abs(diff).toFixed(2)}`;

  const handlePrint = () => {
    // Generate clean HTML for isolated, zero-hang printing
    const clinicName = clinicSettings.name || 'VETCARE PRO';
    const slogan = clinicSettings.slogan || 'Control Clínico, Citas & Pet Shop';
    const address = clinicSettings.address || '';
    const phone = clinicSettings.phone || '';

    const htmlContent = `
      <div class="text-center">
        <div class="font-black" style="font-size: 13px;">${clinicName}</div>
        <div style="font-size: 10px; color: #444;">${slogan}</div>
        ${address ? `<div style="font-size: 9.5px; color: #555;">${address}</div>` : ''}
        ${phone ? `<div style="font-size: 9.5px; color: #555;">Tel: ${phone}</div>` : ''}
        <div class="divider"></div>
        <div class="font-black uppercase" style="font-size: 11px;">*** CORTE DE CAJA / ARQUEO DIARIO ***</div>
      </div>

      <div class="divider"></div>

      <div style="font-size: 10.5px;">
        <div class="flex-between">
          <span>Folio Turno:</span>
          <span class="font-black">${shift.shiftFolio}</span>
        </div>
        <div class="flex-between">
          <span>Cajero(a):</span>
          <span class="font-bold">${shift.openedBy}</span>
        </div>
        <div class="flex-between">
          <span>Apertura:</span>
          <span>${shift.openedAt}</span>
        </div>
        ${shift.closedAt ? `
        <div class="flex-between">
          <span>Cierre:</span>
          <span>${shift.closedAt}</span>
        </div>` : ''}
      </div>

      <div class="divider"></div>

      <div style="font-size: 11px;">
        <div class="font-black uppercase" style="margin-bottom: 3px;">RESUMEN DE EFECTIVO</div>
        <div class="flex-between">
          <span>Fondo Inicial:</span>
          <span>$${shift.initialCashFloat.toFixed(2)}</span>
        </div>
        <div class="flex-between font-bold">
          <span>(+) Ventas Efectivo:</span>
          <span>+$${shift.cashSalesTotal.toFixed(2)}</span>
        </div>
        ${shift.cashInsTotal > 0 ? `
        <div class="flex-between">
          <span>(+) Entradas Extra:</span>
          <span>+$${shift.cashInsTotal.toFixed(2)}</span>
        </div>` : ''}
        ${shift.cashOutsTotal > 0 ? `
        <div class="flex-between font-bold">
          <span>(-) Retiros/Gastos:</span>
          <span>-$${shift.cashOutsTotal.toFixed(2)}</span>
        </div>` : ''}
        <div class="divider"></div>
        <div class="flex-between font-black">
          <span>(=) Efectivo Esperado:</span>
          <span>$${shift.expectedCashInDrawer.toFixed(2)}</span>
        </div>
        ${shift.status === 'closed' ? `
        <div class="flex-between font-black" style="font-size: 11.5px; margin-top: 2px;">
          <span>💵 Físico Contado:</span>
          <span>$${(shift.actualCashInDrawer ?? 0).toFixed(2)}</span>
        </div>
        <div class="flex-between font-black">
          <span>⚖️ Diferencia:</span>
          <span>${diffText}</span>
        </div>` : ''}
      </div>

      <div class="divider"></div>

      <div style="font-size: 10.5px;">
        <div class="font-black uppercase" style="margin-bottom: 3px;">VENTAS POR FORMA DE PAGO</div>
        <div class="flex-between">
          <span>• Efectivo:</span>
          <span>$${shift.cashSalesTotal.toFixed(2)}</span>
        </div>
        <div class="flex-between">
          <span>• Tarjetas Débito/Crédito:</span>
          <span>$${shift.cardSalesTotal.toFixed(2)}</span>
        </div>
        <div class="flex-between">
          <span>• Transferencias SPEI:</span>
          <span>$${shift.transferSalesTotal.toFixed(2)}</span>
        </div>
        ${shift.otherSalesTotal > 0 ? `
        <div class="flex-between">
          <span>• Otros Métodos:</span>
          <span>$${shift.otherSalesTotal.toFixed(2)}</span>
        </div>` : ''}
        <div class="divider"></div>
        <div class="flex-between font-black" style="font-size: 11.5px;">
          <span>TOTAL VENTAS (${shift.salesCount} tkts):</span>
          <span>$${shift.totalSalesAmount.toFixed(2)} MXN</span>
        </div>
      </div>

      <div class="divider"></div>

      <div style="font-size: 10.5px;">
        <div class="font-black uppercase" style="margin-bottom: 3px;">DESGLOSE POR CONCEPTO</div>
        <div class="flex-between">
          <span>🛍️ Pet Shop & Alimentos:</span>
          <span class="font-bold">$${(shift.salesBreakdown?.petshopAmount ?? 0).toFixed(2)}</span>
        </div>
        <div class="flex-between">
          <span>🩺 Consultas Médicas:</span>
          <span class="font-bold">$${(shift.salesBreakdown?.consultationsAmount ?? 0).toFixed(2)}</span>
        </div>
        <div class="flex-between">
          <span>💉 Vacunas & Desparasit.:</span>
          <span class="font-bold">$${(shift.salesBreakdown?.vaccinesAmount ?? 0).toFixed(2)}</span>
        </div>
      </div>

      ${shift.notes ? `
      <div class="divider"></div>
      <div style="font-size: 9.5px; color: #555; font-style: italic;">
        Notas: ${shift.notes}
      </div>` : ''}

      <div class="divider"></div>
      <div class="text-center" style="font-size: 9px; color: #666; margin-top: 6px;">
        <div>*** FIN DEL CORTE DIARIO ***</div>
        <div>Reporte generado por VetCare Pro POS</div>
      </div>
    `;

    printTicketSafely({
      title: `Corte_Caja_${shift.shiftFolio}`,
      htmlContent,
    });
  };

  const handleSendWhatsApp = () => {
    const directorPhone = (clinicSettings.phone || clinicSettings.emergencyPhone || '').replace(/[^0-9]/g, '');

    const text = `📊 *CORTE DIARIO DE CAJA - ${clinicSettings.name || 'VetCare Pro'}*
━━━━━━━━━━━━━━━━━━━━
📌 *Folio:* ${shift.shiftFolio}
👤 *Cajero:* ${shift.openedBy || 'Usuario'}
🕒 *Apertura:* ${shift.openedAt}
🔒 *Cierre:* ${shift.closedAt || 'En curso'}

💰 *RESUMEN DE CAJA (EFECTIVO)*
• Fondo Inicial: $${shift.initialCashFloat.toFixed(2)} MXN
• (+) Ventas Efectivo: $${shift.cashSalesTotal.toFixed(2)} MXN
• (+) Entradas Extra: $${shift.cashInsTotal.toFixed(2)} MXN
• (-) Retiros / Gastos: $${shift.cashOutsTotal.toFixed(2)} MXN
• (=) *Efectivo Esperado:* $${shift.expectedCashInDrawer.toFixed(2)} MXN
• 💵 *Efectivo Real Contado:* $${(shift.actualCashInDrawer ?? 0).toFixed(2)} MXN
• ⚖️ *Diferencia:* ${diffText}

💳 *VENTAS POR FORMA DE PAGO*
• Efectivo: $${shift.cashSalesTotal.toFixed(2)} MXN
• Tarjetas (Débito/Crédito): $${shift.cardSalesTotal.toFixed(2)} MXN
• Transferencias SPEI: $${shift.transferSalesTotal.toFixed(2)} MXN
• Otros Métodos: $${shift.otherSalesTotal.toFixed(2)} MXN
• 🌟 *TOTAL GENERAL VENTAS:* $${shift.totalSalesAmount.toFixed(2)} MXN (${shift.salesCount} tickets)

🏷️ *DESGLOSE POR CONCEPTO*
• 🛍️ Pet Shop & Alimentos: $${(shift.salesBreakdown?.petshopAmount ?? 0).toFixed(2)} MXN
• 🩺 Consultas Médicas: $${(shift.salesBreakdown?.consultationsAmount ?? 0).toFixed(2)} MXN
• 💉 Vacunas & Desparasitaciones: $${(shift.salesBreakdown?.vaccinesAmount ?? 0).toFixed(2)} MXN
━━━━━━━━━━━━━━━━━━━━
_Reporte generado automáticamente por VetCare Pro POS_`;

    const encoded = encodeURIComponent(text);
    const url = directorPhone ? `https://wa.me/${directorPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 relative overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Comprobante de Corte Diario
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {shift.shiftFolio} • {shift.status === 'closed' ? 'Corte Finalizado' : 'Turno Activo'}
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

          {/* Printable Ticket Area */}
          <div
            ref={printRef}
            className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 font-mono text-xs text-slate-800 space-y-3 shadow-inner max-h-[60vh] overflow-y-auto"
          >
            {/* Clinic Info */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <div className="font-black text-sm text-slate-900 uppercase">
                {clinicSettings.name || 'VETCARE PRO'}
              </div>
              <div className="text-[11px] text-slate-500">
                {clinicSettings.slogan || 'Control Clínico, Citas & Pet Shop'}
              </div>
              {clinicSettings.address && (
                <div className="text-[10px] text-slate-500 mt-0.5">{clinicSettings.address}</div>
              )}
              {clinicSettings.phone && (
                <div className="text-[10px] text-slate-500">Tel: {clinicSettings.phone}</div>
              )}
              <div className="text-[11px] font-black text-indigo-700 mt-1 uppercase tracking-wider">
                *** CORTE DE CAJA / ARQUEO DIARIO ***
              </div>
            </div>

            {/* Shift Metadata */}
            <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Folio Turno:</span>
                <span className="font-bold">{shift.shiftFolio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cajero(a):</span>
                <span className="font-bold">{shift.openedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Apertura:</span>
                <span>{shift.openedAt}</span>
              </div>
              {shift.closedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Cierre:</span>
                  <span>{shift.closedAt}</span>
                </div>
              )}
            </div>

            {/* Cash Drawer Reconciliation */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="font-black text-[11px] text-slate-900 flex items-center justify-between">
                <span>ARQUEO EN EFECTIVO</span>
                <span>MONTO ($)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Fondo Inicial de Caja:</span>
                <span>${shift.initialCashFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>(+) Ventas en Efectivo:</span>
                <span>+${shift.cashSalesTotal.toFixed(2)}</span>
              </div>
              {shift.cashInsTotal > 0 && (
                <div className="flex justify-between text-sky-700">
                  <span>(+) Entradas Extra:</span>
                  <span>+${shift.cashInsTotal.toFixed(2)}</span>
                </div>
              )}
              {shift.cashOutsTotal > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>(-) Retiros / Gastos:</span>
                  <span>-${shift.cashOutsTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-1 border-t border-slate-200 flex justify-between font-black text-slate-900">
                <span>(=) Efectivo Esperado:</span>
                <span>${shift.expectedCashInDrawer.toFixed(2)}</span>
              </div>
              {shift.status === 'closed' && (
                <>
                  <div className="flex justify-between font-black text-indigo-700 text-xs">
                    <span>💵 Efectivo Físico Contado:</span>
                    <span>${(shift.actualCashInDrawer ?? 0).toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between font-black text-xs ${
                    diff === 0 ? 'text-emerald-600' : diff > 0 ? 'text-blue-600' : 'text-rose-600'
                  }`}>
                    <span>⚖️ Diferencia de Caja:</span>
                    <span>
                      {diff === 0 ? '✅ $0.00 (Exacto)' : diff > 0 ? `🟢 +$${diff.toFixed(2)} (Sobrante)` : `🔴 -$${Math.abs(diff).toFixed(2)} (Faltante)`}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Payment Methods Breakdown */}
            <div className="space-y-1 border-b border-dashed border-slate-300 pb-2.5">
              <div className="font-black text-[11px] text-slate-900 mb-1">
                VENTAS TOTALES POR FORMA DE PAGO
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Efectivo:</span>
                <span>${shift.cashSalesTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Tarjetas (Débito/Crédito):</span>
                <span>${shift.cardSalesTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>• Transferencias SPEI:</span>
                <span>${shift.transferSalesTotal.toFixed(2)}</span>
              </div>
              {shift.otherSalesTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>• Otros Métodos:</span>
                  <span>${shift.otherSalesTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-900 pt-1 text-xs">
                <span>TOTAL GENERAL ({shift.salesCount} tickets):</span>
                <span>${shift.totalSalesAmount.toFixed(2)} MXN</span>
              </div>
            </div>

            {/* Concept Breakdown */}
            <div className="space-y-1 text-[11px]">
              <div className="font-black text-slate-900 mb-1">DESGLOSE POR CONCEPTO</div>
              <div className="flex justify-between text-amber-800">
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-amber-600" />
                  Pet Shop & Alimentos:
                </span>
                <span className="font-bold">${(shift.salesBreakdown?.petshopAmount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-indigo-800">
                <span className="flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-indigo-600" />
                  Consultas Médicas:
                </span>
                <span className="font-bold">${(shift.salesBreakdown?.consultationsAmount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-teal-800">
                <span className="flex items-center gap-1">
                  <Syringe className="w-3 h-3 text-teal-600" />
                  Vacunas & Desparasitaciones:
                </span>
                <span className="font-bold">${(shift.salesBreakdown?.vaccinesAmount ?? 0).toFixed(2)}</span>
              </div>
            </div>

            {shift.notes && (
              <div className="pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 italic">
                Notas: {shift.notes}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={handlePrint}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-95"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir Corte</span>
            </button>

            <button
              onClick={handleSendWhatsApp}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Enviar por WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
