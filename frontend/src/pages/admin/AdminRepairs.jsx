import { useState, useEffect } from 'react';
import { 
  Search, Filter, Wrench, CheckCircle, Clock, AlertTriangle, 
  Loader2, Trash2, Edit, Check 
} from 'lucide-react';
import { getAllRepairs, updateRepairStatus } from '../../api/repairsApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const statusColors = {
  'Received': 'bg-blue-50 text-blue-700 border-blue-200',
  'Diagnosis Complete': 'bg-purple-50 text-purple-700 border-purple-200',
  'Waiting For Approval': 'bg-amber-50 text-amber-700 border-amber-200',
  'Repair Started': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Parts Ordered': 'bg-orange-50 text-orange-700 border-orange-200',
  'Repair Completed': 'bg-green-50 text-green-700 border-green-200',
  'Ready For Pickup': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Delivered': 'bg-gray-50 text-gray-700 border-gray-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200',
};

const AdminRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRepairs();
      setRepairs(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load repairs queue');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdating(id);
      const updated = await updateRepairStatus(id, { status: newStatus });
      setRepairs(repairs.map(r => r._id === id ? { ...r, repairStatus: updated.repairStatus } : r));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update repair status');
    } finally {
      setUpdating(null);
    }
  };

  const handleApprove = async (id) => {
    await handleStatusUpdate(id, 'Repair Started');
  };

  const counters = {
    pending: repairs.filter(r => r.repairStatus === 'Received').length,
    inRepair: repairs.filter(r => ['Repair Started', 'Parts Ordered', 'Diagnosis Complete'].includes(r.repairStatus)).length,
    awaiting: repairs.filter(r => r.repairStatus === 'Waiting For Approval').length,
    ready: repairs.filter(r => r.repairStatus === 'Ready For Pickup').length,
  };

  const filteredRepairs = repairs.filter(r => {
    // Basic status filter (All, Urgent, Overdue)
    if (statusFilter === 'Urgent' && r.estimatedCost < 3000) return false;
    if (statusFilter === 'Overdue') {
      // simulate overdue if created more than 5 days ago and not delivered
      const days = (new Date() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);
      if (days < 5 || ['Delivered', 'Cancelled'].includes(r.repairStatus)) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const customerName = r.customer?.userId?.fullName?.toLowerCase() || '';
      return r.repairId?.toLowerCase().includes(q) ||
        r.device?.brand?.toLowerCase().includes(q) ||
        r.device?.model?.toLowerCase().includes(q) ||
        r.issueDescription?.toLowerCase().includes(q) ||
        customerName.includes(q);
    }
    return true;
  });

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Repairs Queue</h1>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            {repairs.length} Total
          </span>
        </div>
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, Customer, Device..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* KPI Stats counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Diagnosis</h3>
            <Clock size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{counters.pending}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Repair</h3>
            <Wrench size={18} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{counters.inRepair}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Awaiting Approval</h3>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{counters.awaiting}</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready for Pickup</h3>
            <CheckCircle size={18} className="text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600">{counters.ready}</div>
        </div>
      </div>

      {/* Table & Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/20 flex-wrap gap-4">
          <div className="flex gap-2">
            {['All', 'Urgent', 'Overdue'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'text-slate-500 border-transparent hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {error && <div className="p-6"><ErrorMessage message={error} onRetry={fetchRepairs} /></div>}

        {filteredRepairs.length === 0 ? (
          <EmptyState title="No repairs found" description="There are no active repair tickets matching the selected filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Device & Customer</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRepairs.map((repair) => (
                  <tr key={repair._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-5 font-mono font-bold text-slate-500 whitespace-nowrap">{repair.repairId}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg shrink-0">
                          📱
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{repair.device?.brand || 'Unknown Brand'} {repair.device?.model || ''}</p>
                          <p className="text-xs text-slate-400 font-medium">{repair.customer?.userId?.fullName || 'Walk-in Customer'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-slate-600 max-w-xs truncate">{repair.issueDescription}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={repair.repairStatus}
                          onChange={(e) => handleStatusUpdate(repair._id, e.target.value)}
                          disabled={updating === repair._id}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer outline-none transition-all ${
                            statusColors[repair.repairStatus] || 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {Object.keys(statusColors).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {updating === repair._id && <Loader2 size={14} className="animate-spin text-indigo-600" />}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2.5">
                        {repair.repairStatus === 'Waiting For Approval' && (
                          <button
                            onClick={() => handleApprove(repair._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1"
                          >
                            <Check size={14} />
                            <span>Approve</span>
                          </button>
                        )}
                        <button className="p-2 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRepairs;
