import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { createLogger } from '@/lib/logger'

const log = createLogger('ErrorBoundary')

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        // Update state so next render shows fallback UI
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error
        log.error('❌ Uncaught error in component tree:', error)
        log.error('Component stack:', errorInfo.componentStack)

        // Update state with error info
        this.setState({
            errorInfo
        })

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // You could also send to an error tracking service here
        // example: Sentry.captureException(error, { extra: errorInfo })
    }

    handleReset = () => {
        log.debug('🔄 Resetting error boundary...')
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
        // Reload the page to reset all state
        window.location.reload()
    }

    handleGoHome = () => {
        log.debug('🏠 Navigating to home...')
        // Reset error state first
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        })
        // Navigate to home using window.location
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            // If custom fallback is provided, use it
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="flex min-h-screen items-center justify-center p-4 bg-background">
                    <div className="flex flex-col items-center max-w-md w-full gap-6 text-center">
                        {/* Icon */}
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-10 w-10 text-destructive" />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Something Went Wrong
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                We're sorry, but something unexpected happened. Our team has been notified.
                            </p>
                        </div>

                        {/* Error details (only in development) */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="w-full text-left p-4 rounded-lg bg-muted/50 border border-border/40">
                                <p className="text-xs font-mono text-muted-foreground break-all">
                                    <span className="font-semibold text-foreground">Error:</span>{' '}
                                    {this.state.error.message}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                                            Component Stack
                                        </summary>
                                        <pre className="mt-2 text-[10px] font-mono text-muted-foreground whitespace-pre-wrap break-all overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <Button
                                onClick={this.handleReset}
                                className="flex-1 gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Reload Page
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                variant="outline"
                                className="flex-1 gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}