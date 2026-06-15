import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

const playSuccessSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    setTimeout(() => ctx.close(), 500);
  } catch {}
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'success', duration = 2500) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type === 'success') playSuccessSound();
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.type === 'success'
              ? 'linear-gradient(135deg, #059669, #10b981)'
              : 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: '#fff', padding: '12px 20px', borderRadius: '12px',
            fontSize: '0.9rem', fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '10px',
            animation: 'toastSlide 0.3s ease-out',
            maxWidth: '360px',
          }}>
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: 0, opacity: 0.7 }}>
              &times;
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastSlide {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
