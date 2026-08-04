import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Runtime Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public componentDidMount() {
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleGlobalError = (event: ErrorEvent) => {
    console.error('Global Window Error caught:', event.error || event.message);
    if (!this.state.hasError) {
      this.setState({
        hasError: true,
        error: event.error || new Error(event.message || 'Window Global Error'),
      });
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled Promise Rejection caught:', event.reason);
    const reason = event.reason;
    const errorObj =
      reason instanceof Error
        ? reason
        : new Error(typeof reason === 'string' ? reason : JSON.stringify(reason || 'Unhandled Promise Rejection'));

    if (!this.state.hasError) {
      this.setState({
        hasError: true,
        error: errorObj,
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window && window.caches) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name).catch(() => {});
          }
        });
      }
    } catch (e) {
      console.error('Reset data error:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-rose-500 pb-4 border-b border-slate-800">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Application Runtime Error</h1>
                <p className="text-xs text-slate-400">ZelSurvey encountered an unexpected execution error.</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Error Diagnostic</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                {this.state.error?.toString() || 'Unknown Runtime Exception'}
                {this.state.errorInfo?.componentStack && (
                  <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-800/80 pt-2">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleResetData}
                className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer border border-slate-700"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear Cache & Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
