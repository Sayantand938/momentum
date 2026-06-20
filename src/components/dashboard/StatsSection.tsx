import { StatCard } from './StatCard'
import { Clock, Activity, TrendingUp, TrendingDown } from 'lucide-react'

interface Stats {
    totalTime: number
    totalSessions: number
    mostProductiveSlot: string
    leastProductiveSlot: string
    avgSessionTime: number
}

interface StatsSectionProps {
    title: string
    stats: Stats | null
    icon: React.ElementType
    formatTime: (seconds: number) => string
}

export function StatsSection({ title, stats, icon: Icon, formatTime }: StatsSectionProps) {
    if (!stats) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Time"
                    value={formatTime(stats.totalTime)}
                    icon={Clock}
                />
                <StatCard
                    title="Total Sessions"
                    value={stats.totalSessions}
                    icon={Activity}
                />
                <StatCard
                    title="Most Productive"
                    value={stats.mostProductiveSlot}
                    icon={TrendingUp}
                    color="text-green-500"
                />
                <StatCard
                    title="Least Productive"
                    value={stats.leastProductiveSlot}
                    icon={TrendingDown}
                    color="text-red-500"
                />
            </div>
        </div>
    )
}