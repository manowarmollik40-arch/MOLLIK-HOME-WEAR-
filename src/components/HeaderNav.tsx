import React from 'react';
import { ActiveTab, StoreSettings } from '../types.ts';
import { LayoutDashboard, ReceiptText, Boxes, Users, CircleDollarSign, SlidersHorizontal, Plus } from 'lucide-react';

interface HeaderNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  settings: StoreSettings;
  lowStockCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  setActiveTab,
  settings,
  lowStockCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Brand Wordmark (Single line, no pills) */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center border border-white/15 shrink-0">
            <img
              src="/src/assets/images/mollik_home_wear_logo_1792346708350.jpg"
              alt="Mollik Home Wear Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback styled icon if image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {settings.name || 'MOLLIK HOME WEAR'}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Billing & Inventory ERP
            </span>
          </div>
        </div>

        {/* Zone 2: 5 single-line clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'dashboard'
                ? 'text-white border-blue-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'billing'
                ? 'text-white border-blue-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            New Bill / POS
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'text-white border-blue-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <span>Products & Stock</span>
            {lowStockCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono font-bold">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'customers'
                ? 'text-white border-blue-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Customers
          </button>

          <button
            onClick={() => setActiveTab('sales')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'sales'
                ? 'text-white border-blue-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Sales Ledger
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
              activeTab === 'settings'
                ? 'text-white border-blue-400 font-semibold'
                : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('billing')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Bill</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Sub-Navigation Bar for WebView / Phone View */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 bg-slate-950/70 border-t border-slate-800 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'billing' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ReceiptText className="w-3.5 h-3.5" />
          <span>Billing</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'products' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Stock</span>
          {lowStockCount > 0 && (
            <span className="text-[10px] px-1 bg-amber-500 text-slate-950 font-bold rounded">
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'customers' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customers</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'sales' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CircleDollarSign className="w-3.5 h-3.5" />
          <span>Sales</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'settings' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  );
};
