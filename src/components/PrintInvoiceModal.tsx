import React, { useState } from 'react';
import { Invoice, StoreSettings } from '../types.ts';
import { formatINR, numberToWords } from '../services/storage.ts';
import { Printer, X, FileText, Receipt, CheckCircle } from 'lucide-react';

interface PrintInvoiceModalProps {
  invoice: Invoice | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  invoice,
  settings,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'standard' | 'thermal'>(
    settings.defaultPrintFormat || 'standard'
  );

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:w-full print:rounded-none">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm sm:text-base">
              Invoice #{invoice.invoiceNumber}
            </span>
            <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setPrintFormat('standard')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  printFormat === 'standard'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Tax Invoice</span>
              </button>
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                  printFormat === 'thermal'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>80mm POS Thermal</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-white" id="print-container">
          {printFormat === 'standard' ? (
            /* =========================================================================
               STANDARD A4 GST TAX INVOICE FORMAT
               ========================================================================= */
            <div className="max-w-3xl mx-auto border border-slate-300 p-6 sm:p-8 text-slate-800 text-xs sm:text-sm bg-white font-sans">
              {/* Header: Company Name & Tax Details */}
              <div className="border-b-2 border-slate-900 pb-5 mb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded border border-slate-200 overflow-hidden shrink-0">
                    <img
                      src="/src/assets/images/mollik_home_wear_logo_1792346708350.jpg"
                      alt="Mollik Logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                      {settings.name}
                    </h1>
                    <p className="text-slate-600 text-xs mt-0.5">{settings.tagline}</p>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed max-w-md">
                      {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-700 font-medium">
                      <span>Phone: {settings.phone}</span>
                      {settings.email && <span>Email: {settings.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right flex flex-col sm:items-end justify-between">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xs mb-2">
                    GST TAX INVOICE
                  </span>
                  <div className="text-xs space-y-0.5 text-slate-700">
                    <p>
                      <strong>GSTIN:</strong>{' '}
                      <span className="font-mono-numbers font-semibold">{settings.gstin}</span>
                    </p>
                    {settings.pan && (
                      <p>
                        <strong>PAN:</strong> <span className="font-mono-numbers">{settings.pan}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice & Customer Info Grid */}
              <div className="grid grid-cols-2 gap-4 pb-5 mb-5 border-b border-slate-200 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold uppercase text-[11px] tracking-wider block">
                    Billed To (Customer Details):
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{invoice.customerName}</p>
                  {invoice.customerPhone && (
                    <p className="text-slate-600">Phone: {invoice.customerPhone}</p>
                  )}
                  {invoice.customerAddress && (
                    <p className="text-slate-600">{invoice.customerAddress}</p>
                  )}
                  {invoice.customerGstin && (
                    <p className="text-slate-700 font-medium">
                      GSTIN: <span className="font-mono-numbers">{invoice.customerGstin}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1 sm:text-right">
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-500">Invoice No:</span>
                    <span className="font-bold font-mono-numbers text-slate-900">
                      {invoice.invoiceNumber}
                    </span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-500">Invoice Date:</span>
                    <span className="font-medium text-slate-900">{invoice.date} {invoice.time}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-semibold text-slate-900">{invoice.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-semibold text-emerald-700">{invoice.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-5">
                <table className="w-full border-collapse border border-slate-300 text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 text-center w-10">#</th>
                      <th className="p-2 border-r border-slate-300">Item Description</th>
                      <th className="p-2 border-r border-slate-300 text-center w-16">HSN</th>
                      <th className="p-2 border-r border-slate-300 text-center w-16">Qty</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24">Rate (₹)</th>
                      <th className="p-2 border-r border-slate-300 text-right w-24">Taxable (₹)</th>
                      <th className="p-2 border-r border-slate-300 text-center w-16">GST</th>
                      <th className="p-2 text-right w-28">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 text-center text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          {item.sku && (
                            <span className="text-[11px] text-slate-500 font-mono-numbers">
                              SKU: {item.sku}
                            </span>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono-numbers text-slate-600">
                          {item.hsnCode || '—'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono-numbers font-medium">
                          {item.qty} {item.unit}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono-numbers">
                          {item.rate.toFixed(2)}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono-numbers font-medium">
                          {item.baseAmount.toFixed(2)}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono-numbers text-slate-700">
                          {item.gstRate}%
                        </td>
                        <td className="p-2 text-right font-mono-numbers font-bold text-slate-900">
                          {item.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Calculations & Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800 mb-1">Amount in Words:</p>
                    <p className="italic text-slate-700 font-medium leading-relaxed">
                      {numberToWords(invoice.grandTotal)}
                    </p>
                  </div>

                  {settings.bankName && (
                    <div className="border border-slate-200 p-3 rounded text-xs space-y-1 bg-white">
                      <p className="font-bold text-slate-800">Bank Transfer / UPI Details:</p>
                      <p className="text-slate-600">Bank: {settings.bankName}</p>
                      <p className="text-slate-600">
                        A/C No:{' '}
                        <span className="font-mono-numbers font-semibold">
                          {settings.accountNo}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        IFSC: <span className="font-mono-numbers font-semibold">{settings.ifsc}</span>
                      </p>
                      {settings.upiId && (
                        <p className="text-slate-700 font-semibold">
                          UPI ID: <span className="text-blue-700">{settings.upiId}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-300 p-3.5 rounded text-xs sm:text-sm space-y-2">
                  <div className="flex justify-between text-slate-700">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono-numbers font-medium">{formatINR(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>CGST (Central Tax):</span>
                    <span className="font-mono-numbers">{formatINR(invoice.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>SGST (State Tax):</span>
                    <span className="font-mono-numbers">{formatINR(invoice.sgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-1">
                    <span>Total GST:</span>
                    <span className="font-mono-numbers font-medium">{formatINR(invoice.totalTax)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount Applied:</span>
                      <span className="font-mono-numbers font-medium">-{formatINR(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-slate-900 border-t-2 border-slate-900 pt-2">
                    <span>Grand Total:</span>
                    <span className="font-mono-numbers text-lg text-blue-900">
                      {formatINR(invoice.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-800 mb-1">Terms & Conditions:</p>
                  <p className="text-slate-500 whitespace-pre-line leading-relaxed">
                    {settings.invoiceFooterTerms}
                  </p>
                </div>
                <div className="sm:text-right flex flex-col justify-end pt-8">
                  <div className="border-t border-slate-400 w-48 sm:ml-auto pt-1 text-center">
                    <p className="font-bold text-slate-800">For {settings.name}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* =========================================================================
               80mm POS THERMAL RECEIPT FORMAT (Compact counter slip)
               ========================================================================= */
            <div className="thermal-mode mx-auto bg-white p-4 font-mono text-xs text-slate-950 border border-dashed border-slate-300 max-w-[340px]">
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <h2 className="text-base font-bold uppercase tracking-wide">{settings.name}</h2>
                <p className="text-[11px] text-slate-700">{settings.tagline}</p>
                <p className="text-[10px] text-slate-600 mt-1">{settings.address}, {settings.city}</p>
                <p className="text-[10px] text-slate-600">Ph: {settings.phone}</p>
                <p className="text-[10px] font-bold mt-1">GSTIN: {settings.gstin}</p>
              </div>

              <div className="py-2 text-[11px] border-b border-dashed border-slate-400 space-y-0.5">
                <div className="flex justify-between">
                  <span>Bill: <strong>{invoice.invoiceNumber}</strong></span>
                  <span>{invoice.date} {invoice.time}</span>
                </div>
                <div>Customer: <strong>{invoice.customerName}</strong></div>
                {invoice.customerPhone && <div>Phone: {invoice.customerPhone}</div>}
                <div>Payment: <strong>{invoice.paymentMethod}</strong></div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-left">
                      <th className="pb-1">Item</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Amt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-1 pr-1">
                          <div className="font-bold">{item.name}</div>
                          <div className="text-[10px] text-slate-600">
                            @{item.rate} ({item.gstRate}% GST)
                          </div>
                        </td>
                        <td className="py-1 text-center font-bold">{item.qty}</td>
                        <td className="py-1 text-right font-bold">{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Tax (GST):</span>
                  <span>₹{invoice.totalTax.toFixed(2)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{invoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-400">
                  <span>NET TOTAL:</span>
                  <span>₹{invoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {settings.upiId && (
                <div className="text-center py-2 border-b border-dashed border-slate-400 text-[10px]">
                  <p className="font-bold">Pay via UPI:</p>
                  <p className="font-semibold text-slate-800">{settings.upiId}</p>
                </div>
              )}

              <div className="text-center pt-3 text-[10px] text-slate-600">
                <p className="font-semibold">Thank you for your visit!</p>
                <p>Goods returnable within 7 days with bill.</p>
                <p className="mt-1">*** MOLLIK HOME WEAR ***</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
