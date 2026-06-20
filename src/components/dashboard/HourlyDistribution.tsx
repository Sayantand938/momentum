import { Card, CardContent } from '@/components/ui/card'
import type { Session } from '@/lib/supabase'
import { calculateHourlyDistribution, HOURLY_GOAL_SECONDS } from '@/lib/hourlyUtils'

interface HourlyDistributionProps {
    sessions: Session[]
}

export function HourlyDistribution({ sessions }: HourlyDistributionProps) {
    const hourlyData = calculateHourlyDistribution(sessions)

    const formatTime = (seconds: number): string => {
        if (seconds === 0) return '0m'
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h`
        return `${minutes}m`
    }

    const getBarColor = (seconds: number): string => {
        const percentage = (seconds / HOURLY_GOAL_SECONDS) * 100
        if (seconds === 0) return 'bg-muted'
        if (percentage >= 100) return 'bg-gray-800 dark:bg-gray-200'
        if (percentage >= 75) return 'bg-gray-600 dark:bg-gray-400'
        if (percentage >= 50) return 'bg-gray-400 dark:bg-gray-500'
        if (percentage >= 25) return 'bg-gray-300 dark:bg-gray-600'
        return 'bg-gray-200 dark:bg-gray-700'
    }

    const formatHourLabel = (hour: number): string => {
        const hourStr = String(hour).padStart(2, '0')
        if (hour === 0) return `12:00 AM`
        if (hour < 12) return `${hourStr}:00 AM`
        if (hour === 12) return `12:00 PM`
        const hour12 = String(hour - 12).padStart(2, '0')
        return `${hour12}:00 PM`
    }

    const totalTodaySeconds = sessions.reduce((sum, session) => {
        return sum + (session.end_at ? Math.floor((new Date(session.end_at).getTime() - new Date(session.start_at).getTime()) / 1000) : 0)
    }, 0)
    const totalTodayStr = formatTime(totalTodaySeconds)

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-sm font-medium">Hourly Distribution</h4>
                    <span className="text-xs text-muted-foreground">(Today)</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                        Total: {totalTodayStr}
                    </span>
                </div>

                <div className="max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                        {hourlyData.map(({ hour, totalSeconds }) => {
                            const percentage = (totalSeconds / HOURLY_GOAL_SECONDS) * 100
                            const clampedPercentage = Math.min(percentage, 100)
                            const timeStr = formatTime(totalSeconds)
                            const barColor = getBarColor(totalSeconds)

                            return (
                                <div key={hour} className="flex items-center gap-3">
                                    <div className="w-20 text-right text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                                        {formatHourLabel(hour)}
                                    </div>
                                    <div className="flex-1 h-5 bg-muted/30 rounded-md overflow-hidden">
                                        <div
                                            className={`h-full ${barColor} transition-all duration-500 ease-in-out rounded-md`}
                                            style={{ width: `${Math.max(clampedPercentage, 1)}%` }}
                                        />
                                    </div>
                                    <div className="w-16 text-right text-xs font-medium text-foreground tabular-nums shrink-0">
                                        {timeStr}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}