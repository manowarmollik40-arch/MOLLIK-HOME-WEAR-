import React, { useState } from 'react';
import { Product } from '../types.ts';
import { formatINR, exportProductsToCSV } from '../services/storage.ts';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onSaveProduct,
  onDeleteProduct,
  onUpdateStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'Low' | 'Out'>('All');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Bedsheets');
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [gstRate, setGstRate] = useState<number>(5);
  const [hsnCode, setHsnCode] = useState('6302');
  const [unit, setUnit] = useState('pcs');

  // Categories list
  const existingCategories = Array.from(new Set(products.map((p) => p.category)));
  const allCategories = ['All', ...existingCategories];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    let matchesStock = true;
    if (stockStatusFilter === 'Low') {
      matchesStock = p.stock <= (p.lowStockThreshold || 5) && p.stock > 0;
    } else if (stockStatusFilter === 'Out') {
      matchesStock = p.stock <= 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Open modal for new product
  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`MHW-PR-${Date.now().toString().slice(-4)}`);
    setCategory(existingCategories[0] || 'Bedsheets');
    setPrice(0);
    setCostPrice(0);
    setStock(10);
    setLowStockThreshold(5);
    setGstRate(5);
    setHsnCode('6302');
    setUnit('pcs');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setPrice(p.price);
    setCostPrice(p.costPrice || 0);
    setStock(p.stock);
    setLowStockThreshold(p.lowStockThreshold || 5);
    setGstRate(p.gstRate);
    setHsnCode(p.hsnCode || '6302');
    setUnit(p.unit || 'pcs');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const prodToSave: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      sku: sku.trim() || `MHW-${Date.now().toString().slice(-4)}`,
      category: category.trim() || 'General',
      price: Math.max(0, Number(price) || 0),
      costPrice: Math.max(0, Number(costPrice) || 0),
      stock: Math.max(0, Number(stock) || 0),
      lowStockThreshold: Math.max(1, Number(lowStockThreshold) || 5),
      gstRate: Number(gstRate) || 0,
      hsnCode: hsnCode.trim() || '6302',
      unit: unit.trim() || 'pcs',
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    onSaveProduct(prodToSave);
    setIsModalOpen(false);
  };

  // Stock calculations
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Products & Stock Inventory</h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span>
              Total: <strong className="text-slate-800 font-mono-numbers">{products.length}</strong> Products
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Stock: <strong className="text-slate-800 font-mono-numbers">{totalStockUnits}</strong> Units
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Valuation: <strong className="text-emerald-700 font-mono-numbers">{formatINR(totalValuation)}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportProductsToCSV(products)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock (≤ Threshold)</option>
            <option value="Out">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="font-semibold text-slate-700">No products match your filters</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or add a new product above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Product Name & Category</th>
                  <th className="py-3 px-3">SKU & HSN</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-center">GST %</th>
                  <th className="py-3 px-3 text-center">In Stock</th>
                  <th className="py-3 px-3 text-center">Quick Adjust</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.lowStockThreshold;
                  const isOut = p.stock <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span>{p.category}</span>
                          <span aria-hidden="true" className="mx-1">·</span>
                          <span>Unit: {p.unit}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono-numbers font-semibold text-slate-700">{p.sku}</div>
                        <div className="text-[11px] text-slate-400 font-mono-numbers">
                          HSN: {p.hsnCode || '—'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-bold font-mono-numbers text-slate-900">
                          {formatINR(p.price)}
                        </div>
                        {p.costPrice > 0 && (
                          <div className="text-[11px] text-slate-400 font-mono-numbers">
                            Cost: {formatINR(p.costPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono-numbers font-medium text-slate-700">
                          {p.gstRate}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono-numbers font-bold text-sm ${
                            isOut
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {p.stock}
                        </span>
                        {isLow && (
                          <div className="text-[10px] text-amber-700 font-semibold">
                            {isOut ? 'Out of stock' : `Low (Min ${p.lowStockThreshold})`}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
                          <button
                            onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 1))}
                            className="w-6 h-6 rounded hover:bg-white text-slate-700 flex items-center justify-center font-bold text-xs"
                            title="Deduct 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, p.stock + 1)}
                            className="w-6 h-6 rounded hover:bg-white text-slate-700 flex items-center justify-center font-bold text-xs"
                            title="Add 1"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, p.stock + 10)}
                            className="px-1.5 h-6 rounded hover:bg-white text-blue-700 font-bold text-[10px]"
                            title="Add 10"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${p.name}"? Past invoices will retain this product.`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-lg text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cotton King Bedsheet 300TC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Barcode *</label>
                  <input
                    type="text"
                    required
                    placeholder="MHW-BS-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Bedsheets, Curtains, Towels..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="899.00"
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost / Purchase Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="520.00"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                  >
                    <option value="0">0% (Nil / Exempt)</option>
                    <option value="5">5% (Fabrics & Low Rate Textiles)</option>
                    <option value="12">12% (Curtains, Blankets, Furnishings)</option>
                    <option value="18">18% (Synthetic & Standard Goods)</option>
                    <option value="28">28% (Luxury items)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    placeholder="6302"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
