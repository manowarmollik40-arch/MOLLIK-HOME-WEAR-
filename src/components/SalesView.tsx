import React, { useState } from 'react';
import { Invoice, Product } from '../types.ts';
import {
  formatINR,
  exportInvoicesToCSV,
  exportTaxReportToCSV,
  TaxSlabSummary,
} from '../services/storage.ts';
import {
  Download,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Receipt,
  Calendar,
  X,
  FileSpreadsheet,
  Calculator,
  Printer,
  TrendingUp,
  Landmark,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface SalesViewProps {
  invoices: Invoice[];
  products: Product[];
  onOpenPrint: (invoice: Invoice) => void;
  onVoidInvoice: (invoiceId: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  invoices,
  products,
  onOpenPrint,
  onVoidInvoice,
}) => {
  // Top view mode switcher: Invoices Ledger vs Tax Report
  const [viewMode, setViewMode] = useState<'invoices' | 'tax-report'>('invoices');

  // Ledger Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'invoice' | 'customer'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'last7' | 'thisMonth' | 'custom'>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Tax Report Dedicated Date Filter
  const [taxPeriod, setTaxPeriod] = useState<
    'thisMonth' | 'lastMonth' | 'today' | 'last7' | 'last30' | 'all' | 'custom'
  >('thisMonth');
  const [taxCustomFrom, setTaxCustomFrom] = useState('');
  const [taxCustomTo, setTaxCustomTo] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  // Helper to highlight matching text in table
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const cleanQ = query.trim().toLowerCase();
    const idx = text.toLowerCase().indexOf(cleanQ);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-amber-200 text-slate-900 rounded-2xs px-0.5">
          {text.slice(idx, idx + cleanQ.length)}
        </mark>
        {text.slice(idx + cleanQ.length)}
      </>
    );
  };

  // ---------------------------------------------------------------------------
  // 1. INVOICES LEDGER FILTERING
  // ---------------------------------------------------------------------------
  const filteredInvoices = invoices.filter((inv) => {
    const q = searchTerm.trim().toLowerCase();

    // Search filter logic by invoice number and/or customer name
    let matchSearch = true;
    if (q) {
      const matchInvNo = inv.invoiceNumber.toLowerCase().includes(q);
      const matchCust = inv.customerName.toLowerCase().includes(q);
      const matchPhone = inv.customerPhone ? inv.customerPhone.includes(q) : false;

      if (searchTarget === 'invoice') {
        matchSearch = matchInvNo;
      } else if (searchTarget === 'customer') {
        matchSearch = matchCust || matchPhone;
      } else {
        matchSearch = matchInvNo || matchCust || matchPhone;
      }
    }

    // Date filter
    let matchDate = true;
    if (dateFilter === 'today') {
      matchDate = inv.date === today;
    } else if (dateFilter === 'last7') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      matchDate = inv.date >= d7.toISOString().slice(0, 10);
    } else if (dateFilter === 'thisMonth') {
      const currentMonth = today.slice(0, 7);
      matchDate = inv.date.startsWith(currentMonth);
    } else if (dateFilter === 'custom') {
      if (customFrom && inv.date < customFrom) matchDate = false;
      if (customTo && inv.date > customTo) matchDate = false;
    }

    // Payment method filter
    const matchPayment = paymentFilter === 'All' || inv.paymentMethod === paymentFilter;

    // Status filter
    const matchStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchSearch && matchDate && matchPayment && matchStatus;
  });

  const totalFilteredSales = filteredInvoices
    .filter((inv) => inv.status !== 'Void')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalFilteredTax = filteredInvoices
    .filter((inv) => inv.status !== 'Void')
    .reduce((sum, inv) => sum + inv.totalTax, 0);

  const totalFilteredDiscount = filteredInvoices
    .filter((inv) => inv.status !== 'Void')
    .reduce((sum, inv) => sum + inv.discount, 0);

  const isFiltered =
    searchTerm.trim() !== '' ||
    dateFilter !== 'all' ||
    paymentFilter !== 'All' ||
    statusFilter !== 'All';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchTarget('all');
    setDateFilter('all');
    setCustomFrom('');
    setCustomTo('');
    setPaymentFilter('All');
    setStatusFilter('All');
  };

  // ---------------------------------------------------------------------------
  // 2. TAX REPORT CALCULATIONS FOR SELECTED DATE RANGE
  // ---------------------------------------------------------------------------
  // Compute tax date boundaries
  const getTaxDateRange = () => {
    const now = new Date();
    if (taxPeriod === 'today') {
      return { from: today, to: today, label: `Today (${today})` };
    }
    if (taxPeriod === 'last7') {
      const d7 = new Date();
      d7.setDate(d7.getDate() - 7);
      const fromStr = d7.toISOString().slice(0, 10);
      return { from: fromStr, to: today, label: `Last 7 Days (${fromStr} to ${today})` };
    }
    if (taxPeriod === 'last30') {
      const d30 = new Date();
      d30.setDate(d30.getDate() - 30);
      const fromStr = d30.toISOString().slice(0, 10);
      return { from: fromStr, to: today, label: `Last 30 Days (${fromStr} to ${today})` };
    }
    if (taxPeriod === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      return {
        from: startOfMonth,
        to: today,
        label: `${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })} (Month to Date)`,
      };
    }
    if (taxPeriod === 'lastMonth') {
      const startOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const endOfLast = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      return {
        from: startOfLast,
        to: endOfLast,
        label: `${new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })} (Full Month)`,
      };
    }
    if (taxPeriod === 'custom') {
      return {
        from: taxCustomFrom || '1970-01-01',
        to: taxCustomTo || '2099-12-31',
        label: `Custom Period (${taxCustomFrom || 'Start'} to ${taxCustomTo || 'Present'})`,
      };
    }
    // all
    return { from: '', to: '', label: 'All Time' };
  };

  const taxRange = getTaxDateRange();

  // Invoices included in the tax report (excluding void/cancelled invoices)
  const taxInvoices = invoices.filter((inv) => {
    if (inv.status === 'Void') return false;
    if (taxRange.from && inv.date < taxRange.from) return false;
    if (taxRange.to && inv.date > taxRange.to) return false;
    return true;
  });

  // Calculate totals for tax report
  let reportTaxableTotal = 0;
  let reportCgstTotal = 0;
  let reportSgstTotal = 0;
  let reportIgstTotal = 0;
  let reportNetTaxTotal = 0;
  let reportGrossTotal = 0;

  // Rate slab groupings: 0%, 5%, 12%, 18%, 28%
  const rateSlabs = [0, 5, 12, 18, 28];
  const slabMap: Record<number, TaxSlabSummary> = {};

  rateSlabs.forEach((rate) => {
    slabMap[rate] = {
      gstRate: rate,
      itemCount: 0,
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
      grossAmount: 0,
    };
  });

  // Aggregate item-level and invoice-level GST
  taxInvoices.forEach((inv) => {
    const isInterState = inv.supplyType === 'inter-state' || (inv.igst && inv.igst > 0);
    reportTaxableTotal += inv.subtotal;
    reportGrossTotal += inv.grandTotal;

    const invTax = inv.totalTax;
    reportNetTaxTotal += invTax;

    if (isInterState) {
      reportIgstTotal += invTax;
    } else {
      const c = inv.cgst || invTax / 2;
      const s = inv.sgst || invTax / 2;
      reportCgstTotal += c;
      reportSgstTotal += s;
    }

    // Process line items for slab breakdown
    inv.items.forEach((item) => {
      const rate = item.gstRate || 0;
      if (!slabMap[rate]) {
        slabMap[rate] = {
          gstRate: rate,
          itemCount: 0,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalTax: 0,
          grossAmount: 0,
        };
      }

      const base = item.baseAmount;
      const tax = item.taxAmount;

      slabMap[rate].itemCount += item.qty;
      slabMap[rate].taxableAmount += base;
      slabMap[rate].totalTax += tax;
      slabMap[rate].grossAmount += base + tax;

      if (isInterState) {
        slabMap[rate].igstAmount += tax;
      } else {
        slabMap[rate].cgstAmount += tax / 2;
        slabMap[rate].sgstAmount += tax / 2;
      }
    });
  });

  const slabList: TaxSlabSummary[] = rateSlabs.map((rate) => slabMap[rate]);

  // B2B (with GSTIN) vs B2C Breakdown
  const b2bInvoices = taxInvoices.filter((inv) => inv.customerGstin && inv.customerGstin.trim().length > 0);
  const b2cInvoices = taxInvoices.filter((inv) => !inv.customerGstin || inv.customerGstin.trim().length === 0);

  const b2bTaxable = b2bInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const b2bTax = b2bInvoices.reduce((sum, inv) => sum + inv.totalTax, 0);

  const b2cTaxable = b2cInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const b2cTax = b2cInvoices.reduce((sum, inv) => sum + inv.totalTax, 0);

  const handleExportTaxReport = () => {
    exportTaxReportToCSV(
      taxRange.label,
      slabList,
      reportTaxableTotal,
      reportCgstTotal,
      reportSgstTotal,
      reportIgstTotal,
      reportNetTaxTotal,
      taxInvoices
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Sales & Tax Compliance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sales & GST Invoicing
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Track daily sales invoices, search by customer or bill number, and generate comprehensive GST tax reports.
          </p>
        </div>

        {/* View Switcher: Invoices Ledger vs Tax Report */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setViewMode('invoices')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'invoices'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            <span>Invoices Ledger</span>
          </button>

          <button
            onClick={() => setViewMode('tax-report')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'tax-report'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>GST Tax Report</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          VIEW MODE 1: DEDICATED GST TAX REPORT SECTION
          ======================================================================= */}
      {viewMode === 'tax-report' ? (
        <div className="space-y-6">
          {/* Tax Period Selection Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mr-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Tax Period:</span>
              </span>

              {(
                [
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'lastMonth', label: 'Last Month' },
                  { id: 'today', label: 'Today' },
                  { id: 'last7', label: 'Last 7 Days' },
                  { id: 'last30', label: 'Last 30 Days' },
                  { id: 'all', label: 'All Time' },
                  { id: 'custom', label: 'Custom Range' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTaxPeriod(p.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    taxPeriod === p.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Export and Print Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTaxReport}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Download CSV report with GST slab breakdown and invoice list"
              >
                <Download className="w-4 h-4" />
                <span>Export GST CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Print tax report"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Custom Date Inputs if Custom Range selected */}
          {taxPeriod === 'custom' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700">Filter Tax Dates From:</span>
              <input
                type="date"
                value={taxCustomFrom}
                onChange={(e) => setTaxCustomFrom(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
              />
              <span className="font-semibold text-slate-700">To:</span>
              <input
                type="date"
                value={taxCustomTo}
                onChange={(e) => setTaxCustomTo(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-900"
              />
              <span className="text-slate-400">
                (Matches invoice dates within this inclusive range)
              </span>
            </div>
          )}

          {/* Current Period Active Badge */}
          <div className="flex items-center justify-between text-xs text-slate-600 px-1">
            <div className="flex items-center gap-2">
              <span>Active Tax Window:</span>
              <strong className="text-slate-900">{taxRange.label}</strong>
              <span aria-hidden="true">·</span>
              <span className="font-mono-numbers">{taxInvoices.length} invoices analyzed</span>
            </div>
          </div>

          {/* Core GST Collection KPI Metrics Cards (CGST / SGST / IGST breakdown) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* 1. Taxable Value */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Taxable Turnover
              </span>
              <div className="text-base sm:text-xl font-bold font-mono-numbers text-slate-900 mt-2">
                {formatINR(reportTaxableTotal)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Net base sales</span>
            </div>

            {/* 2. CGST Collected */}
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs bg-blue-50/20">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                CGST (Central Tax)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono-numbers text-blue-900 mt-2">
                {formatINR(reportCgstTotal)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Intra-State 50%</span>
            </div>

            {/* 3. SGST Collected */}
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs bg-blue-50/20">
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                SGST (State Tax)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono-numbers text-blue-900 mt-2">
                {formatINR(reportSgstTotal)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Intra-State 50%</span>
            </div>

            {/* 4. IGST Collected */}
            <div className="bg-white border border-indigo-200 rounded-xl p-4 shadow-xs bg-indigo-50/20">
              <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block">
                IGST (Integrated Tax)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono-numbers text-indigo-900 mt-2">
                {formatINR(reportIgstTotal)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Inter-State 100%</span>
            </div>

            {/* 5. Total GST */}
            <div className="bg-white border border-emerald-300 rounded-xl p-4 shadow-xs bg-emerald-50/30">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                Total GST Collected
              </span>
              <div className="text-base sm:text-xl font-extrabold font-mono-numbers text-emerald-900 mt-2">
                {formatINR(reportNetTaxTotal)}
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 block">CGST + SGST + IGST</span>
            </div>

            {/* 6. Gross Invoiced */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Gross Invoiced Total
              </span>
              <div className="text-base sm:text-xl font-bold font-mono-numbers text-slate-900 mt-2">
                {formatINR(reportGrossTotal)}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Turnover + GST</span>
            </div>
          </div>

          {/* GST Rate Slab Breakdown Table (Indian GST Slabs: 0%, 5%, 12%, 18%, 28%) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  GST Rate Slab Breakdown (GSTR-1 Summary)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Itemized taxable turnover and tax liability partitioned by statutory GST tax brackets.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md">
                Standard Intra & Inter-state Split
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">GST Rate Bracket</th>
                    <th className="py-3 px-3 text-center">Items Sold</th>
                    <th className="py-3 px-3 text-right">Taxable Turnover (₹)</th>
                    <th className="py-3 px-3 text-right">CGST (₹)</th>
                    <th className="py-3 px-3 text-right">SGST (₹)</th>
                    <th className="py-3 px-3 text-right">IGST (₹)</th>
                    <th className="py-3 px-3 text-right">Total GST (₹)</th>
                    <th className="py-3 px-4 text-right">Gross Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slabList.map((slab) => (
                    <tr
                      key={slab.gstRate}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        slab.taxableAmount > 0 ? 'font-medium' : 'text-slate-400'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold font-mono-numbers text-slate-900 text-sm">
                          {slab.gstRate}%
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          {slab.gstRate === 0
                            ? '(Nil / Exempt Goods)'
                            : slab.gstRate === 5
                            ? '(Cotton Bedsheets & Towels)'
                            : slab.gstRate === 12
                            ? '(Curtains & Mink Blankets)'
                            : slab.gstRate === 18
                            ? '(Standard Home Textiles)'
                            : '(Luxury Furnishings)'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono-numbers text-slate-700">
                        {slab.itemCount > 0 ? slab.itemCount : '—'}
                      </td>

                      <td className="py-3 px-3 text-right font-mono-numbers font-semibold text-slate-900">
                        {formatINR(slab.taxableAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono-numbers text-blue-950">
                        {formatINR(slab.cgstAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono-numbers text-blue-950">
                        {formatINR(slab.sgstAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono-numbers text-indigo-950">
                        {formatINR(slab.igstAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono-numbers font-bold text-emerald-800">
                        {formatINR(slab.totalTax)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono-numbers font-bold text-slate-900">
                        {formatINR(slab.grossAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Grand Total Footer Row */}
                <tfoot>
                  <tr className="bg-slate-100/90 border-t-2 border-slate-300 font-bold text-slate-900">
                    <td className="py-3 px-4">GRAND TOTAL</td>
                    <td className="py-3 px-3 text-center font-mono-numbers">
                      {slabList.reduce((sum, s) => sum + s.itemCount, 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers text-sm">
                      {formatINR(reportTaxableTotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers text-sm text-blue-900">
                      {formatINR(reportCgstTotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers text-sm text-blue-900">
                      {formatINR(reportSgstTotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers text-sm text-indigo-900">
                      {formatINR(reportIgstTotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-numbers text-sm text-emerald-900">
                      {formatINR(reportNetTaxTotal)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-numbers text-base text-blue-950">
                      {formatINR(reportGrossTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* B2B vs B2C Tax Distribution Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* B2B Registered Client Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>B2B Registered Tax Invoices (GSTIN Included)</span>
              </div>
              <p className="text-xs text-slate-500">
                Invoices issued to business customers with registered GSTINs (Eligible for Input Tax Credit).
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Invoices</span>
                  <strong className="text-sm font-mono-numbers text-slate-900">{b2bInvoices.length}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Taxable Base</span>
                  <strong className="text-sm font-mono-numbers text-slate-900">{formatINR(b2bTaxable)}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">GST Collected</span>
                  <strong className="text-sm font-mono-numbers text-emerald-800">{formatINR(b2bTax)}</strong>
                </div>
              </div>
            </div>

            {/* B2C Consumer Sales Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>B2C Retail Consumer Sales (Unregistered)</span>
              </div>
              <p className="text-xs text-slate-500">
                Invoices issued to walk-in consumers and customers without a business GSTIN.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Invoices</span>
                  <strong className="text-sm font-mono-numbers text-slate-900">{b2cInvoices.length}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">Taxable Base</span>
                  <strong className="text-sm font-mono-numbers text-slate-900">{formatINR(b2cTaxable)}</strong>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg">
                  <span className="text-slate-400 block text-[11px]">GST Collected</span>
                  <strong className="text-sm font-mono-numbers text-emerald-800">{formatINR(b2cTax)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice-Level Tax Ledger in this Period */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Invoice-Level Tax Register ({taxInvoices.length} Bills)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed CGST, SGST, and IGST components for every invoice in this report period.
                </p>
              </div>

              <button
                onClick={handleExportTaxReport}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report CSV</span>
              </button>
            </div>

            {taxInvoices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No invoices found within the selected tax period ({taxRange.label}).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Customer & GSTIN</th>
                      <th className="py-3 px-3 text-right">Taxable (₹)</th>
                      <th className="py-3 px-3 text-right">CGST (₹)</th>
                      <th className="py-3 px-3 text-right">SGST (₹)</th>
                      <th className="py-3 px-3 text-right">IGST (₹)</th>
                      <th className="py-3 px-3 text-right">Total Tax (₹)</th>
                      <th className="py-3 px-4 text-right">Invoice Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taxInvoices.map((inv) => {
                      const isInterState =
                        inv.supplyType === 'inter-state' || (inv.igst && inv.igst > 0);
                      const cgst = inv.cgst || (isInterState ? 0 : inv.totalTax / 2);
                      const sgst = inv.sgst || (isInterState ? 0 : inv.totalTax / 2);
                      const igst = inv.igst || (isInterState ? inv.totalTax : 0);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-bold font-mono-numbers text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-mono-numbers whitespace-nowrap">
                            {inv.date}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 truncate max-w-[180px]">
                              {inv.customerName}
                            </div>
                            {inv.customerGstin ? (
                              <div className="text-[11px] text-blue-700 font-mono-numbers">
                                GSTIN: {inv.customerGstin}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400">Unregistered Consumer</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-numbers text-slate-800">
                            {formatINR(inv.subtotal)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-numbers text-slate-700">
                            {cgst > 0 ? formatINR(cgst) : '—'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-numbers text-slate-700">
                            {sgst > 0 ? formatINR(sgst) : '—'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-numbers text-indigo-700 font-medium">
                            {igst > 0 ? formatINR(igst) : '—'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono-numbers font-bold text-emerald-800">
                            {formatINR(inv.totalTax)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono-numbers font-bold text-slate-900">
                            {formatINR(inv.grandTotal)}
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
      ) : (
        /* =======================================================================
           VIEW MODE 2: INVOICES LEDGER & SEARCH TABLE
           ======================================================================= */
        <div className="space-y-6">
          {/* Summary KPI Strip for Current Filter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Filtered Sales Total</span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1 font-mono-numbers text-blue-900">
                {formatINR(totalFilteredSales)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">GST Tax Collected</span>
                <button
                  onClick={() => setViewMode('tax-report')}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Tax Report →
                </button>
              </div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1 font-mono-numbers">
                {formatINR(totalFilteredTax)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Discounts Given</span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1 font-mono-numbers text-emerald-700">
                {formatINR(totalFilteredDiscount)}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Invoices Matched</span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 mt-1 font-mono-numbers">
                {filteredInvoices.length}{' '}
                <span className="text-xs font-normal text-slate-400">/ {invoices.length}</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            {/* Main Search Row with Scope Selection */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Search Input with Clear Button */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    searchTarget === 'invoice'
                      ? 'Search by invoice number (e.g. MHW-00101)...'
                      : searchTarget === 'customer'
                      ? 'Search by customer name (e.g. Rajesh, Anita)...'
                      : 'Search by invoice number or customer name...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Target Mode Dropdown / Scope Selector */}
              <div className="md:col-span-2">
                <select
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:border-blue-500"
                >
                  <option value="all">Invoice # or Name</option>
                  <option value="invoice">Invoice # Only</option>
                  <option value="customer">Customer Name Only</option>
                </select>
              </div>

              {/* Quick Date Selector */}
              <div className="md:col-span-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today Only</option>
                  <option value="last7">Last 7 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Date Range...</option>
                </select>
              </div>

              {/* Payment Method */}
              <div className="md:col-span-2">
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="All">All Payments</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>

              {/* Status */}
              <div className="md:col-span-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Completed">Valid</option>
                  <option value="Void">Void</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range Row */}
            {dateFilter === 'custom' && (
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3 text-xs">
                <span className="text-slate-500 font-medium">From:</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800"
                />
                <span className="text-slate-500 font-medium">To:</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800"
                />
              </div>
            )}

            {/* Active Search Context Indicator */}
            {searchTerm.trim() && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span>Searching for:</span>
                  <strong className="text-slate-900 font-mono">"{searchTerm}"</strong>
                  <span className="text-slate-400">in</span>
                  <span className="font-semibold text-blue-700">
                    {searchTarget === 'invoice'
                      ? 'Invoice Numbers'
                      : searchTarget === 'customer'
                      ? 'Customer Names'
                      : 'Invoice Numbers & Customer Names'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-500">{filteredInvoices.length} results</span>
                </div>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Invoices Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            {filteredInvoices.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                <p className="font-semibold text-slate-700">
                  No invoices match your search criteria
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchTerm
                    ? `No invoices found matching "${searchTerm}" under the selected scope.`
                    : 'Try adjusting your date range or payment filters.'}
                </p>
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3 text-right">Taxable</th>
                      <th className="py-3 px-3 text-right">GST</th>
                      <th className="py-3 px-3 text-right">Grand Total</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => {
                      const isVoid = inv.status === 'Void';
                      return (
                        <tr
                          key={inv.id}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            isVoid ? 'opacity-60 bg-slate-50/40 line-through' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold font-mono-numbers text-slate-900">
                            {highlightMatch(inv.invoiceNumber, searchTerm)}
                          </td>

                          <td className="py-3 px-3 text-slate-600">
                            <div>{inv.date}</div>
                            <div className="text-[11px] text-slate-400 font-mono-numbers">
                              {inv.time}
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900 truncate max-w-[170px]">
                              {highlightMatch(inv.customerName, searchTerm)}
                            </div>
                            {inv.customerPhone && (
                              <div className="text-[11px] text-slate-400 font-mono-numbers">
                                {highlightMatch(inv.customerPhone, searchTerm)}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                              {inv.paymentMethod}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right font-mono-numbers text-slate-700">
                            {formatINR(inv.subtotal)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono-numbers text-slate-700">
                            {formatINR(inv.totalTax)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900 text-sm">
                            {formatINR(inv.grandTotal)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${
                                isVoid
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenPrint(inv)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                                title="Print / View Invoice"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Print</span>
                              </button>

                              {!isVoid && (
                                <button
                                  onClick={() => {
                                    const ok = confirm(
                                      `Void invoice ${inv.invoiceNumber}?\n\nThis will cancel the sale and return all ${inv.items.reduce(
                                        (s, i) => s + i.qty,
                                        0
                                      )} items back to your product inventory stock!`
                                    );
                                    if (ok) onVoidInvoice(inv.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Void and restore stock to inventory"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
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
        </div>
      )}
    </div>
  );
};
