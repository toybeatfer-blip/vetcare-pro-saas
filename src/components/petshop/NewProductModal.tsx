import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Package,
  DollarSign,
  Tag,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Percent,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import {
  PetShopProduct,
  ProductCategory,
  ProductPresentation,
  WarehouseLocation,
} from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: PetShopProduct | null;
}

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Alimento Seco / Croquetas',
  'Alimento Húmedo / Latas',
  'Dietas de Prescripción',
  'Premios & Snacks',
  'Collares, Correas & Pecheras',
  'Juguetes & Rascadores',
  'Camas, Casas & Transportadoras',
  'Higiene, Champú & Estética',
  'Arenas & Bandejas Sanitarias',
  'Farmacia & Medicamentos',
  'Suplementos & Vitaminas',
  'Otro Accesorio',
];

const PRODUCT_PRESENTATIONS: ProductPresentation[] = [
  'Bolsa 20 kg',
  'Bolsa 15 kg',
  'Bolsa 7.5 kg',
  'Bolsa 2 kg',
  'Bolsa 1 kg',
  'Lata 370 g',
  'Pouch / Sobre 85 g',
  'Pieza / Unidad',
  'Talla CH (Chica)',
  'Talla M (Mediana)',
  'Talla G (Grande)',
  'Talla XG (Extra Grande)',
  'Frasco',
  'Caja',
  'Blíster',
  'Litro / Mililitros',
  'A granel / Kilo',
  'Otro Formato',
];

const WAREHOUSES: WarehouseLocation[] = [
  'Tienda / Mostrador Pet Shop',
  'Bodega Central / Almacén General',
  'Farmacia / Consultorio 1',
  'Hospitalización / Quirófano',
  'Área de Estética & Baño',
];

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { addProduct, updateProduct, showToast } = useVeterinary();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Alimento Seco / Croquetas');
  const [presentation, setPresentation] = useState<ProductPresentation | string>('Bolsa 15 kg');
  const [warehouse, setWarehouse] = useState<WarehouseLocation | string>('Tienda / Mostrador Pet Shop');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(3);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setPresentation(productToEdit.presentation);
      setWarehouse(productToEdit.warehouse);
      setCostPrice(productToEdit.costPrice);
      setSalePrice(productToEdit.salePrice);
      setStockQuantity(productToEdit.stockQuantity);
      setMinStockAlert(productToEdit.minStockAlert);
      setSupplierName(productToEdit.supplierName || '');
      setSupplierPhone(productToEdit.supplierPhone || '');
      setExpirationDate(productToEdit.expirationDate || '');
      setNotes(productToEdit.notes || '');
    } else {
      setName('');
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setBrand('');
      setCategory('Alimento Seco / Croquetas');
      setPresentation('Bolsa 15 kg');
      setWarehouse('Tienda / Mostrador Pet Shop');
      setCostPrice(500);
      setSalePrice(750);
      setStockQuantity(10);
      setMinStockAlert(3);
      setSupplierName('');
      setSupplierPhone('');
      setExpirationDate('');
      setNotes('');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time Margin calculation
  const profitMargin =
    costPrice > 0 ? (((salePrice - costPrice) / costPrice) * 100).toFixed(1) : '0';
  const unitProfit = Math.max(0, salePrice - costPrice);

  const handleGenerateSku = () => {
    const prefix = brand.substring(0, 3).toUpperCase() || 'PET';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Por favor escribe el nombre del producto.', 'warning');
      return;
    }
    if (salePrice <= 0) {
      showToast('El precio de venta debe ser mayor a 0.', 'warning');
      return;
    }

    const payload = {
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      brand: brand.trim() || 'Genérico',
      category,
      presentation,
      warehouse,
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      minStockAlert: Number(minStockAlert) || 1,
      supplierName: supplierName.trim() || undefined,
      supplierPhone: supplierPhone.trim() || undefined,
      expirationDate: expirationDate || undefined,
      notes: notes.trim() || undefined,
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">
                  {productToEdit ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                </h2>
                <p className="text-xs text-amber-100 mt-0.5">
                  Alimentos, accesorios, higiene y farmacia con control de precios, presentación y almacén
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            {/* SKU and Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Código / SKU / Código de Barras
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[11px] text-amber-700 font-bold hover:underline cursor-pointer"
                  >
                    Auto-generar
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej. ROY-GASTRO-15K"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Marca / Fabricante *
                </label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Ej. Royal Canin, Hill's, KONG, Truelove..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Alimento Royal Canin Gastrointestinal Canine Adulto"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
              />
            </div>

            {/* Category & Presentation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Categoría del Producto *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden cursor-pointer"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  📦 Presentación / Formato de Empaque *
                </label>
                <select
                  value={presentation}
                  onChange={(e) => setPresentation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden cursor-pointer"
                >
                  {PRODUCT_PRESENTATIONS.map((pres) => (
                    <option key={pres} value={pres}>
                      {pres}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Warehouse Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                🏬 Almacén / Depósito de Ubicación *
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300/80 rounded-xl text-xs font-bold text-amber-950 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden cursor-pointer"
              >
                {WAREHOUSES.map((wh) => (
                  <option key={wh} value={wh}>
                    🏢 {wh}
                  </option>
                ))}
              </select>
            </div>

            {/* Financials & Margin Box */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-amber-50/40 rounded-2xl border border-amber-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Estructura de Precios & Margen de Ganancia
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  +{profitMargin}% Utilidad
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Precio Costo Proveedor ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={costPrice}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Precio Venta al Público ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-emerald-600">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={salePrice}
                      onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-emerald-300 rounded-xl text-xs font-black text-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Ganancia Neta / Unidad
                  </label>
                  <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-black text-emerald-800 flex items-center justify-between">
                    <span>+$ {unitProfit.toLocaleString()} MXN</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Quantities & Alert */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Stock Disponible
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Alerta Stock Mínimo
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Caducidad (Opcional)
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Supplier & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Ej. Distribuidora Royal México"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Teléfono de Contacto Proveedor
                </label>
                <input
                  type="tel"
                  value={supplierPhone}
                  onChange={(e) => setSupplierPhone(e.target.value)}
                  placeholder="Ej. +52 55 5544 3322"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Notas / Instrucciones de Venta
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de almacenamiento, promociones o indicaciones..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 resize-none outline-hidden"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-petshop-product"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs font-black shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{productToEdit ? 'Guardar Cambios' : 'Registrar en Catálogo'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
