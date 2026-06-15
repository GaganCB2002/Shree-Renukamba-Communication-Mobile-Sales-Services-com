import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Wrench, Eye, Calendar } from 'lucide-react';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { getAllRepairs } from '../../api/repairsApi';
import { Link } from 'react-router-dom';

const orderStatusColors = {
  'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
  'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
  'Out for Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Delivered': 'bg-green-50 text-green-700 border-green-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('repairs');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const repairsData = await getAllRepairs();
      setRepairs(repairsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepairs = repairs.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.repairId?.toLowerCase().includes(q) ||
      r.device?.brand?.toLowerCase().includes(q) ||
      r.customer?.userId?.fullName?.toLowerCase().includes(q);
  });

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-950">Orders</h1>
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">
            {activeTab === 'repairs' ? repairs.length : orders.length} Total
          </span>
        </div>
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
      </div>

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
        </button>
      </div>

      {activeTab === 'repairs' ? (
        filteredRepairs.length === 0 ? (
          <EmptyState title="No repair orders" description="No repair orders match your search." icon={Wrench} />
        ) : (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
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
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${orderStatusColors[repair.repairStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
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
        <EmptyState
          title="No E-Commerce Orders Yet"
          description="Customer orders will appear here once the checkout is complete."
          icon={ShoppingBag}
        />
      )}
    </div>
  );
};

export default AdminOrders;
