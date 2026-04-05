import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = { hasError: false, error: null, errorInfo: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    (this as any).setState({ error, errorInfo });
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    const onError = (this as any).props.onError;
    if (onError) onError(error, errorInfo);
  }

  handleReset(): void {
    (this as any).setState({ hasError: false, error: null, errorInfo: null });
  }

  render(): React.ReactNode {
    const s = (this as any).state as State;
    const p = (this as any).props as Props;

    if (s.hasError) {
      if (p.fallback) return p.fallback;

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Algo deu errado</h2>
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro inesperado. Por favor, tente novamente ou entre em contato com o suporte.
              </p>
            </div>
            {import.meta.env.DEV && s.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-mono text-muted-foreground hover:text-foreground">
                  Ver detalhes do erro
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="rounded bg-muted p-2 text-xs font-mono">
                    <strong>Erro:</strong> {s.error.message}
                  </div>
                  {s.errorInfo && (
                    <div className="rounded bg-muted p-2 text-xs font-mono max-h-32 overflow-auto">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{s.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            <div className="flex justify-center gap-2">
              <Button onClick={this.handleReset} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Recarregar página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return p.children;
  }
}

export default ErrorBoundary;
