import { useState, useEffect } from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const orderStatusColors = {
  'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
  'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
  'Out for Delivery': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Delivered': 'bg-green-50 text-green-700 border-green-200',
  'Cancelled': 'bg-red-50 text-red-700 border-red-200',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-950">Orders</h1>
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{orders.length} Total</span>
        </div>
        <div className="relative w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
      </div>

      <EmptyState
        title="No Orders Yet"
        description="Customer orders will appear here once the e-commerce checkout is complete."
        icon={ShoppingBag}
      />
    </div>
  );
};

export default AdminOrders;
