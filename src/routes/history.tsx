import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/history')({
    component: () => <div className="text-2xl font-bold">📜 History Page</div>,
})