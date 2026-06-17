import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import { store } from './redux/store'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const queryClient = new QueryClient()

const API_URL = import.meta.env.VITE_API_URL || '/api';

window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error || e.message);
  e.preventDefault?.();
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault?.();
});

const fetchClientId = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/google-client-id`);
    const data = await res.json();
    if (data.clientId) return data.clientId;
  } catch (e) {
    console.warn('Could not fetch Google Client ID from backend, using fallback');
  }
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
};

const Root = () => {
  const [clientId, setClientId] = React.useState(null);

  React.useEffect(() => {
    fetchClientId().then(setClientId);
  }, []);

  if (!clientId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ErrorBoundary>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <LanguageProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </LanguageProvider>
          </QueryClientProvider>
        </Provider>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)