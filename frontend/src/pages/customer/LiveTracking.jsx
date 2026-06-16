import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MapPin, Smartphone, Wrench, CheckCircle, Clock, Calendar, Package, ChevronRight, RefreshCw, Loader2, AlertCircle, ThumbsUp, DollarSign, Image as ImageIcon, X, ShoppingBag, IndianRupee, Truck } from 'lucide-react';
import { getMyRepairs, acceptRepairCost } from '../../api/repairsApi';
import { getMyOrders } from '../../api/ordersApi';
import { PageLoading } from '../../components/LoadingSpinner';

const repairTimeline = [
  'Under Review', 'Awaiting Approval', 'Approved',
  'Repair Started', 'Parts Ordered', 'Repair Completed',
  'Ready For Pickup', 'Delivered',
];

const orderTimeline = ['Processing', 'Shipped', 'Delivered'];

const repairStatusIcons = {
  'Under Review': Clock,
  'Awaiting Approval': AlertCircle,
  'Approved': CheckCircle,
  'Repair Started': Wrench,
  'Parts Ordered': Package,
  'Repair Completed': CheckCircle,
  'Ready For Pickup': MapPin,
  'Delivered': CheckCircle,
};

const orderStatusIcons = {
  'Processing': Clock,
  'Shipped': Truck,
  'Delivered': CheckCircle,
  'Cancelled': AlertCircle,
};

const getStatusColor = (status) => {
  const colors = {
    'Under Review': 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-200',
    'Awaiting Approval': 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200',
    'Approved': 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 border-indigo-200',
    'Repair Started': 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border-purple-200',
    'Parts Ordered': 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10 border-orange-200',
    'Repair Completed': 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-200',
    'Ready For Pickup': 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10 border-green-200',
    'Delivered': 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10 border-slate-200',
    'Cancelled': 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-200',
    'Processing': 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-200',
    'Shipped': 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border-purple-200',
  };
  return colors[status] || 'text-slate-600 bg-slate-50 border-slate-200';
};

