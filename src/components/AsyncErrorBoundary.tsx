import { Component, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onReset?: () => void
}

interface State {
    hasError: boolean
    error: Error | null
}

export class AsyncErrorBoundary extends Component<Props, State> {
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

    componentDidCatch(error: Error) {
        console.error('Async error caught:', error)
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null
        })
        if (this.props.onReset) {
            this.props.onReset()
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Failed to load data</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {this.state.error?.message || 'An error occurred while loading data'}
                    </p>
                    <Button
                        onClick={this.handleReset}
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