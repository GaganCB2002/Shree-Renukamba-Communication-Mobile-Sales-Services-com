import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'Nothing here', description = 'No items to display.', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
      <Inbox size={32} className="text-secondary-400" />
    </div>
    <h3 className="text-lg font-bold text-primary-950 mb-1">{title}</h3>
    <p className="text-secondary-500 text-sm mb-6">{description}</p>
    {action}
  </div>
);

export default EmptyState;
