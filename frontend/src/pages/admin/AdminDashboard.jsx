import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MoreVertical, Wrench, CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { getMyRepairs, updateRepairStatus } from '../../api/repairsApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const statusColors = {
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

const AdminDashboard = () => {
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
      const data = await getMyRepairs();
      setRepairs(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load repairs');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setUpdating(id);
      const updated = await updateRepairStatus(id, { status: newStatus });
      setRepairs(repairs.map(r => r._id === id ? updated : r));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const KPI_CARDS = [
    { label: 'Pending Diagnosis', count: repairs.filter(r => r.repairStatus === 'Received').length, color: 'text-primary-600', icon: Clock },
    { label: 'In Repair', count: repairs.filter(r => ['Repair Started', 'Parts Ordered', 'Diagnosis Complete'].includes(r.repairStatus)).length, color: 'text-green-600', icon: Wrench },
    { label: 'Awaiting Approval', count: repairs.filter(r => r.repairStatus === 'Waiting For Approval').length, color: 'text-red-600', icon: AlertTriangle },
    { label: 'Ready for Pickup', count: repairs.filter(r => r.repairStatus === 'Ready For Pickup').length, color: 'text-purple-600', icon: CheckCircle },
  ];

  const filteredRepairs = repairs.filter(r => {
    if (statusFilter !== 'All' && r.repairStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.repairId?.toLowerCase().includes(q) ||
        r.device?.brand?.toLowerCase().includes(q) ||
        r.device?.model?.toLowerCase().includes(q) ||
        r.issueDescription?.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRepairs} />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-950">Active Repairs Queue</h1>
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{repairs.length} Total</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Customer, Device..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {KPI_CARDS.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-secondary-600">{kpi.label}</h3>
              <kpi.icon size={20} className={kpi.color} />
            </div>
            <div className={`text-4xl font-bold ${kpi.color}`}>{kpi.count}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            {['All', 'Received', 'Diagnosis Complete', 'Waiting For Approval', 'Repair Started', 'Repair Completed', 'Ready For Pickup', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm font-bold rounded-xl border transition-colors ${
                  statusFilter === status
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : 'text-secondary-600 border-transparent hover:bg-secondary-50'
                }`}
              >
                {status === 'All' ? 'All' : status}
              </button>
            ))}
          </div>
          <button className="p-2 text-secondary-400 hover:text-secondary-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {filteredRepairs.length === 0 ? (
          <EmptyState title="No repairs found" description={search ? 'Try a different search term.' : 'No repairs match the selected filter.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Issue</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRepairs.map((repair) => (
                  <tr key={repair._id} className="hover:bg-secondary-50/50 transition-colors group">
                    <td className="px-6 py-5 text-sm font-bold text-secondary-500 whitespace-nowrap font-mono">{repair.repairId}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 text-lg">
                          📱
                        </div>
                        <div>
                          <div className="font-bold text-primary-950 text-sm">{repair.device?.brand || 'Unknown'} {repair.device?.model || ''}</div>
                          <div className="text-secondary-500 text-xs">ID: {repair.device?._id?.slice(-6) || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-secondary-600 max-w-xs truncate">{repair.issueDescription}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <select
                        value={repair.repairStatus}
                        onChange={(e) => handleStatusUpdate(repair._id, e.target.value)}
                        disabled={updating === repair._id}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-md border cursor-pointer ${statusColors[repair.repairStatus] || 'bg-secondary-50 text-secondary-700 border-secondary-200'}`}
                      >
                        {Object.keys(statusColors).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {updating === repair._id && <Loader2 size={14} className="animate-spin ml-2 inline" />}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {repair.estimatedCost && repair.repairStatus === 'Waiting For Approval' ? (
                          <button
                            onClick={() => handleStatusUpdate(repair._id, 'Repair Started')}
                            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
                          >
                            Approve ${repair.estimatedCost}
                          </button>
                        ) : (
                          <button className="p-2 text-secondary-400 hover:text-primary-600 transition-colors">
                            <MoreVertical size={20} />
                          </button>
                        )}
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

export default AdminDashboard;
