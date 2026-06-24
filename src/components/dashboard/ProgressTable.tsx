import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { formatCompactTime } from '@/lib/utils'

interface ProgressItem {
    id: string | number
    label: string
    subLabel: string
    totalSeconds: number
    isHighlighted: boolean
}

interface ProgressTableProps {
    title: string
    items: ProgressItem[]
    totalSeconds: number
    goalSeconds: number
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

    const totalHours = Math.floor(totalSeconds / 3600)
    const totalMinutes = Math.floor((totalSeconds % 3600) / 60)
    const totalTimeStr = totalHours > 0 ? `${totalHours}h ${totalMinutes}m` : `${totalMinutes}m`

    return (
        <Card>
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h4 className="text-sm font-medium">{title}</h4>
                <span className="text-sm text-muted-foreground">
                    Total: {totalTimeStr}
                </span>
            </div>

            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-t border-border/40">
                            <TableHead className="w-28">
                                {title.includes('Weekly') ? 'Day' : 'Week'}
                            </TableHead>
                            <TableHead>Progress</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => {
                            const percentage = getProgressPercentage(item.totalSeconds)
                            const timeStr = formatCompactTime(item.totalSeconds)

                            return (
                                <TableRow
                                    key={item.id}
                                    className={cn(
                                        "border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors",
                                        item.isHighlighted ? "bg-muted/10" : ""
                                    )}
                                >
                                    <TableCell className="py-2.5">
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
                                    </TableCell>

                                    <TableCell className="py-2.5">
                                        <div className="flex items-center gap-3">
                                            <Progress
                                                value={percentage}
                                                className="flex-1 h-2"
                                                data-complete={percentage >= 100 ? "true" : "false"}
                                            />
                                            <span className="text-sm font-medium text-foreground w-16 text-right tabular-nums">
                                                {timeStr}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}