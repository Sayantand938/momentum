import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

interface ProgressItem {
    id: string | number
    label: string          // Day name or Week number
    subLabel: string       // Date or date range
    totalSeconds: number
    isHighlighted: boolean // Today or current week
}

interface ProgressTableProps {
    title: string           // "Weekly Progress" or "Monthly Progress"
    items: ProgressItem[]
    totalSeconds: number
    goalSeconds: number     // 8h for daily, 56h for weekly
}

export function ProgressTable({
    title,
    items,
    totalSeconds,
    goalSeconds
}: ProgressTableProps) {

    const getProgressPercentage = (seconds: number): number => {
        return Math.min((seconds / goalSeconds) * 100, 100)
    }

    const getBarColor = (percentage: number): string => {
        if (percentage >= 100) return 'bg-gray-800 dark:bg-gray-200'
        if (percentage >= 75) return 'bg-gray-600 dark:bg-gray-400'
        if (percentage >= 50) return 'bg-gray-400 dark:bg-gray-500'
        if (percentage >= 25) return 'bg-gray-300 dark:bg-gray-600'
        return 'bg-gray-200 dark:bg-gray-700'
    }

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours === 0 && minutes === 0) return '0h 0m'
        if (hours === 0) return `${minutes}m`
        if (minutes === 0) return `${hours}h`
        return `${hours}h ${minutes}m`
    }

    const totalHours = Math.floor(totalSeconds / 3600)
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60)
    const totalTimeStr = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`

    return (
        <Card>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h4 className="text-sm font-medium">{title}</h4>
                <span className="text-sm text-muted-foreground">
                    Total: {totalTimeStr}
                </span>
            </div>

            {/* Table */}
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-t border-border/40">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2 w-28">
                                {title.includes('Weekly') ? 'Day' : 'Week'}
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">
                                Progress
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const percentage = getProgressPercentage(item.totalSeconds)
                            const barColor = getBarColor(percentage)
                            const timeStr = formatTime(item.totalSeconds)

                            return (
                                <tr
                                    key={item.id}
                                    className={cn(
                                        "border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors",
                                        item.isHighlighted ? "bg-muted/10" : ""
                                    )}
                                >
                                    {/* Label Column */}
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-sm font-medium",
                                                item.isHighlighted ? "text-primary" : "text-foreground"
                                            )}>
                                                {item.label}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {item.subLabel}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Progress Bar Column with Time */}
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${barColor} transition-all duration-500 ease-in-out rounded-full`}
                                                    style={{ width: `${Math.max(percentage, 1)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium text-foreground w-16 text-right tabular-nums">
                                                {timeStr}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    )
}

// Helper function
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}