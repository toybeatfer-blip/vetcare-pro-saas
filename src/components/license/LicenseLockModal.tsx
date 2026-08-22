import React, { useState } from 'react';
import {
  Lock,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  CreditCard,
  Sparkles,
  PhoneCall,
  Clock,
  Zap,
  Building2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  DollarSign,
  Receipt,
  FileCheck,
  Send,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useVeterinary } from '../../context/VeterinaryContext';
import { LicensePlan } from '../../types';

interface LicenseLockModalProps {
  isOpen: boolean;
}

export const LicenseLockModal: React.FC<LicenseLockModalProps> = ({ isOpen }) => {
  const {
    systemLicense,
    daysRemaining,
    renewLicense,
    validateAndApplyKey,
    simulateLicenseDaysOffset,
    currentUser,
    clinicSettings,
    showToast,
    userAccounts,
    login,
    submitRenewalPaymentRequest,
    masterBillingSettings,
  } = useVeterinary();

  const [activeTab, setActiveTab] = useState<'checkout' | 'key' | 'emergency'>('checkout');
  const [selectedPlan, setSelectedPlan] = useState<LicensePlan>('mensual');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei' | 'oxxo'>('card');

  // Card form state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8841');
  const [cardHolder, setCardHolder] = useState(clinicSettings.directorName || 'Dr. Médico Veterinario');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('842');

  // Key form state
  const [inputKey, setInputKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Processing & Payment success state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'validating' | 'charging' | 'issuing' | 'done'>('validating');
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    folio: string;
    amount: string;
    newExpiration: string;
    plan: string;
    superUserEmail: string;
  } | null>(null);

  const [copiedClabe, setCopiedClabe] = useState(false);

  if (!isOpen) return null;

  const planPrice = selectedPlan === 'mensual' 
    ? `$${(masterBillingSettings?.monthlyPrice || 599).toLocaleString('es-MX')} MXN` 
    : `$${(masterBillingSettings?.annualPrice || 5990).toLocaleString('es-MX')} MXN`;
  const planDays = selectedPlan === 'mensual' ? 30 : 365;

  // Process Direct Checkout / Payment
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);
    setProcessingStage('validating');

    // Simulate Payment Steps
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
    newExp.setMonth(newExp.getMonth() + (selectedPlan === 'mensual' ? 1 : 12));
    const expDateStr = newExp.toISOString().split('T')[0];

    const folio = `SAT-VET-${Math.floor(100000 + Math.random() * 900000)}-2026`;
    const numericAmount = selectedPlan === 'mensual' ? 599 : 5990;

    // Send email notification to super user & register request
    const request = submitRenewalPaymentRequest({
      clinicName: clinicSettings.name,
      directorName: clinicSettings.directorName,
      email: clinicSettings.email,
      phone: clinicSettings.phone,
      plan: selectedPlan,
      amount: numericAmount,
      paymentMethod,
      referenceFolio: folio,
      notes: `Pago recibido por ${paymentMethod.toUpperCase()} (${planPrice}). Pendiente de validación por Super Usuario dentro de 24h.`,
    });

    // Provide 3-day emergency courtesy access while super user validates within 24h
    simulateLicenseDaysOffset(3);

    setPaymentSuccessData({
      folio,
      amount: planPrice,
      newExpiration: expDateStr,
      plan: selectedPlan === 'mensual' ? 'Renta Mensual (+30 días)' : 'Renta Anual (+365 días)',
      superUserEmail: request.superUserEmail,
    });

    setIsProcessing(false);
  };

  // Apply Key or Voucher
  const handleApplyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanKey = inputKey.trim();
    if (!cleanKey) {
      setErrorMessage('Por favor introduce una clave de licencia o cupón de renovación.');
      return;
    }

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 600));

    const result = validateAndApplyKey(cleanKey);
    setIsProcessing(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Clave de licencia inválida.');
    } else {
      setInputKey('');
    }
  };

  // Emergency 3-day Unlock
  const handleEmergencyUnlock = () => {
    setIsProcessing(true);
    setTimeout(() => {
      simulateLicenseDaysOffset(3);
      setIsProcessing(false);
      showToast('⚡ Desbloqueo de emergencia activado: 3 días de gracia concedidos para atención médica urgente.', 'warning');
    }, 500);
  };

  const handleCopyClabe = () => {
    const clabeToCopy = masterBillingSettings?.clabe || '646180112400981234';
    navigator.clipboard.writeText(clabeToCopy);
    setCopiedClabe(true);
    showToast('CLABE copiada al portapapeles.', 'info');
    setTimeout(() => setCopiedClabe(false), 3000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-rose-300 w-full max-w-3xl overflow-hidden flex flex-col my-auto max-h-[95vh]"
        >
          {/* Top Urgent Alert Bar */}
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-700 text-white p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-900/30">
                <Lock className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-black tracking-wider uppercase border border-white/30">
                    Software Clínico Bloqueado
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[11px] font-black">
                    Modalidad Renta {systemLicense.plan === 'mensual' ? 'Mensual' : 'Anual'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Licencia de Uso Vencida
                </h2>
                <p className="text-xs text-rose-100 font-medium">
                  El periodo contratado para <strong>{clinicSettings.name}</strong> ha expirado ({systemLicense.expirationDate}).
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-rose-900/40 p-3 rounded-2xl border border-white/20 sm:self-center shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-rose-200 block font-bold">
                Estado Actual
              </span>
              <span className="text-xs font-black text-white flex items-center gap-1 mt-0.5">
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                {daysRemaining < 0 ? `Vencida (${Math.abs(daysRemaining)} días de mora)` : 'Acceso Restringido'}
              </span>
            </div>
          </div>

          {/* If Payment Succeeded Screen */}
          {paymentSuccessData ? (
            <div className="p-8 text-center space-y-6 overflow-y-auto">
              <div className="w-20 h-20 bg-emerald-100 border-4 border-emerald-300 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-full uppercase tracking-wider">
                  ¡Referencia de Pago Registrada con Éxito!
                </span>
                <h3 className="text-2xl font-black text-slate-900">
                  Pago Enviado al Super Administrador
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Se ha enviado un correo a <strong>{paymentSuccessData.superUserEmail}</strong> con tu referencia de pago. La validación oficial y reactivación de tu licencia se completará en un plazo máximo de <strong>24 horas hábiles</strong>.
                </p>
              </div>

              {/* Notice Banner */}
              <div className="max-w-md mx-auto p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-left text-xs flex items-start gap-2.5 text-amber-950 font-medium">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black block text-amber-900">Reactivación en 24 Horas (+3 Días de Cortesía Activos):</span>
                  <span>
                    Hemos concedido 3 días de gracia temporal para que no detengas tus consultas ni cirugías médicas mientras el Super Usuario acredita tu comprobante.
                  </span>
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200/80 pb-2 font-bold text-slate-700">
                  <span>Folio de Referencia:</span>
                  <span className="font-mono text-indigo-700 font-black">{paymentSuccessData.folio}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Plan Solicitado:</span>
                  <span className="font-bold text-slate-900">{paymentSuccessData.plan}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Monto Acreditado:</span>
                  <span className="font-black text-emerald-700">{paymentSuccessData.amount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">Notificado Por Correo:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-700">{paymentSuccessData.superUserEmail}</span>
                </div>
                <div className="flex justify-between text-slate-900 pt-1">
                  <span className="font-bold">Vigencia Estimada:</span>
                  <span className="font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {paymentSuccessData.newExpiration}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-confirm-payment-enter"
                onClick={() => {
                  setPaymentSuccessData(null);
                }}
                className="w-full max-w-md mx-auto py-3.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Entrar al Sistema Clínico Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Main Lock Barrier Content */
            <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1">
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  id="tab-lock-checkout"
                  onClick={() => {
                    setActiveTab('checkout');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'checkout'
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>1. Pagar y Renovar Renta</span>
                </button>

                <button
                  type="button"
                  id="tab-lock-key"
                  onClick={() => {
                    setActiveTab('key');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'key'
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>2. Ingresar Clave de Licencia</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: CHECKOUT & PAYMENT GATEWAY */}
              {activeTab === 'checkout' && (
                <div className="space-y-5">
                  {/* Select Plan Box */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Selecciona el Plan de Renovación:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Monthly Plan */}
                      <div
                        onClick={() => setSelectedPlan('mensual')}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          selectedPlan === 'mensual'
                            ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 text-sm">Plan Mensual</span>
                          <span className="text-[10px] font-black bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            +30 días
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 my-1.5">
                          <span className="text-2xl font-black text-slate-950">$599</span>
                          <span className="text-xs text-slate-500 font-bold">MXN / mes</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Acceso clínico ininterrumpido y app móvil.
                        </p>
                      </div>

                      {/* Annual Plan */}
                      <div
                        onClick={() => setSelectedPlan('anual')}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          selectedPlan === 'anual'
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                          2 Meses Gratis
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 text-sm">Plan Anual</span>
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            +365 días
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 my-1.5">
                          <span className="text-2xl font-black text-emerald-950">$5,990</span>
                          <span className="text-xs text-emerald-700 font-bold">MXN / año</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          365 días continuos de servicio con soporte prioritario.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Select Payment Method */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                      Método de Pago Seguro:
                    </label>
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
                        <span>Tarjeta Bancaria</span>
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
                        <span>SPEI Instantáneo</span>
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
                        <span>OXXO / Efectivo</span>
                      </button>
                    </div>
                  </div>

                  {/* Form depending on payment method */}
                  {paymentMethod === 'card' && (
                    <form onSubmit={handleProcessPayment} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
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
                              CVV / CVC
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
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-black text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>
                              {processingStage === 'validating'
                                ? 'Conectando con Pasarela Bancaria...'
                                : processingStage === 'charging'
                                ? 'Procesando Cobro Seguro...'
                                : 'Emitiendo Licencia y Desbloqueando...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-300" />
                            <span>Pagar {planPrice} y Reactivar Sistema Clínico</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {paymentMethod === 'spei' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-950 font-medium">
                        Realiza una transferencia por <strong>{planPrice}</strong> desde cualquier banco. La licencia se activará al confirmar:
                      </div>

                      <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Banco Receptor:</span>
                          <span className="font-bold text-slate-900">{masterBillingSettings?.bankName || 'STP / BBVA México'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">CLABE Interbancaria:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-indigo-700">{masterBillingSettings?.clabe || '646180112400981234'}</span>
                            <button
                              type="button"
                              onClick={handleCopyClabe}
                              className="p-1 text-slate-500 hover:text-indigo-700"
                              title="Copiar CLABE"
                            >
                              {copiedClabe ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Concepto / Referencia:</span>
                          <span className="font-bold text-slate-900">RENTA-{clinicSettings.name.toUpperCase().slice(0, 10)}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        disabled={isProcessing}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirmar Transferencia y Desbloquear</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'oxxo' && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 font-medium">
                        Presenta esta referencia en cualquier tienda OXXO o Seven Eleven:
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-center font-mono space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase">Referencia de Pago OXXO Pay</span>
                        <div className="text-base font-black text-slate-900 tracking-widest">
                          {masterBillingSettings?.oxxoReference || '9384 1029 4819 0281'}
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold">Monto exacto: {planPrice}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleProcessPayment}
                        disabled={isProcessing}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Simular Pago OXXO y Reactivar Inmediatamente</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: REDEEM KEY */}
              {activeTab === 'key' && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-1">
                      <KeyRound className="w-4 h-4 text-indigo-600" />
                      <span>Introduce tu Clave de Licencia Oficial</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Si el proveedor te entregó un código de activación mensual o anual, ingrésalo aquí:
                    </p>
                  </div>

                  <form onSubmit={handleApplyKey} className="space-y-3">
                    <input
                      type="text"
                      id="input-lock-modal-key"
                      value={inputKey}
                      onChange={(e) => {
                        setInputKey(e.target.value);
                        setErrorMessage('');
                      }}
                      placeholder="Ej. VET-MENS-8942-7719-2026 o VET-ANUAL-..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-hidden"
                    />

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Validando clave...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Activar Clave y Desbloquear Software</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Emergency Unlock & Support */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  id="btn-emergency-unlock"
                  onClick={handleEmergencyUnlock}
                  disabled={isProcessing}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Concede 3 días temporales para atender emergencias médicas sin perder citas"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Desbloqueo de Emergencia (3 días de gracia)</span>
                </button>

                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>Soporte Oficial: <strong>+52 55 4912 8301</strong></span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
