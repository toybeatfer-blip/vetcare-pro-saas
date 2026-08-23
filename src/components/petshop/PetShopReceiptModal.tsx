import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Send,
  Mail,
  Receipt,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  ShoppingBag,
} from 'lucide-react';
import { PetShopSaleReceipt } from '../../types';
import { useVeterinary } from '../../context/VeterinaryContext';
import { printTicketSafely } from '../../utils/thermalPrinter';

interface PetShopReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleReceipt?: PetShopSaleReceipt | null;
  receipt?: PetShopSaleReceipt | null;
}

export const PetShopReceiptModal: React.FC<PetShopReceiptModalProps> = ({
  isOpen,
  onClose,
  saleReceipt,
  receipt,
}) => {
  const actualReceipt = saleReceipt || receipt || null;
  const { clinicSettings, showToast } = useVeterinary();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !actualReceipt) return null;

  const handlePrint = () => {
    const clinicName = clinicSettings.name || 'VetCare Pro Pet Shop';
    const slogan = clinicSettings.slogan || 'Alimentos, Accesorios & Farmacia';
    const address = clinicSettings.address || '';
    const phone = clinicSettings.phone || '';

    const itemsHtml = actualReceipt.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 3px 0;">
          <div class="font-bold">${item.productName}</div>
          <div style="font-size: 9.5px; color: #555;">${item.presentation}</div>
        </td>
        <td style="text-align: center; font-weight: bold;">${item.quantity}</td>
        <td style="text-align: right; font-weight: bold;">$${item.subtotal.toLocaleString()}</td>
      </tr>`
      )
      .join('');

    const htmlContent = `
      <div class="text-center">
        <div style="font-size: 16px; margin-bottom: 2px;">🐾</div>
        <div class="font-black" style="font-size: 13px;">${clinicName}</div>
        <div style="font-size: 10px; color: #444;">${slogan}</div>
        ${address ? `<div style="font-size: 9.5px; color: #555;">${address}</div>` : ''}
        ${phone ? `<div style="font-size: 9.5px; color: #555;">Tel: ${phone}</div>` : ''}
        <div class="divider"></div>
        <div class="font-black uppercase" style="font-size: 11px;">*** COMPROBANTE DE VENTA ***</div>
      </div>

      <div class="divider"></div>

      <div style="font-size: 10.5px;">
        <div class="flex-between">
          <span>Folio Ticket:</span>
          <span class="font-black">${actualReceipt.ticketNumber}</span>
        </div>
        <div class="flex-between">
          <span>Fecha/Hora:</span>
          <span>${actualReceipt.date} ${actualReceipt.time}</span>
        </div>
        <div class="flex-between">
          <span>Almacén:</span>
          <span>${actualReceipt.warehouse}</span>
        </div>
        <div class="flex-between">
          <span>Cliente:</span>
          <span class="font-bold">${actualReceipt.tutorName}</span>
        </div>
        ${actualReceipt.petName ? `
        <div class="flex-between">
          <span>Mascota:</span>
          <span>🐾 ${actualReceipt.petName}</span>
        </div>` : ''}
        <div class="flex-between">
          <span>Atendió:</span>
          <span>${actualReceipt.attendantName}</span>
        </div>
      </div>

      <div class="divider"></div>

      <table class="grid-table">
        <thead>
          <tr>
            <th style="text-align: left;">Descripción</th>
            <th style="text-align: center; width: 40px;">Cant</th>
            <th style="text-align: right; width: 60px;">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="divider"></div>

      <div style="font-size: 11px;">
        <div class="flex-between">
          <span>Subtotal:</span>
          <span>$${actualReceipt.subtotal.toLocaleString()} MXN</span>
        </div>
        ${actualReceipt.discount > 0 ? `
        <div class="flex-between" style="color: #047857;">
          <span>Descuento:</span>
          <span>-$${actualReceipt.discount.toLocaleString()} MXN</span>
        </div>` : ''}
        <div class="divider"></div>
        <div class="flex-between font-black" style="font-size: 12px;">
          <span>TOTAL:</span>
          <span>$${actualReceipt.total.toLocaleString()} MXN</span>
        </div>
        <div class="flex-between" style="font-size: 10px; margin-top: 3px;">
          <span>Forma de Pago:</span>
          <span class="font-bold">${actualReceipt.paymentMethod}</span>
        </div>
      </div>

      <div class="divider"></div>
      <div class="text-center" style="font-size: 9.5px; color: #555; margin-top: 6px;">
        <div class="font-bold">¡GRACIAS POR SU PREFERENCIA!</div>
        <div>Conserve este comprobante para cualquier aclaración.</div>
        <div>🐾 VetCare Pro Pet Shop</div>
      </div>
    `;

    printTicketSafely({
      title: `Ticket_${actualReceipt.ticketNumber}`,
      htmlContent,
    });
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = (actualReceipt.tutorPhone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      showToast('No hay número de WhatsApp registrado para este cliente.', 'warning');
      return;
    }

    const clinic = clinicSettings.name || 'VetCare Pro Pet Shop';
    let msg = `🧾 *TICKET DE VENTA Y COMPROBANTE DE COMPRA*\n🏥 *${clinic}*\n\n` +
      `Estimado(a) *${actualReceipt.tutorName}*,\n` +
      `¡Gracias por tu compra! Te compartimos tu comprobante digital:\n\n` +
      `📄 *Ticket:* #${actualReceipt.ticketNumber}\n` +
      `📅 *Fecha:* ${actualReceipt.date} a las ${actualReceipt.time} hrs\n` +
      `🏬 *Almacén/Sucursal:* ${actualReceipt.warehouse}\n` +
      `👤 *Atendido por:* ${actualReceipt.attendantName}\n\n` +
      `🛒 *DETALLE DE CONCEPTOS:*\n`;

    actualReceipt.items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.productName}* (${item.presentation})\n` +
        `   ${item.quantity} x $${item.unitPrice.toLocaleString()} = *$${item.subtotal.toLocaleString()} MXN*\n`;
    });

    if (actualReceipt.discount > 0) {
      msg += `\nDescuento aplicado: -$${actualReceipt.discount.toLocaleString()} MXN`;
    }

    msg += `\n💰 *TOTAL PAGADO:* *$${actualReceipt.total.toLocaleString()} MXN*\n` +
      `💳 *Método de Pago:* ${actualReceipt.paymentMethod}\n`;

    if (clinicSettings.phone) msg += `\n📞 *Contacto:* ${clinicSettings.phone}`;
    if (clinicSettings.address) msg += `\n📍 *Ubicación:* ${clinicSettings.address}`;
    msg += `\n\n¡Gracias por tu preferencia! Esperamos verte pronto con tu mascota. 🐾❤️`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 my-6 print:border-none print:shadow-none print:m-0 print:max-w-none"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white relative print:hidden">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">Comprobante de Venta</h2>
                <p className="text-xs text-slate-300">Ticket #{actualReceipt.ticketNumber}</p>
              </div>
            </div>
          </div>

          {/* Printable Ticket Receipt */}
          <div ref={printRef} className="p-6 space-y-4 font-mono text-xs text-slate-800 bg-white">
            {/* Header / Store Info */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
              <div className="w-8 h-8 mx-auto rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-black text-sm mb-1">
                🐾
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">
                {clinicSettings.name || 'VetCare Pro Pet Shop'}
              </h3>
              <p className="text-[11px] text-slate-500">{clinicSettings.slogan || 'Alimentos, Accesorios & Farmacia'}</p>
              <p className="text-[10px] text-slate-400">{clinicSettings.address || 'Matriz'}</p>
              <p className="text-[10px] text-slate-400">Tel: {clinicSettings.phone || ''} {clinicSettings.taxId ? `• RFC: ${clinicSettings.taxId}` : ''}</p>
            </div>

            {/* Ticket Meta */}
            <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Folio Ticket:</span>
                <span className="font-bold">{actualReceipt.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha / Hora:</span>
                <span>{actualReceipt.date} {actualReceipt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Almacén:</span>
                <span>{actualReceipt.warehouse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold">{actualReceipt.tutorName}</span>
              </div>
              {actualReceipt.petName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mascota:</span>
                  <span>🐾 {actualReceipt.petName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Atendió:</span>
                <span>{actualReceipt.attendantName}</span>
              </div>
            </div>

            {/* Products Table */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
                <span className="col-span-6">Descripción</span>
                <span className="col-span-2 text-center">Cant</span>
                <span className="col-span-4 text-right">Importe</span>
              </div>

              {actualReceipt.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] items-center pt-1">
                  <div className="col-span-6 pr-1">
                    <span className="font-bold text-slate-900 block truncate">{item.productName}</span>
                    <span className="text-[10px] text-slate-400 block">{item.presentation}</span>
                  </div>
                  <div className="col-span-2 text-center text-slate-700 font-bold">
                    {item.quantity}
                  </div>
                  <div className="col-span-4 text-right font-bold text-slate-900">
                    ${item.subtotal.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>${actualReceipt.subtotal.toLocaleString()} MXN</span>
              </div>
              {actualReceipt.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento:</span>
                  <span>-${actualReceipt.discount.toLocaleString()} MXN</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                <span>TOTAL:</span>
                <span>${actualReceipt.total.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                <span>Forma de Pago:</span>
                <span className="font-bold">{actualReceipt.paymentMethod}</span>
              </div>
            </div>

            {/* Footer message */}
            <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-600">¡GRACIAS POR SU PREFERENCIA!</p>
              <p>Conserve este comprobante para cualquier duda o aclaración.</p>
              <p>🐾 Sistema VetCare Pro Pet Shop</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Imprimir Ticket Térmico o Carta"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Enviar comprobante por WhatsApp al cliente"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
