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
import { calculateHourlyDistributionWithTimeBank } from '@/lib/hourlyUtils'
import { TIME } from '@/constants'
import { Badge } from '@/components/ui/badge'
import { Banknote, Sparkles } from 'lucide-react'

interface HourlyDistributionProps {
    sessions: Session[]
}

export function HourlyDistribution({ sessions }: HourlyDistributionProps) {
    const result = calculateHourlyDistributionWithTimeBank(sessions)
    const { hourlyData, remainingBank, totalBanked } = result

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

    // Count how many hours are "complete" (hit 30 min goal)
    const completedHours = hourlyData.filter(h => h.totalSeconds >= TIME.HOURLY_GOAL).length
    const totalHours = hourlyData.length

    // Check if there's any bank activity
    const hasBankActivity = totalBanked > 0 || remainingBank > 0

    return (
        <Card>
            <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-sm font-medium">Hourly Distribution</h4>
                    <span className="text-xs text-muted-foreground">(Today)</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                        Total: {totalTodayStr}
                    </span>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                        {completedHours}/{totalHours} hours ✓
                    </span>
                    {hasBankActivity && (
                        <Badge variant="outline" className="text-xs gap-1">
                            <Banknote className="h-3 w-3" />
                            Bank: {formatTime(totalBanked)}
                        </Badge>
                    )}
                </div>

                <ScrollArea className="h-[340px] pr-4">
                    <div className="space-y-2">
                        {hourlyData.map(({ hour, totalSeconds, isOverflow }) => {
                            const percentage = (totalSeconds / TIME.HOURLY_GOAL) * 100
                            const clampedPercentage = Math.min(percentage, 100)
                            const timeStr = formatTime(totalSeconds)
                            const isComplete = totalSeconds >= TIME.HOURLY_GOAL

                            return (
                                <TooltipProvider key={hour}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-3 cursor-help">
                                                <div className="w-20 text-right text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                                                    {formatHourLabel(hour)}
                                                </div>
                                                <div className="flex-1 relative">
                                                    <Progress
                                                        value={clampedPercentage}
                                                        className="h-5 rounded-md"
                                                        data-complete={isComplete ? "true" : "false"}
                                                    />
                                                    {isOverflow && (
                                                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                                                            <Banknote className="h-3 w-3 text-primary/70" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-16 text-right text-xs font-medium text-foreground tabular-nums shrink-0">
                                                    {timeStr}
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-xs space-y-1">
                                                <p><span className="font-medium">Slot:</span> {formatHourLabel(hour)}</p>
                                                <p><span className="font-medium">Duration:</span> {timeStr}</p>
                                                <p><span className="font-medium">Status:</span> {isComplete ? '✅ Complete' : '❌ Incomplete'}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )
                        })}

                        {/* Bonus Section - Shows remaining bank time */}
                        {remainingBank > 0 && (
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/40">
                                <div className="w-20 text-right text-xs font-medium text-primary tabular-nums shrink-0">
                                    Bonus
                                </div>
                                <div className="flex-1 relative">
                                    <div className="h-5 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center gap-2">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        <span className="text-xs font-medium text-primary">
                                            +{formatTime(remainingBank)} banked
                                        </span>
                                    </div>
                                </div>
                                <div className="w-16 text-right text-xs font-medium text-primary tabular-nums shrink-0">
                                    {formatTime(remainingBank)}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer with bank summary */}
                {hasBankActivity && (
                    <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Banknote className="h-3 w-3" />
                                Total banked: {formatTime(totalBanked)}
                            </span>
                            {remainingBank > 0 && (
                                <span className="text-primary font-medium flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Bonus: {formatTime(remainingBank)} remaining
                                </span>
                            )}
                        </div>
                        <span className="text-[10px]">
                            Each hour = 30m goal
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}