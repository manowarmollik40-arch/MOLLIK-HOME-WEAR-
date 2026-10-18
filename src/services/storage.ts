import { AppDatabase, Product, Customer, Invoice, StoreSettings } from '../types.ts';

const STORAGE_KEY = 'mollik_home_wear_db_v2';

export const DEFAULT_SETTINGS: StoreSettings = {
  name: 'MOLLIK HOME WEAR',
  tagline: 'Premium Bed Linens, Curtains, Towels & Home Furnishings',
  phone: '+91 98301 23456',
  email: 'mollikhomewear@gmail.com',
  address: 'Shop No. 12, Textile Market Road, Near City Center',
  city: 'Kolkata',
  state: 'West Bengal',
  pincode: '700001',
  gstin: '19AAAPM1234F1Z9',
  pan: 'AAAPM1234F',
  invoicePrefix: 'MHW',
  nextInvoiceNumber: 104,
  invoiceFooterTerms: '1. Goods once sold cannot be returned after 7 days.\n2. In case of manufacturing defect, original invoice is required.\n3. Subject to local jurisdiction. Thank you for shopping with Mollik Home Wear!',
  bankName: 'State Bank of India',
  accountNo: '39281092831',
  ifsc: 'SBIN0001234',
  upiId: 'mollikhomewear@sbi',
  defaultPrintFormat: 'standard',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Pure Cotton King Double Bedsheet (300 TC)',
    sku: 'MHW-BS-101',
    category: 'Bedsheets',
    price: 899,
    costPrice: 520,
    stock: 28,
    lowStockThreshold: 5,
    gstRate: 5,
    hsnCode: '6302',
    unit: 'pcs',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Jacquard Blackout Eyelet Window Curtain (7 ft)',
    sku: 'MHW-CT-201',
    category: 'Curtains',
    price: 549,
    costPrice: 320,
    stock: 22,
    lowStockThreshold: 6,
    gstRate: 12,
    hsnCode: '6303',
    unit: 'pcs',
    createdAt: '2026-10-02T11:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Turkish Cotton Ultra Absorbent Bath Towel 600 GSM',
    sku: 'MHW-TW-301',
    category: 'Towels',
    price: 399,
    costPrice: 220,
    stock: 45,
    lowStockThreshold: 10,
    gstRate: 5,
    hsnCode: '6302',
    unit: 'pcs',
    createdAt: '2026-10-03T09:30:00Z',
  },
  {
    id: 'prod-4',
    name: 'Heavy Winter Embossed Mink Blanket (Double)',
    sku: 'MHW-BK-401',
    category: 'Blankets',
    price: 1899,
    costPrice: 1250,
    stock: 4,
    lowStockThreshold: 5,
    gstRate: 12,
    hsnCode: '6301',
    unit: 'pcs',
    createdAt: '2026-10-04T14:15:00Z',
  },
  {
    id: 'prod-5',
    name: 'Microfiber Resilient Pillow Set (Pack of 2)',
    sku: 'MHW-PL-501',
    category: 'Pillows',
    price: 499,
    costPrice: 280,
    stock: 15,
    lowStockThreshold: 5,
    gstRate: 12,
    hsnCode: '9404',
    unit: 'set',
    createdAt: '2026-10-05T12:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'Handloom Cotton 6-Seater Table Runner & Mats',
    sku: 'MHW-TR-601',
    category: 'Table Linen',
    price: 349,
    costPrice: 190,
    stock: 3,
    lowStockThreshold: 5,
    gstRate: 5,
    hsnCode: '6304',
    unit: 'set',
    createdAt: '2026-10-06T15:40:00Z',
  },
  {
    id: 'prod-7',
    name: 'Elasticated All-Fit Sofa Cover (3+1+1 Set)',
    sku: 'MHW-SC-701',
    category: 'Sofa Covers',
    price: 1599,
    costPrice: 980,
    stock: 9,
    lowStockThreshold: 4,
    gstRate: 12,
    hsnCode: '6304',
    unit: 'set',
    createdAt: '2026-10-07T16:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'Anti-Skid Memory Foam Bath Floor Mat',
    sku: 'MHW-FM-801',
    category: 'Floor Mats',
    price: 249,
    costPrice: 130,
    stock: 36,
    lowStockThreshold: 8,
    gstRate: 5,
    hsnCode: '5705',
    unit: 'pcs',
    createdAt: '2026-10-08T10:10:00Z',
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rajesh Sharma',
    phone: '9876543210',
    email: 'rajesh.sharma@example.com',
    address: '14/B Park Circus, Near 7-Point',
    city: 'Kolkata',
    state: 'West Bengal',
    createdAt: '2026-10-05T10:00:00Z',
  },
  {
    id: 'cust-2',
    name: 'Anita Sen',
    phone: '9830112233',
    email: 'anita.sen@example.com',
    address: '52 Grand Trunk Road, Salkia',
    city: 'Howrah',
    state: 'West Bengal',
    createdAt: '2026-10-08T11:20:00Z',
  },
  {
    id: 'cust-3',
    name: 'M/s Bengal Furnishers (Debashis Roy)',
    phone: '9831998877',
    address: 'Station Road, Mollikpara',
    city: 'Hooghly',
    state: 'West Bengal',
    gstin: '19ABCDE1234F1Z5',
    notes: 'Wholesale client for curtain sets',
    createdAt: '2026-10-10T14:00:00Z',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'MHW-00101',
    date: '2026-10-16',
    time: '11:30',
    customerId: 'cust-1',
    customerName: 'Rajesh Sharma',
    customerPhone: '9876543210',
    customerAddress: '14/B Park Circus, Kolkata',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    items: [
      {
        productId: 'prod-1',
        name: 'Pure Cotton King Double Bedsheet (300 TC)',
        sku: 'MHW-BS-101',
        hsnCode: '6302',
        qty: 2,
        unit: 'pcs',
        rate: 899,
        gstRate: 5,
        baseAmount: 1798,
        taxAmount: 89.9,
        totalAmount: 1887.9,
      },
      {
        productId: 'prod-3',
        name: 'Turkish Cotton Ultra Absorbent Bath Towel 600 GSM',
        sku: 'MHW-TW-301',
        hsnCode: '6302',
        qty: 2,
        unit: 'pcs',
        rate: 399,
        gstRate: 5,
        baseAmount: 798,
        taxAmount: 39.9,
        totalAmount: 837.9,
      },
    ],
    subtotal: 2596,
    totalTax: 129.8,
    cgst: 64.9,
    sgst: 64.9,
    discount: 50,
    grandTotal: 2675.8,
    status: 'Completed',
    createdAt: '2026-10-16T11:30:00Z',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'MHW-00102',
    date: '2026-10-17',
    time: '14:45',
    customerId: 'cust-2',
    customerName: 'Anita Sen',
    customerPhone: '9830112233',
    customerAddress: '52 GT Road, Howrah',
    paymentMethod: 'Cash',
    paymentStatus: 'Paid',
    items: [
      {
        productId: 'prod-2',
        name: 'Jacquard Blackout Eyelet Window Curtain (7 ft)',
        sku: 'MHW-CT-201',
        hsnCode: '6303',
        qty: 4,
        unit: 'pcs',
        rate: 549,
        gstRate: 12,
        baseAmount: 2196,
        taxAmount: 263.52,
        totalAmount: 2459.52,
      },
    ],
    subtotal: 2196,
    totalTax: 263.52,
    cgst: 131.76,
    sgst: 131.76,
    discount: 0,
    grandTotal: 2459.52,
    status: 'Completed',
    createdAt: '2026-10-17T14:45:00Z',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'MHW-00103',
    date: '2026-10-18',
    time: '09:20',
    customerId: '',
    customerName: 'Walk-in Customer',
    customerPhone: '',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    items: [
      {
        productId: 'prod-8',
        name: 'Anti-Skid Memory Foam Bath Floor Mat',
        sku: 'MHW-FM-801',
        hsnCode: '5705',
        qty: 2,
        unit: 'pcs',
        rate: 249,
        gstRate: 5,
        baseAmount: 498,
        taxAmount: 24.9,
        totalAmount: 522.9,
      },
    ],
    subtotal: 498,
    totalTax: 24.9,
    cgst: 12.45,
    sgst: 12.45,
    discount: 0,
    grandTotal: 522.9,
    status: 'Completed',
    createdAt: '2026-10-18T09:20:00Z',
  },
];

