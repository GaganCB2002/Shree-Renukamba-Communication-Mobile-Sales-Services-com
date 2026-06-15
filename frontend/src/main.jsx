import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import { store } from './redux/store'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const queryClient = new QueryClient()

window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error || e.message);
  e.preventDefault?.();
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  e.preventDefault?.();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
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
  </StrictMode>,
)
