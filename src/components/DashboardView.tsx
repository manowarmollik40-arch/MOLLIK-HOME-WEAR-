import React from 'react';
import { AppDatabase, Invoice, Product } from '../types.ts';
import { formatINR } from '../services/storage.ts';
import {
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface DashboardViewProps {
  db: AppDatabase;
  onNavigate: (tab: any) => void;
  onOpenInvoice: (invoice: Invoice) => void;
  onRestockQuick: (productId: string, addQty: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigate,
  onOpenInvoice,
  onRestockQuick,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);

  // Compute metrics
  const totalSales = db.invoices
    .filter((inv) => inv.status !== 'Void')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const todaySales = db.invoices
    .filter((inv) => inv.status !== 'Void' && inv.date === todayStr)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const todayInvoiceCount = db.invoices.filter((inv) => inv.date === todayStr).length;

  const lowStockProducts = db.products.filter(
    (p) => p.stock <= (p.lowStockThreshold || 5)
  );

  const totalInventoryStock = db.products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockValue = db.products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const recentInvoices = db.invoices.slice(0, 6);

  // Compute last 7 days sales data for recharts bar chart
  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = i === 6 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

    const dayInvoices = db.invoices.filter(
      (inv) => inv.status !== 'Void' && inv.date === dateStr
    );
    const revenue = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    return {
      date: dateStr,
      day: dayLabel,
      revenue: Math.round(revenue * 100) / 100,
      invoiceCount: dayInvoices.length,
      isToday: i === 6,
    };
  });

  const sevenDaysTotal = last7DaysData.reduce((sum, d) => sum + d.revenue, 0);
  const averageDailySales = sevenDaysTotal / 7;

  // Custom styled Tooltip for the Recharts BarChart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-sans">
          <p className="text-slate-300 font-medium">
            {data.day}{' '}
            <span className="text-slate-400 font-mono-numbers">({data.date})</span>
          </p>
          <p className="text-sm font-bold text-blue-400 font-mono-numbers mt-1">
            {formatINR(data.revenue)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {data.invoiceCount} {data.invoiceCount === 1 ? 'bill' : 'bills'} issued
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Store Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <span>Store Overview</span>
            <span aria-hidden="true">·</span>
            <span>{settingsDateLabel()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to {db.settings.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time billing, inventory tracking, GST calculations, and local sales management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('billing')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale / Bill</span>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <span>Manage Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-2 font-mono-numbers">
            {formatINR(totalSales)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
            <span>All-time</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{db.invoices.length} invoices</span>
          </div>
        </div>

        {/* Metric 2: Today's Sales */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Today's Sales</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-2 font-mono-numbers text-blue-700">
            {formatINR(todaySales)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
            <span>Today</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{todayInvoiceCount} bills generated</span>
          </div>
        </div>

        {/* Metric 3: Total Stock Inventory */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Inventory Value</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-2 font-mono-numbers">
            {formatINR(totalStockValue)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-mono-numbers">{db.products.length} products</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{totalInventoryStock} units</span>
          </div>
        </div>

        {/* Metric 4: Low Stock Alert */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Low Stock Items</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-lg sm:text-2xl font-extrabold mt-2 font-mono-numbers ${
            lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-900'
          }`}>
            {lowStockProducts.length}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
            {lowStockProducts.length > 0 ? (
              <span className="text-amber-700 font-medium">Needs reordering</span>
            ) : (
              <span className="text-emerald-700 font-medium">Healthy inventory levels</span>
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart: Last 7 Days Total Sales Revenue (Recharts) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Last 7 Days Sales Revenue
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily revenue distribution from {last7DaysData[0].day} to {last7DaysData[6].day}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500">7-Day Total: </span>
              <strong className="text-slate-900 font-mono-numbers text-sm ml-1">
                {formatINR(sevenDaysTotal)}
              </strong>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="text-slate-500">Daily Average: </span>
              <strong className="text-slate-700 font-mono-numbers ml-1">
                {formatINR(averageDailySales)}
              </strong>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
                width={56}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
              />
              <Bar dataKey="revenue" radius={[5, 5, 0, 0]} maxBarSize={48}>
                {last7DaysData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isToday ? '#1d4ed8' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Warning Section (if any items <= threshold) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <h3 className="text-sm font-bold text-amber-900">
                Low Stock Warning ({lowStockProducts.length} items below minimum threshold)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View all in Stock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-amber-200/80 rounded-lg p-3 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono-numbers mt-0.5">
                    SKU: {p.sku} · Stock:{' '}
                    <strong className="text-rose-600 font-bold">{p.stock}</strong> (Min: {p.lowStockThreshold})
                  </p>
                </div>
                <button
                  onClick={() => onRestockQuick(p.id, 10)}
                  className="px-2.5 py-1 text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Quickly add +10 units to stock"
                >
                  +10 Stock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Recent Invoices & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Invoices</h2>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Sales Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <p>No invoices created yet.</p>
              <button
                onClick={() => onNavigate('billing')}
                className="mt-3 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer"
              >
                Create First Bill
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="pb-2.5">Invoice #</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Payment</th>
                    <th className="pb-2.5 text-right">Amount</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-bold font-mono-numbers text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 text-slate-800">
                        <div className="font-medium truncate max-w-[140px] sm:max-w-xs">
                          {inv.customerName}
                        </div>
                        {inv.customerPhone && (
                          <span className="text-[11px] text-slate-400 font-mono-numbers">
                            {inv.customerPhone}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-600 text-xs whitespace-nowrap">
                        {inv.date}
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium whitespace-nowrap">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 font-mono-numbers">
                        {formatINR(inv.grandTotal)}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => onOpenInvoice(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Launch & Status Panel */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('billing')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    Create New Invoice
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Fast counter POS with GST breakdown & print
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => onNavigate('products')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    Add Product & Update Stock
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Bedsheets, curtains, towels, prices, SKUs
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => onNavigate('customers')}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                    Customer Ledger
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Save regular buyers, phone numbers & GSTIN
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          {/* Shop Setup & Data Safety Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Offline-Ready Local Storage
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your billing and stock records are securely preserved in this browser. To keep backups or switch devices, export your JSON backup from Settings anytime.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">GST-ready Indian invoicing</span>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
              >
                Backup Now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function settingsDateLabel(): string {
  const d = new Date();
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
