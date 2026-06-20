import { StatsCard } from './StatsCard'

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
    formatTime: (seconds: number) => string
    showAvg?: boolean // Optional: show average session time
}

export function StatsSection({ title, stats, formatTime, showAvg = false }: StatsSectionProps) {
    if (!stats) return null

    const statCards = [
        {
            id: 'total-time',
            title: 'Total Time',
            value: formatTime(stats.totalTime),
            icon: 'Clock' as const,
            color: 'text-primary'
        },
        {
            id: 'total-sessions',
            title: 'Total Sessions',
            value: stats.totalSessions,
            icon: 'Activity' as const,
            color: 'text-primary'
        },
        {
            id: 'most-productive',
            title: 'Most Productive',
            value: stats.mostProductiveSlot,
            icon: 'TrendingUp' as const,
            color: 'text-green-500'
        },
        {
            id: 'least-productive',
            title: 'Least Productive',
            value: stats.leastProductiveSlot,
            icon: 'TrendingDown' as const,
            color: 'text-red-500'
        }
    ]

    // If showAvg is true, replace the least productive with average session time
    if (showAvg) {
        statCards[3] = {
            id: 'avg-session',
            title: 'Avg Session',
            value: formatTime(stats.avgSessionTime),
            icon: 'Clock' as const,
            color: 'text-primary'
        }
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <StatsCard
                        key={card.id}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        color={card.color}
                    />
                ))}
            </div>
        </div>
    )
}