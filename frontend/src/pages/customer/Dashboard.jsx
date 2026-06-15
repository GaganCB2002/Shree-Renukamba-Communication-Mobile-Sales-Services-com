import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell, Wrench, ShoppingBag, Star, ArrowRight, RefreshCw, Calendar, Clock, Eye, CheckCircle, PauseCircle } from 'lucide-react';
import { getMyRepairs } from '../../api/repairsApi';
import { getMyInvoices } from '../../api/invoicesApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const statusTimeline = [
  'Received', 'Diagnosis Complete', 'Waiting For Approval', 'Repair Started',
  'Parts Ordered', 'Repair Completed', 'Ready For Pickup', 'Delivered',
];

const statusIcons = {
  'Received': '📋',
  'Diagnosis Complete': '🔍',
  'Waiting For Approval': '⏳',
  'Repair Started': '🔧',
  'Parts Ordered': '📦',
  'Repair Completed': '✅',
  'Ready For Pickup': '📢',
  'Delivered': '🎉',
  'Cancelled': '❌',
};

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [repairs, setRepairs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [repairsData, invoicesData] = await Promise.all([
        getMyRepairs(),
        getMyInvoices()
      ]);
      setRepairs(repairsData);
      setInvoices(invoicesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  const activeRepairs = repairs.filter(r => r.repairStatus !== 'Delivered' && r.repairStatus !== 'Cancelled');
  const currentRepair = activeRepairs[0];
  const currentStepIndex = currentRepair ? statusTimeline.indexOf(currentRepair.repairStatus) : -1;

  const getStatusColor = (status) => {
    const colors = {
      'Received': 'bg-blue-50 text-blue-700 border-blue-200',
      'Diagnosis Complete': 'bg-purple-50 text-purple-700 border-purple-200',
      'Waiting For Approval': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Repair Started': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Parts Ordered': 'bg-orange-50 text-orange-700 border-orange-200',
      'Repair Completed': 'bg-green-50 text-green-700 border-green-200',
      'Ready For Pickup': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Delivered': 'bg-gray-50 text-gray-700 border-gray-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-secondary-50 text-secondary-700 border-secondary-200';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-950">Welcome back, {userInfo?.fullName?.split(' ')[0] || 'User'}</h1>
          <p className="text-secondary-600 text-sm mt-1">Here's what's happening with your devices.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 hover:bg-secondary-200 transition-colors">
            <Bell size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
            {userInfo?.fullName?.charAt(0) || 'U'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-primary-950">Active Repairs</h3>
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center"><Wrench size={16} /></div>
          </div>
          <div className="text-5xl font-bold text-primary-600 mb-2">{activeRepairs.length}</div>
          <div className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Device(s) in service center</div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-primary-950">Total Repairs</h3>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"><ShoppingBag size={16} /></div>
          </div>
          <div className="text-5xl font-bold text-primary-950 mb-2">{repairs.length}</div>
          <div className="text-xs font-bold text-secondary-500 uppercase tracking-wider">All time</div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-primary-950">Completed</h3>
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><CheckCircle size={16} /></div>
          </div>
          <div className="text-5xl font-bold text-green-600 mb-2">{repairs.filter(r => r.repairStatus === 'Delivered').length}</div>
          <div className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Delivered devices</div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-border relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-primary-950">Loyalty Points</h3>
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center"><Star size={16} /></div>
          </div>
          <div className="text-5xl font-bold text-green-600 mb-2">{repairs.length * 100}</div>
          <div className="flex justify-between items-end">
            <div className="text-xs font-bold text-secondary-500 uppercase tracking-wider">Available to redeem</div>
            <button className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">Redeem <ArrowRight size={12} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {currentRepair ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary-950">Ongoing Repair</h2>
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{currentRepair.repairId}</span>
              </div>

              <div className="bg-secondary-50 rounded-2xl p-4 flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-secondary-200 rounded-xl flex items-center justify-center text-2xl">
                  {statusIcons[currentRepair.repairStatus] || '📱'}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-primary-950 text-lg">{currentRepair.device?.brand || 'Device'} {currentRepair.device?.model || ''}</h3>
                  <p className="text-sm text-secondary-600">{currentRepair.issueDescription}</p>
                  {currentRepair.onHold && (
                    <div className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs font-bold">
                      <PauseCircle size={14} />
                      On Hold - {currentRepair.holdReason || 'Waiting for parts'}
                    </div>
                  )}
                  {currentRepair.expectedDeliveryDate && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-indigo-600 text-xs font-bold">
                      <Calendar size={14} />
                      Expected Delivery: {new Date(currentRepair.expectedDeliveryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-secondary-200 before:to-transparent">
                {statusTimeline.map((status, idx) => {
                  const isPast = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  const isFuture = idx > currentStepIndex;
                  return (
                    <div key={status} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isFuture ? 'opacity-50' : ''}`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow
                        ${isPast ? 'bg-primary-600 border-2 border-primary-600 text-white' :
                          isCurrent ? 'border-4 border-primary-100 bg-white' :
                          'border-2 border-border bg-white'}`}>
                        {isPast ? '✓' : isCurrent ? <div className="w-2.5 h-2.5 rounded-full bg-primary-600"></div> : ''}
                      </div>
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl ${isCurrent ? 'bg-primary-50 border border-primary-100' : ''}`}>
                        <div className={`font-bold mb-1 ${isCurrent ? 'text-primary-600' : isPast ? 'text-primary-950' : 'text-secondary-500'}`}>{status}</div>
                        {isCurrent && currentRepair.expectedDeliveryDate && (
                          <div className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                            <Calendar size={12} /> Est. delivery: {new Date(currentRepair.expectedDeliveryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench size={32} className="text-secondary-400" />
              </div>
              <h3 className="text-lg font-bold text-primary-950 mb-2">No Active Repairs</h3>
              <p className="text-secondary-500 text-sm mb-6">You don't have any devices being repaired right now.</p>
              <Link to="/dashboard/repairs/new" className="btn-primary inline-flex items-center gap-2">
                <Wrench size={18} /> Book a Repair
              </Link>
            </div>
          )}

          {repairs.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
              <h2 className="text-xl font-bold text-primary-950 mb-6">Recent Activity</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-4 font-bold text-secondary-500 uppercase tracking-wider text-xs">Date</th>
                      <th className="pb-4 font-bold text-secondary-500 uppercase tracking-wider text-xs">Ticket</th>
                      <th className="pb-4 font-bold text-secondary-500 uppercase tracking-wider text-xs">Device</th>
                      <th className="pb-4 font-bold text-secondary-500 uppercase tracking-wider text-xs">Status</th>
                      <th className="pb-4 font-bold text-secondary-500 uppercase tracking-wider text-xs">Delivery</th>
                      <th className="pb-4 font-bold text-secondary-500 uppercase tracking-wider text-xs text-right">Cost</th>
                      <th className="pb-4 font-bold text-secondary-500 uppercase tracking-wider text-xs text-right">Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {repairs.slice(0, 5).map((repair) => (
                      <tr key={repair._id}>
                        <td className="py-4 text-secondary-900 font-medium">{new Date(repair.createdAt).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className="text-secondary-500 font-mono text-xs">{repair.repairId}</span>
                        </td>
                        <td className="py-4 font-bold text-primary-950">{repair.device?.brand || 'Device'}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusColor(repair.repairStatus)}`}>
                              {repair.repairStatus}
                            </span>
                            {repair.onHold && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">HOLD</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          {repair.expectedDeliveryDate ? (
                            <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                              <Calendar size={11} />
                              {new Date(repair.expectedDeliveryDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-xs text-secondary-400">-</span>
                          )}
                        </td>
                        <td className="py-4 font-bold text-primary-950 text-right">
                          {repair.finalCost ? `₹${repair.finalCost}` : repair.estimatedCost ? `₹${repair.estimatedCost}` : '-'}
                        </td>
                        <td className="py-4 text-right">
                          {(() => {
                            const inv = invoices.find(i => i.repairOrder?.repairId === repair.repairId || i.repairOrder === repair._id);
                            return inv ? (
                              <Link to={`/invoices/${inv._id}`} className="text-xs font-bold text-indigo-600 hover:underline">
                                View Bill
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">-</span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {invoices.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-border mt-6">
              <h2 className="text-xl font-bold text-primary-950 mb-6">My Invoices & Bills</h2>
              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div key={inv._id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        📄
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Invoice {inv.invoiceId}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">Due Date: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-slate-900">₹{inv.totalAmount.toLocaleString('en-IN')}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <Link 
                        to={`/invoices/${inv._id}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg px-3 py-1.5 shadow-sm transition-colors"
                      >
                        View Invoice
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
            <h2 className="text-lg font-bold text-primary-950 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/dashboard/repairs/new" className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-bold transition-colors shadow-sm">
                <Wrench size={18} /> Book New Repair
              </Link>
              <Link to="/shop" className="w-full bg-secondary-50 hover:bg-secondary-100 border border-border text-primary-900 rounded-xl py-3 flex items-center justify-center gap-2 font-bold transition-colors">
                <ShoppingBag size={18} /> Browse Store
              </Link>
              <Link to="/track" className="w-full bg-white border border-border text-primary-950 rounded-xl py-3 flex items-center justify-center gap-2 font-bold hover:bg-secondary-50 transition-colors">
                <Eye size={18} /> Track Repair
              </Link>
            </div>
          </div>

          <div className="rounded-3xl p-6 border border-primary-100 bg-gradient-to-br from-white to-primary-50 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-200 rounded-full blur-3xl opacity-50"></div>
            <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-md inline-block mb-4">Promo</span>
            <h3 className="text-xl font-bold text-primary-950 mb-2">Upgrade your protection.</h3>
            <p className="text-sm text-secondary-600 mb-4 leading-relaxed">Get 20% off tempered glass with any repair.</p>
            <a href="#" className="text-sm font-bold text-primary-600 hover:text-primary-700">Learn more</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