export function getInitialDatabase(): AppDatabase {
  return {
    products: INITIAL_PRODUCTS,
    customers: INITIAL_CUSTOMERS,
    invoices: INITIAL_INVOICES,
    settings: DEFAULT_SETTINGS,
  };
}

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : INITIAL_PRODUCTS,
      customers: Array.isArray(parsed.customers) ? parsed.customers : INITIAL_CUSTOMERS,
      invoices: Array.isArray(parsed.invoices) ? parsed.invoices : INITIAL_INVOICES,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch (err) {
    console.error('Error loading database, resetting to defaults:', err);
    return getInitialDatabase();
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function formatINR(val: number): string {
  return '₹' + Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumberOnly(val: number): string {
  return Number(val || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Convert amount to Indian English words for formal invoice printing
export function numberToWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + (n % 10 !== 0 ? units[n % 10] + ' ' : '');
    return units[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? convertChunk(n % 100) : '');
  }

  let num = rounded;
  let words = '';

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  if (crores > 0) words += convertChunk(crores) + 'Crore ';

  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  if (lakhs > 0) words += convertChunk(lakhs) + 'Lakh ';

  const thousands = Math.floor(num / 1000);
  num %= 1000;
  if (thousands > 0) words += convertChunk(thousands) + 'Thousand ';

  if (num > 0) words += convertChunk(num);

  return words.trim() + ' Rupees Only';
}

export function exportJSONBackup(db: AppDatabase): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `mollik-home-wear-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const headers = [
    'Invoice Number',
    'Date',
    'Time',
    'Customer Name',
    'Customer Phone',
    'Payment Method',
    'Subtotal',
    'CGST',
    'SGST',
    'Total Tax',
    'Discount',
    'Grand Total',
    'Status',
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.date,
    inv.time,
    inv.customerName,
    inv.customerPhone || 'N/A',
    inv.paymentMethod,
    inv.subtotal.toFixed(2),
    inv.cgst.toFixed(2),
    inv.sgst.toFixed(2),
    inv.totalTax.toFixed(2),
    inv.discount.toFixed(2),
    inv.grandTotal.toFixed(2),
    inv.status,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
      '\n'
    );

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `mollik-home-wear-invoices-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportProductsToCSV(products: Product[]): void {
  const headers = ['Product Name', 'SKU', 'Category', 'HSN Code', 'Selling Price (INR)', 'Cost Price (INR)', 'Stock Qty', 'Unit', 'GST Rate (%)'];

  const rows = products.map((p) => [
    p.name,
    p.sku,
    p.category,
    p.hsnCode || '',
    p.price.toFixed(2),
    p.costPrice.toFixed(2),
    p.stock,
    p.unit,
    p.gstRate,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
      '\n'
    );

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `mollik-home-wear-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export interface TaxSlabSummary {
  gstRate: number;
  itemCount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grossAmount: number;
}

export function exportTaxReportToCSV(
  periodLabel: string,
  slabs: TaxSlabSummary[],
  totalTaxable: number,
  totalCgst: number,
  totalSgst: number,
  totalIgst: number,
  totalGst: number,
  invoices: Invoice[]
): void {
  const lines: string[] = [];

  // Header & Period
  lines.push(`"MOLLIK HOME WEAR - GST TAX REPORT"`);
  lines.push(`"Report Period: ${periodLabel}"`);
  lines.push(`"Generated On: ${new Date().toLocaleDateString('en-IN')}"`);
  lines.push(``);

  // Summary Totals
  lines.push(`"GST SUMMARY TOTALS"`);
  lines.push(`"Metric","Amount (INR)"`);
  lines.push(`"Total Taxable Turnover","${totalTaxable.toFixed(2)}"`);
  lines.push(`"Total CGST (Central Tax)","${totalCgst.toFixed(2)}"`);
  lines.push(`"Total SGST (State Tax)","${totalSgst.toFixed(2)}"`);
  lines.push(`"Total IGST (Integrated Tax)","${totalIgst.toFixed(2)}"`);
  lines.push(`"Total GST Collected","${totalGst.toFixed(2)}"`);
  lines.push(``);

  // Slab Breakdown Table
  lines.push(`"GST RATE SLAB BREAKDOWN"`);
  lines.push(`"GST Rate Slab","Taxable Turnover (INR)","CGST (INR)","SGST (INR)","IGST (INR)","Total GST (INR)","Gross Amount (INR)"`);
  for (const s of slabs) {
    lines.push(`"${s.gstRate}%","${s.taxableAmount.toFixed(2)}","${s.cgstAmount.toFixed(2)}","${s.sgstAmount.toFixed(2)}","${s.igstAmount.toFixed(2)}","${s.totalTax.toFixed(2)}","${s.grossAmount.toFixed(2)}"`);
  }
  lines.push(`"Total","${totalTaxable.toFixed(2)}","${totalCgst.toFixed(2)}","${totalSgst.toFixed(2)}","${totalIgst.toFixed(2)}","${totalGst.toFixed(2)}","${(totalTaxable + totalGst).toFixed(2)}"`);
  lines.push(``);

  // Invoices list in this tax period
  lines.push(`"INVOICE LEVEL TAX DETAILS"`);
  lines.push(`"Invoice No","Date","Customer Name","Customer GSTIN","Supply Type","Taxable Value","CGST","SGST","IGST","Total GST","Grand Total"`);
  for (const inv of invoices) {
    const isInterState = inv.supplyType === 'inter-state' || (inv.igst && inv.igst > 0);
    const cgst = inv.cgst || (isInterState ? 0 : inv.totalTax / 2);
    const sgst = inv.sgst || (isInterState ? 0 : inv.totalTax / 2);
    const igst = inv.igst || (isInterState ? inv.totalTax : 0);

    lines.push(
      `"${inv.invoiceNumber}","${inv.date}","${inv.customerName}","${inv.customerGstin || 'Unregistered'}","${isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST/SGST)'}","${inv.subtotal.toFixed(2)}","${cgst.toFixed(2)}","${sgst.toFixed(2)}","${igst.toFixed(2)}","${inv.totalTax.toFixed(2)}","${inv.grandTotal.toFixed(2)}"`
    );
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `mollik-home-wear-gst-tax-report-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

