import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Header } from '@/components/Header'

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-svh">
            <Header />
            <main className="pt-16">
                <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
                    <Outlet />
                </div>
            </main>
        </div>
    ),
})