import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-svh">
            <Header />
            <main className="pt-14">
                <div className="flex flex-col items-center justify-start p-4">
                    <ErrorBoundary fallback={<RouteErrorBoundary error={new Error('Route failed to load')} reset={() => { }} />}>
                        <Outlet />
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    ),
    errorComponent: ({ error, reset }) => <RouteErrorBoundary error={error} reset={reset} />,
})