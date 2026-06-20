import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const HistoryPage = lazy(() => import('@/components/History'))

export const Route = createFileRoute('/history')({
    component: () => (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <HistoryPage />
        </Suspense>
    ),
})