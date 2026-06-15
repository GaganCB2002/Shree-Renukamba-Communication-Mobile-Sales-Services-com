import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '+919876543210';
const WHATSAPP_MESSAGE = 'Hi! I need help with SR Communication';

const WhatsAppButton = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {showTooltip && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 max-w-[260px] animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
              <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Need help?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chat with us on WhatsApp! We respond within minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleWhatsApp}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </button>
    </div>
  );
};

export default WhatsAppButton;
