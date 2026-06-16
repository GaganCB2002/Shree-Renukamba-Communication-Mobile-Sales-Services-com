import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Clock, MapPin, Eye, ChevronRight, RefreshCw, Loader2, IndianRupee, AlertCircle, CheckCircle, Search, Download, Tag, Check } from 'lucide-react';
import { getMyOrders } from '../../api/ordersApi';
import { getMyInvoices } from '../../api/invoicesApi';
import { PageLoading } from '../../components/LoadingSpinner';

const orderStatusStyles = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400',
  'Processing': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
  'Shipped': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400',
  'Out for Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400',
};

const getOrderStatusColor = (status) => {
  return orderStatusStyles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
};

const OrderHistory = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.orderSuccess) {
      setSuccessMessage(location.state.message || 'Your order was placed successfully!');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        window.history.replaceState({}, document.title);
      }, 4000);
    }
  }, [location.state]);

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ordersData, invoicesData] = await Promise.all([
        getMyOrders(),
        getMyInvoices().catch(() => []),
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const invoiceByOrderId = {};
  invoices.forEach(inv => {
    if (inv.orderId) invoiceByOrderId[inv.orderId] = inv;
  });

  const filteredOrders = orders.filter(o => {
    if (searchQuery && !o.orderId?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter && o.orderStatus !== statusFilter) return false;
    return true;
  });

  const statusCounts = {};
  orders.forEach(o => { statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1; });

  if (loading) return <PageLoading />;

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowSuccess(false); window.history.replaceState({}, document.title); }}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm mx-4 text-center animate-bounce-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center animate-scale-check">
              <Check size={44} className="text-green-600" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">{successMessage}</h3>
            <p className="text-sm text-secondary-500">Check your order status below</p>
          </div>
          <style>{`
            @keyframes bounce-in {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.1); }
              70% { transform: scale(0.9); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes scale-check {
              0% { transform: scale(0) rotate(-45deg); opacity: 0; }
              60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
              100% { transform: scale(1) rotate(0deg); opacity: 1; }
            }
            .animate-bounce-in { animation: bounce-in 0.8s ease-out forwards; }
            .animate-scale-check { animation: scale-check 0.6s ease-out 0.3s both; }
          `}</style>
        </div>
      )}
      <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View all your past and current orders</p>
        </div>
        <button type="button" onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              !statusFilter ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All ({orders.length})
          </button>
          {['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => {
            if (!statusCounts[s]) return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  statusFilter === s ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s} ({statusCounts[s]})
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center">
          <Package size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {orders.length === 0 ? 'No Orders Yet' : 'No Orders Found'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {orders.length === 0 ? 'Start shopping to see your orders here.' : 'Try a different search term or filter.'}
          </p>
          {orders.length === 0 && (
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">
              <Package size={16} /> Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const inv = invoiceByOrderId[order.orderId];
            return (
              <div key={order._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Order</p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-sm">{order.orderId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getOrderStatusColor(order.orderStatus)}`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                    <Link
                      to={`/order/${order.orderId}`}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <Eye size={14} /> View
                    </Link>
                    {inv && (
                      <a href={`/api/invoices/${inv._id}/pdf`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        <Download size={14} /> Invoice
                      </a>
                    )}
                  </div>
                </div>
                {/* Order Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <IndianRupee size={14} />
                      <span className="font-bold text-slate-900 dark:text-white">₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    {order.couponCode && (
                      <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                        <Tag size={11} /> Coupon {order.couponCode} applied
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock size={14} />
                      <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Package size={14} />
                      <span>{order.products?.length || 0} item(s)</span>
                    </div>
                  </div>
                  {order.shippingAddress && (
                    <div className="flex items-start gap-2 mt-3 text-xs text-slate-400">
                      <MapPin size={12} className="mt-0.5 shrink-0" />
                      <span>
                        {order.shippingAddress.address && <>{order.shippingAddress.address}, </>}
                        {order.shippingAddress.city && <>{order.shippingAddress.city}, </>}
                        {order.shippingAddress.state && <>{order.shippingAddress.state} - </>}
                        {order.shippingAddress.pincode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
};

export default OrderHistory;
