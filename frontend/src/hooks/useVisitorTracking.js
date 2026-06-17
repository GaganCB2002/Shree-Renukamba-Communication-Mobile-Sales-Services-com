import { useEffect, useRef } from 'react';
import { trackVisitorApi } from '../api/visitorApi';

const VISITOR_ID_KEY = 'visitor_id';

const generateVisitorId = () => {
  return 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10);
};

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  let os = 'Unknown';
  if (ua.includes('Windows NT 10')) os = 'Windows 10';
  else if (ua.includes('Windows NT 11')) os = 'Windows 11';
  else if (ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  let deviceType = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) deviceType = 'Tablet';
  else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk|Opera Mini/i.test(ua)) deviceType = 'Mobile';

  return { browser, os, deviceType };
};

const useVisitorTracking = () => {
  const trackedPage = useRef('');

  useEffect(() => {
    const consent = localStorage.getItem('visitorConsent');
    if (consent !== 'granted') return;

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    const currentPage = window.location.pathname + window.location.search;
    if (trackedPage.current === currentPage) return;
    trackedPage.current = currentPage;

    const { browser, os, deviceType } = getBrowserInfo();

    const data = {
      visitorId,
      page: currentPage,
      userAgent: navigator.userAgent,
      browser,
      os,
      deviceType,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      referrer: document.referrer || '',
      consentGiven: true,
    };

    trackVisitorApi(data).catch(() => {});
  }, []);
};

export default useVisitorTracking;
export { generateVisitorId, getBrowserInfo, VISITOR_ID_KEY };
