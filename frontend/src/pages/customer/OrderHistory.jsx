import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Clock, MapPin, Eye, RefreshCw, IndianRupee, Search, Download, Tag, Check } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600/90" onClick={() => { setShowSuccess(false); window.history.replaceState({}, document.title); }}>
          <div className="text-center animate-bounce-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center animate-scale-check shadow-lg backdrop-blur-sm">
              <Check size={52} className="text-white" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">{successMessage}</h3>
            <p className="text-emerald-100 font-medium">Check your order status below</p>
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
        <div className="relative flex-1 min-w-[140px] sm:min-w-[200px] max-w-sm">
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
                    {order.products?.[0]?.image ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                        <img src={order.products[0].image} alt={order.products[0].name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; e.target.parentElement.className = 'w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0'; }} />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
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
                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancellation Requested' && (
                      <button
                        onClick={async () => {
                          const reason = window.prompt('Please enter the reason for cancellation:');
                          if (reason === null) return;
                          try {
                            const { cancelOrder } = await import('../../api/ordersApi');
                            await cancelOrder(order._id, reason);
                            alert('Cancellation request submitted. Awaiting admin approval.');
                            fetchOrders();
                          } catch (err) {
                            alert(err.response?.data?.message || 'Failed to request cancellation');
                          }
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    )}
                    {inv && (
                      <a href={`/api/invoices/${inv._id}/pdf`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        <Download size={14} /> Invoice
                      </a>
                    )}
                  </div>
                </div>
                {/* Order Products */}
                <div className="p-4 sm:p-5 space-y-3">
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
                  {/* Product List */}
                  {Array.isArray(order.products) && order.products.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.products.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg px-2.5 py-1.5 border border-slate-100 dark:border-slate-600">
                          {p.image ? (
                            <img src={p.image} alt={p.name || p.title || 'Product'}
                              className="w-7 h-7 rounded-md object-cover shrink-0"
                              onError={e => { e.target.style.display = 'none'; }} />
                          ) : null}
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">{p.name || p.title || `Item ${i + 1}`}</span>
                          <span className="text-xs text-slate-500">x{p.quantity || 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div className="flex items-start gap-2 mt-2 text-xs text-slate-400">
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
