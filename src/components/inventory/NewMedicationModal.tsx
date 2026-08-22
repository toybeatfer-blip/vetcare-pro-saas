import React, { useState, useEffect } from 'react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { MedicationItem, MedicationCategory, UnitType } from '../../types';
import {
  X,
  Pill,
  Building2,
  Calendar,
  AlertTriangle,
  DollarSign,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMedication?: MedicationItem | null;
}

const CATEGORIES: MedicationCategory[] = [
  'Antibiótico',
  'Antiinflamatorio/Analgésico',
  'Antiparasitario',
  'Dermatológico',
  'Anestesia/Sedación',
  'Sueros/Fluidos',
  'Biológico/Vacuna',
  'Gastrointestinal',
  'Cardiológico',
  'Nutricional/Suplemento',
  'Otro',
];

const UNITS: UnitType[] = [
  'comprimidos',
  'frascos',
  'viales',
  'ampollas',
  'pipetas',
  'bolsas',
  'cajas',
  'ml',
  'tubos',
];

export const NewMedicationModal: React.FC<NewMedicationModalProps> = ({
  isOpen,
  onClose,
  initialMedication,
}) => {
  const { addMedication, updateMedication } = useVeterinary();

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<MedicationCategory>('Antibiótico');
  const [presentation, setPresentation] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<UnitType>('comprimidos');
  const [minStockThreshold, setMinStockThreshold] = useState<number>(5);
  const [expirationDate, setExpirationDate] = useState('2027-12-31');
  const [batchNumber, setBatchNumber] = useState('');
  const [costPrice, setCostPrice] = useState<number>(50);
  const [salePrice, setSalePrice] = useState<number>(110);
  const [location, setLocation] = useState('Estante Farmacia A-1');
  const [requiresPrescription, setRequiresPrescription] = useState(true);
  const [notes, setNotes] = useState('');

  // Supplier info
  const [supplierName, setSupplierName] = useState('Boehringer Ingelheim Animal Health');
  const [supplierPhone, setSupplierPhone] = useState('+52 55 5804 1000');
  const [supplierEmail, setSupplierEmail] = useState('pedidos@boehringer-vet.mx');
  const [supplierContact, setSupplierContact] = useState('Lic. Mariana Garza');
  const [supplierAddress, setSupplierAddress] = useState('Parque Industrial Tlalnepantla, CDMX');

  useEffect(() => {
    if (initialMedication) {
      setName(initialMedication.name);
      setGenericName(initialMedication.genericName);
      setCategory(initialMedication.category);
      setPresentation(initialMedication.presentation);
      setQuantity(initialMedication.quantity);
      setUnit(initialMedication.unit);
      setMinStockThreshold(initialMedication.minStockThreshold);
      setExpirationDate(initialMedication.expirationDate);
      setBatchNumber(initialMedication.batchNumber);
      setCostPrice(initialMedication.costPrice);
      setSalePrice(initialMedication.salePrice);
      setLocation(initialMedication.location);
      setRequiresPrescription(initialMedication.requiresPrescription);
      setNotes(initialMedication.notes || '');

      setSupplierName(initialMedication.supplier.name);
      setSupplierPhone(initialMedication.supplier.phone);
      setSupplierEmail(initialMedication.supplier.email || '');
      setSupplierContact(initialMedication.supplier.contactPerson || '');
      setSupplierAddress(initialMedication.supplier.address || '');
    } else {
      // Defaults for new item
      setName('');
      setGenericName('');
      setCategory('Antibiótico');
      setPresentation('');
      setQuantity(10);
      setUnit('comprimidos');
      setMinStockThreshold(5);
      setExpirationDate('2027-12-31');
      setBatchNumber(`L-${Math.random().toString(36).substring(2, 7).toUpperCase()}`);
      setCostPrice(45);
      setSalePrice(95);
      setLocation('Estante Farmacia A-1');
      setRequiresPrescription(true);
      setNotes('');
      setSupplierName('Boehringer Ingelheim Animal Health');
      setSupplierPhone('+52 55 5804 1000');
      setSupplierEmail('pedidos@boehringer-vet.mx');
      setSupplierContact('Lic. Mariana Garza');
      setSupplierAddress('Parque Industrial Tlalnepantla, CDMX');
    }
  }, [initialMedication, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const medData = {
      name: name.trim(),
      genericName: genericName.trim() || name.trim(),
      category,
      presentation: presentation.trim() || `${quantity} ${unit}`,
      quantity: Number(quantity) || 0,
      unit,
      minStockThreshold: Number(minStockThreshold) || 1,
      expirationDate,
      batchNumber: batchNumber.trim() || 'L-GENERAL',
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
      location: location.trim() || 'Almacén General',
      requiresPrescription,
      notes: notes.trim(),
      supplier: {
        name: supplierName.trim() || 'Distribuidor General',
        phone: supplierPhone.trim() || '+52 55 0000 0000',
        email: supplierEmail.trim(),
        contactPerson: supplierContact.trim(),
        address: supplierAddress.trim(),
      },
    };

    if (initialMedication) {
      updateMedication(initialMedication.id, medData);
    } else {
      addMedication(medData);
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
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-100 my-6 max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Pill className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {initialMedication ? 'Editar Fármaco / Medicamento' : 'Nuevo Medicamento en Inventario'}
                </h2>
                <p className="text-xs text-indigo-200">
                  Control de existencias, umbrales de alerta, lote, proveedor y caducidad
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

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Sección 1: Datos Principales del Fármaco */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Pill className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Identificación Farmacológica
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Amoxicilina + Ác. Clavulánico 500mg"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Principio Activo / Genérico
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Amoxicilina / Clavulanato potásico"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Categoría Terapéutica *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MedicationCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Presentación *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Caja x 20 comprimidos, Frasco 15ml"
                    value={presentation}
                    onChange={(e) => setPresentation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Stock, Umbrales de Alerta y Caducidad */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Control de Stock & Alertas de Reabastecimiento
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Stock Disponible *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as UnitType)}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Umbral Mínimo Alerta *</span>
                    <span className="text-[10px] text-amber-700 font-normal">Dispara alerta</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-amber-50/50 border border-amber-300 rounded-xl text-sm font-bold text-amber-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Fecha de Caducidad *
                  </label>
                  <input
                    type="date"
                    required
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Número de Lote (Batch) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. L-AMX2026-08"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ubicación / Almacén *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Refrigerador 4°C, Estante A-2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={requiresPrescription}
                      onChange={(e) => setRequiresPrescription(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block">Receta Médica</span>
                      <span className="text-slate-500 text-[10px]">Requiere prescripción MVZ</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección 3: Costos y Precios */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Precios & Rentabilidad
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Precio Costo (Compra) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm font-semibold">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={costPrice}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Precio Venta (Tutor) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-emerald-600 text-sm font-semibold">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={salePrice}
                      onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Margen de Ganancia</span>
                  <div className="text-sm font-bold text-emerald-700 flex items-baseline gap-1.5">
                    <span>${(salePrice - costPrice).toFixed(2)} MXN</span>
                    <span className="text-xs text-slate-500 font-normal">
                      ({costPrice > 0 ? (((salePrice - costPrice) / costPrice) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 4: Proveedor y Contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Datos del Proveedor / Laboratorio
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Empresa Distribuidora *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Zoetis México, Boehringer Ingelheim, Virbac"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teléfono / WhatsApp Pedidos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+52 55 1234 5678"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico de Pedidos
                  </label>
                  <input
                    type="email"
                    placeholder="pedidos@proveedor.com"
                    value={supplierEmail}
                    onChange={(e) => setSupplierEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Representante / Asesor de Ventas
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del ejecutivo comercial"
                    value={supplierContact}
                    onChange={(e) => setSupplierContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sección 5: Indicaciones y Notas Clínicas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Indicaciones Clínicas & Observaciones de Conservación
              </label>
              <textarea
                rows={2}
                placeholder="Dosis orientativas, contraindicaciones, precauciones de cadena de frío..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>

            {/* Footer buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {initialMedication ? 'Guardar Cambios' : 'Registrar en Farmacia'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
