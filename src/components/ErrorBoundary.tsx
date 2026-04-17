import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if ((this as any).state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const errInfo = JSON.parse((this as any).state.error.message);
        errorMessage = `Firestore Error: ${errInfo.operationType} at ${errInfo.path || 'unknown path'}. ${errInfo.error}`;
      } catch (e) {
        errorMessage = (this as any).state.error?.message || String((this as any).state.error);
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-8 text-center">
          <div className="bg-surface-container-lowest p-12 rounded-[3rem] shadow-ambient max-w-md space-y-6 border-4 border-error/20">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-error" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter">Application Error</h2>
            <p className="text-on-surface-variant font-bold leading-tight">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-on-surface text-surface-container-lowest rounded-2xl font-black text-lg shadow-ambient active:scale-95 transition-transform"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
