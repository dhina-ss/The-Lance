import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    captureGlobalErrors?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class AiroErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('AiroErrorBoundary caught an error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 max-w-lg mx-auto my-12 bg-destructive/10 border border-destructive/30 rounded-lg text-foreground">
                    <h2 className="text-xl font-bold text-destructive mb-2">Something went wrong</h2>
                    <p className="text-sm opacity-80 mb-4">
                        {this.state.error?.message || 'An unexpected render error occurred.'}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded hover:opacity-90"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
