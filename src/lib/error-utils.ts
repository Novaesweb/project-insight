import React from 'react';

// Hook for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }, []);
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => {
    const [ErrorBoundaryComp, setErrorBoundaryComp] = React.useState<React.ComponentType<any> | null>(null);
    
    React.useEffect(() => {
      import('@/components/ErrorBoundary').then(module => {
        setErrorBoundaryComp(() => module.default);
      });
    }, []);

    if (!ErrorBoundaryComp) {
      return React.createElement('div', null, 'Loading...');
    }

    return React.createElement(
      ErrorBoundaryComp,
      { fallback, onError },
      React.createElement(Component, props)
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
