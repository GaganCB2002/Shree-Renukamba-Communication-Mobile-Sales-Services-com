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

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error || e.message);
  e.preventDefault?.();
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault?.();
});

const Root = () => {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
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