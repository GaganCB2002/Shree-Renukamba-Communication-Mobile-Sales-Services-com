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
    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-sm
    ${isActive(path)
      ? 'bg-primary-600 text-white shadow-md'
      : 'text-secondary-600 hover:bg-secondary-50 hover:text-primary-600'}
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
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ] : [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/repairs/new', label: 'Book Repair', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-white border-r border-border flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-cover rounded-full shadow-sm" onError={(e) => e.target.style.display='none'} />
            <div>
              <div className="text-primary-900 font-bold text-sm leading-tight">SHREE RENUKAMBA</div>
              <div className="text-xs text-secondary-500 font-medium">Admin Portal</div>
            </div>
          </Link>
        </div>

        {isAdmin && (
          <div className="px-4 mb-6">
            <Link to="/dashboard/repairs/new" className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 font-medium transition-colors shadow-sm text-sm">
              <Plus size={18} />
              <span>New Repair Ticket</span>
            </Link>
          </div>
        )}

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path} className={navItemClass(link.path)}>
              <link.icon size={20} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          {userInfo && (
            <div className="px-4 py-3 text-xs text-secondary-500 truncate">
              Signed in as <span className="font-medium text-secondary-700">{userInfo.fullName}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="md:hidden bg-white border-b border-border p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="text-primary-900 font-bold text-lg">SHREE RENUKAMBA</div>
          <button className="p-2 text-secondary-600"><Settings size={24}/></button>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
