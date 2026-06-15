import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="max-w-lg w-full bg-surface rounded-2xl border border-border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-main mb-2">Something went wrong</h1>
            <p className="text-sm text-text-muted mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {isDev && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg text-left text-xs font-mono text-red-700 dark:text-red-300 overflow-auto max-h-40 border border-red-200 dark:border-red-800">
                <div className="font-bold mb-1">{this.state.error.name}: {this.state.error.message}</div>
                {this.state.errorInfo && (
                  <div className="mt-2 text-text-muted">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Refresh Page
              </button>
              <a href="/" className="btn-secondary">
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
