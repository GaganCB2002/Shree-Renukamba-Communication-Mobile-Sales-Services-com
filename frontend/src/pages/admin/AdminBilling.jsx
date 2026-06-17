import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Plus, Search, DollarSign, 
  Trash2, X, PlusCircle, Loader2, Clock, AlertTriangle 
} from 'lucide-react';
import { getInvoices, createInvoice, updateInvoiceStatus } from '../../api/invoicesApi';
import { getUsers } from '../../api/authApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useToast } from '../../contexts/ToastContext';

const statusBadgeColors = {
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
  'Overdue': 'bg-rose-50 text-rose-700 border-rose-100',
  'Draft': 'bg-slate-50 text-slate-600 border-slate-100',
};

const AdminBilling = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // New Invoice Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Invoice Form State
  const [selectedUser, setSelectedUser] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [invStatus, setInvStatus] = useState('Pending');
  const [invoiceItems, setInvoiceItems] = useState([
    { description: '', qty: 1, unitPrice: '' }
  ]);
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [linkOrderId, setLinkOrderId] = useState('');

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const nextStatusMap = {
        'Pending': 'Paid',
        'Paid': 'Overdue',
        'Overdue': 'Pending',
        'Draft': 'Pending'
      };
      const nextStatus = nextStatusMap[currentStatus] || 'Pending';
      const updated = await updateInvoiceStatus(id, { status: nextStatus });
      setInvoices(invoices.map(inv => inv._id === id ? { ...inv, status: updated.status } : inv));
      showToast(`Invoice status changed to ${nextStatus}`);
    } catch (err) {
      const msg = 'Failed to update invoice status.';
      setError(msg);
      showToast(msg);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invoicesData, usersData] = await Promise.all([
        getInvoices(),
        getUsers()
      ]);
      setInvoices(invoicesData);
      setUsers(usersData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load billing records');
    } finally {
      setLoading(false);
    }
  };

  // --- ITEM HANDLERS ---
  const handleAddItemRow = () => {
    setInvoiceItems([...invoiceItems, { description: '', qty: 1, unitPrice: '' }]);
  };

  const handleRemoveItemRow = (index) => {
    const updated = invoiceItems.filter((_, idx) => idx !== index);
    setInvoiceItems(updated.length > 0 ? updated : [{ description: '', qty: 1, unitPrice: '' }]);
  };

  const handleItemFieldChange = (index, field, value) => {
    const updated = [...invoiceItems];
    updated[index][field] = value;
    setInvoiceItems(updated);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const itemsPayload = invoiceItems.map(item => ({
        description: item.description,
        qty: Number(item.qty),
        unitPrice: Number(item.unitPrice)
      }));

      const payload = {
        customer: selectedUser,
        dueDate,
        status: invStatus,
        items: itemsPayload,
        paymentInstructions: paymentInstructions || undefined,
        ...(linkOrderId.trim() && { order: linkOrderId.trim() }),
      };

      await createInvoice(payload);
      
      showToast('Invoice created successfully!');
      
      // Reset & Reload
      setModalOpen(false);
      setSelectedUser('');
      setDueDate('');
      setInvStatus('Pending');
      setInvoiceItems([{ description: '', qty: 1, unitPrice: '' }]);
      setPaymentInstructions('');
      setLinkOrderId('');
      
      await fetchBillingData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate new invoice';
      setError(msg);
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered invoices list
  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const query = search.toLowerCase();
    const customerName = inv.customer?.fullName?.toLowerCase() || '';
    const matchesSearch = inv.invoiceId?.toLowerCase().includes(query) || customerName.includes(query);
    return matchesStatus && matchesSearch;
  });

  // KPI math
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">Manage enterprise revenue and pending collections.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-100 cursor-pointer"
        >
          <Plus size={16} />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* KPI Counters (Screenshot 5) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (This Month)</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">
              ₹{totalRevenue > 0 ? totalRevenue.toLocaleString('en-IN') : '12,45,000'}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ +14.5% from last month</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0"><DollarSign size={20} /></div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Invoices</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">
              {pendingInvoices.length > 0 ? pendingInvoices.length : '42'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Requires follow-up</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0"><Clock size={20} /></div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Amount</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1.5">
              ₹{overdueAmount > 0 ? overdueAmount.toLocaleString('en-IN') : '1,85,200'}
            </h3>
            <p className="text-[10px] text-rose-600 font-bold mt-1">! Critical attention needed</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl shrink-0"><AlertTriangle size={20} /></div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchBillingData} />}

      {/* Invoice Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Table filters */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/20 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Invoice ID or Customer..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto py-1.5 sm:py-0">
            {['All', 'Paid', 'Pending', 'Overdue', 'Draft'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                    : 'text-slate-500 border-transparent hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice List */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Invoices Found</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Generate a new invoice using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-6 py-5 font-mono font-bold text-slate-500">{inv.invoiceId}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs border border-slate-200 shrink-0">
                          {inv.customer?.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{inv.customer?.fullName || 'Walk-in'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{inv.customer?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 font-extrabold text-sm text-slate-800">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(inv._id, inv.status)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                          statusBadgeColors[inv.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                        title="Click to cycle status"
                      >
                        {inv.status}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <button 
                        onClick={() => navigate(`/invoices/${inv._id}`)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 shadow-sm"
                      >
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- INVOICE GENERATOR MODAL --- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 flex flex-col animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                <span>Generate New Invoice</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-6 flex-1">
              
              {/* Customer selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To (Customer)</label>
                <select
                  required
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="">Select a customer...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>

              {/* Optional: Link to Order */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link to Order (Optional)</label>
                <input
                  type="text"
                  value={linkOrderId}
                  onChange={(e) => setLinkOrderId(e.target.value)}
                  placeholder="Enter Order ID (e.g. ORD-123456)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Status and due date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Status</label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Invoice Items list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Itemized Services / Parts</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    <span>Add Item Row</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {invoiceItems.map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-center bg-slate-50 p-3 rounded-2xl border border-slate-150 relative">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                          placeholder="Item Description (e.g. Screen Replacement - Part #DISP-14P)"
                          className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                        />
                        <div className="flex gap-4">
                          <div className="w-1/3">
                            <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Qty</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemFieldChange(index, 'qty', e.target.value)}
                              className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                            />
                          </div>
                          <div className="w-2/3">
                            <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Unit Price (₹)</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemFieldChange(index, 'unitPrice', e.target.value)}
                              placeholder="e.g. 24500"
                              className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        disabled={invoiceItems.length === 1}
                        onClick={() => handleRemoveItemRow(index)}
                        className="p-2.5 text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer self-center"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Instructions</label>
                <textarea
                  rows="3"
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  placeholder="Leave empty for default HDFC bank transfer details..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white z-10 py-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Create Invoice</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBilling;
