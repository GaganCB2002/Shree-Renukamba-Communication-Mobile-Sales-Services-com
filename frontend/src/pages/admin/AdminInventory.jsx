import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Search } from 'lucide-react';
import { PageLoading } from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return <PageLoading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-950">Inventory</h1>
          <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle size={12} /> Low Stock Alerts
          </span>
        </div>
      </div>

      <EmptyState
        title="Inventory Coming Soon"
        description="Track spare parts and stock levels for repair components."
        icon={Package}
      />
    </div>
  );
};

export default AdminInventory;
