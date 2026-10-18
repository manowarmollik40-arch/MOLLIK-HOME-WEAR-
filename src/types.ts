export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  gstRate: number; // 0, 5, 12, 18, 28
  hsnCode: string;
  unit: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  gstin?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  sku: string;
  hsnCode: string;
  qty: number;
  unit: string;
  rate: number;
  gstRate: number;
  baseAmount: number; // qty * rate
  taxAmount: number; // baseAmount * gstRate / 100
  totalAmount: number; // baseAmount + taxAmount
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerGstin?: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Credit';
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  igst?: number;
  supplyType?: 'intra-state' | 'inter-state';
  discount: number;
  grandTotal: number;
  notes?: string;
  status: 'Completed' | 'Returned' | 'Void';
  createdAt: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  invoiceFooterTerms: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  upiId: string;
  defaultPrintFormat: 'standard' | 'thermal';
}

export interface AppDatabase {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  settings: StoreSettings;
}

export type ActiveTab = 'dashboard' | 'billing' | 'products' | 'customers' | 'sales' | 'settings';
