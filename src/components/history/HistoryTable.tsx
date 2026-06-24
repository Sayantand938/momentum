import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { type Session } from '@/lib/supabase'

interface HistoryTableProps {
    sessions: Session[]
    formatDate: (timestamp: string) => string
    formatTime: (timestamp: string) => string
    formatDuration: (startAt: string, endAt: string) => string
}

export function HistoryTable({ sessions, formatDate, formatTime, formatDuration }: HistoryTableProps) {
    return (
        <div className="rounded-lg border border-border/40 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/40 bg-muted/30">
                        <TableHead className="w-16 text-center">#</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session, index) => (
                        <TableRow
                            key={session.id}
                            className={cn(
                                "border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors",
                                index % 2 === 0 ? "bg-background" : "bg-muted/5"
                            )}
                        >
                            <TableCell className="text-center text-muted-foreground">
                                {index + 1}
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                                {formatDate(session.start_at)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                                {formatTime(session.start_at)}
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                {formatTime(session.end_at!)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-foreground whitespace-nowrap">
                                {formatDuration(session.start_at, session.end_at!)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}