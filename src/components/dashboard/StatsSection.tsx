import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
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
    showAvg?: boolean
    shiftStats?: {
        mostProductive: { name: string; totalSeconds: number },
        leastProductive: { name: string; totalSeconds: number }
    } | null
    focusPoints?: number
    bonusTime?: number
}

export function StatsSection({ title, stats, formatTime, showAvg = false, shiftStats, focusPoints, bonusTime }: StatsSectionProps) {
    if (!stats) return null

    // If shiftStats is provided, use shift names instead of time slots
    const mostProductiveValue = shiftStats ? (
        <div className="text-xl font-bold">
            {shiftStats.mostProductive.name}
        </div>
    ) : (
        stats.mostProductiveSlot
    )

    const leastProductiveValue = shiftStats ? (
        <div className="text-xl font-bold">
            {shiftStats.leastProductive.name}
        </div>
    ) : (
        stats.leastProductiveSlot
    )

    // Calculate total completed time (focus points × 30 minutes)
    const totalCompletedTime = focusPoints !== undefined ? focusPoints * 30 * 60 : 0
    const totalCompletedTimeStr = formatTime(totalCompletedTime)

    // Define stat cards with proper typing
    const statCards = [
        {
            id: 'total-time',
            title: 'Total Time',
            value: formatTime(stats.totalTime),
            icon: 'Clock' as const,
            color: 'text-primary' as const,
            tooltip: `Total time spent focusing`
        },
        {
            id: 'focus-points',
            title: 'Focus Points',
            value: focusPoints !== undefined ? focusPoints : stats.totalSessions,
            icon: 'Activity' as const,
            color: 'text-primary' as const,
            tooltip: `${focusPoints || 0} hours completed × 30m = ${totalCompletedTimeStr}`
        },
        {
            id: 'most-productive',
            title: 'Most Productive',
            value: mostProductiveValue,
            icon: 'TrendingUp' as const,
            color: 'text-green-500' as const,
            tooltip: shiftStats
                ? `Most productive shift: ${shiftStats.mostProductive.name}`
                : `Most productive hour: ${stats.mostProductiveSlot}`
        },
        {
            id: 'least-productive',
            title: 'Least Productive',
            value: leastProductiveValue,
            icon: 'TrendingDown' as const,
            color: 'text-red-500' as const,
            tooltip: shiftStats
                ? `Least productive shift: ${shiftStats.leastProductive.name}`
                : `Least productive hour: ${stats.leastProductiveSlot}`
        }
    ]

    // If bonus time is available, replace the least productive card with bonus
    if (bonusTime !== undefined && bonusTime > 0) {
        statCards[3] = {
            id: 'bonus-time',
            title: 'Bonus Banked',
            value: formatTime(bonusTime),
            icon: 'Clock' as const,
            color: 'text-primary' as const,
            tooltip: `Extra time banked! ${formatTime(bonusTime)} available for future hours`
        }
    }

    // If showAvg is true, show average session time instead
    if (showAvg) {
        statCards[3] = {
            id: 'avg-session',
            title: 'Avg Session',
            value: formatTime(stats.avgSessionTime),
            icon: 'Clock' as const,
            color: 'text-primary' as const,
            tooltip: `Average session duration`
        }
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <TooltipProvider key={card.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <StatsCard
                                        title={card.title}
                                        value={card.value}
                                        icon={card.icon}
                                        color={card.color}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{card.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    )
}