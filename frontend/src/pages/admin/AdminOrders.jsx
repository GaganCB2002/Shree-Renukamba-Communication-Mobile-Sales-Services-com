import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Search, Wrench, Eye, Calendar, IndianRupee, User, Download, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, EyeIcon, X } from 'lucide-react';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { getAllRepairs } from '../../api/repairsApi';
import { getAllOrders, updateOrderStatus, updatePaymentStatus, approveCancelOrder, rejectCancelOrder } from '../../api/ordersApi';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import AdminOrderDetailModal from '../../components/AdminOrderDetailModal';

const ORDER_STATUS_FLOW = [
  'Pending',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Cancellation Requested',
];

const ORDER_STATUS_COLORS = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
  'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
  'Out for Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Delivered': 'bg-green-50 text-green-700 border-green-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200',
  'Cancellation Requested': 'bg-rose-50 text-rose-700 border-rose-200',
};

const AdminOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('repairs');
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [repairsData, ordersData] = await Promise.all([
        getAllRepairs(),
        getAllOrders(),
      ]);
      setRepairs(repairsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`);
      setStatusDropdown(null);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaymentUpdate = async (orderId, paymentStatus) => {
    try {
      await updatePaymentStatus(orderId, paymentStatus);
      showToast(`Payment status updated to ${paymentStatus}`);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const filteredRepairs = repairs.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.repairId?.toLowerCase().includes(q) ||
      r.device?.brand?.toLowerCase().includes(q) ||
      r.customer?.userId?.fullName?.toLowerCase().includes(q);
  });

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.orderId?.toLowerCase().includes(q) ||
      o.customer?.userId?.fullName?.toLowerCase().includes(q);
  });

  const pendingOrders = orders.filter(o => o.orderStatus === 'Pending');
  const processingOrders = orders.filter(o => o.orderStatus === 'Processing');
  const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered');

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} />;

  const renderStatusCell = (order) => {
    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.orderStatus);
    const isOpen = statusDropdown === order._id;
    const isUpdating = updatingId === order._id;

    return (
      <div className="relative">
        <button
          onClick={() => setStatusDropdown(isOpen ? null : order._id)}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-all ${ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-50 text-gray-600 border-gray-200'} hover:opacity-80 cursor-pointer`}
        >
          {isUpdating ? (
            <span className="animate-pulse">Updating...</span>
          ) : (
            <>
              {order.orderStatus || 'Pending'}
              <ChevronDown size={12} />
            </>
          )}
        </button>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdown(null)} />
            <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-20 py-1 min-w-[170px] whitespace-nowrap">
              {ORDER_STATUS_FLOW.map((status, idx) => {
                const isDisabled = idx < currentIndex && status !== 'Cancelled';
                const isCurrent = status === order.orderStatus;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      if (!isDisabled && !isCurrent) {
                        handleStatusUpdate(order._id, status);
                      }
                    }}
                    disabled={isDisabled || isCurrent}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                      isCurrent
                        ? 'font-bold text-primary-600 bg-primary-50'
                        : isDisabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-secondary-700 hover:bg-secondary-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${status === 'Cancelled' ? 'bg-red-400' : status === 'Delivered' ? 'bg-green-400' : 'bg-blue-400'}`} />
                    {status}
                    {isCurrent && ' (current)'}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPaymentCell = (order) => {
    const isPending = order.paymentStatus === 'Pending';
    return (
      <button
        onClick={() => handlePaymentUpdate(order._id, isPending ? 'Paid' : 'Pending')}
        className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
          order.paymentStatus === 'Paid'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
        }`}
        title="Click to toggle payment status"
      >
        {order.paymentStatus || 'Pending'}
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-950">Orders</h1>
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
            {activeTab === 'repairs' ? repairs.length : orders.length} Total
          </span>
          {pendingOrders.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
              {pendingOrders.length} Pending Approval
            </span>
          )}
        </div>
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
      </div>

      {/* Status summary cards */}
      {activeTab === 'ecommerce' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-600 font-semibold">Pending</p>
            <p className="text-2xl font-bold text-amber-800">{pendingOrders.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-semibold">Processing</p>
            <p className="text-2xl font-bold text-blue-800">{processingOrders.length}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-xs text-green-600 font-semibold">Delivered</p>
            <p className="text-2xl font-bold text-green-800">{deliveredOrders.length}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-xs text-purple-600 font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-purple-800">
              ₹{orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('repairs')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'repairs' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-gray-50'
          }`}
        >
          <Wrench size={14} className="inline mr-1.5" /> Repair Orders
        </button>
        <button
          onClick={() => setActiveTab('ecommerce')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'ecommerce' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:bg-gray-50'
          }`}
        >
          <ShoppingBag size={14} className="inline mr-1.5" /> E-Commerce Orders
          {pendingOrders.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'repairs' ? (
        filteredRepairs.length === 0 ? (
          <EmptyState title="No repair orders" description="No repair orders match your search." icon={Wrench} />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Device</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Delivery Date</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRepairs.map((repair) => (
                  <tr key={repair._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-primary-600 text-sm">{repair.repairId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-800 font-medium">{repair.customer?.userId?.fullName || 'Customer'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600">{repair.device?.brand || ''} {repair.device?.model || ''}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${ORDER_STATUS_COLORS[repair.repairStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {repair.repairStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {repair.expectedDeliveryDate ? (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} /> {new Date(repair.expectedDeliveryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to="/admin/repairs" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        filteredOrders.length === 0 ? (
          <EmptyState
            title="No E-Commerce Orders Yet"
            description={search ? 'No orders match your search.' : 'Customer orders will appear here once the checkout is complete.'}
            icon={ShoppingBag}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Order ID</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Items</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-xs text-secondary-500 font-bold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className={`hover:bg-gray-50 transition-colors ${order.orderStatus === 'Pending' ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary-600 text-sm">{order.orderId}</span>
                        {order.orderStatus === 'Pending' && (
                          <AlertTriangle size={14} className="text-amber-500" title="Pending Approval" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-800 font-medium">{order.customer?.userId?.fullName || 'Customer'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.products?.length || 0} item(s)
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-sm text-gray-900 flex items-center gap-1">
                          <IndianRupee size={13} />{Number(order.totalAmount || 0).toFixed(2)}
                        </span>
                        {order.couponCode && (
                          <span className="text-[10px] text-green-600 font-medium block">
                            Coupon: {order.couponCode} (-₹{Number(order.couponDiscount || 0).toFixed(2)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {renderStatusCell(order)}
                    </td>
                    <td className="px-5 py-4">
                      {renderPaymentCell(order)}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {order.cancelRequested ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={async () => {
                              try {
                                await approveCancelOrder(order._id);
                                showToast('Cancellation approved');
                                fetchOrders();
                              } catch (err) {
                                showToast(err.response?.data?.message || 'Failed to approve');
                              }
                            }}
                            disabled={updatingId === order._id}
                            className="p-1.5 border border-green-200 hover:border-green-300 text-green-500 hover:text-green-600 rounded-lg transition-colors cursor-pointer"
                            title="Approve Cancellation"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              const reason = window.prompt('Enter reason for rejection (optional):');
                              try {
                                await rejectCancelOrder(order._id, reason || '');
                                showToast('Cancellation rejected');
                                fetchOrders();
                              } catch (err) {
                                showToast(err.response?.data?.message || 'Failed to reject');
                              }
                            }}
                            disabled={updatingId === order._id}
                            className="p-1.5 border border-red-200 hover:border-red-300 text-red-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Reject Cancellation"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setViewOrder(order)} className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium cursor-pointer">
                          <EyeIcon size={14} /> View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {/* Admin Order Detail Modal */}
      {viewOrder && (
        <AdminOrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onStatusUpdate={(id, newStatus) => {
            setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: newStatus } : o));
          }}
        />
      )}
    </div>
  );
};

export default AdminOrders;
