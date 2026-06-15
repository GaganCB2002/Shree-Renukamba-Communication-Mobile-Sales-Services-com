import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Download, Printer, CheckCircle, FileText, Landmark } from 'lucide-react';
import { getInvoiceById } from '../../api/invoicesApi';
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

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
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

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchInvoice} />;
  if (!invoice) return <ErrorMessage message="Invoice not found" />;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6">
      
      {/* Printable Style Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
        }
      `}} />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation / Control Toolbar (no-print) */}
        <div className="flex justify-between items-center no-print">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 transition-all"
            >
              <Printer size={14} />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>

        {/* Invoice Page Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-sm space-y-10 invoice-card relative overflow-hidden">
          
          {/* Watermark for pending invoices */}
          {invoice.status !== 'Paid' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100/35 font-extrabold text-[120px] uppercase pointer-events-none select-none tracking-widest rotate-12 z-0">
              PENDING
            </div>
          )}

          {/* Invoice Header */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><FileText size={20} /></div>
                <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">Lumina</span>
              </div>
              <div className="text-xs text-slate-500 font-medium leading-relaxed">
                <p>Lumina Tech Services Pvt. Ltd.</p>
                <p>128 Tech Park Boulevard, Suite 4</p>
                <p>Bengaluru, Karnataka 560001</p>
                <p className="font-semibold mt-1">GSTIN: 29AAAAA0000A1Z5</p>
              </div>
            </div>

            <div className="text-left md:text-right space-y-3">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">TAX INVOICE</h1>
                <p className="text-xs font-mono font-bold text-slate-400 mt-1">Invoice Number: {invoice.invoiceId}</p>
              </div>
              <div className="text-xs text-slate-500 font-medium space-y-0.5">
                <p>Date of Issue: <span className="font-bold text-slate-800">{new Date(invoice.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span></p>
                <p>Due Date: <span className="font-bold text-rose-600">{new Date(invoice.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span></p>
              </div>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${statusBadgeColors[invoice.status] || 'bg-slate-50'}`}>
                {invoice.status === 'Paid' ? '✓ Paid' : `● Payment ${invoice.status}`}
              </span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Billed To & Service Details Grid */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Billed To</h3>
              <div className="font-medium text-slate-600 space-y-1">
                <p className="text-base font-extrabold text-slate-900">{invoice.customer?.fullName || 'Walk-in Customer'}</p>
                {invoice.customer?.address && (
                  <>
                    <p>{invoice.customer.address.street || ''}</p>
                    <p>{invoice.customer.address.city || ''}, {invoice.customer.address.state || ''} {invoice.customer.address.zipCode || ''}</p>
                  </>
                )}
                <p className="text-slate-400 font-semibold">{invoice.customer?.email}</p>
              </div>
            </div>

            {/* Service & Ticket Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Details</h3>
              <div className="font-medium text-slate-600 space-y-1">
                {invoice.repairOrder ? (
                  <>
                    <p>Device: <span className="font-extrabold text-slate-800">{invoice.repairOrder.device?.brand || 'Unknown'} {invoice.repairOrder.device?.model || ''}</span></p>
                    <p>Ticket ID: <span className="font-bold text-slate-800 font-mono">#{invoice.repairOrder.repairId}</span></p>
                    <p>Technician: <span className="font-semibold text-slate-800">{invoice.repairOrder.assignedTechnician?.fullName || 'Sarah K.'}</span></p>
                  </>
                ) : (
                  <>
                    <p>Service: <span className="font-extrabold text-slate-800">E-Commerce Purchase</span></p>
                    <p>Details: <span className="font-semibold text-slate-800">General Sales Invoice</span></p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="relative z-10 overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Unit Price</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoice.items.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{item.description}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Category Service & Repair Part</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-600">{item.qty}</td>
                    <td className="px-6 py-4 text-right">₹{item.unitPrice.toLocaleString('en-IN')}.00</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">₹{item.total.toLocaleString('en-IN')}.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Instructions & Totals */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            
            {/* Left: Payment Instructions */}
            <div className="p-5 bg-slate-50/70 border border-slate-150 rounded-2xl space-y-3 max-w-sm">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Landmark size={14} className="text-slate-400" />
                <span>Payment Instructions</span>
              </div>
              <pre className="text-xs text-slate-600 font-mono font-medium leading-relaxed whitespace-pre-line">
                {invoice.paymentInstructions}
              </pre>
            </div>

            {/* Right: Totals summary */}
            <div className="space-y-3.5 text-sm font-semibold text-slate-600 ml-auto w-72">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{invoice.subtotal.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>CGST (9%)</span>
                <span className="font-bold text-slate-900">₹{invoice.cgst.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span>SGST (9%)</span>
                <span className="font-bold text-slate-900">₹{invoice.sgst.toLocaleString('en-IN')}.00</span>
              </div>
              <hr className="border-slate-100" />
              <div className="flex justify-between items-center text-base">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-black text-2xl text-indigo-600">
                  ₹{invoice.totalAmount.toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>

          </div>

          <hr className="border-slate-100" />

          {/* Terms & Conditions footer */}
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-medium">
            <div className="space-y-0.5 text-center sm:text-left leading-relaxed">
              <p>Terms & Conditions: Payment is due within 14 days of invoice date. Late payments may incur a</p>
              <p>1.5% monthly fee. Warranty is void if the device shows signs of physical damage or unauthorized repair.</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-rose-500">❤️</span>
              <span>Thank you for your business.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default InvoiceDetail;
