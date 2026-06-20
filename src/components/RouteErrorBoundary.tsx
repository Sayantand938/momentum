import { type ErrorComponentProps } from '@tanstack/react-router'
import { Button } from './ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
    const handleReset = () => {
        if (reset) {
            reset()
        } else {
            window.location.reload()
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                    Failed to Load Page
                </h1>
                <p className="text-sm text-muted-foreground max-w-md">
                    There was an error loading this page. Please try refreshing.
                </p>
                {import.meta.env.DEV && (
                    <pre className="mt-4 p-4 text-left text-xs font-mono text-muted-foreground bg-muted/50 rounded-lg overflow-auto max-w-full">
                        {error.message}
                    </pre>
                )}
            </div>
            <Button
                onClick={handleReset}
                className="gap-2"
            >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
            </Button>
        </div>
    )
}