import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundarySmall extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            hasError: false,
            error: null
        }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Component error:', error, errorInfo)
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null
        })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center p-6 gap-4 rounded-lg border border-destructive/20 bg-destructive/5">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <h3 className="font-medium text-sm">Something went wrong in this component</h3>
                    </div>
                    {import.meta.env.DEV && this.state.error && (
                        <p className="text-xs text-muted-foreground font-mono">
                            {this.state.error.message}
                        </p>
                    )}
                    <Button
                        onClick={this.handleRetry}
                        variant="outline"
                        size="sm"
                    >
                        Try Again
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}