import React, { useState } from 'react';
import { Customer, Invoice } from '../types.ts';
import { formatINR } from '../services/storage.ts';
import {
  Plus,
  Search,
  Users,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  Eye,
  History,
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  invoices: Invoice[];
  onSaveCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  invoices,
  onSaveCustomer,
  onDeleteCustomer,
  onViewInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Selected customer for history drawer
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState<Customer | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gstin, setGstin] = useState('');
  const [notes, setNotes] = useState('');

  // Filtered list
  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q) ||
      (c.gstin && c.gstin.toLowerCase().includes(q))
    );
  });

  const handleOpenNew = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setGstin('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address);
    setCity(c.city || '');
    setGstin(c.gstin || '');
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Customer name is required.');
      return;
    }

    const customer: Customer = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      city: city.trim(),
      gstin: gstin.trim().toUpperCase(),
      notes: notes.trim(),
      createdAt: editingCustomer ? editingCustomer.createdAt : new Date().toISOString(),
    };

    onSaveCustomer(customer);
    setIsModalOpen(false);
  };

  // Compute metrics per customer
  const getCustomerStats = (customerId: string) => {
    const custInvoices = invoices.filter((inv) => inv.customerId === customerId);
    const totalSpend = custInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    return {
      count: custInvoices.length,
      totalSpend,
      invoices: custInvoices,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Customer Records & Ledger</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage repeat clients, contact numbers, B2B GSTIN registrations, and billing history.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name, phone number, address, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="font-semibold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your first customer above to track customer accounts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Address & City</th>
                  <th className="py-3 px-3">GSTIN</th>
                  <th className="py-3 px-3 text-center">Invoices</th>
                  <th className="py-3 px-3 text-right">Total Purchases</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((c) => {
                  const stats = getCustomerStats(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.name}
                        {c.notes && (
                          <p className="text-[11px] text-slate-400 font-normal mt-0.5">{c.notes}</p>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono-numbers text-slate-800 font-medium">
                          {c.phone || '—'}
                        </div>
                        {c.email && <div className="text-[11px] text-slate-400">{c.email}</div>}
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {c.address || '—'}
                        {c.city && <span className="text-slate-400">, {c.city}</span>}
                      </td>

                      <td className="py-3 px-3 font-mono-numbers text-slate-700">
                        {c.gstin ? (
                          <span className="font-semibold text-blue-900">{c.gstin}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-mono-numbers font-medium text-slate-700">
                        {stats.count}
                      </td>

                      <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900">
                        {formatINR(stats.totalSpend)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedCustomerHistory(c)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-indigo-50 transition-colors"
                            title="View Purchase History"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete customer "${c.name}"?`)) {
                                onDeleteCustomer(c.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Delete Customer"
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

      {/* Customer Purchase History Modal */}
      {selectedCustomerHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {selectedCustomerHistory.name} — Billing History
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCustomerHistory.phone || 'No phone'} · {selectedCustomerHistory.address || 'No address'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerHistory(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {(() => {
              const custStats = getCustomerStats(selectedCustomerHistory.id);
              if (custStats.invoices.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    No past invoices on record for this customer.
                  </div>
                );
              }
              return (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs sm:text-sm">
                    <span>Total Invoices: <strong className="font-mono-numbers">{custStats.count}</strong></span>
                    <span>Total Lifetime Spend: <strong className="font-mono-numbers text-emerald-700">{formatINR(custStats.totalSpend)}</strong></span>
                  </div>

                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase">
                        <th className="pb-2">Invoice #</th>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Payment</th>
                        <th className="pb-2 text-right">Amount</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {custStats.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-bold font-mono-numbers">{inv.invoiceNumber}</td>
                          <td className="py-2.5 text-slate-600">{inv.date}</td>
                          <td className="py-2.5">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {inv.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold font-mono-numbers">
                            {formatINR(inv.grandTotal)}
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedCustomerHistory(null);
                                onViewInvoice(inv);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                            >
                              View / Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-lg text-slate-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Street / Shop / Market area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN (for B2B)</label>
                  <input
                    type="text"
                    placeholder="19ABCDE1234F1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 font-mono-numbers uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Regular curtain buyer, wholesale discount 10%"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
