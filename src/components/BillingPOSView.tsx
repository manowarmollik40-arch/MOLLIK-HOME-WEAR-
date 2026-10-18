import React, { useState, useEffect } from 'react';
import {
  AppDatabase,
  Invoice,
  InvoiceItem,
  Product,
  Customer,
} from '../types.ts';
import { formatINR } from '../services/storage.ts';
import {
  Plus,
  Trash2,
  Barcode,
  Search,
  UserPlus,
  Printer,
  Save,
  RotateCcw,
  AlertCircle,
  Check,
  ShoppingCart,
} from 'lucide-react';

interface BillingPOSViewProps {
  db: AppDatabase;
  onSaveInvoice: (invoice: Invoice, updatedProducts: Product[]) => void;
  onOpenPrint: (invoice: Invoice) => void;
  onAddCustomerQuick: (customer: Customer) => void;
}

export const BillingPOSView: React.FC<BillingPOSViewProps> = ({
  db,
  onSaveInvoice,
  onOpenPrint,
  onAddCustomerQuick,
}) => {
  // Current invoice state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit'
  >('Cash');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [notes, setNotes] = useState('');

  // Search & Catalog
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Quick Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');

  // Initialize or reset form
  const initBill = () => {
    const prefix = db.settings.invoicePrefix || 'MHW';
    const nextNum = db.settings.nextInvoiceNumber || 1;
    setInvoiceNumber(`${prefix}-${String(nextNum).padStart(5, '0')}`);
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setSelectedCustomerId('');
    setPaymentMethod('Cash');
    setItems([]);
    setDiscountAmount(0);
    setNotes('');
  };

  useEffect(() => {
    initBill();
  }, [db.settings.invoicePrefix, db.settings.nextInvoiceNumber]);

  // Product categories for filtering
  const categories = ['All', ...Array.from(new Set(db.products.map((p) => p.category)))];

  // Filtered products for quick-add catalog
  const filteredProducts = db.products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchQuery =
      catalogSearch === '' ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchCat && matchQuery;
  });

  // Add product to bill
  const handleAddProduct = (product: Product) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);

    if (existingIndex > -1) {
      // Increase qty
      const updated = [...items];
      const cur = updated[existingIndex];
      const newQty = cur.qty + 1;
      const base = newQty * cur.rate;
      const tax = (base * cur.gstRate) / 100;
      updated[existingIndex] = {
        ...cur,
        qty: newQty,
        baseAmount: base,
        taxAmount: tax,
        totalAmount: base + tax,
      };
      setItems(updated);
    } else {
      // Add new item
      const rate = product.price;
      const gstRate = product.gstRate;
      const base = rate * 1;
      const tax = (base * gstRate) / 100;
      const newItem: InvoiceItem = {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        hsnCode: product.hsnCode || '6302',
        qty: 1,
        unit: product.unit || 'pcs',
        rate: rate,
        gstRate: gstRate,
        baseAmount: base,
        taxAmount: tax,
        totalAmount: base + tax,
      };
      setItems([...items, newItem]);
    }
  };

  // Add custom manual line item (e.g. Alteration / Stitching / Packing)
  const handleAddCustomLine = () => {
    const newItem: InvoiceItem = {
      productId: '',
      name: 'Custom Service / Stitching',
      sku: '',
      hsnCode: '9988',
      qty: 1,
      unit: 'job',
      rate: 100,
      gstRate: 5,
      baseAmount: 100,
      taxAmount: 5,
      totalAmount: 105,
    };
    setItems([...items, newItem]);
  };

  // Barcode / SKU quick-scanner submit
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = db.products.find(
      (p) =>
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase() ||
        p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase())
    );

    if (matched) {
      handleAddProduct(matched);
      setBarcodeInput('');
    } else {
      alert(`No product found with SKU or barcode "${barcodeInput}"`);
    }
  };

  // Modify line item values
  const handleUpdateLine = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: value };

    // Recalculate
    const qty = Math.max(0.01, Number(item.qty) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const gstRate = Math.max(0, Number(item.gstRate) || 0);

    const base = qty * rate;
    const tax = (base * gstRate) / 100;

    item.qty = qty;
    item.rate = rate;
    item.gstRate = gstRate;
    item.baseAmount = base;
    item.taxAmount = tax;
    item.totalAmount = base + tax;

    updated[index] = item;
    setItems(updated);
  };

  const handleRemoveLine = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.baseAmount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  let calculatedDiscount = 0;
  if (discountType === 'percent') {
    calculatedDiscount = (subtotal * Math.min(100, Math.max(0, discountAmount))) / 100;
  } else {
    calculatedDiscount = Math.min(subtotal + totalTax, Math.max(0, discountAmount));
  }

  const grandTotal = Math.max(0, subtotal + totalTax - calculatedDiscount);

  // Quick Customer Creation
  const handleSaveQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert('Please enter a customer name.');
      return;
    }
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      gstin: newCustGstin.trim(),
      createdAt: new Date().toISOString(),
    };
    onAddCustomerQuick(newCust);
    setSelectedCustomerId(newCust.id);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustGstin('');
  };

  // Save bill workflow
  const handleSave = (andPrint: boolean) => {
    if (items.length === 0) {
      alert('Please add at least one product to the invoice.');
      return;
    }

    // Check stock availability
    for (const item of items) {
      if (item.productId) {
        const prod = db.products.find((p) => p.id === item.productId);
        if (prod && prod.stock < item.qty) {
          const proceed = confirm(
            `Warning: Stock for "${item.name}" is only ${prod.stock} ${item.unit}, but you are billing ${item.qty} ${item.unit}.\n\nDo you want to proceed and allow negative stock?`
          );
          if (!proceed) return;
        }
      }
    }

    // Customer info lookup
    const customer = db.customers.find((c) => c.id === selectedCustomerId);

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber,
      date: invoiceDate,
      time: new Date().toTimeString().slice(0, 5),
      customerId: customer?.id || '',
      customerName: customer ? customer.name : 'Walk-in Customer',
      customerPhone: customer?.phone || '',
      customerAddress: customer?.address || '',
      customerGstin: customer?.gstin || '',
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'Credit' ? 'Pending' : 'Paid',
      items: items,
      subtotal: subtotal,
      totalTax: totalTax,
      cgst: cgst,
      sgst: sgst,
      discount: calculatedDiscount,
      grandTotal: grandTotal,
      notes: notes,
      status: 'Completed',
      createdAt: new Date().toISOString(),
    };

    // Deduct stock from products
    const updatedProducts = db.products.map((p) => {
      const lineItem = items.find((i) => i.productId === p.id);
      if (lineItem) {
        return {
          ...p,
          stock: p.stock - lineItem.qty,
        };
      }
      return p;
    });

    onSaveInvoice(invoice, updatedProducts);

    if (andPrint) {
      onOpenPrint(invoice);
    }

    // Reset for next bill
    initBill();
  };

  return (
    <div className="space-y-6">
      {/* Top POS Header & Settings Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold font-mono-numbers text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Customer</label>
              <button
                type="button"
                onClick={() => setShowNewCustomerModal(true)}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ New</span>
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="">Walk-in Customer (General)</option>
              {db.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
              <option value="Card">Card (Debit / Credit)</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="Credit">Credit / Due Later</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split: Left Cart & Calculations vs Right Quick Product Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: Active Invoice Cart (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            {/* Barcode scanner simulator and quick item adder */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <form onSubmit={handleBarcodeSubmit} className="flex-1 min-w-[220px] flex items-center gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Scan SKU barcode or type product name..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  Add Item
                </button>
              </form>

              <button
                type="button"
                onClick={handleAddCustomLine}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
              >
                + Custom Service / Charge
              </button>
            </div>

            {/* Cart Items Table */}
            <div className="overflow-x-auto min-h-[220px]">
              {items.length === 0 ? (
                <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center">
                  <ShoppingCart className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="font-semibold text-sm text-slate-600">Cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Scan a product barcode or click any item from the catalog on the right to add it to this bill.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-2 text-center w-20">Qty</th>
                      <th className="py-2.5 px-2 text-right w-24">Rate (₹)</th>
                      <th className="py-2.5 px-2 text-center w-20">GST</th>
                      <th className="py-2.5 px-3 text-right w-28">Amount</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateLine(idx, 'name', e.target.value)}
                            className="w-full font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden text-xs sm:text-sm"
                          />
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            <span>HSN:</span>
                            <input
                              type="text"
                              value={item.hsnCode}
                              onChange={(e) => handleUpdateLine(idx, 'hsnCode', e.target.value)}
                              className="w-14 bg-transparent border-b border-transparent hover:border-slate-300 text-slate-600 text-[11px] focus:outline-hidden"
                            />
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0.5"
                            step="any"
                            value={item.qty}
                            onChange={(e) => handleUpdateLine(idx, 'qty', e.target.value)}
                            className="w-16 px-1.5 py-1 text-center font-bold font-mono-numbers bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                          />
                        </td>

                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleUpdateLine(idx, 'rate', e.target.value)}
                            className="w-20 px-1.5 py-1 text-right font-mono-numbers bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                          />
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <select
                            value={item.gstRate}
                            onChange={(e) => handleUpdateLine(idx, 'gstRate', e.target.value)}
                            className="px-1 py-1 text-xs font-mono-numbers bg-slate-50 border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>

                        <td className="py-2.5 px-3 text-right font-bold font-mono-numbers text-slate-900">
                          {formatINR(item.totalAmount)}
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Calculations Breakdown Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal</span>
                <span className="font-mono-numbers font-medium">{formatINR(subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>GST Breakdown (CGST 50% + SGST 50%)</span>
                <span className="font-mono-numbers">
                  {formatINR(cgst)} + {formatINR(sgst)} = <strong>{formatINR(totalTax)}</strong>
                </span>
              </div>

              {/* Discount Row */}
              <div className="flex items-center justify-between text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <span>Special Discount</span>
                  <div className="flex items-center rounded border border-slate-300 overflow-hidden text-[11px]">
                    <button
                      type="button"
                      onClick={() => setDiscountType('fixed')}
                      className={`px-1.5 py-0.5 ${
                        discountType === 'fixed' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600'
                      }`}
                    >
                      ₹
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`px-1.5 py-0.5 ${
                        discountType === 'percent' ? 'bg-blue-600 text-white font-bold' : 'bg-white text-slate-600'
                      }`}
                    >
                      %
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    placeholder="0"
                    onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                    className="w-20 px-2 py-0.5 text-right font-mono-numbers bg-white border border-slate-300 rounded focus:outline-hidden"
                  />
                  <span className="font-mono-numbers text-emerald-700 font-semibold">
                    -{formatINR(calculatedDiscount)}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center text-base sm:text-lg font-extrabold text-slate-900 border-t-2 border-slate-800 pt-2.5">
                <span>Total Amount Due</span>
                <span className="font-mono-numbers text-xl sm:text-2xl text-blue-900">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>

            {/* POS Checkout Actions */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={initBill}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear / Reset</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={items.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={items.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Save & Print Bill</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Quick Item Catalog (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Product Catalog</h3>
            <span className="text-xs text-slate-400">{filteredProducts.length} items</span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or SKU..."
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {filteredProducts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No products found matching criteria.
              </div>
            ) : (
              filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleAddProduct(prod)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-700 truncate">
                      {prod.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono-numbers mt-0.5">
                      <span>{prod.sku}</span>
                      <span>·</span>
                      <span className={prod.stock <= prod.lowStockThreshold ? 'text-amber-600 font-bold' : ''}>
                        Stock: {prod.stock} {prod.unit}
                      </span>
                      <span>·</span>
                      <span>GST: {prod.gstRate}%</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono-numbers">
                      {formatINR(prod.price)}
                    </div>
                    <span className="text-[10px] text-blue-600 font-medium group-hover:underline">
                      + Add
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">Add New Customer</h3>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickCustomer} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Area / Market / City"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  GSTIN (Optional for B2B)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 19ABCDE1234F1Z5"
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
