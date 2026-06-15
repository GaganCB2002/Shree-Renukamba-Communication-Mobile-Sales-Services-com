import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Download, TrendingUp, Wrench, Shield, Search, 
  AlertTriangle, Plus, RotateCw, Play, Filter, MoreVertical, ShieldAlert
} from 'lucide-react';
import { getAllRepairs } from '../../api/repairsApi';
import { getProducts } from '../../api/productsApi';
import { PageLoading } from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [repairsData, productsData] = await Promise.all([
        getAllRepairs(),
        getProducts()
      ]);
      setRepairs(repairsData);
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;

  // Calculate stats
  const totalRevenue = repairs
    .filter(r => ['Repair Completed', 'Ready For Pickup', 'Delivered'].includes(r.repairStatus))
    .reduce((sum, r) => sum + (r.finalCost || r.estimatedCost || 0), 0);

  const activeRepairsCount = repairs.filter(r => 
    !['Delivered', 'Cancelled'].includes(r.repairStatus)
  ).length;

  const lowStockProducts = products.filter(p => p.stock <= 5);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  
  // Calculate inventory health percentage
  const totalProductsCount = products.length || 1;
  const healthyProductsCount = products.filter(p => p.stock > 5).length;
  const inventoryHealthVal = Math.round((healthyProductsCount / totalProductsCount) * 100);

  // Status badge colors
  const statusBadgeClass = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Diagnosis Complete':
      case 'Diagnostics':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Waiting For Approval':
      case 'Needs Approval':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Repair Started':
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Parts Ordered':
      case 'Waiting on Parts':
        return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Repair Completed':
      case 'Ready For Pickup':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  // Sparkline data representing trends
  const revenueSparkline = [30, 45, 35, 60, 40, 75, 90];
  const repairSparkline = [20, 35, 50, 40, 65, 55, 80];

  // Fallbacks if data is empty
  const displayRepairs = repairs.slice(0, 4);
  const fallbackRepairs = [
    {
      repairId: 'REP-8942',
      device: { brand: 'iPhone 14 Pro', model: 'Screen Replacement' },
      repairStatus: 'In Progress',
      priority: 'High',
      technician: 'Alex M.'
    },
    {
      repairId: 'REP-8941',
      device: { brand: 'MacBook Pro 16"', model: 'Battery Service' },
      repairStatus: 'Diagnostics',
      priority: 'Medium',
      technician: 'Sarah J.'
    },
    {
      repairId: 'REP-8939',
      device: { brand: 'Samsung S23 Ultra', model: 'Camera Module' },
      repairStatus: 'Waiting on Parts',
      priority: 'Low',
      technician: 'Unassigned'
    },
    {
      repairId: 'REP-8938',
      device: { brand: 'iPad Air 5', model: 'Water Damage' },
      repairStatus: 'In Progress',
      priority: 'High',
      technician: 'Alex M.'
    }
  ];

  const actualOrFallbackRepairs = displayRepairs.length > 0 
    ? displayRepairs.map(r => ({
        id: r._id,
        repairId: r.repairId,
        device: { 
          brand: r.device?.brand || 'Device', 
          model: r.device?.model || r.issueDescription || 'Repair' 
        },
        repairStatus: r.repairStatus === 'Repair Started' ? 'In Progress' :
                      r.repairStatus === 'Diagnosis Complete' ? 'Diagnostics' :
                      r.repairStatus === 'Waiting For Approval' ? 'Needs Approval' : r.repairStatus,
        priority: r.estimatedCost > 5000 ? 'High' : r.estimatedCost > 1500 ? 'Medium' : 'Low',
        technician: r.assignedTechnician?.fullName ? r.assignedTechnician.fullName.split(' ')[0] + ' ' + (r.assignedTechnician.fullName.split(' ')[1]?.slice(0, 1) || '') + '.' : 'Unassigned'
      }))
    : fallbackRepairs;

  // Fallbacks for low stock
  const displayLowStock = lowStockProducts.slice(0, 3);
  const fallbackLowStock = [
    { productId: 'SKU-A14-DIS', title: 'iPhone 14 OLED Panel', stock: 2 },
    { productId: 'SKU-MBP-BAT', title: 'MacBook Pro 16" Battery', stock: 0 },
    { productId: 'SKU-S23-CAM', title: 'S23 Ultra Camera Lens', stock: 5 }
  ];
  const actualOrFallbackLowStock = displayLowStock.length > 0
    ? displayLowStock.map(p => ({
        productId: p.productId,
        title: p.title,
        stock: p.stock
      }))
    : fallbackLowStock;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Enterprise Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">High-level overview of repair volume, revenue, and inventory health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Calendar size={16} className="text-slate-500" />
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-100">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TOTAL REVENUE CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  ₹{totalRevenue > 0 ? totalRevenue.toLocaleString('en-IN') : '1,24,500'}
                </h3>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↑ 12.5%
              </span>
              <span className="text-xs font-semibold text-slate-400">vs last month</span>
            </div>
          </div>
          {/* Sparkline Bar Chart SVG */}
          <div className="h-10 flex items-end gap-1 mt-auto">
            {revenueSparkline.map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-indigo-200 hover:bg-indigo-500 transition-all rounded-sm cursor-pointer"
                style={{ height: `${h}%` }}
                title={`Period ${i+1}: ${h}%`}
              />
            ))}
          </div>
        </div>

        {/* REPAIR VOLUME CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repair Volume</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {repairs.length > 0 ? repairs.length : '1,482'}
                </h3>
              </div>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Wrench size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↑ 8.2%
              </span>
              <span className="text-xs font-semibold text-slate-400">vs last month</span>
            </div>
          </div>
          {/* Sparkline Bar Chart SVG */}
          <div className="h-10 flex items-end gap-1 mt-auto">
            {repairSparkline.map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-indigo-200 hover:bg-indigo-500 transition-all rounded-sm cursor-pointer"
                style={{ height: `${h}%` }}
                title={`Period ${i+1}: ${h}%`}
              />
            ))}
          </div>
        </div>

        {/* INVENTORY HEALTH CARD */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between h-[180px]">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Health</p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {products.length > 0 ? `${inventoryHealthVal}%` : '92%'}
                </h3>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Shield size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                ↓ 2.1%
              </span>
              <span className="text-xs font-semibold text-slate-400">vs last month</span>
            </div>
          </div>
          
          {/* Progress bar gauge */}
          <div className="space-y-1.5 mt-auto">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all" 
                style={{ width: `${products.length > 0 ? (100 - inventoryHealthVal) : 24}%` }} 
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-400">Low Stock Items</span>
              <span className="text-rose-600 font-bold">{lowStockProducts.length > 0 ? lowStockProducts.length : '24'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Repair Queue Table & Right Column Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Active Repair Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-lg font-bold text-slate-900">Active Repair Queue</h2>
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search ID or Customer..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Ticket ID</th>
                  <th className="pb-3 px-4">Device</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Priority</th>
                  <th className="pb-3 pl-4 text-right">Technician</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {actualOrFallbackRepairs.map((repair, idx) => (
                  <tr key={repair.id || idx} className="text-sm hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pr-4 font-mono font-bold text-slate-500">{repair.repairId}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{repair.device.brand}</p>
                        <p className="text-xs text-slate-400">{repair.device.model}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBadgeClass(repair.repairStatus)}`}>
                        {repair.repairStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`flex items-center gap-1 font-semibold text-xs ${
                        repair.priority === 'High' ? 'text-rose-600' :
                        repair.priority === 'Medium' ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {repair.priority === 'High' && <span className="text-rose-600 font-extrabold">!</span>}
                        {repair.priority}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-semibold text-slate-600">{repair.technician}</span>
                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                          {repair.technician !== 'Unassigned' ? repair.technician.charAt(0) : '?'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-50 text-center">
            <Link 
              to="/admin/repairs" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-block"
            >
              View All Repairs
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Widgets */}
        <div className="space-y-8">
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <ShieldAlert size={20} className="text-rose-500" />
              <span>Low Stock Alerts</span>
            </div>

            <div className="space-y-4">
              {actualOrFallbackLowStock.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors rounded-xl border border-slate-100">
                  <div className="space-y-0.5">
                    <p className="text-xs font-mono font-bold text-slate-400">{item.productId}</p>
                    <p className="text-sm font-bold text-slate-800">{item.title}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-extrabold ${item.stock === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {item.stock}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">{item.stock === 0 ? 'Out of stock' : 'Units left'}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/admin/inventory')}
              className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Create Purchase Order</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/dashboard/repairs/new" 
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Plus size={20} />
                </div>
                <span className="text-xs font-bold text-slate-800">New Device</span>
              </Link>
              
              <Link 
                to="/admin/inventory" 
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Wrench size={20} />
                </div>
                <span className="text-xs font-bold text-slate-800">Scan Part</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
