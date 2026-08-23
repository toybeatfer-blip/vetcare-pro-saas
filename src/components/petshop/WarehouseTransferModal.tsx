import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRightLeft,
  Building2,
  Package,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PetShopProduct, WarehouseLocation } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';

interface WarehouseTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct?: PetShopProduct | null;
}

const WAREHOUSES: WarehouseLocation[] = [
  'Tienda / Mostrador Pet Shop',
  'Bodega Central / Almacén General',
  'Farmacia / Consultorio 1',
  'Hospitalización / Quirófano',
  'Área de Estética & Baño',
];

export const WarehouseTransferModal: React.FC<WarehouseTransferModalProps> = ({
  isOpen,
  onClose,
  selectedProduct,
}) => {
  const { products, transferStockBetweenWarehouses, showToast } = useVeterinary();

  const [productId, setProductId] = useState<string>(
    selectedProduct?.id || (products[0]?.id || '')
  );
  const [sourceWarehouse, setSourceWarehouse] = useState<string>(
    selectedProduct?.warehouse || 'Bodega Central / Almacén General'
  );
  const [targetWarehouse, setTargetWarehouse] = useState<string>(
    'Tienda / Mostrador Pet Shop'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Reabastecimiento de mostrador');

  if (!isOpen) return null;

  const currentProd = products.find((p) => p.id === productId) || selectedProduct || products[0];

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProd) return;

    if (sourceWarehouse === targetWarehouse) {
      showToast('El almacén de origen y destino no pueden ser iguales.', 'warning');
      return;
    }

    if (quantity <= 0) {
      showToast('La cantidad a transferir debe ser mayor a 0.', 'warning');
      return;
    }

    if (currentProd.stockQuantity < quantity) {
      showToast(
        `Stock insuficiente en ${sourceWarehouse}. Stock disponible: ${currentProd.stockQuantity}`,
        'warning'
      );
      return;
    }

    const success = transferStockBetweenWarehouses(
      currentProd.id,
      sourceWarehouse,
      targetWarehouse,
      quantity
    );

    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 my-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Transferencia entre Almacenes</h2>
                <p className="text-xs text-blue-100">
                  Mueve inventario entre bodega, tienda mostrador, farmacia y quirófano
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleTransfer} className="p-6 space-y-4">
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Producto a Transferir *
              </label>
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  const p = products.find((x) => x.id === e.target.value);
                  if (p) setSourceWarehouse(p.warehouse);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.presentation}) • Stock: {p.stockQuantity} unid.
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Source and Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Almacén de Origen (Salida)
                </label>
                <select
                  value={sourceWarehouse}
                  onChange={(e) => setSourceWarehouse(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                >
                  {WAREHOUSES.map((wh) => (
                    <option key={wh} value={wh}>
                      {wh}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-700 uppercase mb-1">
                  Almacén Destino (Entrada)
                </label>
                <select
                  value={targetWarehouse}
                  onChange={(e) => setTargetWarehouse(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-indigo-50/60 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-900"
                >
                  {WAREHOUSES.map((wh) => (
                    <option key={wh} value={wh}>
                      {wh}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity and Max Stock Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Cantidad de Unidades a Mover *
                </label>
                {currentProd && (
                  <span className="text-xs font-bold text-slate-500">
                    Disponible: <strong className="text-indigo-600">{currentProd.stockQuantity} unid.</strong>
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max={currentProd?.stockQuantity || 999}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 text-center"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Motivo de la Transferencia
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. Reabastecimiento de mostrador para venta diaria"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Efectuar Transferencia</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
