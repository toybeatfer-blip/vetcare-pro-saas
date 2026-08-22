import React, { useState, useMemo } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { MedicationItem, MedicationCategory, StockMovementType } from '../../types';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  Calendar,
  Building2,
  MapPin,
  TrendingDown,
  TrendingUp,
  Sliders,
  DollarSign,
  ShoppingCart,
  Phone,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  History,
  LayoutGrid,
  List,
  Filter,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NewMedicationModal } from './NewMedicationModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { SupplierOrderModal } from './SupplierOrderModal';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const InventoryManager: React.FC = () => {
  const {
    inventory,
    stockMovements,
    deleteMedication,
    adjustStock,
    stats,
    showToast,
  } = useVeterinary();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'expiring' | 'optimal' | 'out_of_stock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'bento' | 'table'>('bento');
  const [showMovementsHistory, setShowMovementsHistory] = useState(false);

  // Modals state
  const [isNewMedModalOpen, setIsNewMedModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<MedicationItem | null>(null);

  const [adjustmentModalMed, setAdjustmentModalMed] = useState<MedicationItem | null>(null);
  const [adjustmentModalType, setAdjustmentModalType] = useState<StockMovementType>('out');

  const [isSupplierOrderModalOpen, setIsSupplierOrderModalOpen] = useState(false);
  const [deletingMedId, setDeletingMedId] = useState<string | null>(null);

  const nowTime = useMemo(() => new Date().setHours(0, 0, 0, 0), []);

  // Helper for item status
  const getItemStatus = (item: MedicationItem) => {
    const expTime = new Date(item.expirationDate + 'T00:00:00Z').getTime();
    const diffDays = Math.round((expTime - nowTime) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { key: 'expired', label: 'Vencido', color: 'rose' };
    if (item.quantity === 0) return { key: 'out_of_stock', label: 'Agotado (0)', color: 'rose' };
    if (item.quantity <= item.minStockThreshold) return { key: 'low_stock', label: 'Stock Crítico', color: 'amber' };
    if (diffDays <= 60) return { key: 'expiring_soon', label: `Vence en ${diffDays}d`, color: 'orange' };
    return { key: 'optimal', label: 'Stock Óptimo', color: 'emerald' };
  };

  // Filtered Medications
  const filteredMedications = useMemo(() => {
    return inventory.filter((item) => {
      // Search term
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.genericName.toLowerCase().includes(query) ||
        item.batchNumber.toLowerCase().includes(query) ||
        item.supplier.name.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Status filter
      const expTime = new Date(item.expirationDate + 'T00:00:00Z').getTime();
      const diffDays = Math.round((expTime - nowTime) / (1000 * 60 * 60 * 24));

      if (statusFilter === 'low_stock') {
        return item.quantity <= item.minStockThreshold;
      }
      if (statusFilter === 'expiring') {
        return diffDays <= 60;
      }
      if (statusFilter === 'out_of_stock') {
        return item.quantity === 0;
      }
      if (statusFilter === 'optimal') {
        return item.quantity > item.minStockThreshold && diffDays > 60;
      }

      return true;
    });
  }, [inventory, searchTerm, statusFilter, categoryFilter, nowTime]);

  // Low stock items list for purchase order generator
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.minStockThreshold);
  }, [inventory]);

  // Handle Quick Stepper (+1 / -1)
  const handleQuickDispense = (item: MedicationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.quantity <= 0) {
      showToast(`No hay stock disponible de "${item.name}".`, 'warning');
      return;
    }
    adjustStock(item.id, -1, 'out', 'Dispensación rápida en mostrador / consulta');
  };

  const handleQuickRestock = (item: MedicationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    adjustStock(item.id, 1, 'in', 'Reabastecimiento unitario rápido');
  };

  const handleOpenEdit = (item: MedicationItem) => {
    setEditingMedication(item);
    setIsNewMedModalOpen(true);
  };

  const handleOpenAdjustment = (item: MedicationItem, type: StockMovementType = 'out') => {
    setAdjustmentModalMed(item);
    setAdjustmentModalType(type);
  };

  return (
    <div className="space-y-6">
      {/* Top Bento Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Tile 1: Alerta Stock Bajo */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'low_stock' ? 'all' : 'low_stock')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            stats.criticalStockCount > 0
              ? 'bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/50 border-amber-200 hover:border-amber-400 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                stats.criticalStockCount > 0
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200 animate-pulse'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            {stats.criticalStockCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 text-xs font-bold">
                Requiere Compra
              </span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {stats.criticalStockCount}
          </div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
            Fármacos en Stock Bajo
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {stats.outOfStockCount > 0 ? `${stats.outOfStockCount} agotados • ` : ''}
            {stats.lowStockCount} por debajo del umbral mínimo
          </p>
        </div>

        {/* Bento Tile 2: Control de Caducidades */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'expiring' ? 'all' : 'expiring')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
            stats.expiringSoonCount > 0 || stats.expiredCount > 0
              ? 'bg-gradient-to-br from-rose-500/10 via-rose-50 to-orange-50/30 border-rose-200 hover:border-rose-400 shadow-xs'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                stats.expiredCount > 0
                  ? 'bg-rose-600 text-white'
                  : stats.expiringSoonCount > 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            {(stats.expiringSoonCount > 0 || stats.expiredCount > 0) && (
              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                ≤ 60 días
              </span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {stats.expiringSoonCount + stats.expiredCount}
          </div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
            Próximos a Vencer
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {stats.expiredCount > 0 ? `${stats.expiredCount} ya vencidos • ` : ''}
            Monitoreo preventivo de lotes
          </p>
        </div>

        {/* Bento Tile 3: Valoración de Farmacia */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold">
              Inversión Almacén
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            ${stats.totalInventoryValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
            Valor de Inventario (Costo)
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total de {inventory.reduce((acc, i) => acc + i.quantity, 0)} unidades en stock
          </p>
        </div>

        {/* Bento Tile 4: Catálogo y Acciones Rápidas */}
        <div className="p-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Catálogo Activo
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-xs font-mono font-bold">
                {stats.totalMedicationsCount} SKUs
              </span>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Gestión automatizada de farmacia veterinaria, dispensaciones y pedidos.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => {
                setEditingMedication(null);
                setIsNewMedModalOpen(true);
              }}
              className="flex-1 py-2 px-3 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Fármaco</span>
            </button>

            <button
              onClick={() => setIsSupplierOrderModalOpen(true)}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
              title="Generar Pedido de Compra a Proveedores"
            >
              <ShoppingCart className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Controls & List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        {/* Header toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              Inventario & Farmacia Veterinaria
            </h2>
            <p className="text-xs text-slate-500">
              Control de existencias, dispensación en consulta, lotes, proveedores y caducidades
            </p>
          </div>

          {/* Actions toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowMovementsHistory(!showMovementsHistory)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                showMovementsHistory
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>Historial Movimientos ({stockMovements.length})</span>
            </button>

            <button
              onClick={() => setIsSupplierOrderModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs shadow-amber-200"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Pedido a Proveedores ({lowStockItems.length})</span>
            </button>

            <button
              onClick={() => {
                setEditingMedication(null);
                setIsNewMedModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Medicamento</span>
            </button>
          </div>
        </div>

        {/* Search & Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2 border-t border-slate-100">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por fármaco, principio activo, lote, proveedor, ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-56">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">Todas las Categorías</option>
              <option value="Antibiótico">Antibióticos</option>
              <option value="Antiinflamatorio/Analgésico">Antiinflamatorios / AINEs</option>
              <option value="Antiparasitario">Antiparasitarios</option>
              <option value="Dermatológico">Dermatológicos</option>
              <option value="Anestesia/Sedación">Anestesia & Sedación</option>
              <option value="Sueros/Fluidos">Sueros & Fluidos</option>
              <option value="Biológico/Vacuna">Vacunas & Biológicos</option>
              <option value="Gastrointestinal">Gastrointestinales</option>
              <option value="Nutricional/Suplemento">Suplementos</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-end md:self-auto">
            <button
              onClick={() => setViewMode('bento')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'bento' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista Tarjetas Bento"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista Tabla Detallada"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({inventory.length})
          </button>

          <button
            onClick={() => setStatusFilter('low_stock')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'low_stock'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Stock Bajo ({stats.criticalStockCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('expiring')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'expiring'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Por Vencer ({stats.expiringSoonCount + stats.expiredCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('optimal')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'optimal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Óptimos</span>
          </button>

          <button
            onClick={() => setStatusFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              statusFilter === 'out_of_stock'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Agotados ({stats.outOfStockCount})
          </button>
        </div>

        {/* Movements History Dropdown / Panel */}
        <AnimatePresence>
          {showMovementsHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Bitácora Reciente de Movimientos de Inventario
                  </h3>
                </div>
                <button
                  onClick={() => setShowMovementsHistory(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Ocultar Bitácora
                </button>
              </div>

              {stockMovements.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No hay movimientos registrados aún.</p>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-200">
                  {stockMovements.slice(0, 15).map((mov) => {
                    const isPositive = mov.quantityChange > 0;
                    return (
                      <div key={mov.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              mov.type === 'in'
                                ? 'bg-emerald-100 text-emerald-700'
                                : mov.type === 'out'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {mov.type === 'in' ? (
                              <ArrowDownRight className="w-4 h-4" />
                            ) : mov.type === 'out' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <Sliders className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 block">{mov.medicationName}</span>
                            <span className="text-[11px] text-slate-500">
                              {mov.reason}
                              {mov.referencePatient && ` • Paciente: ${mov.referencePatient}`}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-bold font-mono ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+${mov.quantityChange}` : mov.quantityChange} unidades
                          </span>
                          <span className="text-[10px] text-slate-400 block">{mov.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {filteredMedications.length === 0 ? (
          <div className="py-16 text-center">
            <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No se encontraron medicamentos</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : viewMode === 'bento' ? (
          /* Bento Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedications.map((item) => {
              const status = getItemStatus(item);
              const isCritical = item.quantity <= item.minStockThreshold;
              const maxStockRef = Math.max(item.minStockThreshold * 2.5, item.quantity, 1);
              const percentage = Math.min(100, Math.round((item.quantity / maxStockRef) * 100));

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between relative group ${
                    isCritical
                      ? 'bg-gradient-to-b from-amber-50/40 to-white border-amber-200 hover:border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-indigo-200 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {item.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                          status.color === 'rose'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                            : status.color === 'amber'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : status.color === 'orange'
                            ? 'bg-orange-50 text-orange-800 border-orange-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isCritical && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {status.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 italic">{item.genericName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.presentation}</p>
                  </div>

                  {/* Stock Gauge & Stepper */}
                  <div className="my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-slate-500">
                        Existencias en Clínica:
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-xl font-extrabold font-mono ${
                            item.quantity === 0
                              ? 'text-rose-600'
                              : isCritical
                              ? 'text-amber-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">{item.unit}</span>
                      </div>
                    </div>

                    {/* Stock level progress bar */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.quantity === 0
                            ? 'bg-rose-500'
                            : isCritical
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Subtext with Threshold */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>Umbral mín: <strong>{item.minStockThreshold} {item.unit}</strong></span>
                      <span>Lote: <strong className="font-mono text-slate-700">{item.batchNumber}</strong></span>
                    </div>

                    {/* Quick Stepper + / - Buttons */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Ajuste rápido:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleQuickDispense(item, e)}
                          title="Dispensar -1 unidad"
                          disabled={item.quantity <= 0}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-rose-700 font-bold text-sm flex items-center justify-center transition-all disabled:opacity-30"
                        >
                          -1
                        </button>
                        <button
                          onClick={(e) => handleQuickRestock(item, e)}
                          title="Ingresar +1 unidad"
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 font-bold text-sm flex items-center justify-center transition-all"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleOpenAdjustment(item, 'out')}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Operación...
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata: Expiration, Location & Supplier */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Caducidad:
                      </span>
                      <span className="font-semibold text-slate-800">{item.expirationDate}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Ubicación:
                      </span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">{item.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1 truncate max-w-[140px]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {item.supplier.name.split(' ')[0]}...
                      </span>
                      {item.supplier.phone && (
                        <a
                          href={`https://wa.me/${item.supplier.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          Pedir
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">P. Venta</span>
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        ${item.salePrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar detalles del fármaco"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingMedId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar de inventario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table Detailed View */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200 pb-2">
                  <th className="pb-2">Fármaco</th>
                  <th className="pb-2">Categoría</th>
                  <th className="pb-2 text-center">Stock Actual</th>
                  <th className="pb-2 text-center">Umbral Mín.</th>
                  <th className="pb-2">Lote / Caducidad</th>
                  <th className="pb-2">Ubicación</th>
                  <th className="pb-2">Proveedor</th>
                  <th className="pb-2 text-right">P. Costo</th>
                  <th className="pb-2 text-right">P. Venta</th>
                  <th className="pb-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedications.map((item) => {
                  const status = getItemStatus(item);
                  const isCritical = item.quantity <= item.minStockThreshold;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500 italic">{item.genericName}</div>
                        <div className="text-[10px] text-slate-400">{item.presentation}</div>
                      </td>

                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold whitespace-nowrap">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                              status.color === 'rose'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : status.color === 'amber'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 text-center text-slate-500 font-medium">
                        {item.minStockThreshold} {item.unit}
                      </td>

                      <td className="py-3">
                        <div className="font-mono text-slate-700 text-[11px]">{item.batchNumber}</div>
                        <div className="text-[10px] text-slate-500">{item.expirationDate}</div>
                      </td>

                      <td className="py-3 text-slate-600 text-[11px]">{item.location}</td>

                      <td className="py-3">
                        <div className="text-slate-800 font-semibold">{item.supplier.name}</div>
                        <div className="text-[10px] text-slate-400">{item.supplier.phone}</div>
                      </td>

                      <td className="py-3 text-right font-mono text-slate-600">${item.costPrice.toFixed(2)}</td>

                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        ${item.salePrice.toFixed(2)}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenAdjustment(item, 'out')}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Dispensar o Ajustar"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingMedId(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New / Edit Medication */}
      <NewMedicationModal
        isOpen={isNewMedModalOpen}
        onClose={() => {
          setIsNewMedModalOpen(false);
          setEditingMedication(null);
        }}
        initialMedication={editingMedication}
      />

      {/* Modal: Stock Adjustment */}
      <StockAdjustmentModal
        isOpen={!!adjustmentModalMed}
        onClose={() => setAdjustmentModalMed(null)}
        medication={adjustmentModalMed}
        initialType={adjustmentModalType}
      />

      {/* Modal: Supplier Purchase Order Generator */}
      <SupplierOrderModal
        isOpen={isSupplierOrderModalOpen}
        onClose={() => setIsSupplierOrderModalOpen(false)}
        lowStockItems={lowStockItems}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={!!deletingMedId}
        title="Eliminar Medicamento del Inventario"
        message="¿Estás seguro de que deseas retirar este fármaco del inventario? Se eliminarán también sus registros de movimiento."
        confirmText="Sí, Eliminar Fármaco"
        onConfirm={() => {
          if (deletingMedId) {
            deleteMedication(deletingMedId);
            setDeletingMedId(null);
          }
        }}
        onCancel={() => setDeletingMedId(null)}
      />
    </div>
  );
};
