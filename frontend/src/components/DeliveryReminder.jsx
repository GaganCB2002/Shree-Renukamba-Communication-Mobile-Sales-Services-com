import { useState, useEffect, useRef } from 'react';
import { X, Check, Bell, Clock, Loader2 } from 'lucide-react';
import { getMyNotifications, markAsRead } from '../api/notificationsApi';
import { updateRepairStatus } from '../api/repairsApi';

const CHECK_INTERVAL = 30 * 60 * 1000;

const DeliveryReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [updating, setUpdating] = useState(null);
  const audioCtxRef = useRef(null);

  const playAlertSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 880;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 660;
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
      }, 600);
    } catch (e) {
      console.warn('Audio not available:', e.message);
    }
  };

  const fetchReminders = async () => {
    try {
      const data = await getMyNotifications();
      const deliveryReminders = data.filter(
        n => (n.type === 'delivery_reminder' || n.type === 'delivery_update') && !n.isRead
      );
      if (deliveryReminders.length > 0) {
        setReminders(deliveryReminders);
        const hasNew = deliveryReminders.some(r => !dismissed.has(r._id));
        if (hasNew) {
          playAlertSound();
        }
      }
    } catch (e) {
      // silent
    }
  };

  useEffect(() => {
    fetchReminders();
    const interval = setInterval(fetchReminders, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchReminders]);

  const handleDismiss = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setDismissed(prev => new Set([...prev, notificationId]));
      setReminders(prev => prev.filter(r => r._id !== notificationId));
    } catch (e) {
      // silent
    }
  };

  const handleMarkDelivered = async (repairId, notificationId) => {
    try {
      setUpdating(repairId);
      await updateRepairStatus(repairId, { status: 'Delivered' });
      await markAsRead(notificationId);
      setDismissed(prev => new Set([...prev, notificationId]));
      setReminders(prev => prev.filter(r => r._id !== notificationId));
    } catch (e) {
      console.error('Failed to mark delivered:', e);
    } finally {
      setUpdating(null);
    }
  };

  if (reminders.length === 0) return null;

  const visibleReminders = reminders.filter(r => !dismissed.has(r._id));
  if (visibleReminders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
      {visibleReminders.map((reminder) => {
        const repairMatch = reminder.message.match(/Repair: (\S+)/);
        const repairId = repairMatch ? repairMatch[1] : null;
        return (
          <div
            key={reminder._id}
            className="bg-red-50 border-2 border-red-300 rounded-2xl shadow-2xl p-5 animate-bounce"
            style={{ animationDuration: '2s' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Bell size={20} className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-800 text-sm">{reminder.title}</h4>
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> Delivery due
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDismiss(reminder._id)}
                className="p-1 hover:bg-red-100 rounded-lg text-red-400 hover:text-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-red-700 mb-4 leading-relaxed">{reminder.message}</p>
            {repairId && (
              <button
                onClick={() => handleMarkDelivered(repairId, reminder._id)}
                disabled={updating === repairId}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:bg-green-400"
              >
                {updating === repairId ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Mark as Delivered
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryReminder;
