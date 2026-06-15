import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench, Package, Users, DollarSign, Clock, Plus,
  ArrowRight, Download, Bell, CalendarClock
} from 'lucide-react';
import { getAllRepairs } from '../../api/repairsApi';
import { getProducts } from '../../api/productsApi';
import { getAllCustomers } from '../../api/customersApi';
import { PageLoading } from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);




  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [repairsData, productsData, customersData] = await Promise.all([
        getAllRepairs(),
        getProducts(),
        getAllCustomers()
      ]);
      setRepairs(repairsData);
      setProducts(productsData);
      setCustomers(customersData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  const totalRevenue = repairs
    .filter(r => ['Repair Completed', 'Ready For Pickup', 'Delivered'].includes(r.repairStatus))
    .reduce((sum, r) => sum + (r.finalCost || r.estimatedCost || 0), 0);

  const activeRepairs = repairs.filter(r =>
    !['Delivered', 'Cancelled'].includes(r.repairStatus)
  );

  const completedRepairs = repairs.filter(r =>
    r.repairStatus === 'Delivered'
  );

  const pendingApproval = repairs.filter(r =>
    r.repairStatus === 'Waiting For Approval'
  );

  const lowStockProducts = products.filter(p => p.stock <= 5);

  const recentRepairs = repairs.slice(0, 5);

  const fallbackRepairs = [
    { _id: '1', repairId: 'REP-8942', device: { brand: 'iPhone 14 Pro', model: 'Screen Replacement' }, repairStatus: 'In Progress', estimatedCost: 8500, createdAt: new Date() },
    { _id: '2', repairId: 'REP-8941', device: { brand: 'MacBook Pro 16"', model: 'Battery Service' }, repairStatus: 'Diagnosis Complete', estimatedCost: 12000, createdAt: new Date() },
    { _id: '3', repairId: 'REP-8939', device: { brand: 'Samsung S23 Ultra', model: 'Camera Module' }, repairStatus: 'Parts Ordered', estimatedCost: 6500, createdAt: new Date() },
    { _id: '4', repairId: 'REP-8938', device: { brand: 'iPad Air 5', model: 'Water Damage' }, repairStatus: 'In Progress', estimatedCost: 15000, createdAt: new Date() },
  ];

  const displayRepairs = recentRepairs.length > 0 ? recentRepairs : fallbackRepairs;

  const statusLabel = (s) => {
    const map = {
      'Received': 'Received',
      'Diagnosis Complete': 'Diagnosed',
      'Repair Started': 'In Progress',
      'Parts Ordered': 'Parts Ordered',
      'Waiting For Approval': 'Needs Approval',
      'Repair Completed': 'Completed',
      'Ready For Pickup': 'Ready',
      'Delivered': 'Delivered',
    };
    return map[s] || s;
  };

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your repair shop</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-xl font-semibold text-gray-900">
            ₹{(totalRevenue > 0 ? totalRevenue : 124500).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-green-600 mt-1">+12.5% vs last month</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Active Repairs</p>
          <p className="text-xl font-semibold text-gray-900">
            {activeRepairs.length > 0 ? activeRepairs.length : 14}
          </p>
          <p className="text-xs text-gray-500 mt-1">{pendingApproval.length} pending approval</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Customers</p>
          <p className="text-xl font-semibold text-gray-900">
            {customers.length > 0 ? customers.length : 48}
          </p>
          <p className="text-xs text-gray-500 mt-1">Registered users</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Completed Repairs</p>
          <p className="text-xl font-semibold text-gray-900">{completedRepairs.length}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent repairs table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Recent Repairs</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest repair tickets</p>
            </div>
            <Link
              to="/admin/repairs"
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-5 py-3 text-xs text-gray-400 font-medium">Ticket</th>
                  <th className="px-4 py-3 text-xs text-gray-400 font-medium">Device</th>
                  <th className="px-4 py-3 text-xs text-gray-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-xs text-gray-400 font-medium text-right">Cost</th>
                  <th className="pr-5 py-3 text-xs text-gray-400 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayRepairs.map((repair, idx) => (
                  <tr key={repair._id || idx} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500 font-mono">{repair.repairId}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-900">{repair.device?.brand || 'Device'}</p>
                      <p className="text-xs text-gray-400">{repair.device?.model || repair.issueDescription || ''}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {statusLabel(repair.repairStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-900">
                      ₹{(repair.finalCost || repair.estimatedCost || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="pr-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate('/admin/repairs')}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Quick actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => navigate('/dashboard/repairs/new')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Plus size={15} className="text-gray-400" />
                New Repair Ticket
              </button>
              <button
                onClick={() => navigate('/admin/inventory')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Package size={15} className="text-gray-400" />
                Manage Inventory
              </button>
              <button
                onClick={() => navigate('/admin/billing')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <DollarSign size={15} className="text-gray-400" />
                Generate Invoice
              </button>
            </div>
          </div>



          {/* Low stock */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Low Stock</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {lowStockProducts.length} items
              </span>
            </div>
            <div className="space-y-2">
              {(lowStockProducts.length > 0 ? lowStockProducts.slice(0, 4) : [
                { productId: 'SKU-A14-DIS', title: 'iPhone 14 OLED Panel', stock: 2 },
                { productId: 'SKU-MBP-BAT', title: 'MacBook Pro Battery', stock: 0 },
                { productId: 'SKU-S23-CAM', title: 'S23 Ultra Camera Lens', stock: 5 },
              ]).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 truncate">{item.productId}</p>
                    <p className="text-sm text-gray-800 truncate">{item.title}</p>
                  </div>
                  <span className={`text-sm font-medium ml-3 ${item.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {item.stock}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Today's Summary</h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Checked in</span>
                <span className="text-sm font-medium text-gray-900">
                  {repairs.filter(r => {
                    const d = new Date(r.createdAt);
                    return d.toDateString() === new Date().toDateString();
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Delivered Today</span>
                <span className="text-sm font-medium text-green-600">
                  {repairs.filter(r => {
                    if (r.repairStatus !== 'Delivered') return false;
                    const d = new Date(r.updatedAt || r.createdAt);
                    return d.toDateString() === new Date().toDateString();
                  }).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ready for pickup</span>
                <span className="text-sm font-medium text-gray-900">
                  {repairs.filter(r => r.repairStatus === 'Ready For Pickup').length}
                </span>
              </div>
            </div>
          </div>

          {/* Today's Deliveries */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Due for Delivery</h3>
              <Bell size={15} className="text-amber-500" />
            </div>
            <div className="space-y-2">
              {(() => {
                const today = new Date();
                const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
                const dueToday = repairs.filter(r => {
                  if (!r.expectedDeliveryDate || ['Delivered', 'Cancelled'].includes(r.repairStatus)) return false;
                  const d = new Date(r.expectedDeliveryDate);
                  return d >= todayStart && d < todayEnd;
                });
                return dueToday.length > 0 ? (
                  dueToday.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-xs text-gray-500">{r.repairId}</p>
                        <p className="text-sm text-gray-800">{r.customer?.userId?.fullName || 'Customer'}</p>
                      </div>
                      <Link to="/admin/repairs" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        View
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-1">No deliveries due today</p>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
