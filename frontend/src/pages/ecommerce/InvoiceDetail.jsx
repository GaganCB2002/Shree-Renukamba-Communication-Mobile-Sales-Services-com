import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, CheckCircle, FileText, Landmark, Edit, Share2, Save, RotateCcw, Download } from 'lucide-react';
import { getInvoiceById, updateInvoiceStatus } from '../../api/invoicesApi';
import api from '../../api/axios';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const statusBadgeColors = {
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
  'Overdue': 'bg-rose-50 text-rose-700 border-rose-100',
  'Draft': 'bg-slate-50 text-slate-600 border-slate-100',
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const printRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [shopName] = useState(() => localStorage.getItem('invoice_shop_name') || 'Shree Renukamba Communication');
  const [shopOwner] = useState(() => localStorage.getItem('invoice_shop_owner') || 'Gagan G');
  const [gstNumber] = useState(() => localStorage.getItem('invoice_gst_number') || '29AAAAA0000A1Z5');
  const [shopPhone] = useState(() => localStorage.getItem('invoice_shop_phone') || '+91 98765 43210');
  const [shopEmail] = useState(() => localStorage.getItem('invoice_shop_email') || 'contact@renukamba.com');

  const [taxRate, setTaxRate] = useState(18);
  const [customDuty, setCustomDuty] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editableItems, setEditableItems] = useState([]);

  const now = new Date();
  const currentDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const currentTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoiceById(id);
      setInvoice(data);
      setEditableItems((data.items || []).map(item => ({ ...item })));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (idx, field, value) => {
    const updated = [...editableItems];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      updated[idx].total = Number(updated[idx].qty || 0) * Number(updated[idx].unitPrice || 0);
    }
    setEditableItems(updated);
  };

  const handleAddItem = () => {
    setEditableItems([...editableItems, { description: '', qty: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (idx) => {
    setEditableItems(editableItems.filter((_, i) => i !== idx));
  };

  const handleSaveEdits = async () => {
    try {
      setSaving(true);
      const processedItems = editableItems.map(item => ({
        description: item.description,
        qty: Number(item.qty || 1),
        unitPrice: Number(item.unitPrice || 0),
        total: Number(item.qty || 1) * Number(item.unitPrice || 0),
      }));
      const subtotal = processedItems.reduce((s, i) => s + i.total, 0);
      const cgst = Math.round(subtotal * (taxRate / 2 / 100) * 100) / 100;
      const sgst = Math.round(subtotal * (taxRate / 2 / 100) * 100) / 100;
      const svcChargeVal = Number(serviceCharge || 0);
      const totalAmount = subtotal + cgst + sgst + Number(customDuty || 0) + svcChargeVal;

      await updateInvoiceStatus(id, {
        items: processedItems,
        subtotal,
        cgst,
        sgst,
        totalAmount,
        taxRate,
        customDuty,
        serviceCharge: svcChargeVal,
      });
      setInvoice({ ...invoice, items: processedItems, subtotal, cgst, sgst, totalAmount, serviceCharge: svcChargeVal });
      setEditMode(false);
    } catch (err) {
      setError('Failed to save invoice edits');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    if (userInfo?.role === 'admin' || userInfo?.role === 'technician') {
      navigate('/admin/billing');
    } else {
      navigate('/dashboard');
    }
  };

  const handleFinalize = async () => {
    try {
      setSaving(true);
      await updateInvoiceStatus(id, { status: 'Paid' });
      setInvoice({ ...invoice, status: 'Paid' });
    } catch (err) {
      setError('Failed to finalize invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchInvoice} />;
  if (!invoice) return <ErrorMessage message="Invoice not found" />;

  const items = editMode ? editableItems : (invoice.items || []);
  const subtotal = items.reduce((s, i) => s + (i.total || Number(i.qty || 0) * Number(i.unitPrice || 0)), 0);
  const calculatedCgst = Math.round(subtotal * (taxRate / 2 / 100) * 100) / 100;
  const calculatedSgst = Math.round(subtotal * (taxRate / 2 / 100) * 100) / 100;
  const svcCharge = Number(serviceCharge || invoice.serviceCharge || 0);
  const totalAmount = subtotal + calculatedCgst + calculatedSgst + Number(customDuty || 0) + svcCharge;

  const shareText = `Hi! Here is your invoice from ${shopName} (Invoice No: ${invoice.invoiceId}). Total Amount: ₹${totalAmount.toLocaleString('en-IN')}. Generated on ${currentDate} at ${currentTime}.`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .screen-only { display: none !important; }
          body { background: white !important; color: black !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 portrait; margin: 8mm; }
          .invoice-card { break-inside: avoid; box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
          .invoice-logo { display: block !important; }
          .print-time { display: flex !important; }
          table { page-break-inside: auto; font-size: 11px; }
          tr { page-break-inside: avoid; }
          .print-time span { white-space: nowrap; }
        }
        @media screen {
          .print-time { display: none; }
          .screen-only { display: block; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <button onClick={handleBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft size={16} /> Back to Billing Dashboard
          </button>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all">
              <Edit size={14} /> {editMode ? 'Cancel Edit' : 'Edit Invoice'}
            </button>
            {editMode && (
              <button onClick={handleSaveEdits} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition-all">
              <Printer size={14} /> Print
            </button>
            <a href={`/api/invoices/${id}/pdf`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl text-xs font-bold shadow-sm transition-all">
              <Download size={14} /> Download PDF
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
              <Share2 size={14} /> WhatsApp
            </a>
            {invoice.status !== 'Paid' && (
              <button onClick={handleFinalize} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50">
                <CheckCircle size={14} /> Mark as Paid
              </button>
            )}
          </div>
        </div>

        <div className="invoice-card bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          {invoice.status !== 'Paid' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100/35 font-extrabold text-[80px] sm:text-[100px] uppercase pointer-events-none select-none tracking-widest rotate-12 z-0">
              PENDING
            </div>
          )}

          <div className="relative z-10" ref={printRef}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="SR Logo" className="w-12 h-12 rounded-xl object-cover border border-slate-200 invoice-logo" />
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">{shopName}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium leading-relaxed">
                  <p>Owner: <span className="font-bold text-slate-800">{shopOwner}</span></p>
                  <p>Phone: {shopPhone}</p>
                  <p>Email: {shopEmail}</p>
                  <p className="font-semibold text-indigo-600 mt-1">GSTIN: {gstNumber}</p>
                </div>
              </div>

              <div className="text-left md:text-right space-y-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
                <p className="text-xs font-mono font-bold text-slate-400">#{invoice.invoiceId}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-medium print-time">
                  <span>Issue: <span className="font-bold text-slate-800">{new Date(invoice.date).toLocaleDateString('en-IN')}</span></span>
                  <span>Due: <span className="font-bold text-rose-600">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span></span>
                  <span className="font-bold text-green-700">Generated: {currentDate} at {currentTime}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium screen-only">
                  <p>Issue: <span className="font-bold text-slate-800">{new Date(invoice.date).toLocaleDateString('en-IN')}</span></p>
                  <p>Due: <span className="font-bold text-rose-600">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span></p>
                </div>
                <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeColors[invoice.status]}`}>
                  {invoice.status === 'Paid' ? '✓ Paid' : `● ${invoice.status}`}
                </span>
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billed To</h3>
                <div className="font-medium text-slate-600 space-y-0.5">
                  <p className="text-base font-extrabold text-slate-900">{invoice.customer?.fullName || 'Walk-in Customer'}</p>
                  {invoice.customer?.address && (
                    <>
                      <p>{invoice.customer.address.street || ''}</p>
                      <p>{invoice.customer.address.city || ''}, {invoice.customer.address.state || ''} {invoice.customer.address.zipCode || ''}</p>
                    </>
                  )}
                  <p className="text-slate-400 font-semibold">{invoice.customer?.email}</p>
                  {invoice.customer?.phoneNumber && <p className="text-xs">Phone: {invoice.customer.phoneNumber}</p>}
                </div>
              </div>
              <div className="text-left md:text-right print-time">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 justify-start md:justify-end">
                  <span>Issued: <span className="font-bold text-slate-700">{new Date(invoice.date).toLocaleDateString('en-IN')}</span></span>
                  <span>Due: <span className="font-bold text-rose-600">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span></span>
                  <span className="font-bold text-green-700">Generated: {currentDate} at {currentTime}</span>
                </div>
              </div>
              <div className="text-left md:text-right screen-only">
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-medium">3-Day Summary:</p>
                  <p>Issued: <span className="font-bold text-slate-700">{new Date(invoice.date).toLocaleDateString('en-IN')}</span></p>
                  <p>Due: <span className="font-bold text-rose-600">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span></p>
                  <p className="font-bold text-green-700">Generated: {currentDate} at {currentTime}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 mb-6">
              <table className="w-full text-left border-collapse text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    {editMode && <th className="px-4 py-3 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 text-xs text-slate-400">{idx + 1}</td>
                      {editMode ? (
                        <>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(idx, 'qty', Number(e.target.value))}
                              className="w-14 px-2 py-1 border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:border-indigo-400"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-indigo-400"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                            ₹{(Number(item.qty || 0) * Number(item.unitPrice || 0)).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600 text-xs font-bold">X</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2.5">
                            <p className="font-bold text-slate-900">{item.description}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">Service & Repair Part</p>
                          </td>
                          <td className="px-4 py-2.5 text-center font-bold text-slate-600">{item.qty}</td>
                          <td className="px-4 py-2.5 text-right">₹{Number(item.unitPrice).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">₹{(Number(item.qty || 0) * Number(item.unitPrice || 0)).toLocaleString('en-IN')}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {editMode && (
                <div className="px-4 py-2 border-t border-slate-100">
                  <button onClick={handleAddItem} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    + Add Item
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
              <div className="space-y-2">
                {editMode && (
                  <div className="flex gap-3 items-end flex-wrap">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">GST %</label>
                      <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-xs text-center focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Addl (₹)</label>
                      <input type="number" value={customDuty} onChange={(e) => setCustomDuty(Number(e.target.value))} className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service (₹)</label>
                      <input type="number" value={serviceCharge} onChange={(e) => setServiceCharge(Number(e.target.value))} className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs text-right focus:outline-none focus:border-indigo-400" />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 text-sm font-semibold text-slate-600 w-full sm:w-64 ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST ({(taxRate / 2)}%)</span>
                  <span className="font-bold text-slate-900">₹{calculatedCgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({(taxRate / 2)}%)</span>
                  <span className="font-bold text-slate-900">₹{calculatedSgst.toLocaleString('en-IN')}</span>
                </div>
                {Number(customDuty) > 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>Addl Charges</span>
                    <span className="font-bold">₹{Number(customDuty).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {svcCharge > 0 && (
                  <div className="flex justify-between text-purple-600">
                    <span>Service Charge</span>
                    <span className="font-bold">₹{svcCharge.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <hr className="border-slate-100" />
                <div className="flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="font-black text-xl text-indigo-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 mb-4" />

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-400 font-medium">
              <div className="space-y-0.5 text-center sm:text-left leading-relaxed">
                <p>This is a system generated invoice and does not require a physical signature.</p>
                <p>Warranty is void if the device shows signs of damage or unauthorized repair.</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-indigo-500 font-bold">SR Communication</span>
                <span>• Thank you!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
