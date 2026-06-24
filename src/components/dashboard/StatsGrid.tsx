import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { StatsCard } from './StatsCard'
import { Badge } from '@/components/ui/badge'

type IconType = 'Clock' | 'TrendingUp' | 'TrendingDown' | 'Activity' | 'CalendarDays'

interface Stats {
    totalTime: number
    totalSessions: number
    mostProductiveSlot: string
    leastProductiveSlot: string
    avgSessionTime: number
}

interface ExtraCard {
    id: string
    title: string
    value: string | number
    icon: IconType
    color: string
    tooltip: string
}

interface StatsGridProps {
    title: string
    stats: Stats | null
    formatTime: (seconds: number) => string
    shiftStats?: {
        mostProductive: { name: string; totalSeconds: number },
        leastProductive: { name: string; totalSeconds: number }
    } | null
    bonusTime?: number
    showBonus?: boolean
    extraCards?: {
        extra1?: ExtraCard
        extra2?: ExtraCard
    }
}

export function StatsGrid({
    title,
    stats,
    formatTime,
    shiftStats,
    bonusTime,
    showBonus = false,
    extraCards
}: StatsGridProps) {
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

    // Base cards: Total Time, Most Productive, Least Productive
    const statCards: {
        id: string
        title: string
        value: string | React.ReactNode
        icon: IconType
        color: 'text-primary' | 'text-green-500' | 'text-red-500'
        tooltip: string
    }[] = [
            {
                id: 'total-time',
                title: 'Total Studied',
                value: formatTime(stats.totalTime),
                icon: 'Clock',
                color: 'text-primary',
                tooltip: `Total time spent focusing`
            },
            {
                id: 'most-productive',
                title: 'Most Productive',
                value: mostProductiveValue,
                icon: 'TrendingUp',
                color: 'text-green-500',
                tooltip: shiftStats
                    ? `Most productive shift: ${shiftStats.mostProductive.name}`
                    : `Most productive hour: ${stats.mostProductiveSlot}`
            },
            {
                id: 'least-productive',
                title: 'Least Productive',
                value: leastProductiveValue,
                icon: 'TrendingDown',
                color: 'text-red-500',
                tooltip: shiftStats
                    ? `Least productive shift: ${shiftStats.leastProductive.name}`
                    : `Least productive hour: ${stats.leastProductiveSlot}`
            }
        ]

    // Add Bonus card if showBonus and bonusTime > 0
    if (showBonus && bonusTime !== undefined && bonusTime > 0) {
        statCards.push({
            id: 'bonus-time',
            title: 'Bonus Banked',
            value: formatTime(bonusTime),
            icon: 'Activity',
            color: 'text-primary',
            tooltip: `Extra time banked! ${formatTime(bonusTime)} available for future hours`
        })
    }

    // Add extra cards if provided
    const extraCardsList = []
    if (extraCards?.extra1) {
        extraCardsList.push(extraCards.extra1)
    }
    if (extraCards?.extra2) {
        extraCardsList.push(extraCards.extra2)
    }

    // Replace existing cards with extra cards
    extraCardsList.forEach((extra, index) => {
        const targetIndex = 2 + index // Start replacing from least productive
        if (statCards[targetIndex]) {
            statCards[targetIndex] = {
                id: extra.id,
                title: extra.title,
                value: extra.value,
                icon: extra.icon,
                color: extra.color as 'text-primary' | 'text-green-500' | 'text-red-500',
                tooltip: extra.tooltip
            }
        } else {
            statCards.push({
                id: extra.id,
                title: extra.title,
                value: extra.value,
                icon: extra.icon,
                color: extra.color as 'text-primary' | 'text-green-500' | 'text-red-500',
                tooltip: extra.tooltip
            })
        }
    })

    // Ensure we always have exactly 4 cards
    while (statCards.length < 4) {
        statCards.push({
            id: `placeholder-${statCards.length}`,
            title: '—',
            value: '—',
            icon: 'Clock',
            color: 'text-primary',
            tooltip: 'No data available'
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Badge variant="outline" className="text-xs">
                    {stats.totalSessions} sessions
                </Badge>
            </div>
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