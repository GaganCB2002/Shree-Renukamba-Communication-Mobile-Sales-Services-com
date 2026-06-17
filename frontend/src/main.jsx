import { useState, useEffect } from 'react'
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
import { fetchGoogleClientId } from './api/authApi'

const queryClient = new QueryClient()

window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error || e.message);
  e.preventDefault?.();
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault?.();
});

const Root = () => {
  const [googleClientId, setGoogleClientId] = useState(null)

  useEffect(() => {
    fetchGoogleClientId()
      .then(setGoogleClientId)
      .catch(() => setGoogleClientId(''))
  }, [])

  if (googleClientId === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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