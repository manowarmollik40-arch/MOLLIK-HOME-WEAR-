import React, { useState } from 'react';
import { StoreSettings, AppDatabase } from '../types.ts';
import { exportJSONBackup, getInitialDatabase } from '../services/storage.ts';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Building2,
  Receipt,
  Landmark,
  ShieldAlert,
  Smartphone,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  settings: StoreSettings;
  fullDb: AppDatabase;
  onSaveSettings: (settings: StoreSettings) => void;
  onRestoreDb: (restoredDb: AppDatabase) => void;
  onResetToDemo: () => void;
  onClearAll: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  fullDb,
  onSaveSettings,
  onRestoreDb,
  onResetToDemo,
  onClearAll,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field: keyof StoreSettings, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.products || !parsed.customers || !parsed.invoices) {
          throw new Error('Invalid backup schema');
        }

        const confirmRestore = confirm(
          'Restore database from file? This will replace current records on this browser.'
        );
        if (confirmRestore) {
          onRestoreDb(parsed);
          alert('Backup restored successfully!');
        }
      } catch (err) {
        alert('Failed to restore backup: File is invalid or corrupted JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business & Store Settings</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your shop branding, GST registration, bank details, and local data backups.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Profile */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Shop / Firm Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Subtitle</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="e.g. Premium Bed Linens, Curtains & Home Furnishings"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GSTIN (GST Number)</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                placeholder="e.g. 19AAAPM1234F1Z9"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers uppercase font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                placeholder="e.g. AAAPM1234F"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Invoice Preferences & Bank Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Receipt className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">Invoice Format & Payment Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers uppercase font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">E.g. "MHW" becomes MHW-00104</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Next Sequence #</label>
              <input
                type="number"
                min="1"
                value={formData.nextInvoiceNumber}
                onChange={(e) => handleChange('nextInvoiceNumber', Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Print Mode</label>
              <select
                value={formData.defaultPrintFormat}
                onChange={(e) => handleChange('defaultPrintFormat', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              >
                <option value="standard">Standard A4 Tax Invoice</option>
                <option value="thermal">80mm POS Thermal Receipt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="e.g. State Bank of India"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNo}
                onChange={(e) => handleChange('accountNo', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc}
                onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI ID for Payment</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                placeholder="shop@upi"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Invoice Terms & Conditions (Printed on bottom of bill)
            </label>
            <textarea
              rows={3}
              value={formData.invoiceFooterTerms}
              onChange={(e) => handleChange('invoiceFooterTerms', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Business Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Data Backup, Restore & Reset */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Download className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-base text-slate-900">Database Backup & Recovery</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          All your inventory products, customers, invoices, and settings are preserved in local storage on this browser. You can export a full JSON backup file at any time to safeguard your store data or transfer it to another computer or phone.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => exportJSONBackup(fullDb)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore JSON Backup</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Reload preloaded demo products and customer records for Mollik Home Wear?'
                )
              ) {
                onResetToDemo();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Load Sample Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'DANGER: This will permanently erase all products, customers, and invoices from this browser. Be sure you downloaded a backup first.\n\nContinue with deletion?'
                )
              ) {
                onClearAll();
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Erase All Local Data</span>
          </button>
        </div>
      </div>

      {/* Section 4: AppCreator24 & Android APK Embedding Instructions */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span>AppCreator24 & Android WebView Integration Notes</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 leading-relaxed pl-1">
          <li>
            <strong>Mobile & WebView Ready:</strong> This app is fully responsive and touch-optimized with compact POS controls for mobile phones, counter tablets, and Android WebViews.
          </li>
          <li>
            <strong>Using with AppCreator24:</strong> In AppCreator24, create a new app, add a <strong>Web / Website / WebView</strong> section, and enter your live application URL.
          </li>
          <li>
            <strong>Thermal Printer Support:</strong> When printing from mobile browsers or Bluetooth POS apps, select "80mm POS Thermal" format to output standard 3-inch counter receipts.
          </li>
          <li>
            <strong>Data Storage:</strong> Data is saved directly in browser LocalStorage. Ensure users regularly use <em>Download JSON Backup</em> to guard against accidental browser cache clear.
          </li>
        </ul>
      </div>
    </div>
  );
};
