'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class EnhancedErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Integration point for error reporting services
      // Example: Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl"
          >
            <Card className="shadow-xl">
              <CardHeader className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center"
                >
                  <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </motion.div>
                <CardTitle className="text-2xl font-bold">
                  Oops! Something went wrong
                </CardTitle>
                <CardDescription className="text-base">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Bug className="h-4 w-4" />
                      <span>View error details (Development Mode)</span>
                    </summary>
                    <div className="mt-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono overflow-auto max-h-60">
                      <div className="text-red-600 dark:text-red-400 font-semibold mb-2">
                        {this.state.error.toString()}
                      </div>
                      {this.state.errorInfo && (
                        <pre className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                    What you can do:
                  </h4>
                  <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200 list-disc list-inside">
                    <li>Try refreshing the page</li>
                    <li>Go back to the home page</li>
                    <li>Clear your browser cache</li>
                    <li>Contact support if the problem persists</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="w-full sm:w-auto"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
