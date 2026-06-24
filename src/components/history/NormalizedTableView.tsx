import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface NormalizedSlot {
    hour: number
    label: string
    totalSeconds: number
    actualSeconds: number
    bankUsed?: number
    isComplete: boolean
    isOverflow: boolean
}

interface NormalizedTableViewProps {
    data: NormalizedSlot[]
    formatTime: (seconds: number) => string
    formatHourLabel: (hour: number) => string
}

export function NormalizedTableView({ data, formatTime, formatHourLabel }: NormalizedTableViewProps) {
    return (
        <div className="rounded-lg border border-border/40 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/40 bg-muted/30">
                        <TableHead className="w-16 text-center">#</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((slot, index) => {
                        const startHour = slot.hour
                        const endHour = slot.hour + 1
                        const startLabel = formatHourLabel(startHour)
                        const endLabel = formatHourLabel(endHour)
                        const duration = formatTime(slot.totalSeconds)
                        const isComplete = slot.totalSeconds >= 1800

                        return (
                            <TableRow
                                key={slot.hour}
                                className={cn(
                                    "border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors",
                                    isComplete ? "bg-muted/5" : ""
                                )}
                            >
                                <TableCell className="text-center text-muted-foreground">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap">
                                    {startLabel}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {endLabel}
                                </TableCell>
                                <TableCell className="text-right font-medium text-foreground whitespace-nowrap">
                                    {duration}
                                </TableCell>
                                <TableCell className="text-right text-lg">
                                    {isComplete ? '✅' : '❌'}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}