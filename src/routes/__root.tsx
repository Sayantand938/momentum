import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-svh">
            <Header />
            <main className="pt-16">
                <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
                    <ErrorBoundary fallback={<RouteErrorBoundary error={new Error('Route failed to load')} reset={() => { }} />}>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    ),
    errorComponent: ({ error, reset }) => <RouteErrorBoundary error={error} reset={reset} />,
})