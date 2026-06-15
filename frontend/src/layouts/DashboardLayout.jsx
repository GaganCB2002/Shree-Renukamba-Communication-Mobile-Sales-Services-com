import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Wrench,
  ShoppingBag,
  Package,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Loader2,
  BarChart2,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  const isAdmin = userInfo.role === 'admin' || userInfo.role === 'technician';
  const basePath = isAdmin ? '/admin' : '/dashboard';

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItemClass = (path) => `
    flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm
    ${isActive(path)
      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
  `;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const sidebarLinks = isAdmin ? [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/repairs', label: 'Active Repairs', icon: Wrench },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/inventory', label: 'Inventory', icon: Package },
    { path: '/admin/billing', label: 'Billing & Analytics', icon: BarChart2 },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ] : [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/repairs/new', label: 'Book Repair', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col hidden md:flex sticky top-0 h-screen shrink-0">
        <div className="p-6">
          <Link to="/" className="block mb-6">
            <div className="text-indigo-600 font-bold text-lg leading-tight">Admin Portal</div>
            <div className="text-xs text-slate-500 font-medium">Manage Repairs & Sales</div>
          </Link>
        </div>

        {isAdmin && (
          <div className="px-4 mb-6">
            <Link to="/dashboard/repairs/new" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 font-semibold transition-all shadow-sm shadow-indigo-200 text-sm">
              <Plus size={18} />
              <span>New Repair Ticket</span>
            </Link>
          </div>
        )}

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path} className={navItemClass(link.path)}>
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link
            to="/help"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            <HelpCircle size={18} />
            <span>Help</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content viewport */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="md:hidden bg-white border-b border-slate-100 p-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <div className="text-indigo-600 font-bold text-base">Admin Portal</div>
            <div className="text-[10px] text-slate-500">Manage Repairs & Sales</div>
          </div>
          <button className="p-2 text-slate-600"><Settings size={22}/></button>
        </div>

        <div className="p-6 md:p-8 w-full max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
