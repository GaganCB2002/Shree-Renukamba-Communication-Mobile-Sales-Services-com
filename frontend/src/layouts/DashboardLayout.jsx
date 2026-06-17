import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Wrench, ShoppingBag, Package, Settings,
  HelpCircle, Plus, Loader2, BarChart2, Gift,
  Bell, Search, Sun, Moon, ChevronDown, Users, Menu,
  User as UserIcon, LogOut as LogOutIcon, ChevronLeft, ChevronRight, MoreHorizontal,
  Headphones, Tags, MapPin, UserCog
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { resetPageData } from '../redux/slices/pageSlice';
import { useTheme } from '../contexts/ThemeContext';
import { getUnreadCount, getMyNotifications, markAllAsRead, markAsRead } from '../api/notificationsApi';
import CustomerAiAssistant from '../components/CustomerAiAssistant';
import AdminAiAssistant from '../components/AdminAiAssistant';
import DeliveryReminder from '../components/DeliveryReminder';
import useVisitorTracking from '../hooks/useVisitorTracking';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  useVisitorTracking();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    const isAdminPath = location.pathname.startsWith('/admin');
    const isCustomerPath = location.pathname.startsWith('/dashboard');
    const userIsAdmin = userInfo.role === 'admin' || userInfo.role === 'technician';
    if (isAdminPath && !userIsAdmin) {
      navigate('/dashboard');
    } else if (isCustomerPath && userIsAdmin) {
      navigate('/admin');
    }
  }, [userInfo, navigate, location.pathname]);

  useEffect(() => {
    if (userInfo) {
      fetchNotifications();
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userInfo]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data.slice(0, 10));
    } catch (err) {
      // silent
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (err) {
      // silent
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 size={32} className="animate-spin text-amber-600" />
      </div>
    );
  }

  const isAdmin = userInfo.role === 'admin' || userInfo.role === 'technician';
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetPageData());
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (isAdmin) {
        navigate(`/admin/repairs?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery('');
    }
  };

  const sidebarLinks = isAdmin ? [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/repairs', label: 'Repairs', icon: Wrench },
    { path: '/admin/users', label: 'Users', icon: UserCog },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/inventory', label: 'Inventory', icon: Package },
    { path: '/admin/coupons', label: 'Coupons', icon: Gift },
    { path: '/admin/price-list', label: 'Price List', icon: Tags },
    { path: '/admin/billing', label: 'Billing', icon: BarChart2 },
    { path: '/admin/visitors', label: 'Visitors', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ] : [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/', label: 'Homepage', icon: Package },
    { path: '/shop', label: 'Shop Products', icon: ShoppingBag },
    { path: '/dashboard/orders', label: 'My Orders', icon: ShoppingBag },
    { path: '/dashboard/live-tracking', label: 'Live Tracking', icon: MapPin },
    { path: '/accessories', label: 'Accessories', icon: Headphones },
    { path: '/dashboard/repairs/new', label: 'Book Repair', icon: Wrench },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    { path: '/dashboard/support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col md:flex-row pb-16 md:pb-0`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Tablet & Desktop) */}
      <aside className={`
        fixed md:sticky top-0 h-screen z-50 bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col shrink-0
        transition-all duration-300
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed && !sidebarOpen ? 'md:w-20' : 'md:w-64'}
      `}>
        {/* Header Branding */}
        <div className="p-4 h-16 border-b border-slate-800 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="SR Logo" 
              className="w-8 h-8 rounded-full object-cover shrink-0 bg-white"
              onError={e => { e.target.style.display = 'none'; }}
            />
            {(!isCollapsed || sidebarOpen) && (
              <div className="leading-tight shrink-0 transition-opacity duration-300">
                <div className="font-bold text-sm text-slate-100">
                  {isAdmin ? 'SR Admin' : 'SR Client'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {isAdmin ? 'Services Panel' : 'My Account'}
                </div>
              </div>
            )}
          </div>
          
          {/* Collapse toggle (Desktop only) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Create Ticket Shortcut */}
        {isAdmin && (!isCollapsed || sidebarOpen) && (
          <div className="px-4 pt-4">
            <Link
              to="/dashboard/repairs/new"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/15 text-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create Ticket</span>
            </Link>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold transition-all text-sm group relative
                ${isActive(link.path)
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
              `}
              title={isCollapsed ? link.label : ''}
            >
              {isActive(link.path) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-amber-500 rounded-full" />
              )}
              <link.icon size={18} className={isActive(link.path) ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'} />
              {(!isCollapsed || sidebarOpen) && (
                <span className="transition-opacity duration-300">{link.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-slate-800 space-y-0.5">
          <Link
            to="/help"
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors font-semibold text-sm"
            title={isCollapsed ? 'Help & Support' : ''}
          >
            <HelpCircle size={18} />
            {(!isCollapsed || sidebarOpen) && <span>Support</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors font-semibold text-sm"
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOutIcon size={18} />
            {(!isCollapsed || sidebarOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 shrink-0 flex items-center px-4 md:px-6 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {sidebarLinks.find(l => isActive(l.path))?.label || 'Dashboard'}
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-sm mx-8">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search database..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
              />
            </div>
          </form>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs font-semibold text-amber-600 hover:text-amber-700">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">No new updates</div>
                    ) : (
                      notifications.map((n) => {
                        const idMatch = n.message.match(/(REP-\d+|ORD-\d+)/);
                        const refId = idMatch ? idMatch[1] : null;
                        return (
                          <div key={n._id} onClick={async () => {
                            if (!n.isRead) {
                              try {
                                await markAsRead(n._id);
                                setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
                                setUnreadCount(prev => Math.max(0, prev - 1));
                              } catch { /* ignore */ }
                            }
                            if (refId) navigate(`/order/${refId}`);
                            setShowNotifications(false);
                          }} className={`p-3 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/20 ${!n.isRead ? 'bg-amber-500/5' : ''}`}>
                            <p className="text-xs font-semibold text-slate-950 dark:text-white">{n.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.message}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shadow-md shadow-amber-500/10">
                  {userInfo?.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{userInfo.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{userInfo.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      to={isAdmin ? '/admin/settings' : '/dashboard/settings'}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <UserIcon size={14} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOutIcon size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {/* Responsive Mobile Bottom Navigation (Orchestrated for Mobile Screen UX) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex md:hidden justify-around items-center px-4 z-40 shadow-lg shadow-slate-950/10">
        {isAdmin ? (
          <>
            <Link to="/admin" className={`flex flex-col items-center justify-center ${isActive('/admin') && !isActive('/admin/repairs') && !isActive('/admin/inventory') && !isActive('/admin/billing') ? 'text-amber-500' : 'text-slate-400'}`}>
              <LayoutDashboard size={20} />
              <span className="text-[9px] font-bold mt-1">Home</span>
            </Link>
            <Link to="/admin/repairs" className={`flex flex-col items-center justify-center ${isActive('/admin/repairs') ? 'text-amber-500' : 'text-slate-400'}`}>
              <Wrench size={20} />
              <span className="text-[9px] font-bold mt-1">Repairs</span>
            </Link>
            <Link to="/admin/inventory" className={`flex flex-col items-center justify-center ${isActive('/admin/inventory') ? 'text-amber-500' : 'text-slate-400'}`}>
              <Package size={20} />
              <span className="text-[9px] font-bold mt-1">Stock</span>
            </Link>
            <Link to="/admin/billing" className={`flex flex-col items-center justify-center ${isActive('/admin/billing') ? 'text-amber-500' : 'text-slate-400'}`}>
              <BarChart2 size={20} />
              <span className="text-[9px] font-bold mt-1">Billing</span>
            </Link>
            <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center justify-center text-slate-400">
              <MoreHorizontal size={20} />
              <span className="text-[9px] font-bold mt-1">More</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={`flex flex-col items-center justify-center ${isActive('/dashboard') && !isActive('/dashboard/repairs') && !isActive('/dashboard/live-tracking') && !isActive('/dashboard/orders') ? 'text-amber-500' : 'text-slate-400'}`}>
              <LayoutDashboard size={20} />
              <span className="text-[9px] font-bold mt-1">Home</span>
            </Link>
            <Link to="/dashboard/orders" className={`flex flex-col items-center justify-center ${isActive('/dashboard/orders') ? 'text-amber-500' : 'text-slate-400'}`}>
              <ShoppingBag size={20} />
              <span className="text-[9px] font-bold mt-1">Orders</span>
            </Link>
            <Link to="/dashboard/live-tracking" className={`flex flex-col items-center justify-center ${isActive('/dashboard/live-tracking') ? 'text-amber-500' : 'text-slate-400'}`}>
              <MapPin size={20} />
              <span className="text-[9px] font-bold mt-1">Track</span>
            </Link>
            <Link to="/dashboard/repairs/new" className={`flex flex-col items-center justify-center ${isActive('/dashboard/repairs/new') ? 'text-amber-500' : 'text-slate-400'}`}>
              <Wrench size={20} />
              <span className="text-[9px] font-bold mt-1">Repair</span>
            </Link>
            <button type="button" onClick={() => setSidebarOpen(true)} className="flex flex-col items-center justify-center text-slate-400">
              <MoreHorizontal size={20} />
              <span className="text-[9px] font-bold mt-1">More</span>
            </button>
          </>
        )}
      </nav>

      {/* Floating AI Assistants */}
      {userInfo && !isAdmin && <CustomerAiAssistant />}
      {userInfo && isAdmin && <AdminAiAssistant />}
      <DeliveryReminder />
    </div>
  );
};

export default DashboardLayout;
