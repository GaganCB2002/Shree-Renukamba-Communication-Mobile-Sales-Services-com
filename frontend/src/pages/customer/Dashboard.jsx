import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Wrench, ShoppingBag, Star, ArrowRight, Calendar,
  Clock, Eye, CheckCircle, Smartphone, TrendingUp,
  FileText, AlertCircle, ChevronRight, Package, Heart, Sparkles, Search, Home, Headphones,
  IndianRupee
} from 'lucide-react';
import { getMyRepairs, acceptRepairCost } from '../../api/repairsApi';
import { getMyInvoices } from '../../api/invoicesApi';
import { getMyOrders } from '../../api/ordersApi';
import { getProducts } from '../../api/productsApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const statusTimeline = [
  'Under Review', 'Awaiting Approval', 'Approved', 'Repair Started',
  'Parts Ordered', 'Repair Completed', 'Ready For Pickup', 'Delivered',
];

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [repairs, setRepairs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [repairsData, invoicesData, ordersData, productsData] = await Promise.all([
        getMyRepairs(),
        getMyInvoices(),
        getMyOrders(),
        getProducts(),
      ]);
      setRepairs(Array.isArray(repairsData) ? repairsData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCost = async (repairId) => {
    try {
      await acceptRepairCost(repairId);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to accept cost:', err);
    }
  };

  const discountedPrice = (p) => {
    const price = Number(p.price) || 0;
    const disc = Number(p.discount) || 0;
    return disc > 0 ? (price * (1 - disc / 100)).toFixed(2) : price;
  };

  const productMap = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p._id || p.id] = p; });
    return map;
  }, [products]);

  const liveWishlistItems = useMemo(() => {
    return wishlistItems.map(item => {
      const id = item._id || item.id;
      return productMap[id] || item;
    });
  }, [wishlistItems, productMap]);

  const wishlistTotal = useMemo(() => {
    return liveWishlistItems.reduce((sum, item) => {
      const p = Number(item.price) || 0;
      const d = Number(item.discount) || 0;
      return sum + (d > 0 ? p * (1 - d / 100) : p);
    }, 0);
  }, [liveWishlistItems]);

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  const activeRepairs = repairs.filter(r => r.repairStatus !== 'Delivered' && r.repairStatus !== 'Cancelled');
  const currentRepair = activeRepairs[0];
  const currentStepIndex = currentRepair ? statusTimeline.indexOf(currentRepair.repairStatus) : -1;

  const getStatusColor = (status) => {
    const colors = {
      'Under Review': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
      'Awaiting Approval': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
      'Approved': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
      'Repair Started': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
      'Parts Ordered': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
      'Repair Completed': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
      'Ready For Pickup': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
      'Delivered': 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    };
    return colors[status] || 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
  };

  const totalSpent = repairs
    .filter(r => r.repairStatus === 'Delivered')
    .reduce((sum, r) => sum + (r.finalCost || r.estimatedCost || 0), 0);

  const completedCount = repairs.filter(r => r.repairStatus === 'Delivered').length;

  const orderTotalSpent = orders
    .filter(o => o.orderStatus === 'Delivered')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const activeOrderCount = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {userInfo?.fullName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-indigo-100 text-sm mt-1.5 max-w-md">
              Track your repairs, view invoices, and manage your devices all in one place.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/dashboard/repairs/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold transition-all"
            >
              <Wrench size={16} />
              <span>Book Repair</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-white/20">
          <div className="flex items-center gap-2">
            <Smartphone size={16} className="text-indigo-200" />
            <span className="text-sm text-indigo-100">{activeRepairs.length} active repair{activeRepairs.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-indigo-200" />
            <span className="text-sm text-indigo-100">{completedCount} completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-indigo-200" />
            <span className="text-sm text-indigo-100">{repairs.length * 100} loyalty points</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Repairs</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Wrench size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeRepairs.length}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Device(s) in service center</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Orders</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
              <ShoppingBag size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{activeOrderCount}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending & shipped orders</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <Package size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{orders.length}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All time purchases</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Ongoing Repair */}
          {currentRepair ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ongoing Repair</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track your repair progress</p>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                  {currentRepair.repairId}
                </span>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-xl shadow-sm">
                  📱
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {currentRepair.device?.brand || 'Device'} {currentRepair.device?.model || ''}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{currentRepair.issueDescription}</p>
                  {currentRepair.expectedDeliveryDate && (
                    <div className="flex items-center gap-1.5 mt-1 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                      <Calendar size={12} />
                      Expected by: {new Date(currentRepair.expectedDeliveryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(currentRepair.repairStatus)}`}>
                  {currentRepair.repairStatus}
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />
                <div className="space-y-0">
                  {statusTimeline.map((status, idx) => {
                    const isPast = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const isFuture = idx > currentStepIndex;
                    return (
                      <div key={status} className={`relative flex items-start gap-4 pb-6 last:pb-0 ${isFuture ? 'opacity-40' : ''}`}>
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                          ${isPast ? 'bg-indigo-600 text-white' :
                            isCurrent ? 'bg-white dark:bg-slate-700 border-4 border-indigo-500' :
                            'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600'}`}
                        >
                          {isPast ? (
                            <CheckCircle size={14} className="text-white" />
                          ) : isCurrent ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          ) : null}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className={`text-sm font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isPast ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                            {status}
                          </p>
                          {isCurrent && currentRepair.expectedDeliveryDate && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                              Est. delivery: {new Date(currentRepair.expectedDeliveryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approve Cost Button */}
              {currentRepair.repairStatus === 'Awaiting Approval' && currentRepair.estimatedCost && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Cost Estimate Ready</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Estimated: <strong>₹{currentRepair.estimatedCost}</strong>
                        {currentRepair.finalCost ? ` | Final: ₹${currentRepair.finalCost}` : ''}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleAcceptCost(currentRepair._id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
                      <CheckCircle size={16} />
                      Approve & Start
                    </button>
                  </div>
                  {currentRepair.diagnosisDetails && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 border-t border-amber-200/50 pt-2">
                      Diagnosis: {currentRepair.diagnosisDetails}
                    </p>
                  )}
                </div>
              )}

              {/* Cost Display */}
              {currentRepair.estimatedCost && currentRepair.repairStatus !== 'Awaiting Approval' && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Repair Cost</span>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">₹{currentRepair.finalCost || currentRepair.estimatedCost}</p>
                      {currentRepair.finalCost && <p className="text-[10px] text-slate-400">Estimated: ₹{currentRepair.estimatedCost}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Repairs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                You don't have any devices being repaired right now. Schedule a repair to get started.
              </p>
              <Link
                to="/dashboard/repairs/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 text-sm"
              >
                <Wrench size={16} />
                Book a Repair
              </Link>
            </div>
          )}

          {/* Recent Activity */}
          {repairs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your latest repair tickets</p>
                </div>
              </div>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="pb-3 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ticket</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Device</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Cost</th>
                      <th className="pb-3 pr-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {repairs.slice(0, 5).map((repair) => {
                      const inv = invoices.find(i => i.repairOrder?.repairId === repair.repairId || i.repairOrder === repair._id);
                      return (
                        <tr key={repair._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400 text-xs font-medium">
                            {new Date(repair.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{repair.repairId}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white text-sm">
                            {repair.device?.brand || 'Device'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(repair.repairStatus)}`}>
                              {repair.repairStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                            ₹{repair.finalCost || repair.estimatedCost || '-'}
                          </td>
                          <td className="py-3.5 pr-6 text-right">
                            {inv ? (
                              <Link
                                to={`/invoices/${inv._id}`}
                                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                              >
                                View Bill
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Invoices */}
          {invoices.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invoices & Bills</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your payment history</p>
                </div>
              </div>
              <div className="space-y-3">
                {invoices.slice(0, 5).map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Invoice {inv.invoiceId}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                          ₹{inv.totalAmount?.toLocaleString('en-IN')}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <Link
                        to={`/invoices/${inv._id}`}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {orders.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Orders</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your latest purchases</p>
                </div>
                <Link to="/dashboard/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="pb-3 px-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Order</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Items</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="pb-3 px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Total</th>
                      <th className="pb-3 pr-6 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-6 text-slate-600 dark:text-slate-400 text-xs font-medium">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{o.orderId}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white text-sm">
                          {o.products?.length || 0} item(s)
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                            o.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            o.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400' :
                            o.orderStatus === 'Shipped' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400' :
                            'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                          }`}>
                            {o.orderStatus || 'Processing'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ₹{Number(o.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 pr-6 text-right">
                          <Link to={`/order/${o.orderId}`} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-2.5">
              <Link
                to="/"
                className="flex items-center gap-3 p-3.5 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Home size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Visit Homepage</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Browse our full store</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/shop"
                className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Buy New Products</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Smartphones & accessories</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/dashboard/orders"
                className="flex items-center gap-3 p-3.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">My Orders</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">View order history & status</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/accessories"
                className="flex items-center gap-3 p-3.5 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Headphones size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Buy Accessories</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Earphones, cases & more</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/dashboard/repairs/new"
                className="flex items-center gap-3 p-3.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wrench size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Book New Repair</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Schedule a device repair</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/dashboard/live-tracking"
                className="flex items-center gap-3 p-3.5 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Eye size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Live Tracking</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Real-time order & repair updates</p>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* My Wishlist — live prices from DB */}
          {liveWishlistItems.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-red-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">My Wishlist</h3>
                </div>
                <Link to="/wishlist" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All ({liveWishlistItems.length}) <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-2.5">
                {liveWishlistItems.slice(0, 4).map(item => {
                  const id = item._id || item.id;
                  const isStale = !productMap[id];
                  return (
                    <Link key={id} to={`/products/${id}`}
                      className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600">
                        {item.images && item.images[0] ? (
                          <img src={item.images[0]} alt={item.title || item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <Package size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title || item.name}</p>
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          ₹{discountedPrice(item)}
                          {isStale && <span className="text-[9px] text-amber-500 font-medium ml-1">(stale)</span>}
                        </p>
                      </div>
                      <Heart size={12} className="text-red-400 fill-red-400 shrink-0" />
                    </Link>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Estimated Total</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">₹{wishlistTotal.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Device Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Device Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Smartphone size={16} className="text-indigo-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Total Devices</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{repairs.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Repaired</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Star size={16} className="text-amber-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Loyalty Points</span>
                </div>
                <span className="font-bold text-amber-600 dark:text-amber-400">{repairs.length * 100}</span>
              </div>
            </div>
            <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors">
              <Star size={14} />
              <span>Redeem Points</span>
            </button>
          </div>

          {/* Featured Products */}
          {products.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shop Products</h3>
                <Link to="/shop" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {products.slice(0, 4).map(product => (
                  <Link key={product._id} to={`/products/${product._id}`}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <Package size={18} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{product.title}</p>
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">₹{discountedPrice(product)}</p>
                    </div>
                    <Eye size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Promo */}
          <div className="rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/20 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-200 dark:bg-indigo-500/20 rounded-full blur-3xl opacity-50" />
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md inline-block mb-3">Special Offer</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upgrade your protection</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">Get 20% off tempered glass with any repair service.</p>
            <a href="#" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1">
              Learn more <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
