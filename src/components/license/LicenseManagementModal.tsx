import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Calendar,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  RotateCcw,
  Zap,
  Building2,
  BadgeCheck,
  ChevronRight,
  Clock,
  Info,
  ArrowRight,
  Receipt,
  Copy,
  Check,
  RefreshCw,
  DollarSign,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { LicensePlan } from '../../types';

interface LicenseManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseManagementModal: React.FC<LicenseManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    systemLicense,
    daysRemaining,
    isLicenseLocked,
    renewLicense,
    changeLicensePlan,
    validateAndApplyKey,
    toggleLicenseLock,
    simulateLicenseDaysOffset,
    currentUser,
    clinicSettings,
    showToast,
    submitRenewalPaymentRequest,
    masterBillingSettings,
  } = useVeterinary();

  const [inputVoucher, setInputVoucher] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'plans'>('status');

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<LicensePlan>('mensual');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | 'oxxo'>('card');

  // Card form fields
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8841');
  const [cardHolder, setCardHolder] = useState(clinicSettings.directorName || 'Dr. Médico Veterinario');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('842');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'validating' | 'charging' | 'issuing' | 'done'>('validating');
  const [paymentReceipt, setPaymentReceipt] = useState<{
    folio: string;
    amount: string;
    newExpiration: string;
    plan: string;
    superUserEmail: string;
  } | null>(null);

  const [copiedClabe, setCopiedClabe] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superuser';

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVoucher.trim()) {
      showToast('Introduce un cupón o clave de licencia.', 'warning');
      return;
    }

    const result = validateAndApplyKey(inputVoucher.trim());
    if (result.success) {
      setInputVoucher('');
    } else {
      showToast(result.message, 'error');
    }
  };

  // Open checkout for specific plan
  const handleOpenCheckout = (plan: LicensePlan) => {
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
    setPaymentReceipt(null);
  };

  // Execute payment and renewal
  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStage('validating');

    await new Promise(r => setTimeout(r, 600));
    setProcessingStage('charging');
    await new Promise(r => setTimeout(r, 700));
    setProcessingStage('issuing');
    await new Promise(r => setTimeout(r, 600));

    // Calculate prospective expiration date
    const today = new Date();
    const currentExp = new Date(systemLicense.expirationDate);
    const baseDate = currentExp > today ? currentExp : today;
    const newExp = new Date(baseDate);
    newExp.setMonth(newExp.getMonth() + (checkoutPlan === 'mensual' ? 1 : 12));
    const expDateStr = newExp.toISOString().split('T')[0];

    const folio = `SAT-VET-${Math.floor(100000 + Math.random() * 900000)}-2026`;
    const numericAmount = checkoutPlan === 'mensual' ? 599 : 5990;

    const request = submitRenewalPaymentRequest({
      clinicName: clinicSettings.name,
      directorName: clinicSettings.directorName,
      email: clinicSettings.email,
      phone: clinicSettings.phone,
      plan: checkoutPlan,
      amount: numericAmount,
      paymentMethod,
      referenceFolio: folio,
      notes: `Renovación por ${paymentMethod.toUpperCase()} (${checkoutPlan === 'mensual' ? '$599 MXN' : '$5,990 MXN'}). Notificado para reactivación en 24h.`,
    });

    // Provide 3-day courtesy access while super user validates in 24h
    simulateLicenseDaysOffset(3);

    setPaymentReceipt({
      folio,
      amount: checkoutPlan === 'mensual' ? '$599 MXN' : '$5,990 MXN',
      newExpiration: expDateStr,
      plan: checkoutPlan === 'mensual' ? 'Renta Mensual (+30 días)' : 'Renta Anual (+365 días)',
      superUserEmail: request.superUserEmail,
    });

    setIsProcessing(false);
  };

  const handleCopyClabe = () => {
    const clabeToCopy = masterBillingSettings?.clabe || '646180112400981234';
    navigator.clipboard.writeText(clabeToCopy);
    setCopiedClabe(true);
    showToast('CLABE copiada al portapapeles.', 'info');
    setTimeout(() => setCopiedClabe(false), 3000);
  };

  const checkoutPrice = checkoutPlan === 'mensual' 
    ? `$${(masterBillingSettings?.monthlyPrice || 599).toLocaleString('es-MX')} MXN` 
    : `$${(masterBillingSettings?.annualPrice || 5990).toLocaleString('es-MX')} MXN`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-500/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/30 border border-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    Licencia & Renta de Software
                  </h2>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                      daysRemaining < 0
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40'
                        : daysRemaining <= 5
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                        : 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                    }`}
                  >
                    {daysRemaining < 0 ? 'Vencida' : daysRemaining <= 5 ? 'Por Vencer' : 'Vigente'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Control de suscripción mensual/anual, estado de pagos y pasarela de renovación.
                </p>
              </div>
            </div>

            <button
              id="btn-close-license-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/80 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('status');
                setIsCheckoutOpen(false);
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'status' && !isCheckoutOpen
                  ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Estado de la Licencia</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('plans');
                setIsCheckoutOpen(false);
              }}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'plans' || isCheckoutOpen
                  ? 'bg-white text-indigo-700 border-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Planes & Pasarela de Pago Oficial</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* CHECKOUT / PAYMENT MODAL VIEW */}
            {isCheckoutOpen ? (
              paymentReceipt ? (
                /* Payment Success View */
                <div className="p-6 text-center space-y-5">
                  <div className="w-16 h-16 bg-emerald-100 border-4 border-emerald-300 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-[11px] font-black rounded-full uppercase tracking-wider">
                      ¡Referencia de Pago Registrada con Éxito!
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      Notificación Enviada al Super Administrador
                    </h3>
                    <p className="text-xs text-slate-600">
                      Se ha enviado un correo a <strong>{paymentReceipt.superUserEmail}</strong>. La validación oficial de tu pago y reactivación de licencia se completará en un plazo máximo de <strong>24 horas hábiles</strong>.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto p-3 bg-amber-50 border border-amber-300 rounded-xl text-left text-xs flex items-start gap-2.5 text-amber-950 font-medium">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black block text-amber-900">Reactivación en 24 Horas (+3 Días de Cortesía):</span>
                      <span>
                        Se han acreditado 3 días de cortesía temporal para que continúes operando con normalidad mientras se realiza la validación oficial.
                      </span>
                    </div>
                  </div>

                  <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-700">
                      <span>Folio de Referencia:</span>
                      <span className="font-mono text-indigo-700 font-black">{paymentReceipt.folio}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Plan:</span>
                      <span className="font-bold text-slate-900">{paymentReceipt.plan}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Monto:</span>
                      <span className="font-black text-emerald-700">{paymentReceipt.amount}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-slate-500">Notificado Por Correo:</span>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{paymentReceipt.superUserEmail}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 pt-1">
                      <span className="font-bold">Nueva Fecha de Vencimiento:</span>
                      <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {paymentReceipt.newExpiration}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setActiveTab('status');
                    }}
                    className="w-full max-w-md mx-auto py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Listo, Ver Estado de Licencia</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Payment Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span>Pasarela de Pago Seguro</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Renovación de Licencia: <strong>{checkoutPlan === 'mensual' ? 'Plan Mensual (+30 días)' : 'Plan Anual (+365 días)'}</strong> por <strong>{checkoutPrice}</strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                    >
                      &larr; Volver a Planes
                    </button>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Tarjeta</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('spei')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'spei'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>SPEI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('oxxo')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        paymentMethod === 'oxxo'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                      <span>OXXO Pay</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <form onSubmit={handleExecutePayment} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Número de Tarjeta (Débito o Crédito)
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 0000 0000 0000"
                            required
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Titular de la Tarjeta
                          </label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Nombre y Apellido"
                            required
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Expiración
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/AA"
                              required
                              className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="123"
                              maxLength={4}
                              required
                              className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>
                              {processingStage === 'validating'
                                ? 'Conectando con Pasarela Bancaria...'
                                : processingStage === 'charging'
                                ? 'Procesando Cobro Seguro...'
                                : 'Emitiendo Licencia...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-200" />
                            <span>Pagar {checkoutPrice} y Procesar Renovación</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {paymentMethod === 'spei' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 font-medium">
                        Realiza una transferencia por <strong>{checkoutPrice}</strong>. La licencia se acreditará de forma automática:
                      </div>

                      <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Banco Receptor:</span>
                          <span className="font-bold text-slate-900">{masterBillingSettings?.bankName || 'STP / BBVA México'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">CLABE:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-indigo-700">{masterBillingSettings?.clabe || '646180112400981234'}</span>
                            <button
                              type="button"
                              onClick={handleCopyClabe}
                              className="p-1 text-slate-500 hover:text-indigo-700"
                            >
                              {copiedClabe ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Concepto:</span>
                          <span className="font-bold text-slate-900">RENTA-{clinicSettings.name.toUpperCase().slice(0, 10)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleExecutePayment}
                        disabled={isProcessing}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirmar Transferencia Bancaria y Renovar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'oxxo' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center font-mono space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Referencia de Pago OXXO Pay</span>
                        <div className="text-base font-black text-slate-900 tracking-widest">
                          {masterBillingSettings?.oxxoReference || '9384 1029 4819 0281'}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">Monto: {checkoutPrice}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleExecutePayment}
                        disabled={isProcessing}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Simular Pago OXXO y Renovar Inmediatamente</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              /* STANDARD TABS */
              <>
                {/* TAB 1: STATUS */}
                {activeTab === 'status' && (
                  <div className="space-y-4">
                    {/* License Details Hero Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold block">
                            Licencia Registrada
                          </span>
                          <h3 className="text-lg font-black text-white">{clinicSettings.name}</h3>
                        </div>
                        <span className="px-3 py-1 bg-white/10 text-amber-300 font-black text-xs rounded-xl border border-white/10 uppercase tracking-wider">
                          Modalidad Renta {systemLicense.plan === 'mensual' ? 'Mensual ($599/mes)' : 'Anual ($5,990/año)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-3 border-t border-white/10 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Vencimiento</span>
                          <span className="font-extrabold text-white text-sm">{systemLicense.expirationDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Días Restantes</span>
                          <span
                            className={`font-extrabold text-sm ${
                              daysRemaining < 0
                                ? 'text-rose-400'
                                : daysRemaining <= 5
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} días vencida` : `${daysRemaining} días`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Cuota Renta</span>
                          <span className="font-extrabold text-white text-sm">${systemLicense.priceAmount} MXN</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Estado</span>
                          <span className="font-extrabold text-emerald-400 text-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {daysRemaining >= 0 ? 'Activo' : 'Bloqueado'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200">
                        <span className="font-mono truncate">Serie: {systemLicense.serialNumber}</span>
                        <span className="font-mono truncate">Key: {systemLicense.licenseKey}</span>
                      </div>
                    </div>

                    {/* Redeem Voucher / License Key */}
                    <div className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-indigo-600" />
                        <span>Canjear Nueva Clave de Licencia o Cupón</span>
                      </h4>

                      <form onSubmit={handleApplyVoucher} className="flex gap-2">
                        <input
                          type="text"
                          id="input-voucher-management"
                          value={inputVoucher}
                          onChange={(e) => setInputVoucher(e.target.value)}
                          placeholder="Ej. VET-MENS-XXXX o VET-ANUAL-XXXX"
                          className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                        />
                        <button
                          type="submit"
                          id="btn-submit-voucher"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 cursor-pointer"
                        >
                          Aplicar Clave
                        </button>
                      </form>
                    </div>

                    {/* Quick Button to Checkout */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenCheckout(systemLicense.plan)}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4 text-emerald-200" />
                        <span>Abrir Pasarela de Pago para Renovar Licencia &rarr;</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: PLANS & RENEWAL */}
                {activeTab === 'plans' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Plan Mensual */}
                      <div
                        className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                          systemLicense.plan === 'mensual'
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/20'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900 text-sm">Renta Mensual</span>
                            {systemLicense.plan === 'mensual' && (
                              <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                Plan Actual
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-950">$599</span>
                            <span className="text-xs text-slate-500 font-bold">MXN / mes</span>
                          </div>
                          <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Renovación cada 30 días</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Pacientes y consultas ilimitadas</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>App Android para tutores sincronizada</span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-4 space-y-2">
                          <button
                            type="button"
                            id="btn-extend-monthly-direct"
                            onClick={() => handleOpenCheckout('mensual')}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pagar y Renovar Plan Mensual ($599 MXN)</span>
                          </button>
                        </div>
                      </div>

                      {/* Plan Anual */}
                      <div
                        className={`p-5 rounded-2xl border-2 flex flex-col justify-between relative overflow-hidden transition-all ${
                          systemLicense.plan === 'anual'
                            ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                          Recomendado • 2 Meses Gratis
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900 text-sm">Renta Anual</span>
                            {systemLicense.plan === 'anual' && (
                              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                                Plan Actual
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-950">$5,990</span>
                            <span className="text-xs text-emerald-700 font-bold">MXN / año</span>
                          </div>
                          <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>365 días ininterrumpidos</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ahorro de $1,198 MXN al año</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Soporte prioritario 24/7</span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-4 space-y-2">
                          <button
                            type="button"
                            id="btn-extend-annual-direct"
                            onClick={() => handleOpenCheckout('anual')}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Pagar y Renovar Plan Anual ($5,990 MXN)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
