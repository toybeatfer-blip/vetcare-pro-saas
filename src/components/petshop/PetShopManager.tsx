import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Plus,
  ArrowRightLeft,
  Building2,
  Package,
  DollarSign,
  TrendingUp,
  Tag,
  Layers,
  Edit2,
  Trash2,
  Receipt,
  Printer,
  Send,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  List,
  Sparkles,
  Percent,
  Calendar,
  Filter,
  Lock,
  Unlock,
  Banknote,
  Clock,
  User,
} from 'lucide-react';
import {
  PetShopProduct,
  ProductCategory,
  ProductPresentation,
  WarehouseLocation,
  PetShopSaleReceipt,
  CashRegisterShift,
} from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import { NewProductModal } from './NewProductModal';
import { PetShopPOSModal } from './PetShopPOSModal';
import { WarehouseTransferModal } from './WarehouseTransferModal';
import { PetShopReceiptModal } from './PetShopReceiptModal';
import { CashRegisterShiftModal } from './CashRegisterShiftModal';
import { CashShiftReceiptModal } from './CashShiftReceiptModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

const WAREHOUSES = [
  { name: 'Tienda / Mostrador Pet Shop', iconColor: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  { name: 'Bodega Central / Almacén General', iconColor: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { name: 'Farmacia / Consultorio 1', iconColor: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  { name: 'Hospitalización / Quirófano', iconColor: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { name: 'Área de Estética & Baño', iconColor: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
];

const CATEGORY_TABS = [
  'Todos',
  'Alimento Seco / Croquetas',
  'Alimento Húmedo / Latas',
  'Dietas de Prescripción',
  'Premios & Snacks',
  'Collares, Correas & Pecheras',
  'Juguetes & Rascadores',
  'Camas, Casas & Transportadoras',
  'Higiene, Champú & Estética',
  'Farmacia & Medicamentos',
];

export const PetShopManager: React.FC = () => {
  const {
    products,
    salesReceipts,
    cashShifts,
    activeShift,
    deleteProduct,
    showToast,
  } = useVeterinary();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'sales' | 'shifts'>('catalog');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Todos');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'low' | 'out' | 'optimal'>('all');

  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PetShopProduct | null>(null);

  const [isPOSModalOpen, setIsPOSModalOpen] = useState(false);
  const [posInitialProductId, setPosInitialProductId] = useState<string | undefined>(undefined);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSelectedProduct, setTransferSelectedProduct] = useState<PetShopProduct | null>(null);

  const [isCashShiftModalOpen, setIsCashShiftModalOpen] = useState(false);
  const [viewingShiftReceipt, setViewingShiftReceipt] = useState<CashRegisterShift | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<PetShopSaleReceipt | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.presentation.toLowerCase().includes(q) ||
        p.warehouse.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
      if (selectedWarehouse !== 'Todos' && p.warehouse !== selectedWarehouse) return false;
      if (selectedStockFilter === 'out' && p.stockQuantity > 0) return false;
      if (selectedStockFilter === 'low' && (p.stockQuantity === 0 || p.stockQuantity > p.minStockAlert)) return false;
      if (selectedStockFilter === 'optimal' && p.stockQuantity <= p.minStockAlert) return false;

      return true;
    });
  }, [products, searchTerm, selectedCategory, selectedWarehouse, selectedStockFilter]);

  const totalCatalogItems = products.length;
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0);
  const totalPotentialSales = products.reduce((sum, p) => sum + p.salePrice * p.stockQuantity, 0);
  const totalSalesRevenue = salesReceipts.reduce((sum, s) => sum + s.total, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  const handleOpenEditProduct = (prod: PetShopProduct) => {
    setEditingProduct(prod);
    setIsNewProductModalOpen(true);
  };

  const handleOpenPOSWithProduct = (prodId?: string) => {
    setPosInitialProductId(prodId);
    setIsPOSModalOpen(true);
  };

  const handleOpenTransfer = (prod?: PetShopProduct) => {
    setTransferSelectedProduct(prod || null);
    setIsTransferModalOpen(true);
  };
  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 rounded-3xl text-white shadow-xl shadow-amber-900/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Venta de Alimentos, Accesorios & Almacenes
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 text-amber-100 backdrop-blur-xs">
                Pet Shop, POS & Caja
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-2xl font-medium">
              Control de precios, formatos de presentación, múltiples almacenes y corte diario de caja
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* BOTÓN CONTROL DE CAJA / CORTE DIARIO */}
          <button
            type="button"
            id="btn-cash-shift-modal"
            onClick={() => setIsCashShiftModalOpen(true)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${
              activeShift
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-emerald-900/20'
                : 'bg-amber-950/80 text-amber-200 border border-amber-500/40 hover:bg-amber-900'
            }`}
          >
            {activeShift ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" />
                <div className="text-left leading-tight">
                  <span className="block text-[10px] text-emerald-400 font-extrabold uppercase">Turno Abierto</span>
                  <span className="font-mono text-xs text-white">${activeShift.expectedCashInDrawer.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Abrir Turno de Caja</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="btn-open-pos"
            onClick={() => handleOpenPOSWithProduct()}
            className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl text-xs font-black shadow-lg shadow-black/10 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 text-amber-600" />
            <span>Punto de Venta (POS)</span>
          </button>

          <button
            type="button"
            id="btn-warehouse-transfer"
            onClick={() => handleOpenTransfer()}
            className="px-3.5 py-2.5 bg-black/20 hover:bg-black/30 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-200" />
            <span>Transferir Almacenes</span>
          </button>

          <button
            type="button"
            id="btn-new-product"
            onClick={() => {
              setEditingProduct(null);
              setIsNewProductModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-lg transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ventas Cobradas (POS)
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
              ${totalSalesRevenue.toLocaleString()} <span className="text-xs text-slate-400 font-bold font-sans">MXN</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 block">
              {salesReceipts.length} tickets emitidos
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Catálogo de Productos
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {totalCatalogItems} <span className="text-xs text-slate-400 font-bold">artículos</span>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 mt-0.5 block">
              {totalStockUnits} unidades en stock
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Valor de Inventario
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-mono">
              ${totalInventoryCost.toLocaleString()} <span className="text-xs text-slate-400 font-bold font-sans">costo</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5 block font-mono">
              ${totalPotentialSales.toLocaleString()} venta potencial
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Control de Turnos
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {activeShift ? '🟢 Turno Activo' : '🔒 Caja Cerrada'}
            </div>
            <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
              {cashShifts.length} cortes registrados
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
            activeShift ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}>
            <Banknote className="w-6 h-6" />
          </div>
        </div>
      </div>
      {/* Sub-Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-petshop-catalog"
            onClick={() => setActiveSubTab('catalog')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-amber-500 text-white font-black shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catálogo & Almacenes ({products.length})</span>
          </button>

          <button
            type="button"
            id="tab-petshop-sales"
            onClick={() => setActiveSubTab('sales')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'sales'
                ? 'bg-amber-500 text-white font-black shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Historial de Tickets ({salesReceipts.length})</span>
          </button>

          <button
            type="button"
            id="tab-petshop-shifts"
            onClick={() => setActiveSubTab('shifts')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'shifts'
                ? 'bg-amber-500 text-white font-black shadow-md shadow-amber-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Control de Caja & Turnos ({cashShifts.length})</span>
          </button>
        </div>

        {activeSubTab === 'catalog' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* SUBTAB 1: CATALOG VIEW */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Warehouse Pills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedWarehouse('Todos')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedWarehouse === 'Todos'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos los Almacenes ({products.length})
            </button>
            {WAREHOUSES.map((wh) => {
              const count = products.filter((p) => p.warehouse === wh.name).length;
              return (
                <button
                  key={wh.name}
                  type="button"
                  onClick={() => setSelectedWarehouse(wh.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedWarehouse === wh.name
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{wh.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedWarehouse === wh.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, código SKU, marca, formato, almacén..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="md:col-span-4 flex items-center gap-2">
                <select
                  value={selectedStockFilter}
                  onChange={(e) => setSelectedStockFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden cursor-pointer"
                >
                  <option value="all">Filtro Stock: Todos ({products.length})</option>
                  <option value="low">Stock Bajo ({lowStockCount})</option>
                  <option value="out">Agotados (0)</option>
                  <option value="optimal">Stock Óptimo</option>
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {CATEGORY_TABS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid / Table Content */}
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 p-6">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No se encontraron productos</h3>
              <p className="text-xs text-slate-400 mt-1">Prueba cambiando los filtros o el término de búsqueda.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stockQuantity === 0;
                const isLowStock = prod.stockQuantity > 0 && prod.stockQuantity <= prod.minStockAlert;
                const profitMargin =
                  prod.costPrice > 0
                    ? (((prod.salePrice - prod.costPrice) / prod.costPrice) * 100).toFixed(0)
                    : '0';

                return (
                  <motion.div
                    key={prod.id}
                    layout
                    className="p-4 bg-white rounded-3xl border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                          {prod.sku}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-full truncate max-w-[140px]">
                          {prod.presentation}
                        </span>
                      </div>

                      <h3 className="font-black text-sm text-slate-900 line-clamp-2 leading-tight">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{prod.brand} • {prod.category}</p>

                      <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                        <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{prod.warehouse}</span>
                      </div>

                      {/* Financials & Margins */}
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-2xl space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Costo Compra:</span>
                          <span className="font-bold text-slate-700 font-mono">${prod.costPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Precio Venta:</span>
                          <span className="font-black text-slate-900 font-mono">${prod.salePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                          <span className="text-emerald-700 font-bold">Margen Ganancia:</span>
                          <span className="font-black text-emerald-700">+{profitMargin}% (${(prod.salePrice - prod.costPrice).toFixed(0)})</span>
                        </div>
                      </div>

                      {/* Stock Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className={`font-black ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {isOutOfStock ? 'Agotado (0)' : isLowStock ? `Stock Bajo: ${prod.stockQuantity}` : `Stock: ${prod.stockQuantity} unid.`}
                          </span>
                          <span className="text-[10px] text-slate-400">Mín: {prod.minStockAlert}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOutOfStock ? 'bg-rose-500 w-0' : isLowStock ? 'bg-amber-500 w-1/4' : 'bg-emerald-500 w-3/4'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-1.5 pt-3 mt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenTransfer(prod)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          title="Transferir a otro almacén"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(prod.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleOpenPOSWithProduct(prod.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Vender</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Código / SKU</th>
                      <th className="p-3.5">Producto & Marca</th>
                      <th className="p-3.5">Presentación</th>
                      <th className="p-3.5">Almacén</th>
                      <th className="p-3.5 text-center">Stock</th>
                      <th className="p-3.5 text-right">Precio Costo</th>
                      <th className="p-3.5 text-right">Precio Venta</th>
                      <th className="p-3.5 text-right">Margen</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((prod) => {
                      const profitMargin =
                        prod.costPrice > 0
                          ? (((prod.salePrice - prod.costPrice) / prod.costPrice) * 100).toFixed(0)
                          : '0';

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-500">{prod.sku}</td>
                          <td className="p-3.5">
                            <span className="font-black text-slate-900 block">{prod.name}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{prod.brand} • {prod.category}</span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md">{prod.presentation}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold">
                              {prod.warehouse}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                              prod.stockQuantity === 0
                                ? 'bg-rose-100 text-rose-700'
                                : prod.stockQuantity <= prod.minStockAlert
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {prod.stockQuantity}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-medium text-slate-600 font-mono">${prod.costPrice.toLocaleString()}</td>
                          <td className="p-3.5 text-right font-black text-emerald-700 font-mono">${prod.salePrice.toLocaleString()}</td>
                          <td className="p-3.5 text-right font-bold text-emerald-700">+{profitMargin}%</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenPOSWithProduct(prod.id)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Vender
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1 text-slate-400 hover:text-amber-600 rounded-lg"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingProductId(prod.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* SUBTAB 2: SALES RECEIPTS HISTORY */}
      {activeSubTab === 'sales' && (
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Historial de Tickets y Ventas Emitidas</h3>
                <p className="text-xs text-slate-500">Registro de comprobantes con detalle de productos, consultas y vacunas</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenPOSWithProduct()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>+ Nueva Venta POS</span>
              </button>
            </div>

            {salesReceipts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Aún no hay ventas registradas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Folio Ticket</th>
                      <th className="p-3.5">Fecha / Hora</th>
                      <th className="p-3.5">Cliente / Tutor</th>
                      <th className="p-3.5">Almacén Salida</th>
                      <th className="p-3.5">Conceptos Vendidos</th>
                      <th className="p-3.5">Forma de Pago</th>
                      <th className="p-3.5 text-right">Total Cobrado</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesReceipts.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono font-black text-indigo-700">#{sale.ticketNumber}</td>
                        <td className="p-3.5 font-medium text-slate-600">{sale.date} @ {sale.time}</td>
                        <td className="p-3.5 font-bold text-slate-900">
                          {sale.tutorName}
                          {sale.petName && <span className="text-[11px] text-slate-400 block font-normal">🐾 {sale.petName}</span>}
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">{sale.warehouse}</span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-600 max-w-xs truncate">
                          {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{sale.paymentMethod}</td>
                        <td className="p-3.5 text-right font-black text-emerald-700 text-sm font-mono">
                          ${sale.total.toLocaleString()} MXN
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(sale)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ver Ticket</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: CASH SHIFTS & CORTE DIARIO DE CAJA */}
      {activeSubTab === 'shifts' && (
        <div className="space-y-4">
          {/* Active Shift Card */}
          {activeShift ? (
            <div className="p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-3xl border border-emerald-500/30 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/30">
                    <Unlock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">Turno de Caja Activo</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase font-mono">
                        {activeShift.shiftFolio}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Abierto por <strong className="text-white">{activeShift.openedBy}</strong> el {activeShift.openedAt}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCashShiftModalOpen(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <Lock className="w-4 h-4" />
                  <span>Realizar Corte Diario & Cerrar</span>
                </button>
              </div>

              {/* Financial Stats 4-Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Fondo Inicial</span>
                  <span className="text-base font-black text-white font-mono block mt-0.5">
                    ${activeShift.initialCashFloat.toFixed(2)} MXN
                  </span>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Ventas en Efectivo</span>
                  <span className="text-base font-black text-emerald-300 font-mono block mt-0.5">
                    +${activeShift.cashSalesTotal.toFixed(2)} MXN
                  </span>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase block">Tarjetas & SPEI</span>
                  <span className="text-base font-black text-indigo-300 font-mono block mt-0.5">
                    ${(activeShift.cardSalesTotal + activeShift.transferSalesTotal).toFixed(2)} MXN
                  </span>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">Efectivo en Cajón</span>
                  <span className="text-base font-black text-amber-300 font-mono block mt-0.5">
                    ${activeShift.expectedCashInDrawer.toFixed(2)} MXN
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">La caja se encuentra cerrada</h3>
                  <p className="text-xs text-slate-500">Inicia una nueva jornada o turno abriendo la caja con tu fondo en efectivo.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCashShiftModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <Unlock className="w-4 h-4" />
                <span>🟢 Abrir Turno de Caja</span>
              </button>
            </div>
          )}

          {/* Shifts History Table */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Historial de Turnos & Cortes Diarios de Caja</h3>
              <p className="text-xs text-slate-500">Auditoría completa de aperturas, cierres, arqueos y diferencias de caja</p>
            </div>

            {cashShifts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Banknote className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">No hay turnos ni cortes registrados todavía.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Folio Turno</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5">Apertura</th>
                      <th className="p-3.5">Cierre</th>
                      <th className="p-3.5">Cajero</th>
                      <th className="p-3.5 text-right">Fondo Inicial</th>
                      <th className="p-3.5 text-right">Ventas Totales</th>
                      <th className="p-3.5 text-right">Efectivo Arqueo</th>
                      <th className="p-3.5 text-right">Diferencia</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cashShifts.map((shift) => {
                      const diff = shift.cashDifference ?? 0;
                      return (
                        <tr key={shift.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono font-black text-indigo-700">{shift.shiftFolio}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              shift.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {shift.status === 'open' ? '🟢 Abierto' : '🔒 Cerrado'}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-slate-600">{shift.openedAt}</td>
                          <td className="p-3.5 font-medium text-slate-600">{shift.closedAt || 'En curso'}</td>
                          <td className="p-3.5 font-bold text-slate-800">{shift.openedBy}</td>
                          <td className="p-3.5 text-right font-mono text-slate-600">${shift.initialCashFloat.toFixed(2)}</td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                            ${shift.totalSalesAmount.toFixed(2)} ({shift.salesCount})
                          </td>
                          <td className="p-3.5 text-right font-mono font-black text-slate-900">
                            ${(shift.actualCashInDrawer ?? shift.expectedCashInDrawer).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-right font-bold">
                            {shift.status === 'closed' ? (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                diff === 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : diff > 0
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {diff === 0 ? 'Exacto' : diff > 0 ? `+${diff.toFixed(2)}` : `-${Math.abs(diff).toFixed(2)}`}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">En curso</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setViewingShiftReceipt(shift)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5 text-slate-600" />
                              <span>Comprobante</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New / Edit Product Modal */}
      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => {
          setIsNewProductModalOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />

      {/* POS Point of Sale Modal */}
      <PetShopPOSModal
        isOpen={isPOSModalOpen}
        onClose={() => {
          setIsPOSModalOpen(false);
          setPosInitialProductId(undefined);
        }}
        initialProductId={posInitialProductId}
        onOpenCashShiftModal={() => setIsCashShiftModalOpen(true)}
      />

      {/* Cash Register Shift Modal */}
      <CashRegisterShiftModal
        isOpen={isCashShiftModalOpen}
        onClose={() => setIsCashShiftModalOpen(false)}
      />

      {/* Cash Shift Receipt Modal */}
      <CashShiftReceiptModal
        isOpen={Boolean(viewingShiftReceipt)}
        onClose={() => setViewingShiftReceipt(null)}
        shift={viewingShiftReceipt}
      />

      {/* Warehouse Transfer Modal */}
      <WarehouseTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
          setTransferSelectedProduct(null);
        }}
        selectedProduct={transferSelectedProduct}
      />

      {/* Sales Ticket Receipt Modal */}
      <PetShopReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        saleReceipt={selectedReceipt}
      />

      {/* Confirmation Modal for Product Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={() => {
          if (deletingProductId) {
            deleteProduct(deletingProductId);
            setDeletingProductId(null);
          }
        }}
        title="¿Eliminar producto del catálogo?"
        message="Esta acción retirará el producto del catálogo y eliminará el registro de inventario."
        confirmText="Sí, Eliminar Producto"
        cancelText="Conservar"
        type="danger"
      />
    </div>
  );
};
