import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, Clock, MapPin, Eye, ChevronRight, RefreshCw, Loader2, IndianRupee, AlertCircle, CheckCircle, Search, Download } from 'lucide-react';
import { getMyOrders } from '../../api/ordersApi';
import { getMyInvoices } from '../../api/invoicesApi';
import { PageLoading } from '../../components/LoadingSpinner';

const orderStatusStyles = {
  'Processing': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
  'Shipped': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400',
  'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400',
};

const getOrderStatusColor = (status) => {
  return orderStatusStyles[status] || 'bg-slate-50 text-slate-700 border-slate-200';
};

const OrderHistory = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredOrders = orders.filter(o =>
    !searchQuery || o.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <PageLoading />;

  return (
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center">
          <Package size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {orders.length === 0 ? 'No Orders Yet' : 'No Orders Found'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {orders.length === 0 ? 'Start shopping to see your orders here.' : 'Try a different search term.'}
          </p>
          {orders.length === 0 && (
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">
              <Package size={16} /> Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
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
                    {order.orderStatus || 'Processing'}
                  </span>
                  <Link
                    to={`/order/${order.orderId}`}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    <Eye size={14} /> View
                  </Link>
                  {invoiceByOrderId[order.orderId] && (
                    <a
                      href={`/api/invoices/${invoiceByOrderId[order.orderId]._id}/pdf`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      <Download size={12} /> Invoice
                    </a>
                  )}
                </div>
              </div>

              {/* Order Body */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={14} />
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Package size={14} />
                    <span>{order.products?.length || 0} item(s)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <IndianRupee size={14} />
                    <span>₹{Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Products Preview */}
                {Array.isArray(order.products) && order.products.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {order.products.slice(0, 3).map((p, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-xs text-slate-700 dark:text-slate-300">
                        {p.image && (
                          <img src={p.image} alt="" className="w-5 h-5 rounded object-cover" onError={e => { e.target.style.display = 'none'; }} />
                        )}
                        <span>{p.name || p.title} x{p.quantity || 1}</span>
                      </div>
                    ))}
                    {order.products.length > 3 && (
                      <span className="text-xs text-slate-400 self-center">+{order.products.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <span>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state || order.shippingAddress.pincode}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;