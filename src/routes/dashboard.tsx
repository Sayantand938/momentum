import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
    component: () => <div className="text-2xl font-bold">📊 Dashboard Page</div>,
})