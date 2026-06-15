import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Users, Phone, Mail, MapPin, Calendar,
  Smartphone, Wrench, Star, ChevronDown, MoreHorizontal,
  MessageSquare, RefreshCw
} from 'lucide-react';
import { getAllCustomers } from '../../api/customersApi';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCustomers} />;

  const filtered = customers.filter(c =>
    !search || c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber?.includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'name') return (a.fullName || '').localeCompare(b.fullName || '');
    if (sortBy === 'repairs') return (b.repairsCount || 0) - (a.repairsCount || 0);
    if (sortBy === 'points') return (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0);
    return 0;
  });

  const totalCustomers = customers.length;
  const totalRepairs = customers.reduce((sum, c) => sum + (c.repairsCount || 0), 0);
  const avgRepairsPerCustomer = totalCustomers > 0 ? (totalRepairs / totalCustomers).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your customer base and view their repair history
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
              <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalCustomers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
              <Wrench size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalRepairs}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Repairs</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
              <Star size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{avgRepairsPerCustomer}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Repairs/Customer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="newest">Newest First</option>
          <option value="name">Name A-Z</option>
          <option value="repairs">Most Repairs</option>
          <option value="points">Highest Points</option>
        </select>
      </div>

      {/* Customer List */}
      {sorted.length === 0 ? (
        <EmptyState
          title={search ? 'No customers found' : 'No customers yet'}
          description={search ? 'Try a different search term' : 'Customers will appear here once they register and book repairs.'}
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((customer) => (
            <div
              key={customer._id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {customer.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {customer.fullName || 'Unknown Customer'}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      Joined {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < Math.min(5, Math.ceil((customer.repairsCount || 0) / 2)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {customer.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Mail size={12} className="shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phoneNumber && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Phone size={12} className="shrink-0" />
                    <span>{customer.phoneNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-1.5">
                  <Smartphone size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{customer.devicesCount || 0} devices</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{customer.repairsCount || 0} repairs</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <Star size={13} className="text-amber-400" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{customer.loyaltyPoints || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
