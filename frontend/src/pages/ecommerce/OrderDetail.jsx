import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Package, CheckCircle, AlertCircle, MapPin, ArrowLeft, Calendar, Wrench, Image as ImageIcon, Smartphone, DollarSign, Download } from 'lucide-react';
import { trackOrder } from '../../api/ordersApi';
import { getInvoiceByOrder } from '../../api/invoicesApi';
import { PageLoading } from '../../components/LoadingSpinner';

const getStatusStyle = (status) => {
  const map = {
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Repair Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Shipped': 'bg-blue-50 text-blue-700 border-blue-200',
    'Processing': 'bg-amber-50 text-amber-700 border-amber-200',
    'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
    'Awaiting Approval': 'bg-amber-50 text-amber-700 border-amber-200',
    'Approved': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Repair Started': 'bg-purple-50 text-purple-700 border-purple-200',
    'Parts Ordered': 'bg-orange-50 text-orange-700 border-orange-200',
    'Ready For Pickup': 'bg-green-50 text-green-700 border-green-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200',
  };
  return map[status] || 'bg-slate-50 text-slate-600 border-slate-200';
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await trackOrder(orderId);
        setOrder(data);
        if (!data.isRepair) {
          try {
            const inv = await getInvoiceByOrder(orderId);
            setInvoice(inv);
          } catch {
            // No invoice yet
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center max-w-md w-full shadow-sm">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Order Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{order.isRepair ? 'Repair ID' : 'Order ID'}</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{order.orderId}</h1>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusStyle(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {order.isRepair ? (
            /* Repair Order Details */
            <div className="p-6 space-y-6">
              {order.deviceImages?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Smartphone size={14} /> Device Images
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {order.deviceImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Device ${idx + 1}`}
                        className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shrink-0"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock size={12} /> Requested On
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                {order.expectedDeliveryDate && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                      <Calendar size={12} /> Est. Delivery
                    </span>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {order.issueDescription && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Wrench size={12} /> Issue
                  </span>
                  <p className="text-sm text-slate-900 dark:text-white">{order.issueDescription}</p>
                </div>
              )}

              {order.diagnosisDetails && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Wrench size={12} /> Diagnosis
                  </span>
                  <p className="text-sm text-slate-900 dark:text-white">{order.diagnosisDetails}</p>
                </div>
              )}

              {(order.estimatedCost || order.finalCost) && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                    <DollarSign size={12} /> Cost
                  </span>
                  <div className="flex items-center gap-4">
                    {order.estimatedCost && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Estimated: <strong className="text-slate-900 dark:text-white">₹{order.estimatedCost}</strong>
                      </p>
                    )}
                    {order.finalCost && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Final: <strong className="text-indigo-600 dark:text-indigo-400">₹{order.finalCost}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {order.repairImages?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ImageIcon size={14} /> Repair Photos
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {order.repairImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Repair ${idx + 1}`}
                        className="w-32 h-32 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shrink-0"
                        onError={e => { e.target.style.display = 'none'; }} />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link to="/dashboard/live-tracking"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">
                  View Live Tracking
                </Link>
              </div>
            </div>
          ) : (
            /* E-commerce Order Details */
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock size={12} /> Ordered On
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Package size={12} /> Items
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.products?.length || 0} item(s)</p>
                </div>
              </div>

              {/* Products */}
              {Array.isArray(order.products) && order.products.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Items</p>
                  <div className="space-y-2">
                    {order.products.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <span className="text-sm text-slate-900 dark:text-white">{p.name || p.title || `Product ${i + 1}`} {p.quantity ? `x${p.quantity}` : ''}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{Number(p.price) || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Total Amount</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{order.totalAmount}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <span className="text-sm text-slate-600 dark:text-slate-400">Payment</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {order.paymentStatus || 'Pending'}
                </span>
              </div>

              {order.shippingAddress && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <MapPin size={12} /> Shipping To
                  </span>
                  <p className="text-sm text-slate-900 dark:text-white">
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              )}

              {invoice && (
                <div className="pt-2">
                  <a href={`/api/invoices/${invoice._id}/pdf`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all">
                    <Download size={16} /> Download Invoice
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
