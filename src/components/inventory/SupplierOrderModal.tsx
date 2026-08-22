import React, { useState, useEffect } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { MedicationItem } from '../../types';
import {
  X,
  Building2,
  Phone,
  Mail,
  Send,
  Copy,
  Check,
  Download,
  DollarSign,
  AlertTriangle,
  PackageCheck,
  ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupplierOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockItems: MedicationItem[];
}

export const SupplierOrderModal: React.FC<SupplierOrderModalProps> = ({
  isOpen,
  onClose,
  lowStockItems,
}) => {
  const { showToast, clinicSettings } = useVeterinary();
  const [copiedSupplier, setCopiedSupplier] = useState<string | null>(null);

  // Editable order quantities map { [medId]: orderQuantity }
  const [orderQuantities, setOrderQuantities] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    const initial: { [id: string]: number } = {};
    lowStockItems.forEach((item) => {
      const suggested = Math.max(10, item.minStockThreshold * 3 - item.quantity);
      initial[item.id] = suggested;
    });
    setOrderQuantities(initial);
  }, [lowStockItems, isOpen]);

  if (!isOpen) return null;

  // Group items by supplier name
  const suppliersMap = new Map<string, MedicationItem[]>();
  lowStockItems.forEach((item) => {
    const sName = item.supplier.name || 'Distribuidor General';
    const list = suppliersMap.get(sName) || [];
    list.push(item);
    suppliersMap.set(sName, list);
  });

  const handleQtyChange = (id: string, val: number) => {
    setOrderQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, isNaN(val) ? 1 : val),
    }));
  };

  const handleCopyOrderText = (supplierName: string, items: MedicationItem[]) => {
    const supplier = items[0]?.supplier;
    const todayFormatted = new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const lines = [
      `📋 ORDEN DE COMPRA DE MEDICAMENTOS VETERINARIOS`,
      `🏥 Clínica Veterinaria: ${clinicSettings.name}`,
      `🏢 Proveedor: ${supplierName}`,
      `👤 Contacto: ${supplier?.contactPerson || 'Ventas'}`,
      `📅 Fecha: ${todayFormatted}`,
      `------------------------------------------------`,
      `FÁRMACOS REQUERIDOS:`,
    ];

    let totalEst = 0;
    items.forEach((item, idx) => {
      const qty = orderQuantities[item.id] || 10;
      const subtotal = qty * item.costPrice;
      totalEst += subtotal;
      lines.push(
        `${idx + 1}. ${item.name} (${item.presentation})` +
          `\n   • Cantidad solicitada: ${qty} ${item.unit}` +
          `\n   • Stock actual en clínica: ${item.quantity} ${item.unit}` +
          `\n   • Costo estimado: $${subtotal.toLocaleString('es-MX')} MXN`
      );
    });

    lines.push(`------------------------------------------------`);
    lines.push(`💰 TOTAL ESTIMADO DE PEDIDO: $${totalEst.toLocaleString('es-MX')} MXN`);
    lines.push(`📍 Dirección de Entrega: ${clinicSettings.address}`);
    lines.push(`📞 Teléfono de Recepción: ${clinicSettings.phone}`);

    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedSupplier(supplierName);
    showToast(`Orden para "${supplierName}" copiada al portapapeles.`);
    setTimeout(() => setCopiedSupplier(null), 3000);
  };

  const handleSendWhatsApp = (supplierName: string, items: MedicationItem[]) => {
    const supplier = items[0]?.supplier;
    if (!supplier?.phone) {
      showToast('No se encontró teléfono para este proveedor.', 'warning');
      return;
    }

    const cleanPhone = supplier.phone.replace(/[^0-9]/g, '');
    const lines = [
      `Hola ${supplier.contactPerson || 'Ventas ' + supplierName}, te compartimos el pedido de reposición urgente de ${clinicSettings.name}:`,
      '',
    ];

    items.forEach((item) => {
      const qty = orderQuantities[item.id] || 10;
      lines.push(`• ${item.name} (${item.presentation}) -> *${qty} ${item.unit}*`);
    });

    lines.push('');
    lines.push(`Favor de confirmarnos disponibilidad, tiempos de entrega y factura. ¡Gracias!`);

    const encoded = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  // Grand total calculation
  let grandTotal = 0;
  lowStockItems.forEach((item) => {
    const qty = orderQuantities[item.id] || 10;
    grandTotal += qty * item.costPrice;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 my-6 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Generador de Pedidos a Proveedores
                </h2>
                <p className="text-xs text-indigo-200">
                  {lowStockItems.length} fármacos en nivel de stock crítico o por debajo de su umbral
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {lowStockItems.length === 0 ? (
              <div className="py-12 text-center">
                <PackageCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">¡Inventario en Niveles Óptimos!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  No hay ningún medicamento con existencias por debajo de su umbral mínimo de seguridad.
                </p>
              </div>
            ) : (
              <>
                {/* Total Summary Banner */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        {lowStockItems.length} Medicamentos Requieren Reabastecimiento
                      </h4>
                      <p className="text-[11px] text-amber-700">
                        Divididos entre {suppliersMap.size} distribuidores farmacéuticos
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Presupuesto Estimado Total
                    </span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                </div>

                {/* Grouped by Supplier */}
                <div className="space-y-6">
                  {Array.from(suppliersMap.entries()).map(([supplierName, items]) => {
                    const firstItem = items[0];
                    const supplier = firstItem.supplier;

                    let supplierTotal = 0;
                    items.forEach((it) => {
                      const q = orderQuantities[it.id] || 10;
                      supplierTotal += q * it.costPrice;
                    });

                    return (
                      <div
                        key={supplierName}
                        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs"
                      >
                        {/* Supplier Box Header */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                              <h3 className="text-sm font-bold text-slate-800">{supplierName}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                {items.length} {items.length === 1 ? 'fármaco' : 'fármacos'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              {supplier.contactPerson && (
                                <span>Ejecutivo: <strong className="text-slate-700">{supplier.contactPerson}</strong></span>
                              )}
                              <span>Tel: <strong className="text-slate-700">{supplier.phone}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopyOrderText(supplierName, items)}
                              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                            >
                              {copiedSupplier === supplierName ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-bold">¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Copiar Pedido</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendWhatsApp(supplierName, items)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs shadow-emerald-200"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Enviar por WhatsApp</span>
                            </button>
                          </div>
                        </div>

                        {/* Items Table */}
                        <div className="p-4 overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-2">
                                <th className="pb-2">Fármaco / Presentación</th>
                                <th className="pb-2 text-center">Stock Actual</th>
                                <th className="pb-2 text-center">Umbral Mín.</th>
                                <th className="pb-2 text-center">Cant. a Pedir</th>
                                <th className="pb-2 text-right">Costo Unit.</th>
                                <th className="pb-2 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {items.map((item) => {
                                const qty = orderQuantities[item.id] || 10;
                                const subtotal = qty * item.costPrice;

                                return (
                                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-2.5 pr-2">
                                      <span className="font-bold text-slate-800 block">{item.name}</span>
                                      <span className="text-[10px] text-slate-500">
                                        {item.presentation} • Lote act: {item.batchNumber}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-center">
                                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                        {item.quantity} {item.unit}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-center text-slate-500 font-medium">
                                      {item.minStockThreshold} {item.unit}
                                    </td>
                                    <td className="py-2.5 text-center">
                                      <input
                                        type="number"
                                        min="1"
                                        value={qty}
                                        onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 1)}
                                        className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-slate-800 text-xs focus:bg-white focus:border-indigo-500"
                                      />
                                    </td>
                                    <td className="py-2.5 text-right font-mono text-slate-600">
                                      ${item.costPrice.toFixed(2)}
                                    </td>
                                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                                      ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="border-t border-slate-200 font-bold text-slate-800">
                                <td colSpan={5} className="pt-3 text-right text-slate-600">
                                  Subtotal Proveedor {supplierName}:
                                </td>
                                <td className="pt-3 text-right font-mono text-indigo-700 text-sm">
                                  ${supplierTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500">
              💡 Puedes ajustar las cantidades solicitadas en la tabla antes de enviar o copiar la orden.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all"
            >
              Cerrar Ventana
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
