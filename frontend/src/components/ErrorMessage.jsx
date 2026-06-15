import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <AlertCircle size={32} className="text-red-500" />
    </div>
    <p className="text-secondary-700 font-medium mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
        <RefreshCw size={16} /> Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;
