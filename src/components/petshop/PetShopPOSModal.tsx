import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  User,
  Building2,
  CreditCard,
  Banknote,
  Send,
  CheckCircle2,
  Sparkles,
  Layers,
  Stethoscope,
  Syringe,
  AlertCircle,
  Clock,
  Unlock,
  Tag,
} from 'lucide-react';
import {
  PetShopProduct,
  SaleItem,
  PetShopSaleReceipt,
  WarehouseLocation,
  SaleItemType,
} from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import { PetShopReceiptModal } from './PetShopReceiptModal';

interface PetShopPOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
  onOpenCashShiftModal?: () => void;
}

const WAREHOUSES: WarehouseLocation[] = [
  'Tienda / Mostrador Pet Shop',
  'Bodega Central / Almacén General',
  'Farmacia / Consultorio 1',
  'Hospitalización / Quirófano',
  'Área de Estética & Baño',
];

interface POSCartItem {
  id: string;
  itemType: SaleItemType;
  productId?: string;
  productName: string;
  presentation: string;
  warehouse: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  petId?: string;
  petName?: string;
  referenceRecordId?: string;
  referenceVaccineId?: string;
  stockLimit?: number;
}

export const PetShopPOSModal: React.FC<PetShopPOSModalProps> = ({
  isOpen,
  onClose,
  initialProductId,
  onOpenCashShiftModal,
}) => {
  const {
    products,
    pets,
    vaccines,
    clinicSettings,
    currentUser,
    activeShift,
    recordSaleReceipt,
    showToast,
  } = useVeterinary();

  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(
    'Tienda / Mostrador Pet Shop'
  );
  const [productSearch, setProductSearch] = useState('');
  const [selectedTutorMode, setSelectedTutorMode] = useState<'patient' | 'general'>('general');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [generalClientName, setGeneralClientName] = useState('Público General');
  const [generalClientPhone, setGeneralClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'Efectivo' | 'Tarjeta de Débito/Crédito' | 'Transferencia SPEI' | 'Mercado Pago / Clip'
  >('Efectivo');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Service Pricing Defaults
  const consultationPrice = clinicSettings.consultationPrice || 450;
  const emergencyConsultationPrice = clinicSettings.emergencyConsultationPrice || 750;
  const standardVaccinePrice = clinicSettings.standardVaccinePrice || 380;
  const dewormingPrice = clinicSettings.dewormingPrice || 220;

  // Cart state
  const [cart, setCart] = useState<POSCartItem[]>(() => {
    if (initialProductId) {
      const p = products.find((x) => x.id === initialProductId);
      if (p && p.stockQuantity > 0) {
        return [
          {
            id: `prod-${p.id}`,
            itemType: 'product',
            productId: p.id,
            productName: p.name,
            presentation: p.presentation,
            warehouse: p.warehouse,
            quantity: 1,
            unitPrice: p.salePrice,
            subtotal: p.salePrice,
            stockLimit: p.stockQuantity,
          },
        ];
      }
    }
    return [];
  });

  const [lastReceipt, setLastReceipt] = useState<PetShopSaleReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Selected Pet Data
  const selectedPet = useMemo(() => {
    return pets.find((p) => p.id === selectedPetId) || null;
  }, [pets, selectedPetId]);

  // Pending / Upcoming vaccines for selected pet
  const petPendingVaccines = useMemo(() => {
    if (!selectedPetId) return [];
    return vaccines.filter(
      (v) => v.petId === selectedPetId && (v.status === 'proxima' || v.status === 'vencida')
    );
  }, [vaccines, selectedPetId]);

  // Available products for current warehouse
  const availableProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesWarehouse = p.warehouse === selectedWarehouse;
      const query = productSearch.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.presentation.toLowerCase().includes(query);

      return matchesWarehouse && matchesSearch;
    });
  }, [products, selectedWarehouse, productSearch]);

  const handleAddToCart = (product: PetShopProduct) => {
    const existing = cart.find(
      (item) => item.itemType === 'product' && item.productId === product.id
    );
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        showToast(
          `Stock máximo alcanzado para este producto (${product.stockQuantity} unid.).`,
          'warning'
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: item.unitPrice * (item.quantity + 1),
              }
            : item
        )
      );
    } else {
      if (product.stockQuantity <= 0) {
        showToast('Producto agotado en este almacén.', 'warning');
        return;
      }
      const newItem: POSCartItem = {
        id: `prod-${product.id}-${Date.now()}`,
        itemType: 'product',
        productId: product.id,
        productName: product.name,
        presentation: product.presentation,
        warehouse: selectedWarehouse,
        quantity: 1,
        unitPrice: product.salePrice,
        subtotal: product.salePrice,
        stockLimit: product.stockQuantity,
      };
      setCart([...cart, newItem]);
    }
  };

  // Add Consultation Fee to POS Cart
  const handleAddConsultationToCart = (isEmergency = false) => {
    if (!selectedPet) {
      showToast('Seleccione un paciente registrado para asociar la consulta médica.', 'warning');
      return;
    }

    const price = isEmergency ? emergencyConsultationPrice : consultationPrice;
    const title = isEmergency
      ? `Consulta de Urgencia / Especialidad - ${selectedPet.name}`
      : `Consulta Médica General - ${selectedPet.name}`;

    const newItem: POSCartItem = {
      id: `consult-${selectedPet.id}-${Date.now()}`,
      itemType: 'consultation',
      productName: title,
      presentation: isEmergency ? 'Urgencia 24/7' : 'Consulta Clínica',
      warehouse: selectedWarehouse,
      quantity: 1,
      unitPrice: price,
      subtotal: price,
      petId: selectedPet.id,
      petName: selectedPet.name,
    };

    setCart([...cart, newItem]);
    showToast(`Consulta médica de ${selectedPet.name} agregada al ticket ($${price} MXN).`, 'success');
  };

  // Add Vaccine / Dewormer to POS Cart
  const handleAddVaccineToCart = (
    vaccineName?: string,
    customPrice?: number,
    vaccineRefId?: string
  ) => {
    if (!selectedPet) {
      showToast('Seleccione un paciente registrado para asociar la vacuna.', 'warning');
      return;
    }

    const isDeworm = (vaccineName || '').toLowerCase().includes('desparasit');
    const defaultPrice = isDeworm ? dewormingPrice : standardVaccinePrice;
    const finalPrice = customPrice !== undefined ? customPrice : defaultPrice;
    const vName = vaccineName || 'Vacuna / Inmunización Biológica';

    const newItem: POSCartItem = {
      id: `vac-${selectedPet.id}-${Date.now()}-${Math.random()}`,
      itemType: 'vaccine',
      productName: `Vacunación: ${vName} - ${selectedPet.name}`,
      presentation: isDeworm ? 'Desparasitación' : 'Dosis Biológica',
      warehouse: selectedWarehouse,
      quantity: 1,
      unitPrice: finalPrice,
      subtotal: finalPrice,
      petId: selectedPet.id,
      petName: selectedPet.name,
      referenceVaccineId: vaccineRefId,
    };

    setCart([...cart, newItem]);
    showToast(`Vacunación (${vName}) agregada al ticket de ${selectedPet.name} ($${finalPrice} MXN).`, 'success');
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            if (item.stockLimit && nextQty > item.stockLimit) {
              showToast(`Stock máximo disponible: ${item.stockLimit} unid.`, 'warning');
              return item;
            }
            return {
              ...item,
              quantity: nextQty,
              subtotal: item.unitPrice * nextQty,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart(cart.filter((item) => item.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.max(0, subtotal - discount);
  const cashChange = paymentMethod === 'Efectivo' && cashGiven > total ? cashGiven - total : 0;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('El carrito de compras está vacío.', 'warning');
      return;
    }

    let tutorName = generalClientName.trim() || 'Público General';
    let tutorPhone = generalClientPhone.trim() || '';
    let tutorEmail = '';
    let petName = '';

    if (selectedTutorMode === 'patient' && selectedPet) {
      tutorName = selectedPet.owner?.name || tutorName;
      tutorPhone = selectedPet.owner?.phone || tutorPhone;
      tutorEmail = selectedPet.owner?.email || '';
      petName = selectedPet.name;
    }

    const saleItems: SaleItem[] = cart.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      presentation: item.presentation,
      warehouse: item.warehouse || selectedWarehouse,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
      itemType: item.itemType,
      petId: item.petId,
      petName: item.petName,
      referenceVaccineId: item.referenceVaccineId,
      referenceRecordId: item.referenceRecordId,
    }));

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const createdSale = recordSaleReceipt({
      date: dateStr,
      time: timeStr,
      tutorName,
      tutorPhone,
      tutorEmail,
      petName,
      items: saleItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      warehouse: selectedWarehouse,
      attendantName: currentUser?.name || 'Médico / Cajero',
      notes,
    });

    setLastReceipt(createdSale);
    setIsReceiptModalOpen(true);
    setCart([]);
    setDiscount(0);
    setCashGiven(0);
    setNotes('');
  };

  if (!isOpen) return null;
  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[94vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:px-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                      Terminal Punto de Venta (POS) & Cobro Clínico
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                      En Vivo
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Cobro unificado de alimentos, accesorios, consultas y vacunas por paciente
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Cash Shift Status Badge */}
                {activeShift ? (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{activeShift.shiftFolio}</span>
                  </div>
                ) : (
                  onOpenCashShiftModal && (
                    <button
                      type="button"
                      onClick={onOpenCashShiftModal}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Abrir Turno de Caja</span>
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Left: Products & Quick Medical Service Fees (7 cols) */}
              <div className="lg:col-span-7 p-4 sm:p-5 border-r border-slate-100 flex flex-col space-y-3 overflow-y-auto max-h-[50vh] lg:max-h-[calc(94vh-80px)]">
                {/* Warehouse selector & search */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-600" />
                      Almacén de Salida
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-500 outline-hidden cursor-pointer"
                    >
                      {WAREHOUSES.map((wh) => (
                        <option key={wh} value={wh}>
                          {wh}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Buscar Alimento o Accesorio
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Nombre, croquetas, correa, SKU..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* QUICK MEDICAL SERVICES SECTION (CONSULTAS & VACUNAS) */}
                <div className="p-3 bg-gradient-to-r from-indigo-50/80 to-teal-50/80 border border-indigo-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide">
                      <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                      Cobro de Servicios Médicos por Paciente
                    </span>
                    {selectedPet && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-600 text-white rounded-full">
                        Paciente: {selectedPet.name}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddConsultationToCart(false)}
                      className="p-2 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl text-left transition-all hover:border-indigo-400 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-indigo-700">${consultationPrice}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 block mt-1 leading-tight">Consulta Gral.</span>
                      <span className="text-[9px] text-slate-400 font-medium">Médica rutinaria</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddConsultationToCart(true)}
                      className="p-2 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl text-left transition-all hover:border-rose-400 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-rose-700">${emergencyConsultationPrice}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 block mt-1 leading-tight">Urgencia 24/7</span>
                      <span className="text-[9px] text-slate-400 font-medium">Especialidad</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddVaccineToCart('Vacunación Estándar', standardVaccinePrice)}
                      className="p-2 bg-white hover:bg-teal-50 border border-teal-200 rounded-xl text-left transition-all hover:border-teal-400 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <Syringe className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-teal-700">${standardVaccinePrice}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 block mt-1 leading-tight">Vacunación</span>
                      <span className="text-[9px] text-slate-400 font-medium">Dosis biológica</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddVaccineToCart('Desparasitación Interna/Externa', dewormingPrice)}
                      className="p-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-left transition-all hover:border-emerald-400 group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-emerald-700">${dewormingPrice}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-900 block mt-1 leading-tight">Desparasitación</span>
                      <span className="text-[9px] text-slate-400 font-medium">Interna / Externa</span>
                    </button>
                  </div>

                  {/* Smart detection of pending vaccines for selected pet */}
                  {selectedPet && petPendingVaccines.length > 0 && (
                    <div className="pt-2 border-t border-indigo-200/60 space-y-1.5">
                      <span className="text-[10px] font-extrabold text-amber-800 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Vacunas pendientes registradas para {selectedPet.name}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {petPendingVaccines.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => handleAddVaccineToCart(v.vaccineName, standardVaccinePrice, v.id)}
                            className="px-2.5 py-1 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 text-amber-950 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-amber-800" />
                            <span>{v.vaccineName} (${standardVaccinePrice})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Catalog Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Catálogo Pet Shop ({availableProducts.length} artículos en almacén)
                    </span>
                  </div>

                  {availableProducts.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <ShoppingCart className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                      <p className="text-xs font-bold text-slate-500">
                        No hay productos disponibles en este almacén con ese filtro.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableProducts.map((prod) => {
                        const isOutOfStock = prod.stockQuantity <= 0;
                        return (
                          <div
                            key={prod.id}
                            onClick={() => !isOutOfStock && handleAddToCart(prod)}
                            className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                              isOutOfStock
                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-500/5 cursor-pointer group'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">
                                  {prod.sku}
                                </span>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md truncate max-w-[120px]">
                                  {prod.presentation}
                                </span>
                              </div>

                              <h4 className="text-xs font-black text-slate-900 mt-0.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {prod.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-medium">{prod.brand}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-100">
                              <div>
                                <span className="text-xs font-black text-slate-900 block font-mono">
                                  ${prod.salePrice.toLocaleString()} MXN
                                </span>
                                <span
                                  className={`text-[9px] font-bold ${
                                    isOutOfStock
                                      ? 'text-rose-600'
                                      : prod.stockQuantity <= prod.minStockAlert
                                      ? 'text-amber-600'
                                      : 'text-emerald-600'
                                  }`}
                                >
                                  {isOutOfStock ? 'Agotado (0)' : `Stock: ${prod.stockQuantity}`}
                                </span>
                              </div>

                              <button
                                type="button"
                                disabled={isOutOfStock}
                                className={`p-1 rounded-lg text-xs font-bold transition-all ${
                                  isOutOfStock
                                    ? 'bg-slate-100 text-slate-400'
                                    : 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Cart & Checkout (5 cols) */}
              <div className="lg:col-span-5 bg-slate-50/70 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[calc(94vh-80px)]">
                {/* Tutor / Client Selector */}
                <div className="space-y-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase">Cliente / Tutor</span>
                    <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSelectedTutorMode('general')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          selectedTutorMode === 'general'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Público General
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTutorMode('patient')}
                        className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                          selectedTutorMode === 'patient'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🐾 Tutor Paciente
                      </button>
                    </div>
                  </div>

                  {selectedTutorMode === 'patient' ? (
                    <select
                      value={selectedPetId}
                      onChange={(e) => setSelectedPetId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    >
                      <option value="">-- Seleccionar Mascota / Tutor --</option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species}) • Tutor: {p.owner?.name} ({p.owner?.phone})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={generalClientName}
                        onChange={(e) => setGeneralClientName(e.target.value)}
                        placeholder="Nombre del Cliente"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                      <input
                        type="tel"
                        value={generalClientPhone}
                        onChange={(e) => setGeneralClientPhone(e.target.value)}
                        placeholder="WhatsApp (ej. 5549128301)"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="flex-1 py-2 overflow-y-auto space-y-1.5 max-h-48">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-slate-400">
                      <p className="text-xs font-medium">El carrito está vacío</p>
                      <p className="text-[11px] text-slate-400">
                        Agregue productos, consultas o vacunas para cobrar.
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                item.itemType === 'consultation'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : item.itemType === 'vaccine'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {item.itemType === 'consultation'
                                ? 'Consulta'
                                : item.itemType === 'vaccine'
                                ? 'Vacuna'
                                : 'Pet Shop'}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {item.productName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            ${item.unitPrice.toLocaleString()} c/u • Subtotal: ${item.subtotal.toLocaleString()} MXN
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-black font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-50 cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Payment & Totals Section */}
                <form onSubmit={handleCheckout} className="space-y-2.5 pt-2 border-t border-slate-200">
                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Método de Pago
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                      {[
                        'Efectivo',
                        'Tarjeta de Débito/Crédito',
                        'Transferencia SPEI',
                        'Mercado Pago / Clip',
                      ].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m as any)}
                          className={`p-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            paymentMethod === m
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-black'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {m === 'Efectivo' ? (
                            <Banknote className="w-3.5 h-3.5" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          <span className="truncate">{m}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cash Change Calculator */}
                  {paymentMethod === 'Efectivo' && (
                    <div className="grid grid-cols-2 gap-2 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase">
                          Efectivo Recibido ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={cashGiven || ''}
                          onChange={(e) => setCashGiven(Number(e.target.value))}
                          placeholder={total.toString()}
                          className="w-full px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-black text-slate-900 mt-0.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 uppercase">
                          Cambio a Devolver
                        </label>
                        <div className="text-sm font-black text-emerald-700 font-mono mt-1">
                          ${cashChange.toFixed(2)} MXN
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Totals Summary */}
                  <div className="space-y-1 text-xs pt-1 border-t border-slate-200">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} conceptos):</span>
                      <span className="font-mono font-bold">${subtotal.toFixed(2)} MXN</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>Descuento ($):</span>
                      <input
                        type="number"
                        min="0"
                        value={discount || ''}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        placeholder="0"
                        className="w-20 px-2 py-0.5 text-right bg-white border border-slate-200 rounded text-xs font-bold"
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                      <span>TOTAL A PAGAR:</span>
                      <span className="text-base font-black text-indigo-700 font-mono">
                        ${total.toFixed(2)} MXN
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={cart.length === 0}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>COBRAR & EMITIR TICKET (${total.toFixed(2)} MXN)</span>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Sale Receipt Modal */}
      <PetShopReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setLastReceipt(null);
        }}
        receipt={lastReceipt}
      />
    </>
  );
};
