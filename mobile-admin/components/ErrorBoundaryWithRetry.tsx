import React, { ReactNode } from "react";

export type ErrorBoundaryFallbackProps = {
  error: string | null; // Updated to allow null
  retry: () => void;
};

interface ErrorBoundaryWithRetryProps {
  children: ({ fetchKey }: { fetchKey: number }) => ReactNode;
  fallback: ({ error, retry }: ErrorBoundaryFallbackProps) => ReactNode;
}

interface ErrorBoundaryWithRetryState {
  error: string | null; // Updated to allow null
  fetchKey: number;
}

class ErrorBoundaryWithRetry extends React.Component<
  ErrorBoundaryWithRetryProps,
  ErrorBoundaryWithRetryState
> {
  state: ErrorBoundaryWithRetryState = {
    error: null,
    fetchKey: 0,
  };

  componentDidCatch(error: Error | null, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.log(errorInfo);
    }

    this.setState({ error: error ? error.toString() : null });
  }

  retry = () => {
    this.setState((prev) => ({
      error: null,
      fetchKey: prev.fetchKey + 1,
    }));
  };

  render() {
    const { children, fallback } = this.props;
    const { error, fetchKey } = this.state;
    if (error) {
      if (typeof fallback === "function") {
        return fallback({ error, retry: this.retry });
      }
      return fallback;
    }
    return children({ fetchKey });
  }
}

export default ErrorBoundaryWithRetry;
