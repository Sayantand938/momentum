import { createFileRoute } from '@tanstack/react-router'
import { Timer } from '@/components/Timer'

export const Route = createFileRoute('/')({
    component: () => (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] w-full">
            <Timer />
        </div>
    ),
})