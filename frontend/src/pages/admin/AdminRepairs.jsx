import { useState, useEffect } from 'react';
import {
  Search, Filter, Wrench, CheckCircle, Clock, AlertTriangle,
  Loader2, Trash2, Edit, Check, X, Eye, Calendar, PauseCircle,
  Play, CalendarClock, MessageSquare,
} from 'lucide-react';
import { getAllRepairs, updateRepairStatus, updateRepairDetails, getRepairById } from '../../api/repairsApi';
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

const statusSteps = [
  'Received', 'Diagnosis Complete', 'Waiting For Approval',
  'Repair Started', 'Parts Ordered', 'Repair Completed',
  'Ready For Pickup', 'Delivered',
];

const AdminRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updating, setUpdating] = useState(null);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [showHoldInput, setShowHoldInput] = useState(false);

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
      setRepairs(repairs.map(r => r._id === id ? { ...r, repairStatus: updated.repairStatus, finalCost: updated.finalCost } : r));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update repair status');
    } finally {
      setUpdating(null);
    }
  };

  const handleApprove = async (id) => {
    await handleStatusUpdate(id, 'Repair Started');
  };

  const handleHold = async (id) => {
    if (!holdReason.trim()) return;
    try {
      setUpdating(id);
      const updated = await updateRepairDetails(id, { onHold: true, holdReason });
      setRepairs(repairs.map(r => r._id === id ? { ...r, onHold: updated.onHold, holdReason: updated.holdReason } : r));
      setShowHoldInput(false);
      setHoldReason('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to hold repair');
    } finally {
      setUpdating(null);
    }
  };

  const handleUnhold = async (id) => {
    try {
      setUpdating(id);
      const updated = await updateRepairDetails(id, { onHold: false });
      setRepairs(repairs.map(r => r._id === id ? { ...r, onHold: updated.onHold, holdReason: '' } : r));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unhold repair');
    } finally {
      setUpdating(null);
    }
  };

  const handleSetDeliveryDate = async (id) => {
    if (!deliveryDate) return;
    try {
      setUpdating(id);
      const updated = await updateRepairDetails(id, { expectedDeliveryDate: deliveryDate });
      setRepairs(repairs.map(r => r._id === id ? { ...r, expectedDeliveryDate: updated.expectedDeliveryDate } : r));
      setDeliveryDate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set delivery date');
    } finally {
      setUpdating(null);
    }
  };

  const openDetail = async (id) => {
    try {
      setDetailLoading(true);
      const data = await getRepairById(id);
      setSelectedRepair(data);
      setDetailModal(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load repair details');
    } finally {
      setDetailLoading(false);
    }
  };

  const counters = {
    pending: repairs.filter(r => r.repairStatus === 'Received').length,
    inRepair: repairs.filter(r => ['Repair Started', 'Parts Ordered', 'Diagnosis Complete'].includes(r.repairStatus)).length,
    awaiting: repairs.filter(r => r.repairStatus === 'Waiting For Approval').length,
    ready: repairs.filter(r => r.repairStatus === 'Ready For Pickup').length,
    onHold: repairs.filter(r => r.onHold).length,
  };

  const filteredRepairs = repairs.filter(r => {
    if (statusFilter === 'Urgent' && r.estimatedCost < 3000) return false;
    if (statusFilter === 'Overdue') {
      const days = (new Date() - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);
      if (days < 5 || ['Delivered', 'Cancelled'].includes(r.repairStatus)) return false;
    }
    if (statusFilter === 'On Hold') return r.onHold === true;

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

  const statusStepIndex = (status) => statusSteps.indexOf(status);
  const repairStepIndex = selectedRepair ? statusStepIndex(selectedRepair.repairStatus) : -1;

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-8 animate-fade-in">
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">On Hold</h3>
            <PauseCircle size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600">{counters.onHold}</div>
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/20 flex-wrap gap-4">
          <div className="flex gap-2">
            {['All', 'Urgent', 'Overdue', 'On Hold'].map((tab) => (
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
                  <tr key={repair._id} className={`hover:bg-slate-50/30 transition-colors ${repair.onHold ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => openDetail(repair._id)}
                        className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline whitespace-nowrap text-left"
                      >
                        {repair.repairId}
                      </button>
                      {repair.onHold && (
                        <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          HOLD
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-lg shrink-0">
                          📱
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{repair.device?.brand || 'Unknown Brand'} {repair.device?.model || ''}</p>
                          <p className="text-xs text-slate-400 font-medium">{repair.customer?.userId?.fullName || 'Walk-in Customer'}</p>
                          {repair.expectedDeliveryDate && (
                            <p className="text-[10px] text-indigo-500 font-semibold mt-0.5 flex items-center gap-1">
                              <Calendar size={10} /> Due: {new Date(repair.expectedDeliveryDate).toLocaleDateString()}
                            </p>
                          )}
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(repair._id)}
                          className="p-2 border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {repair.onHold ? (
                          <button
                            onClick={() => handleUnhold(repair._id)}
                            disabled={updating === repair._id}
                            className="p-2 border border-amber-200 hover:border-emerald-300 text-amber-500 hover:text-emerald-600 rounded-lg transition-colors"
                            title="Resume Repair"
                          >
                            <Play size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => { setShowHoldInput(true); setSelectedRepair(repair); }}
                            className="p-2 border border-slate-200 hover:border-amber-300 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                            title="Hold Repair"
                          >
                            <PauseCircle size={14} />
                          </button>
                        )}
                        {repair.repairStatus === 'Waiting For Approval' && (
                          <button
                            onClick={() => handleApprove(repair._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1"
                          >
                            <Check size={14} />
                            <span>Approve</span>
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

      {showHoldInput && selectedRepair && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowHoldInput(false); setHoldReason(''); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Hold Repair</h3>
            <p className="text-sm text-slate-500 mb-4">Provide the reason for putting this repair on hold.</p>
            <textarea
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none resize-none"
              placeholder="e.g. Waiting for parts, Customer needs to approve estimate..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowHoldInput(false); setHoldReason(''); }} className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleHold(selectedRepair._id)} disabled={!holdReason.trim()} className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-400">Confirm Hold</button>
            </div>
          </div>
        </div>
      )}

      {detailModal && selectedRepair && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setDetailModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">Repair Details</h2>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">{selectedRepair.repairId}</span>
                {selectedRepair.onHold && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">ON HOLD</span>}
              </div>
              <button onClick={() => setDetailModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Brand</p>
                  <p className="font-bold text-slate-900">{selectedRepair.device?.brand || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Model</p>
                  <p className="font-bold text-slate-900">{selectedRepair.device?.model || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IMEI</p>
                  <p className="font-bold text-slate-900 font-mono text-sm">{selectedRepair.device?.imei || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Condition</p>
                  <p className="font-bold text-slate-900">{selectedRepair.device?.condition || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                  <p className="font-bold text-slate-900">{selectedRepair.customer?.userId?.fullName || 'Walk-in'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="font-bold text-slate-900 text-sm truncate">{selectedRepair.customer?.userId?.email || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                  <p className="font-bold text-slate-900">{selectedRepair.customer?.userId?.phoneNumber || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Cost</p>
                  <p className="font-bold text-slate-900">{selectedRepair.estimatedCost ? `₹${selectedRepair.estimatedCost}` : '-'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Issue Description</h3>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{selectedRepair.issueDescription}</p>
              </div>

              {selectedRepair.technicianNotes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Technician Notes</h3>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">{selectedRepair.technicianNotes}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-4">Status Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                  <div className="space-y-6">
                    {statusSteps.map((step, idx) => {
                      const isPast = idx <= repairStepIndex;
                      const isCurrent = idx === repairStepIndex;
                      return (
                        <div key={step} className="relative flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                            isPast && !isCurrent ? 'bg-indigo-600 text-white' :
                            isCurrent ? 'border-4 border-indigo-200 bg-white' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                            {isPast && !isCurrent && <Check size={14} />}
                            {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isCurrent ? 'text-indigo-600' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>{step}</p>
                            {isCurrent && <p className="text-xs text-slate-500 mt-0.5">Current Status</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Admin Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Expected Delivery Date</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => handleSetDeliveryDate(selectedRepair._id)}
                        disabled={!deliveryDate || updating === selectedRepair._id}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-400"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Set Final Cost</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="₹"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleStatusUpdate(selectedRepair._id, selectedRepair.repairStatus);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    {selectedRepair.repairStatus === 'Repair Completed' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedRepair._id, 'Ready For Pickup')}
                        className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Mark Ready
                      </button>
                    )}
                    {selectedRepair.repairStatus === 'Ready For Pickup' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedRepair._id, 'Delivered')}
                        className="w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <Check size={16} /> Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRepairs;