const LiveTracking = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('repairs');
  const [repairs, setRepairs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [repairsData, ordersData] = await Promise.all([
        getMyRepairs(),
        getMyOrders(),
      ]);
      setRepairs(Array.isArray(repairsData) ? repairsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error('Failed to fetch tracking data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptCost = async (repairId) => {
    try {
      await acceptRepairCost(repairId);
      await fetchData(true);
    } catch (err) {
      console.error('Failed to accept cost:', err);
    }
  };

  if (loading) return <PageLoading />;

  const activeRepairs = repairs.filter(r => r.repairStatus !== 'Delivered' && r.repairStatus !== 'Cancelled');
  const completedRepairs = repairs.filter(r => r.repairStatus === 'Delivered' || r.repairStatus === 'Cancelled');
  const displayRepair = selectedRepair || activeRepairs[0];

  const activeOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const completedOrders = orders.filter(o => o.orderStatus === 'Delivered' || o.orderStatus === 'Cancelled');
  const displayOrder = selectedOrder || activeOrders[0];

  const getStepIndex = (status, timeline) => {
    const idx = timeline.indexOf(status);
    return idx >= 0 ? idx : -1;
  };

  const hasRepairs = repairs.length > 0;
  const hasOrders = orders.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Tracking</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time status of your orders & repairs</p>
        </div>
        <button type="button" onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Tabs */}
      {(hasRepairs || hasOrders) && (
        <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 w-fit">
          {hasRepairs && (
            <button type="button" onClick={() => setActiveTab('repairs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'repairs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}>
              <Wrench size={14} /> Repairs {activeRepairs.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
            </button>
          )}
          {hasOrders && (
            <button type="button" onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}>
              <ShoppingBag size={14} /> Orders {activeOrders.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />}
            </button>
          )}
        </div>
      )}

      {/* No Data */}
      {!hasRepairs && !hasOrders && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone size={28} className="text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Activity Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Start shopping or book a repair to start tracking.</p>
          <div className="flex gap-3 justify-center">
            <button type="button" onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">
              <ShoppingBag size={16} /> Shop Now
            </button>
            <button type="button" onClick={() => navigate('/dashboard/repairs/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm">
              <Wrench size={16} /> Book Repair
            </button>
          </div>
        </div>
      )}

      {/* Repairs Tab */}
      {activeTab === 'repairs' && hasRepairs && (
        <>
          {activeRepairs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {activeRepairs.map(r => (
                <button key={r._id} type="button" onClick={() => setSelectedRepair(r)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                    (selectedRepair?._id === r._id || (!selectedRepair && activeRepairs[0]?._id === r._id))
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${r.repairStatus === 'Under Review' ? 'bg-blue-500' : r.repairStatus === 'Awaiting Approval' ? 'bg-amber-500' : 'bg-green-500'}`} />
                  {r.repairId} - {r.device?.brand || 'Device'}
                </button>
              ))}
            </div>
          )}

          {displayRepair && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${getStatusColor(displayRepair.repairStatus)}`}>
                      {(() => {
                        const Icon = repairStatusIcons[displayRepair.repairStatus] || Smartphone;
                        return <Icon size={24} />;
                      })()}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white">
                        {displayRepair.device?.brand || 'Device'} {displayRepair.device?.model || ''}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{displayRepair.issueDescription}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(displayRepair.repairStatus)}`}>
                      {displayRepair.repairStatus}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{displayRepair.repairId}</p>
                  </div>
                </div>

                {displayRepair.device?.images?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <ImageIcon size={12} /> Device Images
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {displayRepair.device.images.map((img, idx) => (
                        <button key={idx} type="button" onClick={() => setLightboxImage(img)}
                          className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 hover:ring-2 hover:ring-indigo-400 transition-all">
                          <img src={img} alt={`Device ${idx + 1}`} className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {displayRepair.repairImages?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <ImageIcon size={12} /> Repair Photos
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {displayRepair.repairImages.map((img, idx) => (
                        <button key={idx} type="button" onClick={() => setLightboxImage(img)}
                          className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 hover:ring-2 hover:ring-indigo-400 transition-all">
                          <img src={img} alt={`Repair ${idx + 1}`} className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {displayRepair.repairStatus === 'Awaiting Approval' && displayRepair.estimatedCost && (
                  <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Cost Estimate Ready</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Estimated: <strong>₹{displayRepair.estimatedCost}</strong>
                          {displayRepair.finalCost ? ` | Final: ₹${displayRepair.finalCost}` : ''}
                        </p>
                      </div>
                      <button type="button" onClick={() => handleAcceptCost(displayRepair._id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all">
                        <ThumbsUp size={16} /> Approve & Start
                      </button>
                    </div>
                    {displayRepair.diagnosisDetails && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 border-t border-amber-200/50 pt-2">
                        Diagnosis: {displayRepair.diagnosisDetails}
                      </p>
                    )}
                  </div>
                )}

                {displayRepair.repairStatus !== 'Cancelled' && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span>{displayRepair.repairStatus === 'Delivered' ? '100%' : `${Math.round((getStepIndex(displayRepair.repairStatus, repairTimeline) / (repairTimeline.length - 1)) * 100)}%`}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${displayRepair.repairStatus === 'Delivered' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{
                        width: displayRepair.repairStatus === 'Delivered' ? '100%' : `${(getStepIndex(displayRepair.repairStatus, repairTimeline) / (repairTimeline.length - 1)) * 100}%`
                      }} />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />
                  <div className="space-y-0">
                    {repairTimeline.map((status, idx) => {
                      const stepIdx = getStepIndex(displayRepair.repairStatus, repairTimeline);
                      const isPast = idx < stepIdx;
                      const isCurrent = idx === stepIdx;
                      const isFuture = idx > stepIdx;
                      const isCancelled = displayRepair.repairStatus === 'Cancelled';
                      return (
                        <div key={status} className={`relative flex items-start gap-4 pb-6 last:pb-0 ${isFuture && !isCancelled ? 'opacity-40' : ''}`}>
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${
                            isPast ? 'bg-indigo-600 text-white' :
                            isCurrent ? 'bg-white dark:bg-slate-700 border-4 border-indigo-500 animate-pulse' :
                            'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600'}`}>
                            {isPast ? <CheckCircle size={14} className="text-white" /> : isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> : null}
                          </div>
                          <div className="flex-1 pt-1.5">
                            <p className={`text-sm font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isPast ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                              {status}
                              {isCurrent && status === 'Awaiting Approval' && displayRepair.estimatedCost && (
                                <span className="ml-2 text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">₹{displayRepair.estimatedCost}</span>
                              )}
                            </p>
                            {isCurrent && displayRepair.expectedDeliveryDate && status !== 'Delivered' && (
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                                <Calendar size={11} /> Est. delivery: {new Date(displayRepair.expectedDeliveryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {displayRepair.estimatedCost && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Cost Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Estimated Cost</span>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">₹{displayRepair.estimatedCost}</span>
                    </div>
                    {displayRepair.finalCost && (
                      <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">Final Cost</span>
                        <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">₹{displayRepair.finalCost}</span>
                      </div>
                    )}
                    {displayRepair.diagnosisDetails && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Diagnosis Notes</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{displayRepair.diagnosisDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {completedRepairs.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Past Repairs</h3>
                  <div className="space-y-2">
                    {completedRepairs.slice(0, 5).map(r => (
                      <div key={r._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.repairStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {r.repairStatus === 'Delivered' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.device?.brand || 'Device'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{r.repairId}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${getStatusColor(r.repairStatus)}`}>{r.repairStatus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!displayRepair && activeRepairs.length === 0 && completedRepairs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 border border-slate-200 dark:border-slate-700 text-center">
              <CheckCircle size={40} className="text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">All Repairs Completed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">You have no active repairs.</p>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && hasOrders && (
        <>
          {activeOrders.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {activeOrders.map(o => (
                <button key={o._id} type="button" onClick={() => setSelectedOrder(o)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                    (selectedOrder?._id === o._id || (!selectedOrder && activeOrders[0]?._id === o._id))
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${o.orderStatus === 'Processing' ? 'bg-blue-500' : o.orderStatus === 'Shipped' ? 'bg-purple-500' : 'bg-green-500'}`} />
                  {o.orderId} - ₹{o.totalAmount}
                </button>
              ))}
            </div>
          )}

          {displayOrder && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${getStatusColor(displayOrder.orderStatus || 'Processing')}`}>
                      {(() => {
                        const Icon = orderStatusIcons[displayOrder.orderStatus] || ShoppingBag;
                        return <Icon size={24} />;
                      })()}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white">Order #{displayOrder.orderId}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{displayOrder.products?.length || 0} item(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(displayOrder.orderStatus || 'Processing')}`}>
                      {displayOrder.orderStatus || 'Processing'}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{displayOrder.orderId}</p>
                  </div>
                </div>

                {/* Products */}
                {displayOrder.products?.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Order Items</p>
                    {displayOrder.products.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-600">
                          {p.image ? (
                            <img src={p.image} alt={p.name || p.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                          ) : <ShoppingBag size={16} className="text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name || p.title}</p>
                          <p className="text-xs text-slate-500">Qty: {p.quantity || 1}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">₹{p.price || 0}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progress */}
                {displayOrder.orderStatus !== 'Cancelled' && (
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Progress</span>
                      <span>{displayOrder.orderStatus === 'Delivered' ? '100%' : `${Math.round((getStepIndex(displayOrder.orderStatus || 'Processing', orderTimeline) / (orderTimeline.length - 1)) * 100)}%`}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${displayOrder.orderStatus === 'Delivered' ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{
                        width: displayOrder.orderStatus === 'Delivered' ? '100%' : `${(getStepIndex(displayOrder.orderStatus || 'Processing', orderTimeline) / (orderTimeline.length - 1)) * 100}%`
                      }} />
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-700" />
                  <div className="space-y-0">
                    {orderTimeline.map((status, idx) => {
                      const stepIdx = getStepIndex(displayOrder.orderStatus || 'Processing', orderTimeline);
                      const isPast = idx < stepIdx;
                      const isCurrent = idx === stepIdx;
                      const isFuture = idx > stepIdx;
                      return (
                        <div key={status} className={`relative flex items-start gap-4 pb-6 last:pb-0 ${isFuture ? 'opacity-40' : ''}`}>
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 ${
                            isPast ? 'bg-indigo-600 text-white' :
                            isCurrent ? 'bg-white dark:bg-slate-700 border-4 border-indigo-500 animate-pulse' :
                            'bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600'}`}>
                            {isPast ? <CheckCircle size={14} className="text-white" /> : isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> : null}
                          </div>
                          <div className="flex-1 pt-1.5">
                            <p className={`text-sm font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isPast ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                              {status}
                            </p>
                            {isCurrent && displayOrder.orderStatus === 'Shipped' && (
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                                <Truck size={11} /> In transit to you
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Payment & Shipping Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Payment Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Amount</span>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">₹{Number(displayOrder.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Payment Method</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{displayOrder.paymentInfo?.method || 'COD'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${displayOrder.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {displayOrder.paymentStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                {displayOrder.shippingAddress && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Shipping To</h3>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{displayOrder.shippingAddress.fullName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{displayOrder.shippingAddress.phone}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{displayOrder.shippingAddress.address}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.state || ''} - {displayOrder.shippingAddress.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Past Orders */}
              {completedOrders.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Past Orders</h3>
                  <div className="space-y-2">
                    {completedOrders.slice(0, 5).map(o => (
                      <div key={o._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${o.orderStatus === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {o.orderStatus === 'Delivered' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Order {o.orderId}</p>
                            <p className="text-[10px] text-slate-400">{o.products?.length || 0} item(s) - ₹{Number(o.totalAmount || 0).toFixed(2)}</p>
                          </div>
                        </div>
                        <Link to={`/order/${o.orderId}`} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                          View <ChevronRight size={12} className="inline" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}>
          <button type="button" onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
            <X size={20} />
          </button>
          <img src={lightboxImage} alt="Enlarged view"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default LiveTracking;