import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 24, className = '' }) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <Loader2 size={size} className="animate-spin text-primary-600" />
  </div>
);

export default LoadingSpinner;

export const PageLoading = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <Loader2 size={48} className="animate-spin text-primary-600 mx-auto mb-4" />
      <p className="text-secondary-500 font-medium">Loading...</p>
    </div>
  </div>
);
