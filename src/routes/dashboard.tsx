import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'

const DashboardPage = lazy(() => import('@/components/Dashboard'))

export const Route = createFileRoute('/dashboard')({
    component: () => (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Spinner className="h-8 w-8 animate-spin" />
            </div>
        }>
            <DashboardPage />
        </Suspense>
    ),
})