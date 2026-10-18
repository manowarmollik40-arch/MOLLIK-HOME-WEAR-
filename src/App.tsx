import React, { useState, useEffect } from 'react';
import { ActiveTab, AppDatabase, Customer, Invoice, Product, StoreSettings } from './types.ts';
import {
  loadDatabase,
  saveDatabase,
  getInitialDatabase,
  DEFAULT_SETTINGS,
} from './services/storage.ts';
import { HeaderNav } from './components/HeaderNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { BillingPOSView } from './components/BillingPOSView.tsx';
import { ProductsView } from './components/ProductsView.tsx';
import { CustomersView } from './components/CustomersView.tsx';
import { SalesView } from './components/SalesView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { PrintInvoiceModal } from './components/PrintInvoiceModal.tsx';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [printableInvoice, setPrintableInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage whenever db updates
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3000);
  };

  // Handler: Save Invoice & update stock
  const handleSaveInvoice = (invoice: Invoice, updatedProducts: Product[]) => {
    setDb((prev) => {
      const nextNum = (prev.settings.nextInvoiceNumber || 1) + 1;
      return {
        ...prev,
        invoices: [invoice, ...prev.invoices],
        products: updatedProducts,
        settings: {
          ...prev.settings,
          nextInvoiceNumber: nextNum,
        },
      };
    });
    showToast(`Invoice ${invoice.invoiceNumber} saved & stock deducted!`);
  };

  // Handler: Save Product
  const handleSaveProduct = (product: Product) => {
    setDb((prev) => {
      const existingIdx = prev.products.findIndex((p) => p.id === product.id);
      let updatedProducts: Product[];
      if (existingIdx > -1) {
        updatedProducts = [...prev.products];
        updatedProducts[existingIdx] = product;
      } else {
        updatedProducts = [product, ...prev.products];
      }
      return {
        ...prev,
        products: updatedProducts,
      };
    });
    showToast(`Product "${product.name}" updated successfully.`);
  };

  // Handler: Delete Product
  const handleDeleteProduct = (productId: string) => {
    setDb((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
    showToast('Product removed.');
  };

  // Handler: Quick Stock Update (+/-)
  const handleUpdateStock = (productId: string, newStock: number) => {
    setDb((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
      ),
    }));
  };

  // Handler: Quick Restock
  const handleRestockQuick = (productId: string, addQty: number) => {
    setDb((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + addQty } : p
      ),
    }));
    showToast(`Added +${addQty} stock.`);
  };

  // Handler: Save Customer
  const handleSaveCustomer = (customer: Customer) => {
    setDb((prev) => {
      const existingIdx = prev.customers.findIndex((c) => c.id === customer.id);
      let updated: Customer[];
      if (existingIdx > -1) {
        updated = [...prev.customers];
        updated[existingIdx] = customer;
      } else {
        updated = [customer, ...prev.customers];
      }
      return {
        ...prev,
        customers: updated,
      };
    });
    showToast(`Customer "${customer.name}" saved.`);
  };

  // Handler: Delete Customer
  const handleDeleteCustomer = (customerId: string) => {
    setDb((prev) => ({
      ...prev,
      customers: prev.customers.filter((c) => c.id !== customerId),
    }));
    showToast('Customer record deleted.');
  };

  // Handler: Void Invoice and restore stock
  const handleVoidInvoice = (invoiceId: string) => {
    setDb((prev) => {
      const targetInvoice = prev.invoices.find((inv) => inv.id === invoiceId);
      if (!targetInvoice || targetInvoice.status === 'Void') return prev;

      // Restore product stock
      const updatedProducts = prev.products.map((p) => {
        const item = targetInvoice.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.qty };
        }
        return p;
      });

      // Update invoice status
      const updatedInvoices = prev.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'Void' as const } : inv
      );

      return {
        ...prev,
        products: updatedProducts,
        invoices: updatedInvoices,
      };
    });
    showToast('Invoice voided and inventory stock restored!');
  };

  // Handler: Save Settings
  const handleSaveSettings = (newSettings: StoreSettings) => {
    setDb((prev) => ({
      ...prev,
      settings: newSettings,
    }));
    showToast('Store settings saved.');
  };

  // Handler: Restore DB from JSON backup
  const handleRestoreDb = (restoredDb: AppDatabase) => {
    setDb(restoredDb);
    showToast('Backup restored successfully!');
  };

  // Handler: Reset to sample demo data
  const handleResetToDemo = () => {
    const demo = getInitialDatabase();
    setDb(demo);
    showToast('Sample demo catalog loaded!');
  };

  // Handler: Clear all data
  const handleClearAll = () => {
    setDb({
      products: [],
      customers: [],
      invoices: [],
      settings: DEFAULT_SETTINGS,
    });
    showToast('All local records cleared.');
  };

  const lowStockCount = db.products.filter(
    (p) => p.stock <= (p.lowStockThreshold || 5)
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <HeaderNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={db.settings}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            db={db}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenInvoice={(inv) => setPrintableInvoice(inv)}
            onRestockQuick={handleRestockQuick}
          />
        )}

        {activeTab === 'billing' && (
          <BillingPOSView
            db={db}
            onSaveInvoice={handleSaveInvoice}
            onOpenPrint={(inv) => setPrintableInvoice(inv)}
            onAddCustomerQuick={handleSaveCustomer}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={db.products}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersView
            customers={db.customers}
            invoices={db.invoices}
            onSaveCustomer={handleSaveCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onViewInvoice={(inv) => setPrintableInvoice(inv)}
          />
        )}

        {activeTab === 'sales' && (
          <SalesView
            invoices={db.invoices}
            products={db.products}
            onOpenPrint={(inv) => setPrintableInvoice(inv)}
            onVoidInvoice={handleVoidInvoice}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={db.settings}
            fullDb={db}
            onSaveSettings={handleSaveSettings}
            onRestoreDb={handleRestoreDb}
            onResetToDemo={handleResetToDemo}
            onClearAll={handleClearAll}
          />
        )}
      </main>

      {/* Print & View Invoice Modal */}
      {printableInvoice && (
        <PrintInvoiceModal
          invoice={printableInvoice}
          settings={db.settings}
          onClose={() => setPrintableInvoice(null)}
        />
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
