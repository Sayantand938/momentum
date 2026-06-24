import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Session } from '@/lib/supabase'
import { calculateHourlyDistribution } from '@/lib/hourlyUtils'
import { TIME } from '@/constants'

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

                <ScrollArea className="h-[320px] pr-4">
                    <div className="space-y-2">
                        {hourlyData.map(({ hour, totalSeconds }) => {
                            const percentage = (totalSeconds / TIME.HOURLY_GOAL) * 100
                            const clampedPercentage = Math.min(percentage, 100)
                            const timeStr = formatTime(totalSeconds)

                            return (
                                <TooltipProvider key={hour}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-3 cursor-help">
                                                <div className="w-20 text-right text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                                                    {formatHourLabel(hour)}
                                                </div>
                                                <div className="flex-1">
                                                    <Progress
                                                        value={clampedPercentage}
                                                        className="h-5 rounded-md"
                                                        data-complete={totalSeconds >= TIME.HOURLY_GOAL ? "true" : "false"}
                                                    />
                                                </div>
                                                <div className="w-16 text-right text-xs font-medium text-foreground tabular-nums shrink-0">
                                                    {timeStr}
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{formatHourLabel(hour)}: {timeStr}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {Math.round(percentage)}% of 30min goal
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}