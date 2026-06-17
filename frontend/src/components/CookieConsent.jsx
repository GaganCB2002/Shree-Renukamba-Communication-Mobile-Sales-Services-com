import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Check, X } from 'lucide-react';
import { VISITOR_ID_KEY, generateVisitorId, getBrowserInfo } from '../hooks/useVisitorTracking';
import { trackVisitorApi } from '../api/visitorApi';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('visitorConsent');
    if (!consent) {
      setTimeout(() => setVisible(true), 500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('visitorConsent', 'granted');
    const consentTime = new Date().toISOString();
    localStorage.setItem('visitorConsentTime', consentTime);

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    const { browser, os, deviceType } = getBrowserInfo();
    trackVisitorApi({
      visitorId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      browser,
      os,
      deviceType,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || '',
      consentGiven: true,
    }).catch(() => {});

    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('visitorConsent', 'declined');
    localStorage.setItem('visitorConsentTime', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: '16px 24px',
      boxShadow: '0 -8px 32px rgba(0,0,0,0.3)',
      animation: 'consentSlideUp 0.4s ease-out',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 200 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(79,70,229,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Cookie size={20} color="#818cf8" />
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>We value your privacy</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', lineHeight: 1.4 }}>
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Allow", you consent to our use of cookies. Read our{' '}
              <Link to="/privacy" style={{ color: '#818cf8', textDecoration: 'underline' }} onClick={handleDecline}>Privacy Policy</Link>{' '}
              and{' '}
              <Link to="/terms" style={{ color: '#818cf8', textDecoration: 'underline' }} onClick={handleDecline}>Terms &amp; Conditions</Link>.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={handleDecline}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)',
              padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >
            <X size={14} /> Decline
          </button>
          <button onClick={handleAccept}
            style={{
              background: '#4F46E5', border: 'none', color: '#fff',
              padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4338CA' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#4F46E5' }}
          >
            <Check size={14} /> Allow
          </button>
        </div>
      </div>
      <style>{`
        @keyframes consentSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CookieConsent;
