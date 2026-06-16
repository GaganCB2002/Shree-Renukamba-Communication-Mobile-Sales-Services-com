import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Package, CheckCircle, AlertCircle, MapPin, ArrowLeft, Calendar, Wrench, Image as ImageIcon, Smartphone, DollarSign, Download, Tag, ChevronRight, IndianRupee } from 'lucide-react';
import { trackOrder } from '../../api/ordersApi';
import { getInvoiceByOrder } from '../../api/invoicesApi';
import { PageLoading } from '../../components/LoadingSpinner';

const ORDER_STATUS_FLOW = [
  'Pending',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const getStatusStyle = (status) => {
  const map = {
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Repair Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Shipped': 'bg-blue-50 text-blue-700 border-blue-200',
    'Out for Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
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

const OrderTimeline = ({ currentStatus, isRepair }) => {
  const flow = isRepair
    ? ['Received', 'Under Review', 'Diagnosis Complete', 'Awaiting Approval', 'Approved', 'Repair Started', 'Parts Ordered', 'Repair Completed', 'Ready For Pickup', 'Delivered']
    : ORDER_STATUS_FLOW;

  const currentIdx = flow.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-center gap-3">
        <AlertCircle size={20} className="text-red-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-red-800">Order Cancelled</p>
          <p className="text-xs text-red-600">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {flow.map((status, idx) => {
        const isCompleted = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        return (
          <div key={status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                isCompleted
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle size={14} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                )}
              </div>
              {idx < flow.length - 1 && (
                <div className={`w-0.5 h-6 ${isCompleted && idx < currentIdx ? 'bg-primary-400' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className={`pb-4 ${isCurrent ? 'font-bold' : ''}`}>
              <span className={`text-sm ${isCompleted ? 'text-primary-900' : 'text-gray-400'}`}>
                {status}
              </span>
              {isCurrent && (
                <span className="ml-2 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
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
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {order.isRepair ? 'Repair ID' : 'Order ID'}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">{order.orderId}</h1>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusStyle(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Order Status Timeline */}
          {!order.isRepair && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock size={14} /> Order Progress
              </h3>
              <OrderTimeline currentStatus={order.orderStatus} />
            </div>
          )}

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

              {/* Coupon Breakdown */}
              {order.couponCode && (
                <div className="p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-2">
                    <Tag size={12} /> Coupon Applied
                  </span>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-green-800 dark:text-green-300">
                      <span>Code: <strong className="font-mono">{order.couponCode}</strong></span>
                    </div>
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span>Discount</span>
                      <span className="font-bold">-₹{Number(order.couponDiscount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-800 dark:text-green-300 border-t border-green-200 dark:border-green-500/20 pt-1 mt-1">
                      <span>Subtotal</span>
                      <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-xl flex items-center justify-between ${order.couponCode ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'bg-indigo-50 dark:bg-indigo-500/10'}`}>
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
                    {order.shippingAddress.fullName && <><strong>{order.shippingAddress.fullName}</strong><br /></>}
                    {order.shippingAddress.phone && <>{order.shippingAddress.phone}<br /></>}
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
